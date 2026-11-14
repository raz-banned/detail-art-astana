-- CRM (/admin/revenue): revenue by day for the owner and the accountant.
--
-- Not an automatic migration: run once by hand in Supabase Dashboard → SQL Editor, after
-- 2026-11-14-booking-prices.sql.
-- After running it, update src/integrations/supabase/types.ts (revenue_by_day).
--
-- A prototype on prices typed into the CRM, until the company has a cash register / 1C.

-- 1. Revenue counts done bookings by done_at; this keeps the lookup cheap as bookings grow.
create index if not exists bookings_done_at on public.bookings (done_at) where done_at is not null;

-- 2. Revenue by Astana day, for days p_from..p_to inclusive (dates as Astana sees them).
-- - Astana is a fixed +05:00, the same as UTC_OFFSET_HOURS in src/lib/booking-slots.ts, so the
--   server and the CRM agree on where a day starts. A named zone ('Asia/Almaty') would follow the
--   server's tz database, which may predate Kazakhstan's 2024 switch to +5.
-- - Days with no done bookings aren't returned.
-- - A done booking without a price counts in done_count and unpriced_count, not in revenue, so the
--   page can say the total is incomplete.
-- - security invoker: owner and accountant can already read bookings and booking_prices through
--   RLS. The role check up front turns "a manager sees zero revenue" into a clear error.
-- - The range is capped at 366 days and a wider one raises an error, like busy_slots().
create or replace function public.revenue_by_day(p_from date, p_to date)
returns table (done_day date, revenue bigint, done_count integer, unpriced_count integer)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  -- Astana's offset, once: the range bounds and the day grouping must use the same one.
  v_tz constant interval := '+05:00';
  -- Astana midnight at the start of p_from, and at the start of the day after p_to: `<` on the end
  -- keeps a booking done exactly at midnight in one day only. Comparing done_at with the dates
  -- directly would use the session's time zone (UTC), not Astana's.
  v_start timestamptz := p_from::timestamp at time zone v_tz;
  v_end timestamptz := (p_to + 1)::timestamp at time zone v_tz;
begin
  if not (select public.has_role('{owner,accountant}')) then
    raise exception 'Only the owner or the accountant can see revenue' using errcode = '42501';
  end if;
  if p_from is null or p_to is null or p_to < p_from then
    raise exception 'revenue_by_day: invalid range' using errcode = '22023';
  end if;
  -- date - date is a number of days.
  if p_to - p_from >= 366 then
    raise exception 'revenue_by_day: range is limited to 366 days' using errcode = '22023';
  end if;

  return query
    select
      (b.done_at at time zone v_tz)::date,
      coalesce(sum(bp.price), 0)::bigint,
      count(*)::integer,
      (count(*) filter (where bp.price is null))::integer
    from public.bookings b
    left join public.booking_prices bp on bp.booking_id = b.id
    where b.status = 'done'
      and b.done_at >= v_start and b.done_at < v_end
    group by 1
    order by 1;
end;
$$;

revoke execute on function public.revenue_by_day(date, date) from public, anon;
grant execute on function public.revenue_by_day(date, date) to authenticated;

-- 3. Check. In the SQL Editor auth.uid() is null, so act as the owner (see the PR's test plan):
-- begin;
-- select set_config('request.jwt.claims', '{"sub":"OWNER_UID","role":"authenticated"}', true);
-- set local role authenticated;
-- select * from public.revenue_by_day(date '2026-11-01', date '2026-11-30');
-- select * from public.revenue_by_day(date '2025-01-01', date '2026-11-30'); -- error: 366 days
-- rollback;
