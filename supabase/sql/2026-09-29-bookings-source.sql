-- CRM (/admin): bookings added by hand (phone call, WhatsApp, walk-in) and a source column.
--
-- Not an automatic migration: run once by hand in Supabase Dashboard → SQL Editor, after
-- 2026-09-28-bookings-update-grants.sql.

-- 1. Where the booking came from. Existing rows and the public form get 'site'; the list
-- of other values lives in src/lib/crm-config.ts (BOOKING_SOURCES), like statuses.
alter table public.bookings add column source text not null default 'site';

-- 2. INSERT only on the columns the forms fill in. Table-level INSERT (the Supabase default)
-- let the public form also set note, created_at, id and any column added later, so it
-- could, for example, fake a manager's note or a booking date. Now:
-- - anon (the public form) can't set source, status or note: they keep their defaults;
-- - authenticated (admins in the CRM) can also set source.
-- Revoking table-level INSERT also removes column INSERT grants, so they're re-granted.
revoke insert on table public.bookings from anon, authenticated;
grant insert (name, phone, car, service, preferred_date) on table public.bookings to anon;
grant insert (name, phone, car, service, preferred_date, source)
  on table public.bookings to authenticated;

-- 3. Admins can add bookings from the CRM. The existing "Anyone can submit a booking" policy
-- covers anon and authenticated with status = 'new'; this one is ORed with it.
create policy "Admins can insert bookings" on public.bookings
  for insert to authenticated
  with check ((select public.is_admin()));

-- A signed-in user who isn't an admin passes "Anyone can submit a booking", and the column
-- grant lets authenticated set source, so only admins may set anything but 'site'.
-- A restrictive policy is ANDed with all permissive ones.
create policy "Only admins can insert non-site bookings" on public.bookings
  as restrictive
  for insert to authenticated
  with check (source = 'site' or (select public.is_admin()));

-- Check: INSERT for anon only on name, phone, car, service, preferred_date; for authenticated
-- the same plus source. Every existing row should have source = 'site'.
-- select grantee, column_name from information_schema.column_privileges
--   where table_schema = 'public' and table_name = 'bookings' and privilege_type = 'INSERT'
--     and grantee in ('anon', 'authenticated') order by 1, 2;
-- select policyname, permissive, roles, cmd, with_check from pg_policies
--   where schemaname = 'public' and tablename = 'bookings' order by cmd, policyname;
-- select source, count(*) from public.bookings group by source;
