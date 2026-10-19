import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GOALS, reachGoal } from "@/lib/analytics";
import { bookingSchema } from "@/lib/booking-schema";
import { bookingDays, dayLabel, daySlots, hasSlots, slotKey, slotStart } from "@/lib/booking-slots";
import { whatsappUrl } from "@/lib/business-info";
import { directionTitle, type DirectionSlug } from "@/lib/directions";
import { useBusySlots } from "@/lib/use-busy-slots";

// The booking form shared by the direction pages. Each page passes its own direction (stored in
// bookings.direction, so the CRM can filter by it) and the services offered in the select; with
// no services the select is hidden and the direction's name is sent as the service. Nothing is
// preselected: a visitor who skips the select would otherwise book the first service by accident.
// `carPlaceholder={null}` hides the car field for directions that don't work on vehicles.
// A direction with working hours in booking-slots.ts books a day and a time slot; the rest keep
// a plain optional date.
export function BookingForm({
  direction,
  services,
  carPlaceholder = "Марка и модель авто",
}: {
  direction: DirectionSlug;
  services: string[];
  carPlaceholder?: string | null;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const noService = services.length > 0 ? "" : directionTitle(direction);
  const [form, setForm] = useState({ name: "", phone: "", car: "", service: noService, date: "" });
  const [time, setTime] = useState("");
  const [consent, setConsent] = useState(false);

  const slotted = hasSlots(direction);
  const busy = useBusySlots(direction, slotted && form.date ? form.date : null);
  const now = useNow();
  const days = useMemo(
    () => (slotted && now !== null ? bookingDays(direction, new Date(now)) : []),
    [slotted, direction, now],
  );

  // Drop a choice that went stale while the form was open: the day rolled past (after the last
  // slot or at midnight), the time started, or a background refetch found it taken. Otherwise it
  // stays highlighted on a disabled button and the insert fails on the server.
  useEffect(() => {
    if (!form.date || now === null) return;
    if (!days.includes(form.date)) {
      setForm((f) => ({ ...f, date: "" }));
      setTime("");
      return;
    }
    if (!time) return;
    const key = slotKey(slotStart(form.date, time));
    if (key <= now || busy.data?.has(key)) setTime("");
  }, [days, form.date, time, now, busy.data]);

  const field =
    "w-full rounded-md border border-input bg-secondary px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setStatus("error");
      setError("Подтвердите согласие на обработку персональных данных");
      return;
    }
    const parsed = bookingSchema.safeParse(form);
    if (!parsed.success) {
      setStatus("error");
      setError(parsed.error.issues[0]?.message ?? "Проверьте введённые данные");
      return;
    }
    const d = parsed.data;
    if (slotted && (!d.date || !time)) {
      setStatus("error");
      setError("Выберите день и время");
      return;
    }
    // The clock ticks every 30 s; check again here, since RLS rejects a started slot with a
    // generic permission error that the form couldn't tell from other failures.
    if (slotted && slotKey(slotStart(d.date, time)) <= Date.now()) {
      setStatus("error");
      setError("Это время уже прошло, выберите другое");
      setTime("");
      return;
    }
    setStatus("sending");
    setError(null);

    const whatsappWindow = window.open("", "_blank");
    if (whatsappWindow) whatsappWindow.opener = null;

    const { error: dbError } = await supabase.from("bookings").insert({
      name: d.name,
      phone: d.phone,
      car: d.car || null,
      service: d.service,
      preferred_date: d.date || null,
      slot_start: slotted ? slotStart(d.date, time) : null,
      direction,
    });

    // 23505 is the unique index on (direction, slot_start): someone else booked this time
    // between loading the grid and pressing "Send".
    if (dbError?.code === "23505") {
      whatsappWindow?.close();
      setStatus("error");
      setError("Это время только что заняли, выберите другое");
      setTime("");
      void busy.refetch();
      return;
    }

    if (dbError) {
      whatsappWindow?.close();
      setStatus("error");
      setError("Не удалось сохранить заявку. Попробуйте ещё раз или напишите нам в WhatsApp.");
      return;
    }

    const lines = [
      "Новая заявка с сайта APELSIN INDUSTRIAL",
      `Направление: ${directionTitle(direction)}`,
      `Имя: ${d.name}`,
      `Телефон: ${d.phone}`,
      d.car ? `Авто: ${d.car}` : null,
      `Услуга: ${d.service}`,
      slotted ? `Время: ${dayLabel(d.date, true)}, ${time}` : null,
      !slotted && d.date ? `Желаемая дата: ${d.date}` : null,
    ].filter(Boolean);

    const url = whatsappUrl(lines.join("\n"));
    if (whatsappWindow) whatsappWindow.location.href = url;
    else window.open(url, "_blank", "noopener,noreferrer");

    reachGoal(GOALS.bookingSubmit);
    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <div className="surface-panel rounded-lg p-8 text-center">
        <Check className="mx-auto h-10 w-10 text-primary" />
        <h3 className="mt-4 text-2xl">Заявка отправлена в WhatsApp</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {form.name}, ваша заявка открыта в WhatsApp менеджера — отправьте сообщение, и мы
          перезвоним на {form.phone}.
        </p>
        <button
          onClick={() => {
            // Keep the contact details, but make the next booking pick its service and time again.
            setForm({ ...form, service: noService });
            setTime("");
            void busy.refetch();
            setStatus("idle");
          }}
          className="mt-6 text-sm text-primary underline"
        >
          Отправить ещё одну заявку
        </button>
      </div>
    );
  }

  return (
    // min-w-0: below lg the booking section is one auto-sized grid column, and a grid item won't
    // shrink below its content, so the row of days would push the form past the screen.
    <form className="surface-panel min-w-0 space-y-4 rounded-lg p-6 sm:p-8" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          required
          maxLength={80}
          className={field}
          placeholder="Ваше имя"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          required
          type="tel"
          maxLength={20}
          className={field}
          placeholder="+7 (___) ___ __ __"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        {carPlaceholder !== null && (
          <input
            maxLength={80}
            // Alone in its row when the date field gives way to the slot picker.
            className={slotted ? `${field} sm:col-span-2` : field}
            placeholder={carPlaceholder}
            value={form.car}
            onChange={(e) => setForm({ ...form, car: e.target.value })}
          />
        )}
        {!slotted && (
          <input
            type="date"
            // Alone in its row when the car field is hidden.
            className={carPlaceholder === null ? `${field} sm:col-span-2` : field}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        )}
      </div>
      {slotted && (
        <SlotPicker
          direction={direction}
          days={days}
          now={now}
          day={form.date}
          time={time}
          busy={busy}
          onDay={(day) => {
            setForm({ ...form, date: day });
            setTime("");
          }}
          onTime={setTime}
        />
      )}
      {services.length > 0 && (
        <select
          required
          aria-label="Услуга"
          // Grey like the inputs' placeholders until a service is chosen; the options keep the
          // normal colour, since some browsers pass the select's colour on to its dropdown.
          className={
            form.service ? field : `${field} text-muted-foreground [&>option]:text-foreground`
          }
          value={form.service}
          onChange={(e) => setForm({ ...form, service: e.target.value })}
        >
          <option value="" disabled>
            Выберите услугу
          </option>
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}
      <label className="flex items-start gap-3 text-xs text-muted-foreground">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary"
        />
        <span>
          Я согласен(на) на обработку указанных персональных данных (имя, телефон и другие данные из
          заявки) в соответствии с{" "}
          <Link to="/privacy" className="text-primary hover:underline">
            политикой конфиденциальности
          </Link>{" "}
          — они будут использованы для оформления и обработки заявки.
        </span>
      </label>
      {status === "error" && error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-ember w-full rounded-md px-6 py-4 text-sm disabled:opacity-60"
      >
        {status === "sending" ? "Отправляем в WhatsApp…" : "Отправить заявку в WhatsApp"}
      </button>
    </form>
  );
}

// Day chips and the time grid. A slot is disabled when it's taken or already started; times are
// Astana's, whatever the visitor's own time zone is.
function SlotPicker({
  direction,
  days,
  now,
  day,
  time,
  busy,
  onDay,
  onTime,
}: {
  direction: DirectionSlug;
  days: string[];
  now: number | null;
  day: string;
  time: string;
  busy: ReturnType<typeof useBusySlots>;
  onDay: (day: string) => void;
  onTime: (time: string) => void;
}) {
  const chip =
    "rounded-md border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40";
  const chipState = (active: boolean) =>
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-input bg-secondary hover:border-primary";

  return (
    // min-w-0: a fieldset defaults to min-width: min-content and would stretch to the whole row
    // of days instead of letting it scroll.
    <fieldset className="min-w-0 space-y-3">
      <legend className="text-sm text-muted-foreground">День и время (по Астане)</legend>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {days.map((d) => {
          const label = dayLabel(d);
          return (
            <button
              key={d}
              type="button"
              aria-pressed={d === day}
              onClick={() => onDay(d)}
              className={`${chip} ${chipState(d === day)} shrink-0 text-center leading-tight`}
            >
              <span className="block text-xs uppercase">{label.weekday}</span>
              <span className="block whitespace-nowrap">{label.date}</span>
            </button>
          );
        })}
      </div>
      {day &&
        (busy.isPending ? (
          <p className="text-sm text-muted-foreground">Загружаем свободное время…</p>
        ) : busy.isError ? (
          <p className="text-sm text-destructive">
            Не удалось загрузить свободное время.{" "}
            <button type="button" className="underline" onClick={() => void busy.refetch()}>
              Повторить
            </button>
          </p>
        ) : (
          // As many columns as fit: fixed counts overflow on a 320px phone.
          <div className="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-2">
            {daySlots(direction).map((t) => {
              const key = slotKey(slotStart(day, t));
              const disabled = busy.data.has(key) || now === null || key <= now;
              return (
                <button
                  key={t}
                  type="button"
                  disabled={disabled}
                  aria-pressed={t === time}
                  onClick={() => onTime(t)}
                  className={`${chip} ${chipState(t === time)}`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        ))}
    </fieldset>
  );
}

// The current time, updated every 30 s so slots that have started get disabled while the form is
// open. null on the server and in the first client render: the day chips are built from it, and
// a server clock past Astana midnight (or cached HTML) would otherwise not match the browser.
function useNow(): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}
