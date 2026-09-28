-- CRM (/admin): make "admins can change only status and note" hold at the grant level.
--
-- Not an automatic migration: run once by hand in Supabase Dashboard → SQL Editor, after
-- 2026-09-26-crm-admin-access.sql.
--
-- A column-level grant doesn't limit anything if the role also has table-level UPDATE,
-- which Supabase's default privileges may have given when the table was created.
-- Revoking table-level UPDATE also removes the column grants, so re-grant them after.

revoke update on table public.bookings from anon, authenticated;
grant update (status, note) on table public.bookings to authenticated;

-- Check: anon should have only INSERT, authenticated only SELECT (+ INSERT if the public
-- form's policy covers logged-in users), and UPDATE only on status and note.
-- select grantee, privilege_type from information_schema.role_table_grants
--   where table_schema = 'public' and table_name = 'bookings' order by 1, 2;
-- select grantee, column_name from information_schema.column_privileges
--   where table_schema = 'public' and table_name = 'bookings' and privilege_type = 'UPDATE';
-- select policyname, roles, cmd from pg_policies
--   where schemaname = 'public' and tablename = 'bookings';
