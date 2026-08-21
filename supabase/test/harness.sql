-- A local stand-in for the parts of Supabase that schema.sql leans on, so
-- the real schema can be executed and exercised verbatim against a plain
-- Postgres — in CI, or on your own machine.
--
-- This file is never run against the real project. Supabase already
-- provides all of it.

-- ── The two roles PostgREST speaks as ───────────────────────────────
-- `anon` for a stranger holding only the public key, `authenticated`
-- for someone signed in. Supabase grants both access to new tables in
-- `public` by default; the policies are what actually decide anything.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
end $$;

grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;

-- ── The auth schema ─────────────────────────────────────────────────
-- Only what the schema touches: the users table the profile trigger
-- hangs off, and auth.uid(), which reads the caller out of the JWT.

create schema if not exists auth;
grant usage on schema auth to anon, authenticated;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);

create or replace function auth.uid() returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::json ->> 'sub', '')::uuid;
$$;

-- ── Assertions ──────────────────────────────────────────────────────
-- Deliberately plain: a test that passes says one line, and a test that
-- fails raises, which stops psql under ON_ERROR_STOP and fails the job.

create schema if not exists test;
grant usage on schema test to anon, authenticated;

create or replace function test.eq(actual text, expected text, what text)
returns void
language plpgsql
as $$
begin
  if actual is distinct from expected then
    raise exception 'FAILED · %  (expected %, got %)',
      what, coalesce(expected, '<null>'), coalesce(actual, '<null>');
  end if;
  raise notice 'ok · %', what;
end;
$$;
