-- CRM (/admin): staff access to bookings.
--
-- Not an automatic migration: run once by hand in Supabase Dashboard → SQL Editor.
-- Safe for the public booking form: anon keeps INSERT only and gets no new rights.

-- 1. Who may use the CRM. One row per staff user (auth.users).
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

grant select on table public.admins to authenticated;

create policy "Users can see their own admin row" on public.admins
  for select to authenticated
  using (user_id = auth.uid());

-- 2. Helper for policies: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 3. Manager's note on a booking.
alter table public.bookings add column note text;

-- 4. Admins can read bookings and change only status and note.
grant select on table public.bookings to authenticated;
grant update (status, note) on table public.bookings to authenticated;

create policy "Admins can read bookings" on public.bookings
  for select to authenticated
  using (public.is_admin());

create policy "Admins can update bookings" on public.bookings
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 5. After creating your user in Authentication → Users, make it an admin:
-- insert into public.admins (user_id)
--   select id from auth.users where email = 'you@example.com';
