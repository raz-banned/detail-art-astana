-- Bookings: a time slot, so two clients can't book the same direction at the same time.
--
-- Not an automatic migration: run once by hand in Supabase Dashboard → SQL Editor, after
-- 2026-10-09-bookings-direction.sql, and BEFORE deploying code that sends `slot_start`.
--
-- The slot length and working hours live in src/lib/booking-slots.ts; the database only knows
-- that a direction can't have two active bookings starting at the same moment.

-- 1. When the booking starts. Old rows and bookings without a time keep only preferred_date.
alter table public.bookings add column slot_start timestamptz;

-- 2. One active booking per direction and start time. A cancelled booking frees its slot.
-- Done as an index, not a check in the form: two clients pressing "Send" at the same moment
-- both pass any check made before the insert; the second insert fails here with 23505.
-- Changing a cancelled booking back to another status fails the same way if the slot was taken.
create unique index bookings_direction_slot_unique on public.bookings (direction, slot_start)
  where slot_start is not null and status <> 'cancelled';

-- The index only catches the exact same start, so a slot must start on a whole hour: 10:30 or
-- 10:00:00.001 would slip past a 10:00 booking. Astana is UTC+5, a whole-hour offset, so a
-- whole hour in UTC is a whole hour in Astana. Tied to SLOT_MINUTES = 60 in booking-slots.ts.
-- Working hours aren't checked here on purpose: they're a draft and change without SQL.
alter table public.bookings add constraint bookings_slot_start_on_hour
  check (slot_start is null or extract(epoch from slot_start) % 3600 = 0);

-- 3. Both forms choose the slot. INSERT is granted per column (see
-- 2026-09-29-bookings-source.sql). UPDATE stays limited to status and note.
grant insert (slot_start) on table public.bookings to anon, authenticated;

-- 4. The public form can't book a slot in the past. Admins can: a walk-in is entered after the
-- fact. A restrictive policy is ANDed with "Anyone can submit a booking".
create policy "Site bookings can't be in the past" on public.bookings
  as restrictive
  for insert to anon
  with check (slot_start is null or slot_start > now());

-- A signed-in user who isn't an admin also passes "Anyone can submit a booking", so the same
-- rule applies to authenticated, with admins let through. A separate policy, not one for both
-- roles: anon has no EXECUTE on is_admin(), and the call would fail every site booking.
create policy "Only admins can insert past slots" on public.bookings
  as restrictive
  for insert to authenticated
  with check (slot_start is null or slot_start > now() or (select public.is_admin()));

-- 5. Which slots are taken, for the public form. anon can't read bookings (they hold personal
-- data), so this returns only start times. security definer runs it with the owner's rights.
-- - The range is capped at 31 days and a wider one raises an error instead of returning nothing:
--   an empty result would show every slot as free.
-- - Non-admins only get slots from now on: the form doesn't need the past, and past times would
--   show the business's daily volume to anyone with the publishable key.
create or replace function public.busy_slots(
  p_direction text,
  p_from timestamptz,
  p_to timestamptz
)
returns setof timestamptz
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_to - p_from > interval '31 days' then
    raise exception 'busy_slots: range is limited to 31 days' using errcode = '22023';
  end if;

  if not (select public.is_admin()) then
    p_from := greatest(p_from, now());
  end if;

  return query
    select b.slot_start
    from public.bookings b
    where b.direction = p_direction
      and b.status <> 'cancelled'
      and b.slot_start >= p_from
      and b.slot_start < p_to
    order by 1;
end;
$$;

revoke execute on function public.busy_slots(text, timestamptz, timestamptz) from public;
grant execute on function public.busy_slots(text, timestamptz, timestamptz)
  to anon, authenticated;

-- Check: anon and authenticated have INSERT on slot_start; the index, the check and both
-- policies exist; busy_slots returns nothing yet and raises on a range over 31 days.
-- select grantee, column_name from information_schema.column_privileges
--   where table_schema = 'public' and table_name = 'bookings' and privilege_type = 'INSERT'
--     and column_name = 'slot_start';
-- select indexname, indexdef from pg_indexes where indexname = 'bookings_direction_slot_unique';
-- select conname, pg_get_constraintdef(oid) from pg_constraint
--   where conname = 'bookings_slot_start_on_hour';
-- select policyname, permissive, roles, cmd, with_check from pg_policies
--   where schemaname = 'public' and tablename = 'bookings' order by cmd, policyname;
-- select * from public.busy_slots('detailing', now(), now() + interval '7 days');
-- select * from public.busy_slots('detailing', now(), now() + interval '40 days'); -- error
