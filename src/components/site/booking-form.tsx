import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GOALS, reachGoal } from "@/lib/analytics";
import { bookingSchema } from "@/lib/booking-schema";
import { whatsappUrl } from "@/lib/business-info";
import { directionTitle, type DirectionSlug } from "@/lib/directions";

// The booking form shared by the direction pages. Each page passes its own direction (stored in
// bookings.direction, so the CRM can filter by it) and the services offered in the select; with
// no services the select is hidden and the direction's name is sent as the service.
// `carPlaceholder={null}` hides the car field for directions that don't work on vehicles.
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
  const [form, setForm] = useState({
    name: "",
    phone: "",
    car: "",
    service: services[0] ?? directionTitle(direction),
    date: "",
  });
  const [consent, setConsent] = useState(false);

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
      direction,
    });

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
      d.date ? `Желаемая дата: ${d.date}` : null,
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
        <button onClick={() => setStatus("idle")} className="mt-6 text-sm text-primary underline">
          Отправить ещё одну заявку
        </button>
      </div>
    );
  }

  return (
    <form className="surface-panel space-y-4 rounded-lg p-6 sm:p-8" onSubmit={submit}>
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
            className={field}
            placeholder={carPlaceholder}
            value={form.car}
            onChange={(e) => setForm({ ...form, car: e.target.value })}
          />
        )}
        <input
          type="date"
          // Alone in its row when the car field is hidden.
          className={carPlaceholder === null ? `${field} sm:col-span-2` : field}
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
      </div>
      {services.length > 0 && (
        <select
          className={field}
          value={form.service}
          onChange={(e) => setForm({ ...form, service: e.target.value })}
        >
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
