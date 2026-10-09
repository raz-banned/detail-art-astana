// CRM (/admin) settings that the business hasn't confirmed yet.
// Everything here is a draft: edit these lists instead of the admin components.

import { ADDRESS } from "./business-info";
import { DIRECTIONS } from "./directions";

// TODO: подтвердить у компании список статусов заявки и их порядок.
// `value` is stored in bookings.status as plain text, so adding or reordering is safe.
// Renaming a `value` that is already in use needs one SQL update of existing rows.
// "new" must stay: the public booking form's RLS policy only allows status = 'new'.
export const BOOKING_STATUSES = [
  { value: "new", label: "Новая" },
  { value: "in_progress", label: "В работе" },
  { value: "scheduled", label: "Записан" },
  { value: "ready_for_pickup", label: "Готов к выдаче" },
  { value: "done", label: "Выполнена" },
  { value: "cancelled", label: "Отказ" },
] as const;

export function bookingStatusLabel(value: string): string {
  // Unknown values (e.g. a status removed from the list) are shown as-is, not hidden.
  return BOOKING_STATUSES.find((s) => s.value === value)?.label ?? value;
}

// TODO: согласовать тексты с владельцем.
// WhatsApp message to the client for a status. The CRM offers to send it when a manager
// sets the status; the manager still presses "Send" in WhatsApp, nothing goes out on its own.
const CLIENT_STATUS_MESSAGES: Partial<
  Record<string, (b: { name: string; car: string | null }) => string>
> = {
  ready_for_pickup: (b) =>
    [
      `Здравствуйте, ${b.name}!`,
      `Ваш автомобиль${b.car ? ` ${b.car}` : ""} готов к выдаче.`,
      `Ждём вас по адресу: ${ADDRESS}.`,
      "APELSIN INDUSTRIAL",
    ].join("\n"),
};

export function clientStatusMessage(
  status: string,
  booking: { name: string; car: string | null },
): string | null {
  return CLIENT_STATUS_MESSAGES[status]?.(booking) ?? null;
}

// TODO: подтвердить у компании список источников заявки.
// `value` is stored in bookings.source as plain text, like statuses.
// "site" must stay: it's the column default that the public booking form can't override
// (anon has no INSERT grant on source), and notify-booking sends Telegram only for it.
export const BOOKING_SOURCES = [
  { value: "site", label: "Сайт" },
  { value: "phone", label: "Звонок" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "walk_in", label: "Пришёл сам" },
] as const;

// Sources a manager can pick when adding a booking by hand.
export const MANUAL_BOOKING_SOURCES = BOOKING_SOURCES.filter((s) => s.value !== "site");

export function bookingSourceLabel(value: string): string {
  return BOOKING_SOURCES.find((s) => s.value === value)?.label ?? value;
}

// bookings.direction holds a direction's slug; the list itself lives in directions.ts.
export const BOOKING_DIRECTIONS = DIRECTIONS.map((d) => ({ value: d.slug, label: d.title }));

export function bookingDirectionLabel(value: string): string {
  return BOOKING_DIRECTIONS.find((d) => d.value === value)?.label ?? value;
}
