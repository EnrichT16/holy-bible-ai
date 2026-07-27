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
