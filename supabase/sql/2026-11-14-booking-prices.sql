-- CRM (/admin): the price of a booking, seen and set only by the owner and the accountant, plus
-- the moment a booking was done, for revenue by day later.
--
-- Not an automatic migration: run once by hand in Supabase Dashboard → SQL Editor, after
-- 2026-11-11-admin-roles-enum.sql.
-- After running it, update src/integrations/supabase/types.ts (bookings.done_at,
-- bookings.price_locked_at, booking_prices, booking_price_changes, set_booking_price).
--
-- A prototype: the price is typed into the CRM until the company has a cash register / 1C.

-- 1. Two moments on the booking, both written only by the trigger in step 4:
-- - done_at: when the booking became "done". Revenue for a day is counted by this, in Astana time.
-- - price_locked_at: when the client agreed (status reached scheduled or later). Set once and
--   never cleared, so moving the status back to "new" doesn't unlock the price.
-- Staff have no INSERT or UPDATE grant on these columns, so the API can't set them.
alter table public.bookings add column done_at timestamptz;
alter table public.bookings add column price_locked_at timestamptz;

-- 2. The price lives in its own table, not in a bookings column.
-- Grants go to database roles, and every staff user is the same role (authenticated), so a
-- column grant can't hide a price from a manager while showing it to the owner. RLS can tell
-- staff roles apart (has_role), but it filters rows: on bookings it would hide the whole booking.
-- A row in another table is the way to hide "one column" from managers.
-- Whole tenge, no tiyn: integer.
create table public.booking_prices (
  booking_id uuid primary key references public.bookings (id) on delete cascade,
  price integer not null check (price >= 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

-- 3. Every price change, so a change after the client agreed leaves a trace (like an addendum to
-- a work order on paper). Only set_booking_price() writes here; nobody can edit or delete rows.
create table public.booking_price_changes (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings (id) on delete cascade,
  old_price integer,
  new_price integer not null,
  reason text,
  locked boolean not null,
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users (id) on delete set null
);
create index booking_price_changes_booking_id on public.booking_price_changes (booking_id);

-- Only reading through the API; writes go through set_booking_price() (step 5).
-- Revoke first: Supabase's default privileges may grant everything on new tables.
alter table public.booking_prices enable row level security;
alter table public.booking_price_changes enable row level security;
revoke all on table public.booking_prices, public.booking_price_changes from anon, authenticated;
grant select on table public.booking_prices, public.booking_price_changes to authenticated;

create policy "Owner and accountant can read prices" on public.booking_prices
  for select to authenticated
  using ((select public.has_role('{owner,accountant}')));

create policy "Owner and accountant can read price changes" on public.booking_price_changes
  for select to authenticated
  using ((select public.has_role('{owner,accountant}')));

-- 4. Status changes on bookings: done_at, the price lock, and who may undo "done".
-- Only on UPDATE: nobody has an INSERT grant on status, so a new booking is always 'new'.
-- Fires only when the UPDATE sets status, so a note edit doesn't touch the timestamps.
-- Statuses are plain text (see BOOKING_STATUSES in src/lib/crm-config.ts); the lock statuses
-- here must follow that list if it changes.
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
  if old.status = 'done' and new.status <> 'done'
     and auth.uid() is not null
     and not public.has_role('{owner,accountant}') then
    raise exception 'Only the owner or the accountant can undo a done booking'
      using errcode = '42501';
  end if;

  -- Done again after an undo gets a new time: revenue follows the current state.
  if new.status = 'done' and old.status <> 'done' then
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

create trigger bookings_status_guard
  before update of status on public.bookings
  for each row execute function public.bookings_status_guard();

-- 5. Setting a price: the only way to write booking_prices, so the lock and the log can't be
-- skipped. security definer: it writes tables the caller has no write grant on, which is why it
-- checks the role itself first.
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
begin
  if not (select public.has_role('{owner,accountant}')) then
    raise exception 'Only the owner or the accountant can set a price' using errcode = '42501';
  end if;

  -- for update: two people saving a price for the same booking at once are done one after the
  -- other, so the log's old_price is always the price that was really replaced.
  select b.price_locked_at is not null into v_locked
    from public.bookings b where b.id = p_booking_id for update;
  if not found then
    raise exception 'Booking % not found', p_booking_id using errcode = 'P0002';
  end if;

  select bp.price into v_old_price
    from public.booking_prices bp where bp.booking_id = p_booking_id;

  if v_old_price is not distinct from p_price then
    return;
  end if;

  if v_locked and v_old_price is not null and nullif(btrim(p_reason), '') is null then
    raise exception 'Must provide a reason, to change the locked price' using errcode = '22023';
  end if;

  insert into public.booking_prices (booking_id, price, updated_at, updated_by)
    values (p_booking_id, p_price, now(), auth.uid())
    on conflict (booking_id) do update
      set price = excluded.price, updated_at = excluded.updated_at, updated_by = excluded.updated_by;

  insert into public.booking_price_changes
      (booking_id, old_price, new_price, reason, locked, changed_by)
    values (p_booking_id, v_old_price, p_price, nullif(btrim(p_reason), ''), v_locked, auth.uid());
end;
$$;

revoke execute on function public.set_booking_price(uuid, integer, text) from public, anon;
grant execute on function public.set_booking_price(uuid, integer, text) to authenticated;

-- 6. Check:
-- No write grants for staff on the new tables or columns:
-- select grantee, table_name, privilege_type from information_schema.role_table_grants
--   where table_schema = 'public' and table_name in ('booking_prices', 'booking_price_changes')
--   order by 1, 2, 3;
-- select grantee, column_name, privilege_type from information_schema.column_privileges
--   where table_schema = 'public' and table_name = 'bookings'
--     and column_name in ('done_at', 'price_locked_at');  -- only SELECT
-- Then in the CRM: as a manager, a booking moved to "Записан" gets price_locked_at; moving a
-- "Выполнена" booking back fails for a manager and works for the owner.
