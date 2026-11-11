-- CRM (/admin): admins.role becomes an enum, so a typo in a role name fails when a policy or
-- function is written, not as a silent "no access" later. Follows 2026-11-07-admin-roles.sql,
-- which is already applied: run this file after it.
--
-- Not an automatic migration: run once by hand in Supabase Dashboard → SQL Editor.
-- After running it, update src/integrations/supabase/types.ts (Enums.staff_role, admins.role,
-- has_role) and STAFF_ROLE_LABELS in src/lib/staff-roles.ts.
--
-- Adding a role later: `alter type public.staff_role add value 'cashier';` as its own run, since
-- a new value can't be used in the same transaction that adds it. Renaming or removing a value
-- is much harder in Postgres, so pick names carefully.

-- 1. The type, and the column switched to it. The CHECK is replaced by the type itself.
-- The default goes first: the old text default can't be cast automatically.
create type public.staff_role as enum ('manager', 'owner', 'accountant');

alter table public.admins drop constraint admins_role_check;
alter table public.admins alter column role drop default;
alter table public.admins
  alter column role type public.staff_role using role::public.staff_role;
alter table public.admins alter column role set default 'manager';

-- 2. has_role() takes the enum. A different argument type makes a new overload, so the text[]
-- version is dropped first (nothing uses it in a policy yet).
-- Call it with an array literal: public.has_role('{owner,accountant}'). A typo like
-- '{Owner}' fails with "invalid input value for enum staff_role" when the policy is created.
-- (array['owner'] would be text[] and fail with "function does not exist": loud too.)
drop function public.has_role(text[]);

create function public.has_role(p_roles public.staff_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where role = any(p_roles) and user_id = auth.uid())
$$;

revoke execute on function public.has_role(public.staff_role[]) from public, anon;
grant execute on function public.has_role(public.staff_role[]) to authenticated;

-- 3. Check: roles kept their values; a typo is rejected.
-- select user_id, role from public.admins;
-- select public.has_role('{owner,accountant}'); -- in the SQL Editor auth.uid() is null: false
-- select public.has_role('{Owner}');            -- error: invalid input value for enum
