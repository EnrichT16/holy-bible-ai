-- Holy Bible · AI Assisted — Phase 2 backend schema (Supabase)
--
-- Run this once in the Supabase dashboard: SQL Editor → New query →
-- paste everything → Run. Safe to re-run (idempotent).
--
-- Security model: the app ships only the public anon key. Row Level
-- Security lets anonymous users INSERT submissions but never read them
-- back; the only thing the public can read is verified church listings.
-- You review submissions in the dashboard (Table Editor) and, for a
-- church, copy it into the public `churches` table with verified = true.

-- ── Church listing requests (private queue) ─────────────────────────
create table if not exists public.church_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  city text not null,
  country text not null,
  contact text not null,
  notes text,
  status text not null default 'pending'
);

alter table public.church_submissions enable row level security;

drop policy if exists "anyone can submit a church" on public.church_submissions;
create policy "anyone can submit a church"
  on public.church_submissions for insert
  to anon with check (true);
-- no select/update/delete policies for anon: the queue is private

-- ── Book submission requests (private queue) ────────────────────────
create table if not exists public.book_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  author text not null,
  rights text not null,
  about text,
  contact text not null,
  status text not null default 'pending'
);

alter table public.book_submissions enable row level security;

drop policy if exists "anyone can submit a book" on public.book_submissions;
create policy "anyone can submit a book"
  on public.book_submissions for insert
  to anon with check (true);

-- ── The verified church directory (publicly readable) ───────────────
create table if not exists public.churches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  city text not null,
  country text not null,
  mass_times text,
  verified boolean not null default false
);

alter table public.churches enable row level security;

drop policy if exists "verified churches are public" on public.churches;
create policy "verified churches are public"
  on public.churches for select
  to anon using (verified = true);

-- ════════════════════════════════════════════════════════════════════
--  PHASE 3 · SLICE 1 — accounts and the Prayer Circle
-- ════════════════════════════════════════════════════════════════════
--
-- Everything below is signed-in territory, and it is the ground the
-- prayer calls of Slice 2 will stand on: a person, a shareable prayer
-- ID, the circle of friends they pray with, and the intentions they
-- carry for one another.
--
-- Security model: nothing here is readable by `anon`. A signed-in
-- person sees their own row, the people in their circle, whoever has a
-- pending invite with them, and the intentions of that circle — never
-- the wider table. Anything that must touch two people at once
-- (accepting an invite, leaving a circle, looking a stranger up by
-- their prayer ID) goes through a `security definer` function so the
-- app never needs broader read access than that.

-- ── Profiles ────────────────────────────────────────────────────────
-- One row per account, created automatically when the person signs up.
-- The prayer ID is the human-shareable handle — "HB-4KQ7-9TXM" — that
-- friends use to find each other. Ambiguous characters (I, L, O, 0, 1)
-- are left out so it survives being read aloud or written on paper.
-- Thirty-one letters in eight places is some 850 billion codes, so an
-- ID cannot be stumbled upon; keep Supabase's API rate limits on, and
-- guessing stays out of reach.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  display_name text not null,
  prayer_id text not null unique,
  about text
);

create or replace function public.generate_prayer_id()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  candidate text;
  i int;
begin
  loop
    candidate := 'HB-';
    for i in 1..8 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
      if i = 4 then
        candidate := candidate || '-';
      end if;
    end loop;
    exit when not exists (select 1 from public.profiles p where p.prayer_id = candidate);
  end loop;
  return candidate;
end;
$$;

-- A profile is minted the moment an account is created. The display
-- name comes from the sign-up form (Supabase carries it in user
-- metadata); anyone who declines to give one is simply a friend in Christ.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, prayer_id)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'A friend in Christ'),
    public.generate_prayer_id()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Belt and braces: the app calls this on every sign-in, so an account
-- that pre-dates the trigger (or slipped past it) still gets a profile.
-- Passing a name updates it; passing nothing leaves it be.
create or replace function public.ensure_profile(name text default null)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.profiles;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;

  insert into public.profiles (id, display_name, prayer_id)
  values (
    auth.uid(),
    coalesce(nullif(trim(name), ''), 'A friend in Christ'),
    public.generate_prayer_id()
  )
  on conflict (id) do update
    set display_name = coalesce(nullif(trim(name), ''), profiles.display_name)
  returning * into result;

  return result;
end;
$$;

-- ── The circle ──────────────────────────────────────────────────────
-- Membership is stored both ways round (a → b and b → a) so every
-- read is a simple `user_id = auth.uid()` with no recursive policies.
-- Rows are only ever written by the functions below.

create table if not exists public.circle_members (
  user_id uuid not null references public.profiles (id) on delete cascade,
  friend_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint circle_members_pkey primary key (user_id, friend_id),
  constraint circle_members_not_self check (user_id <> friend_id)
);

create table if not exists public.circle_invites (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  from_user uuid not null references public.profiles (id) on delete cascade,
  to_user uuid not null references public.profiles (id) on delete cascade,
  note text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  constraint circle_invites_unique_pair unique (from_user, to_user),
  constraint circle_invites_not_self check (from_user <> to_user)
);

create index if not exists circle_invites_to_user_idx on public.circle_invites (to_user, status);

-- ── Intentions ──────────────────────────────────────────────────────
-- What the circle is *for*, before calling exists: the burdens people
-- name and the others carry. `intention_prayers` records the quiet
-- "I prayed for this" — one per person, so the count means something.

create table if not exists public.prayer_intentions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  author uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1000),
  answered boolean not null default false
);

create index if not exists prayer_intentions_author_idx on public.prayer_intentions (author, created_at desc);

create table if not exists public.intention_prayers (
  intention_id uuid not null references public.prayer_intentions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint intention_prayers_pkey primary key (intention_id, user_id)
);

-- ── Row Level Security ──────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.circle_members enable row level security;
alter table public.circle_invites enable row level security;
alter table public.prayer_intentions enable row level security;
alter table public.intention_prayers enable row level security;

-- Profiles: yourself, your circle, and anyone mid-invite with you.
-- Nobody can browse the membership of the app.
drop policy if exists "profiles are visible to self, circle and invitees" on public.profiles;
create policy "profiles are visible to self, circle and invitees"
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1 from public.circle_members m
      where m.user_id = auth.uid() and m.friend_id = profiles.id
    )
    or exists (
      select 1 from public.circle_invites v
      where v.status = 'pending'
        and (
          (v.from_user = auth.uid() and v.to_user = profiles.id)
          or (v.to_user = auth.uid() and v.from_user = profiles.id)
        )
    )
  );

drop policy if exists "a person may edit their own profile" on public.profiles;
create policy "a person may edit their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Circle membership: your own side of it, and you may always leave.
drop policy if exists "your circle is yours to read" on public.circle_members;
create policy "your circle is yours to read"
  on public.circle_members for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "you may leave a circle" on public.circle_members;
create policy "you may leave a circle"
  on public.circle_members for delete
  to authenticated
  using (user_id = auth.uid());

-- Invites: both sides can see one; the sender may withdraw it.
-- Sending and answering go through the functions below.
drop policy if exists "invites are visible to both sides" on public.circle_invites;
create policy "invites are visible to both sides"
  on public.circle_invites for select
  to authenticated
  using (from_user = auth.uid() or to_user = auth.uid());

drop policy if exists "you may withdraw an invite you sent" on public.circle_invites;
create policy "you may withdraw an invite you sent"
  on public.circle_invites for delete
  to authenticated
  using (from_user = auth.uid());

-- Intentions: your own, and those of the people in your circle.
drop policy if exists "intentions are shared with the circle" on public.prayer_intentions;
create policy "intentions are shared with the circle"
  on public.prayer_intentions for select
  to authenticated
  using (
    author = auth.uid()
    or exists (
      select 1 from public.circle_members m
      where m.user_id = auth.uid() and m.friend_id = prayer_intentions.author
    )
  );

drop policy if exists "you may name your own intention" on public.prayer_intentions;
create policy "you may name your own intention"
  on public.prayer_intentions for insert
  to authenticated
  with check (author = auth.uid());

drop policy if exists "you may tend your own intention" on public.prayer_intentions;
create policy "you may tend your own intention"
  on public.prayer_intentions for update
  to authenticated
  using (author = auth.uid())
  with check (author = auth.uid());

drop policy if exists "you may withdraw your own intention" on public.prayer_intentions;
create policy "you may withdraw your own intention"
  on public.prayer_intentions for delete
  to authenticated
  using (author = auth.uid());

-- "I prayed for this": recordable on any intention you can see,
-- readable by everyone who can see that intention, and yours to undo.
drop policy if exists "prayers are visible with their intention" on public.intention_prayers;
create policy "prayers are visible with their intention"
  on public.intention_prayers for select
  to authenticated
  using (
    exists (
      select 1 from public.prayer_intentions i
      where i.id = intention_prayers.intention_id
    )
  );

drop policy if exists "you may pray for an intention you can see" on public.intention_prayers;
create policy "you may pray for an intention you can see"
  on public.intention_prayers for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.prayer_intentions i
      where i.id = intention_prayers.intention_id
    )
  );

drop policy if exists "you may take back your own prayer" on public.intention_prayers;
create policy "you may take back your own prayer"
  on public.intention_prayers for delete
  to authenticated
  using (user_id = auth.uid());

-- ── The two-sided operations ────────────────────────────────────────
-- Each of these touches a row the caller cannot see or write directly,
-- so each is `security definer` and checks the caller itself.

-- Look a friend up by the prayer ID they gave you. Returns nothing at
-- all for an unknown code, so the table cannot be trawled.
create or replace function public.find_profile_by_prayer_id(code text)
returns table (id uuid, display_name text, prayer_id text)
language sql
security definer
stable
set search_path = public
as $$
  select p.id, p.display_name, p.prayer_id
  from public.profiles p
  where p.prayer_id = upper(trim(code))
  limit 1;
$$;

-- Invite by prayer ID. Returns a word the app can speak plainly:
-- invited · joined (they had already invited you) · already_in_circle ·
-- already_invited · not_found · self.
create or replace function public.invite_to_circle(code text, invite_note text default null)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  friend uuid;
  reciprocal uuid;
begin
  if me is null then
    raise exception 'not signed in';
  end if;

  select p.id into friend from public.profiles p where p.prayer_id = upper(trim(code));
  if friend is null then
    return 'not_found';
  end if;
  if friend = me then
    return 'self';
  end if;

  if exists (select 1 from public.circle_members m where m.user_id = me and m.friend_id = friend) then
    return 'already_in_circle';
  end if;

  -- They asked first: honour it and join the two circles now.
  select v.id into reciprocal
  from public.circle_invites v
  where v.from_user = friend and v.to_user = me and v.status = 'pending';

  if reciprocal is not null then
    perform public.respond_to_invite(reciprocal, true);
    return 'joined';
  end if;

  if exists (
    select 1 from public.circle_invites v
    where v.from_user = me and v.to_user = friend and v.status = 'pending'
  ) then
    return 'already_invited';
  end if;

  insert into public.circle_invites (from_user, to_user, note)
  values (me, friend, nullif(trim(invite_note), ''))
  on conflict (from_user, to_user) do update
    set status = 'pending', note = nullif(trim(invite_note), ''), created_at = now();

  return 'invited';
end;
$$;

-- Answer an invite addressed to you. Accepting joins both circles.
create or replace function public.respond_to_invite(invite uuid, accept boolean)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  inv public.circle_invites;
begin
  if me is null then
    raise exception 'not signed in';
  end if;

  select * into inv from public.circle_invites v where v.id = invite;
  if not found or inv.to_user <> me or inv.status <> 'pending' then
    return 'not_found';
  end if;

  if accept then
    update public.circle_invites set status = 'accepted' where id = invite;
    insert into public.circle_members (user_id, friend_id)
    values (inv.from_user, inv.to_user), (inv.to_user, inv.from_user)
    on conflict do nothing;
    return 'accepted';
  end if;

  update public.circle_invites set status = 'declined' where id = invite;
  return 'declined';
end;
$$;

-- Leave a circle. Both sides are undone, and any invite between the
-- two is cleared so either may ask again one day.
create or replace function public.leave_circle(friend uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'not signed in';
  end if;

  delete from public.circle_members m
  where (m.user_id = me and m.friend_id = friend)
     or (m.user_id = friend and m.friend_id = me);

  delete from public.circle_invites v
  where (v.from_user = me and v.to_user = friend)
     or (v.from_user = friend and v.to_user = me);
end;
$$;
