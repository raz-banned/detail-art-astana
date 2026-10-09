-- Bookings: which direction of the park (detailing, minibus, truck service, metal workshop)
-- a booking is for, so the CRM can filter by it once each direction has its own page.
--
-- Not an automatic migration: run once by hand in Supabase Dashboard → SQL Editor, after
-- 2026-09-29-bookings-source.sql, and BEFORE deploying the code that sends `direction`
-- (an insert with an unknown column fails, so the old form would keep working but the new
-- one wouldn't).

-- 1. Existing rows and any form that doesn't send it yet get 'detailing': until now the site
-- only took detailing bookings. Unlike status and source, the list is checked here: anyone
-- can insert through the API, and an unknown value would fall out of every CRM filter.
-- The values are the slugs of DIRECTIONS in src/lib/directions.ts; keep the two in sync.
alter table public.bookings
  add column direction text not null default 'detailing'
  constraint bookings_direction_check
    check (direction in ('detailing', 'minibus', 'trucks', 'metal-workshop'));

-- 2. Both the public form (anon) and the CRM (authenticated) choose the direction. INSERT is
-- granted per column (see 2026-09-29-bookings-source.sql), so the new column needs its own
-- grant. UPDATE stays limited to status and note.
grant insert (direction) on table public.bookings to anon, authenticated;

-- Check: anon and authenticated both have INSERT on direction; every existing row is
-- 'detailing'.
-- select grantee, column_name from information_schema.column_privileges
--   where table_schema = 'public' and table_name = 'bookings' and privilege_type = 'INSERT'
--     and grantee in ('anon', 'authenticated') order by 1, 2;
-- select direction, count(*) from public.bookings group by direction;
