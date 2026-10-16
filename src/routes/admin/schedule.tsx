import { useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useBookings, type Booking } from "@/lib/admin-bookings";
import {
  astanaDay,
  dayLabel,
  daySlots,
  hasSlots,
  shiftDay,
  slotDay,
  slotTime,
} from "@/lib/booking-slots";
import { bookingStatusLabel } from "@/lib/crm-config";
import { DIRECTION_SLUGS, directionTitle } from "@/lib/directions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { phoneDigits } from "@/lib/phone";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/schedule")({
  component: SchedulePage,
});

// Columns: the directions that book time slots (see BOOKING_HOURS in booking-slots.ts).
const SLOT_DIRECTIONS = DIRECTION_SLUGS.filter(hasSlots);

// Rows: every start time any direction has, so one table fits all their hours.
const GRID_TIMES = [...new Set(SLOT_DIRECTIONS.flatMap(daySlots))].sort();

function cellKey(time: string, direction: string): string {
  return `${time}|${direction}`;
}

type Schedule = {
  // Bookings by cellKey(time, direction); an array, since nothing in the data rules out two.
  cells: Map<string, Booking[]>;
  // The day's bookings that have no cell: a preferred_date only (manual "без времени", old
  // rows), or a slot in a direction that has no column.
  unscheduled: Booking[];
};

// Lays one Astana day's bookings out for the table. `bookings` is the CRM's whole list.
function buildSchedule(bookings: Booking[], day: string): Schedule {
  const cells = new Map<string, Booking[]>();
  const unscheduled: Booking[] = [];
  // The day's active bookings: by slot_start's Astana day when there's a time, by preferred_date
  // when there isn't. Cancelled ones are left out: they've freed their slot, which may hold
  // another client now.
  const filteredBookings = bookings.filter(
    (b) =>
      b.status !== "cancelled" &&
      (b.slot_start ? slotDay(b.slot_start) === day : b.preferred_date === day),
  );
  for (const b of filteredBookings) {
    // No time, or a direction without a column (dropped from BOOKING_HOURS): the list below.
    if (!b.slot_start || !hasSlots(b.direction)) {
      unscheduled.push(b);
      continue;
    }
    const key = cellKey(slotTime(b.slot_start), b.direction);
    const values = cells.get(key);

    cells.set(key, values ? [...values, b] : [b]);
  }
  return { cells, unscheduled };
}

function SchedulePage() {
  const bookings = useBookings();
  const [day, setDay] = useState(() => astanaDay());

  if (bookings.isPending) return <p className="text-muted-foreground">Загрузка расписания…</p>;
  if (bookings.isError && !bookings.data) {
    return (
      <div className="space-y-3">
        <p className="text-destructive">Не удалось загрузить заявки.</p>
        <Button variant="outline" onClick={() => bookings.refetch()}>
          Повторить
        </Button>
      </div>
    );
  }

  const { cells, unscheduled } = buildSchedule(bookings.data, day);
  // A booking outside today's grid (hours changed since, or entered by hand) still gets a row.
  const times = [
    ...new Set([...GRID_TIMES, ...[...cells.keys()].map((k) => k.split("|")[0]!)]),
  ].sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl tracking-wider">Расписание</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setDay((d) => shiftDay(d, -1))}>
            ←
          </Button>
          <Input
            type="date"
            aria-label="День"
            className="w-auto"
            value={day}
            // Clearing the field would leave no day to show.
            onChange={(e) => e.target.value && setDay(e.target.value)}
          />
          <Button variant="outline" size="sm" onClick={() => setDay((d) => shiftDay(d, 1))}>
            →
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDay(astanaDay())}>
            Сегодня
          </Button>
          <Button variant="ghost" size="sm" onClick={() => bookings.refetch()}>
            {bookings.isFetching ? "Обновляем…" : "Обновить"}
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground first-letter:uppercase">
        {dayLabel(day, true)} · время по Астане · отменённые не показаны
      </p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="w-20 px-3 py-2 text-left font-medium">Время</th>
              {SLOT_DIRECTIONS.map((d) => (
                <th key={d} className="px-3 py-2 text-left font-medium">
                  {directionTitle(d)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((time) => (
              <tr key={time} className="border-b border-border last:border-0">
                <td className="px-3 py-2 align-top font-medium tabular-nums">{time}</td>
                {SLOT_DIRECTIONS.map((d) => {
                  const items = cells.get(cellKey(time, d)) ?? [];
                  const open = daySlots(d).includes(time);
                  return (
                    <td
                      key={d}
                      className={cn("px-3 py-2 align-top", !open && !items.length && "bg-muted/30")}
                    >
                      {items.length > 0 ? (
                        <div className="space-y-2">
                          {items.map((b) => (
                            <BookingEntry key={b.id} booking={b} />
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60">{open ? "" : "—"}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {unscheduled.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Вне таблицы · {unscheduled.length}</h2>
          <ul className="space-y-2">
            {unscheduled.map((b) => (
              <li key={b.id} className="rounded-md border border-border p-3">
                <BookingEntry booking={b} direction />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// One booking in a cell or in the "Без времени" list: client, service, status.
function BookingEntry({ booking: b, direction }: { booking: Booking; direction?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">{b.name}</span>
        <Badge variant={b.status === "new" ? "default" : "secondary"}>
          {bookingStatusLabel(b.status)}
        </Badge>
        {direction && <Badge variant="outline">{directionTitle(b.direction)}</Badge>}
        {direction && (
          <span className="text-xs text-muted-foreground">
            {b.slot_start ? slotTime(b.slot_start) : "без времени"}
          </span>
        )}
      </div>
      <Line>{b.service}</Line>
      <Line>
        <a href={`tel:+${phoneDigits(b.phone)}`} className="hover:text-primary">
          {b.phone}
        </a>
        {b.car ? ` · ${b.car}` : ""}
      </Line>
    </div>
  );
}

function Line({ children }: { children: ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}
