import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isValid, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import {
  BOOKINGS_KEY,
  isSlotTaken,
  useBookings,
  useUpdateBooking,
  type Booking,
} from "@/lib/admin-bookings";
import { bookingSchema } from "@/lib/booking-schema";
import { daySlots, hasSlots, slotKey, slotLabel, slotStart } from "@/lib/booking-slots";
import { phoneDigits, whatsappUrl } from "@/lib/phone";
import { BUSY_SLOTS_KEY, useBusySlots } from "@/lib/use-busy-slots";
import { DIRECTION_SLUGS, directionServices, directionTitle } from "@/lib/directions";
import {
  BOOKING_DIRECTIONS,
  BOOKING_SOURCES,
  BOOKING_STATUSES,
  MANUAL_BOOKING_SOURCES,
  bookingDirectionLabel,
  bookingSourceLabel,
  bookingStatusLabel,
  clientStatusMessage,
} from "@/lib/crm-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: BookingsPage,
});

function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [directionFilter, setDirectionFilter] = useState<string>("all");

  const bookings = useBookings();

  if (bookings.isPending) return <p className="text-muted-foreground">Загрузка заявок…</p>;
  // A failed background refetch keeps the loaded list (and an open add-booking dialog).
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

  const all = bookings.data;
  // "all" lets every booking through; otherwise the field must match the chosen chip.
  const byStatus = (b: Booking) => statusFilter === "all" || b.status === statusFilter;
  const bySource = (b: Booking) => sourceFilter === "all" || b.source === sourceFilter;
  const byDirection = (b: Booking) => directionFilter === "all" || b.direction === directionFilter;
  // Each row's counts follow the other rows' filters but not its own, so a chip's number
  // matches the list it shows when clicked.
  const forStatusRow = all.filter((b) => bySource(b) && byDirection(b));
  const forSourceRow = all.filter((b) => byStatus(b) && byDirection(b));
  const forDirectionRow = all.filter((b) => byStatus(b) && bySource(b));
  const visible = all.filter((b) => byStatus(b) && bySource(b) && byDirection(b));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-3xl tracking-wider">Заявки</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => bookings.refetch()}>
            {bookings.isFetching ? "Обновляем…" : "Обновить"}
          </Button>
          <AddBookingDialog />
        </div>
      </div>

      <div className="space-y-3">
        <FilterRow
          label="Статус"
          options={BOOKING_STATUSES}
          value={statusFilter}
          onChange={setStatusFilter}
          items={forStatusRow}
          field="status"
        />
        <FilterRow
          label="Источник"
          options={BOOKING_SOURCES}
          value={sourceFilter}
          onChange={setSourceFilter}
          items={forSourceRow}
          field="source"
        />
        <FilterRow
          label="Направление"
          options={BOOKING_DIRECTIONS}
          value={directionFilter}
          onChange={setDirectionFilter}
          items={forDirectionRow}
          field="direction"
        />
      </div>

      {visible.length === 0 ? (
        <p className="text-muted-foreground">Заявок нет.</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
  items,
  field,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  items: Booking[];
  field: "status" | "source" | "direction";
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="w-28 text-sm text-muted-foreground">{label}</span>
      <FilterChip active={value === "all"} onClick={() => onChange("all")}>
        Все · {items.length}
      </FilterChip>
      {options.map((o) => (
        <FilterChip key={o.value} active={value === o.value} onClick={() => onChange(o.value)}>
          {o.label} · {items.filter((b) => b[field] === o.value).length}
        </FilterChip>
      ))}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:border-primary hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

const emptyForm = {
  name: "",
  phone: "",
  car: "",
  // The service select's value: one of the direction's services or OTHER_SERVICE.
  serviceChoice: "",
  // Free text typed after choosing "Другое".
  serviceOther: "",
  date: "",
  // "HH:MM" from the direction's slots, or NO_TIME.
  time: "",
  source: MANUAL_BOOKING_SOURCES[0]?.value ?? "",
  direction: "",
};

// Select value for a service outside the direction's list; can't be "" (Radix reserves it).
const OTHER_SERVICE = "__other__";
// Select value for a booking without a time (the client will call back to agree on it).
const NO_TIME = "__none__";

// The service to store: the chosen item, or the typed text for "Другое". A direction without a
// services list (detailing for now) stores its title, the same as the public BookingForm does.
// An empty result is caught by bookingSchema's "Укажите услугу".
function resolveService(form: typeof emptyForm): string {
  if (directionServices(form.direction).length === 0) return directionTitle(form.direction);
  return form.serviceChoice === OTHER_SERVICE ? form.serviceOther : form.serviceChoice;
}

// Keys are checked in order and only the first issue is shown, so direction goes first: the
// service select is disabled until a direction is chosen, and its error would point nowhere.
const manualBookingSchema = z.object({
  // No default: a manual booking for the truck service mustn't silently become detailing.
  direction: z.enum(DIRECTION_SLUGS, { message: "Выберите направление" }),
  ...bookingSchema.shape,
  source: z.string().min(1, "Выберите источник"),
});

function AddBookingDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: async (booking: TablesInsert<"bookings">) => {
      const { data, error } = await supabase.from("bookings").insert(booking).select().single();
      if (error) throw error;
      return data;
    },
    // Same as saving a status: a refetch started earlier mustn't drop the new booking.
    onMutate: () => queryClient.cancelQueries({ queryKey: BOOKINGS_KEY }),
    onSuccess: (created) => {
      // A refetch that ran after the insert may already contain the new booking.
      queryClient.setQueryData<Booking[]>(
        BOOKINGS_KEY,
        (old) => old && (old.some((b) => b.id === created.id) ? old : [created, ...old]),
      );
      toast.success("Заявка добавлена");
      setOpen(false);
      setForm(emptyForm);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: BUSY_SLOTS_KEY }),
    onError: (error) => {
      // Someone (the site or another manager) booked this slot after the dialog loaded it;
      // onSettled refreshes the time select, so the slot shows as taken.
      const taken = isSlotTaken(error);
      const message = taken
        ? "Это время уже занято, выберите другое."
        : "Не удалось сохранить. Попробуйте ещё раз.";
      // Otherwise the taken time stays selected and the next save fails the same way.
      if (taken) setForm((f) => ({ ...f, time: "" }));
      // The dialog may already be closed, so the inline error alone could go unseen.
      setError(message);
      toast.error(message);
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = manualBookingSchema.safeParse({ ...form, service: resolveService(form) });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Проверьте введённые данные");
      return;
    }
    const d = parsed.data;
    const time = slotted && form.time !== NO_TIME ? form.time : "";
    if (slotted && !form.time) {
      setError("Выберите время или «Без времени»");
      return;
    }
    setError(null);
    create.mutate({
      name: d.name,
      phone: d.phone,
      car: d.car || null,
      service: d.service,
      preferred_date: d.date || null,
      // Past slots are allowed here (RLS lets admins): a walk-in is often entered afterwards.
      slot_start: time ? slotStart(d.date, time) : null,
      source: d.source,
      direction: d.direction,
    });
  };

  const set = (key: keyof typeof emptyForm) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));
  // Another direction has another list, so the chosen service and any error about it no longer
  // apply.
  // Its slots and their hours differ too, so the time is chosen again.
  const setDirection = (direction: string) => {
    setForm((f) => ({ ...f, direction, serviceChoice: "", serviceOther: "", time: "" }));
    setError(null);
  };
  const setDate = (date: string) => setForm((f) => ({ ...f, date, time: "" }));
  const services = directionServices(form.direction);
  // Narrowed once here: TypeScript doesn't carry hasSlots() through form.direction.
  const slotDirection = hasSlots(form.direction) ? form.direction : null;
  const slotted = slotDirection !== null;
  const busy = useBusySlots(slotDirection, form.date || null);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">Добавить заявку</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новая заявка</DialogTitle>
          <DialogDescription>
            Для клиентов, которые позвонили или написали напрямую. В Telegram не отправляется.
          </DialogDescription>
        </DialogHeader>
        <form id="add-booking" className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          <LabeledField id="booking-name" label="Имя">
            <Input
              id="booking-name"
              required
              maxLength={80}
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
            />
          </LabeledField>
          <LabeledField id="booking-phone" label="Телефон">
            <Input
              id="booking-phone"
              type="tel"
              required
              maxLength={20}
              placeholder="+7 (___) ___ __ __"
              value={form.phone}
              onChange={(e) => set("phone")(e.target.value)}
            />
          </LabeledField>
          <LabeledField id="booking-direction" label="Направление">
            <Select value={form.direction} onValueChange={setDirection}>
              <SelectTrigger id="booking-direction">
                <SelectValue placeholder="Выберите" />
              </SelectTrigger>
              <SelectContent>
                {BOOKING_DIRECTIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </LabeledField>
          {/* A direction without a services list stores its title (see resolveService). */}
          {(!form.direction || services.length > 0) && (
            <LabeledField id="booking-service" label="Услуга">
              <Select
                value={form.serviceChoice}
                onValueChange={set("serviceChoice")}
                disabled={!form.direction}
              >
                <SelectTrigger id="booking-service">
                  <SelectValue
                    placeholder={form.direction ? "Выберите" : "Сначала выберите направление"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                  <SelectItem value={OTHER_SERVICE}>Другое</SelectItem>
                </SelectContent>
              </Select>
            </LabeledField>
          )}
          {form.serviceChoice === OTHER_SERVICE && (
            <div className="sm:col-span-2">
              <LabeledField id="booking-service-other" label="Какая услуга">
                <Input
                  id="booking-service-other"
                  required
                  maxLength={120}
                  value={form.serviceOther}
                  onChange={(e) => set("serviceOther")(e.target.value)}
                />
              </LabeledField>
            </div>
          )}
          <LabeledField id="booking-car" label="Авто">
            <Input
              id="booking-car"
              maxLength={80}
              value={form.car}
              onChange={(e) => set("car")(e.target.value)}
            />
          </LabeledField>
          <LabeledField id="booking-date" label={slotted ? "Дата" : "Желаемая дата"}>
            <Input
              id="booking-date"
              type="date"
              value={form.date}
              onChange={(e) => setDate(e.target.value)}
            />
          </LabeledField>
          {slotDirection && (
            <LabeledField id="booking-time" label="Время (Астана)">
              <Select
                value={form.time}
                onValueChange={set("time")}
                // «Без времени» works without a date: a client who'll call back about the day.
                disabled={!!form.date && busy.isPending}
              >
                <SelectTrigger id="booking-time">
                  <SelectValue
                    placeholder={busy.isError ? "Не удалось загрузить часы" : "Выберите"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_TIME}>Без времени</SelectItem>
                  {!form.date && (
                    <p className="px-2 py-1.5 text-xs text-muted-foreground">
                      Часы появятся после выбора даты
                    </p>
                  )}
                  {form.date &&
                    busy.data &&
                    daySlots(slotDirection).map((t) => {
                      const taken = busy.data.has(slotKey(slotStart(form.date, t)));
                      return (
                        <SelectItem key={t} value={t} disabled={taken}>
                          {taken ? `${t} — занято` : t}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </LabeledField>
          )}
          <LabeledField id="booking-source" label="Источник">
            <Select value={form.source} onValueChange={set("source")}>
              <SelectTrigger id="booking-source">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MANUAL_BOOKING_SOURCES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </LabeledField>
        </form>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button type="submit" form="add-booking" disabled={create.isPending}>
            {create.isPending ? "Сохраняем…" : "Добавить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LabeledField({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function BookingCard({ booking: b }: { booking: Booking }) {
  const update = useUpdateBooking();
  const [note, setNote] = useState(b.note ?? "");
  // Follow the saved note when a refetch brings another manager's edit, so saving a stale
  // draft doesn't silently overwrite it.
  useEffect(() => setNote(b.note ?? ""), [b.note]);
  const noteChanged = note.trim() !== (b.note ?? "");
  // Keep a status that isn't in BOOKING_STATUSES selectable, so it isn't silently lost.
  const statusOptions = BOOKING_STATUSES.some((s) => s.value === b.status)
    ? BOOKING_STATUSES
    : [...BOOKING_STATUSES, { value: b.status, label: b.status }];
  const clientMessage = clientStatusMessage(b.status, b);

  return (
    <li className="rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {formatDate(b.created_at, "d MMMM yyyy, HH:mm")}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold">{b.name}</p>
            {/* Site bookings are the usual case; manual ones stand out. */}
            <Badge variant={b.source === "site" ? "outline" : "default"}>
              {bookingSourceLabel(b.source)}
            </Badge>
            <Badge variant="secondary">{bookingDirectionLabel(b.direction)}</Badge>
          </div>
          <p className="flex flex-wrap gap-x-3 text-sm">
            <a href={`tel:+${phoneDigits(b.phone)}`} className="text-primary hover:underline">
              {b.phone}
            </a>
            <a
              href={whatsappUrl(b.phone)}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary"
            >
              WhatsApp
            </a>
          </p>
        </div>
        <Select
          value={b.status}
          disabled={update.isPending}
          onValueChange={(status) =>
            update.mutate(
              { id: b.id, patch: { status } },
              {
                onSuccess: () => {
                  const message = clientStatusMessage(status, b);
                  // Opened from the toast's button click, so popup blockers let it through.
                  toast.success(
                    `Статус: ${bookingStatusLabel(status)}`,
                    message
                      ? {
                          duration: 15000,
                          action: {
                            label: "Написать клиенту",
                            onClick: () =>
                              window.open(
                                whatsappUrl(b.phone, message),
                                "_blank",
                                "noopener,noreferrer",
                              ),
                          },
                        }
                      : undefined,
                  );
                },
              },
            )
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {clientMessage && (
        <Button asChild size="sm" variant="outline" className="mt-3">
          <a href={whatsappUrl(b.phone, clientMessage)} target="_blank" rel="noreferrer">
            Сообщить клиенту в WhatsApp: {bookingStatusLabel(b.status).toLowerCase()}
          </a>
        </Button>
      )}

      <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
        <Field label="Услуга">{b.service}</Field>
        <Field label="Авто">{b.car || "—"}</Field>
        {b.slot_start ? (
          <Field label="Время">{slotLabel(b.slot_start)}</Field>
        ) : (
          <Field label="Желаемая дата">
            {b.preferred_date ? formatDate(b.preferred_date, "d MMMM yyyy") : "—"}
          </Field>
        )}
      </dl>

      <div className="mt-3 space-y-2">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Заметка менеджера"
          rows={2}
          maxLength={2000}
        />
        {noteChanged && (
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={update.isPending}
              onClick={() =>
                update.mutate(
                  { id: b.id, patch: { note: note.trim() || null } },
                  { onSuccess: () => toast.success("Заметка сохранена") },
                )
              }
            >
              Сохранить
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setNote(b.note ?? "")}>
              Отмена
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

// Anyone can insert a booking through the API, so a malformed date must not crash the list.
function formatDate(value: string, pattern: string): string {
  const date = parseISO(value);
  return isValid(date) ? format(date, pattern, { locale: ru }) : value;
}
