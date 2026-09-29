// CRM (/admin) settings that the business hasn't confirmed yet.
// Everything here is a draft: edit these lists instead of the admin components.

// TODO: подтвердить у компании список статусов заявки и их порядок.
// `value` is stored in bookings.status as plain text, so adding or reordering is safe.
// Renaming a `value` that is already in use needs one SQL update of existing rows.
// "new" must stay: the public booking form's RLS policy only allows status = 'new'.
export const BOOKING_STATUSES = [
  { value: "new", label: "Новая" },
  { value: "in_progress", label: "В работе" },
  { value: "scheduled", label: "Записан" },
  { value: "done", label: "Выполнена" },
  { value: "cancelled", label: "Отказ" },
] as const;

export function bookingStatusLabel(value: string): string {
  // Unknown values (e.g. a status removed from the list) are shown as-is, not hidden.
  return BOOKING_STATUSES.find((s) => s.value === value)?.label ?? value;
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
