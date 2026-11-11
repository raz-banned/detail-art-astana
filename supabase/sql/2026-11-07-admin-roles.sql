-- CRM (/admin): a role for each staff user, so revenue can later be shown only to the owner and
-- the accountant. This file only adds the roles; nothing reads them in a policy yet.
--
-- Not an automatic migration: run once by hand in Supabase Dashboard → SQL Editor.
-- After running it, update src/integrations/supabase/types.ts (admins.role, has_role).

-- 1. The role. Existing staff become managers; set the owner and the accountant by hand (step 4).
-- The list is checked here because policies will depend on it: a typo like 'Owner' must fail
-- loudly instead of silently giving no access.
alter table public.admins
  add column role text not null default 'manager'
  constraint admins_role_check check (role in ('manager', 'owner', 'accountant'));

-- Roles change only here, in the SQL Editor: authenticated has no UPDATE or INSERT on admins
-- (see 2026-09-26-crm-admin-access.sql), so a manager can't promote themselves through the API.

-- 2. Helper for policies and functions: does the current user have one of these roles?
-- An array, so a check like "owner or accountant" is a single call.
-- security definer: it reads admins regardless of the caller's RLS, like is_admin().
-- search_path = '': names are fully qualified, so a table or function planted in another schema
-- can't be picked up instead of public.admins.
create or replace function public.has_role(p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where role = any(p_roles) and user_id = auth.uid())
$$;

revoke execute on function public.has_role(text[]) from public, anon;
grant execute on function public.has_role(text[]) to authenticated;

-- 3. Check: the column, the constraint and the function exist; every staff user is a manager.
-- select user_id, role from public.admins;
-- select public.has_role(array['manager']); -- in the SQL Editor auth.uid() is null: false

-- 4. Give roles (by the user's email in Authentication → Users):
-- update public.admins set role = 'owner'
--   where user_id = (select id from auth.users where email = 'owner@example.com');
-- update public.admins set role = 'accountant'
--   where user_id = (select id from auth.users where email = 'accountant@example.com');
