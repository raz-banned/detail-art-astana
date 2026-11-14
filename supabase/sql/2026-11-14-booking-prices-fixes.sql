-- For a database that already ran an early version of 2026-11-14-booking-prices.sql (before
-- the code review fixes). Brings it to the final version of that file; a fresh database runs
-- only that file, not this one.
--
-- Not an automatic migration: run once by hand in Supabase Dashboard → SQL Editor.
-- Safe on any early version: functions are replaced whole, the trigger is recreated, and the
-- backfill only fills values that are still empty. types.ts needs no change.

-- 1. Existing bookings: the real moments are unknown. Already agreed bookings are locked from
-- now; done ones get their slot (or creation) time as an approximate done_at. Only empty values:
-- bookings whose status changed since the early version already have them set by the trigger.
-- These UPDATEs don't set status, so the trigger doesn't fire on them.
update public.bookings set price_locked_at = now()
  where status in ('scheduled', 'ready_for_pickup', 'done') and price_locked_at is null;
update public.bookings set done_at = coalesce(slot_start, created_at)
  where status = 'done' and done_at is null;

-- 2. The price log is kept when a booking is deleted: a booking with price history can't be
-- deleted at all (was on delete cascade).
alter table public.booking_price_changes
  drop constraint booking_price_changes_booking_id_fkey,
  add constraint booking_price_changes_booking_id_fkey
    foreign key (booking_id) references public.bookings (id) on delete restrict;

-- 3. The status trigger: runs with the caller's rights (was security definer) and on INSERT too.
create or replace function public.bookings_status_guard()
returns trigger
language plpgsql
-- security invoker: it only edits the row in memory and calls has_role(), which staff may
-- already execute, so it needs no rights beyond the caller's.
security invoker
set search_path = ''
as $$
begin
  -- Undoing "done" takes money out of revenue: owner and accountant only.
  -- auth.uid() is null in the SQL Editor and for the service role: those are trusted.
  -- (anon also has no uid, but anon has no UPDATE grant on bookings at all.)
  if tg_op = 'UPDATE' and old.status = 'done' and new.status <> 'done'
     and auth.uid() is not null
     and not public.has_role('{owner,accountant}') then
    raise exception 'Only the owner or the accountant can undo a done booking'
      using errcode = '42501';
  end if;

  -- Done again after an undo gets a new time: revenue follows the current state.
  if new.status = 'done' and old.status is distinct from 'done' then
    new.done_at := now();
  elsif new.status <> 'done' then
    new.done_at := null;
  else
    new.done_at := old.done_at;
  end if;

  new.price_locked_at := coalesce(
    old.price_locked_at,
    case when new.status in ('scheduled', 'ready_for_pickup', 'done') then now() end
  );

  return new;
end;
$$;

revoke execute on function public.bookings_status_guard() from public, anon, authenticated;

drop trigger if exists bookings_status_guard on public.bookings;
create trigger bookings_status_guard
  before insert or update of status on public.bookings
  for each row execute function public.bookings_status_guard();

-- 4. set_booking_price: rejects a null price, reads the lock and the old price in one locked
-- query, and the reason check and the log use the same trimmed value.
create or replace function public.set_booking_price(
  p_booking_id uuid,
  p_price integer,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_locked boolean;
  v_old_price integer;
  -- Blank counts as no reason; the check and the log use this same value.
  v_reason text := nullif(btrim(p_reason), '');
begin
  if not (select public.has_role('{owner,accountant}')) then
    raise exception 'Only the owner or the accountant can set a price' using errcode = '42501';
  end if;

  if p_price is null then
    raise exception 'Price is required' using errcode = '22023';
  end if;

  -- for update: two people saving a price for the same booking at once are done one after the
  -- other, so the log's old_price is always the price that was really replaced.
  select b.price_locked_at is not null, bp.price into v_locked, v_old_price
    from public.bookings b
    left join public.booking_prices bp on bp.booking_id = b.id
    where b.id = p_booking_id
    for update of b;
  if not found then
    raise exception 'Booking % not found', p_booking_id using errcode = 'P0002';
  end if;

  if v_old_price is not distinct from p_price then
    return;
  end if;

  -- Once the client agreed, a change needs a reason. The first price on a locked booking
  -- doesn't: nothing agreed is being replaced.
  if v_locked and v_old_price is not null and v_reason is null then
    raise exception 'Must provide a reason, to change the locked price' using errcode = '22023';
  end if;

  insert into public.booking_prices (booking_id, price, updated_at, updated_by)
    values (p_booking_id, p_price, now(), auth.uid())
    on conflict (booking_id) do update
      set price = excluded.price, updated_at = excluded.updated_at, updated_by = excluded.updated_by;

  insert into public.booking_price_changes
      (booking_id, old_price, new_price, reason, locked, changed_by)
    values (p_booking_id, v_old_price, p_price, v_reason, v_locked, auth.uid());
end;
$$;

revoke execute on function public.set_booking_price(uuid, integer, text) from public, anon;
grant execute on function public.set_booking_price(uuid, integer, text) to authenticated;

-- 5. Check:
-- select prosecdef from pg_proc where proname = 'bookings_status_guard';      -- false
-- select tgtype from pg_trigger where tgname = 'bookings_status_guard';       -- 23: before, row, insert or update
-- select confdeltype from pg_constraint
--   where conname = 'booking_price_changes_booking_id_fkey';                  -- r (restrict)
-- select count(*) from public.bookings
--   where status in ('scheduled', 'ready_for_pickup', 'done') and price_locked_at is null; -- 0
-- select count(*) from public.bookings where status = 'done' and done_at is null;         -- 0
