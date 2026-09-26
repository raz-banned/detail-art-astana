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
