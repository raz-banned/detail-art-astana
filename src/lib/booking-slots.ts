// Booking time slots: the one place for slot length, working hours and how far ahead a client
// can book. The public form and the CRM both build their slot grids from here.
// The database only guarantees one active booking per direction and start time
// (bookings_direction_slot_unique in supabase/sql/2026-10-15-bookings-slots.sql); it doesn't
// know these hours, so changing them needs no SQL.

import type { DirectionSlug } from "./directions";

// TODO: всё ниже — черновик, не подтверждено компанией. Уточнить длительность услуг, часы
// работы и выходные по каждому направлению.

// Length of one slot. Every service takes exactly one slot for now.
export const SLOT_MINUTES = 60;

// Working hours as whole hours in Astana time: the first slot starts at `open`, the last one
// ends by `close`. A direction missing here takes requests without a time (metal workshop).
// The site also shows HOURS from business-info.ts; both are drafts, update them together.
export const BOOKING_HOURS: Partial<Record<DirectionSlug, { open: number; close: number }>> = {
  detailing: { open: 9, close: 20 },
  minibus: { open: 9, close: 20 },
  trucks: { open: 9, close: 18 },
};

// How many days ahead, today included, the public form offers.
export const BOOKING_DAYS_AHEAD = 14;

// Astana is UTC+5 all year. Slots are built in this zone, not in the visitor's browser zone,
// so a client abroad and the manager see the same "10:00". Both forms below come from one number.
// supabase/functions/notify-booking/index.ts repeats the offset and slotLabel()'s format for
// Telegram (it's deployed on its own and can't import this); keep them in sync.
const UTC_OFFSET_HOURS = 5;
export const SLOT_UTC_OFFSET = `+${String(UTC_OFFSET_HOURS).padStart(2, "0")}:00`;
const UTC_OFFSET_MS = UTC_OFFSET_HOURS * 60 * 60 * 1000;

// Own keys only: `in` would also find "toString" and other prototype keys.
export function hasSlots(direction: string): direction is DirectionSlug {
  return Object.hasOwn(BOOKING_HOURS, direction);
}

// Start times ("09:00", "10:00", …) of a direction's slots on any day; empty if it has none.
export function daySlots(direction: DirectionSlug): string[] {
  const hours = BOOKING_HOURS[direction];
  if (!hours) return [];

  // Minutes since midnight; converted to "HH:MM" only for output. A slot fits if it ends by close.
  const slots: string[] = [];
  for (let m = hours.open * 60; m + SLOT_MINUTES <= hours.close * 60; m += SLOT_MINUTES) {
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}

// "2026-10-20" + "10:00" → the timestamp stored in bookings.slot_start.
export function slotStart(day: string, time: string): string {
  return new Date(`${day}T${time}:00${SLOT_UTC_OFFSET}`).toISOString();
}

// Compares slots by moment, not by string: slotStart() gives "…T05:00:00.000Z", while Supabase
// returns timestamptz as "…T05:00:00+00:00", so the same slot never matches as text.
export function slotKey(timestamp: string): number {
  return new Date(timestamp).getTime();
}

const DAY_MS = 24 * 60 * 60 * 1000;

// The calendar day in Astana at a given moment, as "2026-10-20". Late in the evening in Europe
// it's already tomorrow in Astana, so the browser's own date would be off by one.
export function astanaDay(at: Date = new Date()): string {
  return new Date(at.getTime() + UTC_OFFSET_MS).toISOString().slice(0, 10);
}

// Days the public form offers: today in Astana and the days after it, BOOKING_DAYS_AHEAD in all.
// Today is left out once its last slot has started, so the first chip isn't a day with no time.
export function bookingDays(direction: DirectionSlug, now: Date): string[] {
  const first = Date.parse(`${astanaDay(now)}T00:00:00Z`);
  const days = Array.from({ length: BOOKING_DAYS_AHEAD }, (_, i) =>
    new Date(first + i * DAY_MS).toISOString().slice(0, 10),
  );
  const last = daySlots(direction).at(-1);
  if (last && slotKey(slotStart(days[0]!, last)) <= now.getTime()) days.shift();
  return days;
}

// Formatters are built once: dayLabel() runs for every chip on every render.
const weekdayShort = new Intl.DateTimeFormat("ru-RU", { timeZone: "UTC", weekday: "short" });
const dateShort = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
});
const dateLong = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

// "2026-10-20" → { weekday: "вт", date: "20 окт." }, or one line with `long`: "вторник, 20 октября".
// Formatted in UTC because the string already is an Astana date; the browser's zone would shift it.
export function dayLabel(day: string): { weekday: string; date: string };
export function dayLabel(day: string, long: true): string;
export function dayLabel(day: string, long?: true) {
  const date = new Date(`${day}T00:00:00Z`);
  if (long) return dateLong.format(date);
  return { weekday: weekdayShort.format(date), date: dateShort.format(date) };
}

// The range busy_slots() is asked for: one Astana day.
export function dayRange(day: string): { from: string; to: string } {
  const from = slotStart(day, "00:00");
  return { from, to: new Date(slotKey(from) + DAY_MS).toISOString() };
}

// A stored slot_start as Astana's "10:00", whatever the browser's zone.
export function slotTime(timestamp: string): string {
  return new Date(slotKey(timestamp) + UTC_OFFSET_MS).toISOString().slice(11, 16);
}

// A stored slot_start as its Astana day, "2026-10-20".
export function slotDay(timestamp: string): string {
  return astanaDay(new Date(timestamp));
}

// "вторник, 20 октября, 10:00" for a stored slot_start.
export function slotLabel(timestamp: string): string {
  return `${dayLabel(slotDay(timestamp), true)}, ${slotTime(timestamp)}`;
}

// The day after or before an Astana day, "2026-10-20" → "2026-10-21".
export function shiftDay(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}
