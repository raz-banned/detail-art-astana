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
// so a client abroad and the manager see the same "10:00".
export const SLOT_UTC_OFFSET = "+05:00";

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
