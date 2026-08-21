-- What the Prayer Circle promises people, checked as three separate
-- signed-in users against the real schema.sql.
--
-- The promises, in the app's own words: nobody can browse the membership
-- of the app, a stranger is reachable only by the exact prayer ID they
-- handed you, and an intention never leaves the circle it was shared
-- with. Everything below is one of those sentences, made checkable.
--
--   psql -v ON_ERROR_STOP=1 -f supabase/test/harness.sql
--   psql -v ON_ERROR_STOP=1 -f supabase/schema.sql
--   psql -v ON_ERROR_STOP=1 -f supabase/test/rls_test.sql
--
-- Any failure raises, which stops psql and fails the run.

\set ON_ERROR_STOP on
\pset pager off
-- Every check announces itself with a notice; the rows themselves are noise.
\o /dev/null

-- ── Three people sign up ────────────────────────────────────────────
-- Read as the owner, before dropping to `authenticated`: prayer IDs are
-- random, and this stands in for the codes being exchanged out of band.

truncate auth.users cascade;
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'anna@example.org', '{"display_name":"Anna"}'),
  ('22222222-2222-2222-2222-222222222222', 'ben@example.org',  '{"display_name":"Ben"}'),
  ('33333333-3333-3333-3333-333333333333', 'cleo@example.org', '{}');

select prayer_id as a_code from public.profiles where id = '11111111-1111-1111-1111-111111111111' \gset
select prayer_id as b_code from public.profiles where id = '22222222-2222-2222-2222-222222222222' \gset
select prayer_id as c_code from public.profiles where id = '33333333-3333-3333-3333-333333333333' \gset

select test.eq(
  (select count(*)::text from public.profiles),
  '3',
  'signing up mints a profile for each person');

select test.eq(
  (select count(*)::text from public.profiles
    where prayer_id ~ '^HB-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$'),
  '3',
  'every prayer ID is well formed, with no ambiguous letters');

select test.eq(
  (select display_name from public.profiles where id = '33333333-3333-3333-3333-333333333333'),
  'A friend in Christ',
  'someone who gives no name is still welcome');

-- ── Anna, before she knows anyone ───────────────────────────────────

set role authenticated;
set request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';

select test.eq(
  (select count(*)::text from public.profiles),
  '1',
  'nobody can browse the membership of the app');

select test.eq(
  (select display_name from public.find_profile_by_prayer_id(:'b_code')),
  'Ben',
  'a friend is found by the prayer ID they handed you');

select test.eq(
  (select count(*)::text from public.find_profile_by_prayer_id('HB-ZZZZ-ZZZZ')),
  '0',
  'an unknown prayer ID finds nothing at all');

-- ── Asking ──────────────────────────────────────────────────────────

select test.eq(public.invite_to_circle(:'b_code', 'Pray with me?'), 'invited', 'Anna asks Ben');
select test.eq(public.invite_to_circle(:'b_code'), 'already_invited', 'asking twice does not ask twice');
select test.eq(public.invite_to_circle(:'a_code'), 'self', 'you cannot ask yourself');
select test.eq(public.invite_to_circle('HB-ZZZZ-ZZZZ'), 'not_found', 'a mistyped ID reaches no one');

select test.eq(
  (select count(*)::text from public.profiles),
  '2',
  'a pending invite lets the two see each other, and no one else');

-- ── Ben answers ─────────────────────────────────────────────────────

set request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222"}';

select test.eq(
  (select p.display_name || ' · ' || v.note
     from public.circle_invites v join public.profiles p on p.id = v.from_user),
  'Anna · Pray with me?',
  'the invitation arrives with the word sent alongside it');

select id as invite_id from public.circle_invites where status = 'pending' \gset

select test.eq(public.respond_to_invite(:'invite_id', true), 'accepted', 'Ben accepts');
select test.eq(public.respond_to_invite(:'invite_id', true), 'not_found', 'an answered invite cannot be answered again');

select test.eq(
  (select p.display_name from public.circle_members m join public.profiles p on p.id = m.friend_id),
  'Anna',
  'accepting puts Anna in Ben''s circle');

insert into public.prayer_intentions (author, body) values (auth.uid(), 'For my mother, who is ill.');

-- ── The circle, from Anna's side ────────────────────────────────────

set request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';

select test.eq(
  (select p.display_name from public.circle_members m join public.profiles p on p.id = m.friend_id),
  'Ben',
  'and Ben in Anna''s — a circle is never one-sided');

select test.eq(
  (select body from public.prayer_intentions),
  'For my mother, who is ill.',
  'an intention is shared with the circle');

select id as intention_id from public.prayer_intentions limit 1 \gset
-- Kept for the outsider's attempt further down, where a psql variable
-- cannot reach inside a plpgsql block.
select set_config('test.intention_id', :'intention_id', false);

insert into public.intention_prayers (intention_id, user_id) values (:'intention_id', auth.uid());
select test.eq(
  (select count(*)::text from public.intention_prayers where intention_id = :'intention_id'),
  '1',
  'praying for a friend''s intention is recorded');

do $$
declare touched int;
begin
  update public.prayer_intentions set answered = true;
  get diagnostics touched = row_count;
  if touched <> 0 then
    raise exception 'FAILED · only the author may mark an intention answered (% rows changed)', touched;
  end if;
  raise notice 'ok · only the author may mark an intention answered';
end $$;

-- ── Someone outside the circle ──────────────────────────────────────

set request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';

select test.eq(
  (select count(*)::text from public.prayer_intentions),
  '0',
  'an intention never leaves the circle it was shared with');

select test.eq(
  (select count(*)::text from public.intention_prayers),
  '0',
  'nor does who prayed for it');

select test.eq(
  (select count(*)::text from public.profiles),
  '1',
  'an outsider sees only themselves');

do $$
declare refused boolean := false;
begin
  begin
    insert into public.circle_members (user_id, friend_id)
    values ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111');
  exception when others then
    refused := true;
  end;
  if not refused then
    raise exception 'FAILED · membership cannot be forged';
  end if;
  raise notice 'ok · membership cannot be forged';
end $$;

do $$
declare refused boolean := false;
begin
  begin
    insert into public.prayer_intentions (author, body)
    values ('22222222-2222-2222-2222-222222222222', 'forged');
  exception when others then
    refused := true;
  end;
  if not refused then
    raise exception 'FAILED · an intention cannot be posted in someone else''s name';
  end if;
  raise notice 'ok · an intention cannot be posted in someone else''s name';
end $$;

-- Knowing the row's own id is not a way in: the policy asks whether the
-- intention is visible to the caller, not whether they can name it.
do $$
declare refused boolean := false;
begin
  begin
    insert into public.intention_prayers (intention_id, user_id)
    values (current_setting('test.intention_id')::uuid, auth.uid());
  exception when others then
    refused := true;
  end;
  if not refused then
    raise exception 'FAILED · an outsider prayed on an intention they cannot see';
  end if;
  raise notice 'ok · knowing an intention''s id is not a way into the circle';
end $$;

do $$
declare touched int;
begin
  update public.profiles set display_name = 'Hijacked'
  where id = '11111111-1111-1111-1111-111111111111';
  get diagnostics touched = row_count;
  if touched <> 0 then
    raise exception 'FAILED · no one may rename someone else (% rows changed)', touched;
  end if;
  raise notice 'ok · no one may rename someone else';
end $$;

-- ── Two people who ask each other ───────────────────────────────────

select test.eq(public.invite_to_circle(:'a_code'), 'invited', 'the outsider asks Anna');

set request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
select test.eq(public.invite_to_circle(:'c_code'), 'joined',
  'two people who ask each other simply join');
select test.eq(
  (select count(*)::text from public.circle_members),
  '2',
  'Anna''s circle is now two');
select test.eq(public.invite_to_circle(:'c_code'), 'already_in_circle',
  'asking someone already beside you says so');

-- ── Leaving ─────────────────────────────────────────────────────────

select public.leave_circle('33333333-3333-3333-3333-333333333333');
select test.eq(
  (select count(*)::text from public.circle_members),
  '1',
  'leaving removes them from your circle');

set request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
select test.eq(
  (select count(*)::text from public.circle_members),
  '0',
  'and you from theirs — leaving is never one-sided');
select test.eq(public.invite_to_circle(:'a_code'), 'invited',
  'and either may ask again one day');

-- ── The stranger holding only the public key ────────────────────────

reset role;
set role anon;
set request.jwt.claims = '';

select test.eq(
  (select
     (select count(*) from public.profiles)
   + (select count(*) from public.circle_members)
   + (select count(*) from public.circle_invites)
   + (select count(*) from public.prayer_intentions)
   + (select count(*) from public.intention_prayers))::text,
  '0',
  'none of it is readable without signing in');

reset role;
\o
\echo ''
\echo 'All schema and privacy checks passed.'
