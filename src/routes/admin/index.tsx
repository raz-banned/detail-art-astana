import { useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";
import { BOOKING_STATUSES, bookingStatusLabel } from "@/lib/crm-config";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  const [filter, setFilter] = useState<string>("all");

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
  if (bookings.isError) {
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
  const countBy = (status: string) => all.filter((b) => b.status === status).length;
  const visible = filter === "all" ? all : all.filter((b) => b.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-3xl tracking-wider">Заявки</h1>
        <Button variant="ghost" size="sm" onClick={() => bookings.refetch()}>
          {bookings.isFetching ? "Обновляем…" : "Обновить"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          Все · {all.length}
        </FilterChip>
        {BOOKING_STATUSES.map((s) => (
          <FilterChip key={s.value} active={filter === s.value} onClick={() => setFilter(s.value)}>
            {s.label} · {countBy(s.value)}
          </FilterChip>
        ))}
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
    onSuccess: (updated) => {
      queryClient.setQueryData<Booking[]>(BOOKINGS_KEY, (old) =>
        old?.map((b) => (b.id === updated.id ? updated : b)),
      );
    },
    onError: () => toast.error("Не удалось сохранить. Попробуйте ещё раз."),
  });
}

function BookingCard({ booking: b }: { booking: Booking }) {
  const update = useUpdateBooking();
  const [note, setNote] = useState(b.note ?? "");
  const noteChanged = note.trim() !== (b.note ?? "");
  // Keep a status that isn't in BOOKING_STATUSES selectable, so it isn't silently lost.
  const statusOptions = BOOKING_STATUSES.some((s) => s.value === b.status)
    ? BOOKING_STATUSES
    : [...BOOKING_STATUSES, { value: b.status, label: b.status }];

  return (
    <li className="rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {format(parseISO(b.created_at), "d MMMM yyyy, HH:mm", { locale: ru })}
          </p>
          <p className="text-lg font-semibold">{b.name}</p>
          <p className="flex flex-wrap gap-x-3 text-sm">
            <a href={`tel:+${phoneDigits(b.phone)}`} className="text-primary hover:underline">
              {b.phone}
            </a>
            <a
              href={`https://wa.me/${phoneDigits(b.phone)}`}
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
              { onSuccess: () => toast.success(`Статус: ${bookingStatusLabel(status)}`) },
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

      <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
        <Field label="Услуга">{b.service}</Field>
        <Field label="Авто">{b.car || "—"}</Field>
        <Field label="Желаемая дата">
          {b.preferred_date
            ? format(parseISO(b.preferred_date), "d MMMM yyyy", { locale: ru })
            : "—"}
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

// Kazakhstan numbers: "8 7xx..." is the local form of "+7 7xx...".
function phoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("8") ? `7${digits.slice(1)}` : digits;
}
