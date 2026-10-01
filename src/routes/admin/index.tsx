import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isValid, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { bookingSchema } from "@/lib/booking-schema";
import {
  BOOKING_SOURCES,
  BOOKING_STATUSES,
  MANUAL_BOOKING_SOURCES,
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

type Booking = Tables<"bookings">;
const BOOKINGS_KEY = ["admin", "bookings"];

function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const bookings = useQuery({
    queryKey: BOOKINGS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

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
  // Each row's counts follow the other row's filter, so a chip's number matches the list
  // it shows.
  const bySource = sourceFilter === "all" ? all : all.filter((b) => b.source === sourceFilter);
  const byStatus = statusFilter === "all" ? all : all.filter((b) => b.status === statusFilter);
  const visible = bySource.filter((b) => statusFilter === "all" || b.status === statusFilter);

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
          items={bySource}
          field="status"
        />
        <FilterRow
          label="Источник"
          options={BOOKING_SOURCES}
          value={sourceFilter}
          onChange={setSourceFilter}
          items={byStatus}
          field="source"
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
  field: "status" | "source";
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="w-20 text-sm text-muted-foreground">{label}</span>
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

function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TablesUpdate<"bookings"> }) => {
      // .select().single() turns "0 rows updated" (e.g. blocked by RLS) into an error.
      const { data, error } = await supabase
        .from("bookings")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    // A refetch started before the save could land after it and bring back old values.
    onMutate: () => queryClient.cancelQueries({ queryKey: BOOKINGS_KEY }),
    onSuccess: (updated) => {
      queryClient.setQueryData<Booking[]>(BOOKINGS_KEY, (old) =>
        old?.map((b) => (b.id === updated.id ? updated : b)),
      );
    },
    onError: () => toast.error("Не удалось сохранить. Попробуйте ещё раз."),
  });
}

const emptyForm = {
  name: "",
  phone: "",
  car: "",
  service: "",
  date: "",
  source: MANUAL_BOOKING_SOURCES[0]?.value ?? "",
};

const manualBookingSchema = bookingSchema.extend({
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
    onError: () => {
      // The dialog may already be closed, so the inline error alone could go unseen.
      setError("Не удалось сохранить. Попробуйте ещё раз.");
      toast.error("Не удалось добавить заявку. Попробуйте ещё раз.");
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = manualBookingSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Проверьте введённые данные");
      return;
    }
    const d = parsed.data;
    setError(null);
    create.mutate({
      name: d.name,
      phone: d.phone,
      car: d.car || null,
      service: d.service,
      preferred_date: d.date || null,
      source: d.source,
    });
  };

  const set = (key: keyof typeof emptyForm) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

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
          <LabeledField id="booking-service" label="Услуга">
            <Input
              id="booking-service"
              required
              maxLength={120}
              value={form.service}
              onChange={(e) => set("service")(e.target.value)}
            />
          </LabeledField>
          <LabeledField id="booking-car" label="Авто">
            <Input
              id="booking-car"
              maxLength={80}
              value={form.car}
              onChange={(e) => set("car")(e.target.value)}
            />
          </LabeledField>
          <LabeledField id="booking-date" label="Желаемая дата">
            <Input
              id="booking-date"
              type="date"
              value={form.date}
              onChange={(e) => set("date")(e.target.value)}
            />
          </LabeledField>
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
        <Field label="Желаемая дата">
          {b.preferred_date ? formatDate(b.preferred_date, "d MMMM yyyy") : "—"}
        </Field>
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

// Kazakhstan numbers: "8 7xx..." is the local form of "+7 7xx...", and the booking form
// also accepts 10 digits without the country code ("7xx...").
function phoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) return `7${digits.slice(1)}`;
  if (digits.length === 10) return `7${digits}`;
  return digits;
}

function whatsappUrl(phone: string, text?: string): string {
  const url = `https://wa.me/${phoneDigits(phone)}`;
  return text ? `${url}?text=${encodeURIComponent(text)}` : url;
}
