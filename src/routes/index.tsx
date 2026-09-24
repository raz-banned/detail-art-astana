import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { MANAGER_PHONE, PHONE, WHATSAPP } from "@/lib/business-info";

import {
  Sparkles,
  ShieldCheck,
  Car,
  Droplets,
  SprayCan,
  Sun,
  Clock,
  MapPin,
  Phone,
  Star,
  Check,
  MessageCircle,
  Truck,
  ArrowLeftRight,
  ChevronDown,
} from "lucide-react";

import heroImg from "@/assets/hero-detailing.jpg";
import apelsinLogo from "@/assets/apelsin-logo.webp";
import beforePaint from "@/assets/before-paint.jpg";
import afterPaint from "@/assets/after-paint.jpg";
import beforeInterior from "@/assets/before-interior.jpg";
import afterInterior from "@/assets/after-interior.jpg";
import parkAsset from "@/assets/apelsin-park.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "APELSIN DETAILING — детейлинг авто, фур и мото в Астане" },
      {
        name: "description",
        content:
          "APELSIN Industrial Park, Астана, Алаш 46/2: детейлинг легковых машин, грузовых фур и мотоциклов — полировка, керамика, химчистка, защитные плёнки.",
      },
      {
        property: "og:title",
        content: "APELSIN DETAILING — детейлинг авто, фур и мото в Астане",
      },
      {
        property: "og:description",
        content:
          "Детейлинг легковых авто, грузовых фур и мотоциклов в Астане: керамика, полировка, химчистка. Фото до/после, цены и запись онлайн.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    const fallback = setTimeout(() => setVisible(true), 3000);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return { ref, className: visible ? "reveal reveal-visible" : "reveal" };
}

const PRELOAD_HOLD_MS = 100;
const PRELOAD_FADE_MS = 250;
const PRELOADER_SESSION_KEY = "apelsin-preloader-shown";

function Preloader({ onDone }: { onDone: () => void }) {
  const [mounted, setMounted] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(PRELOADER_SESSION_KEY) === "1") {
      setMounted(false);
      onDone();
      return;
    }
    sessionStorage.setItem(PRELOADER_SESSION_KEY, "1");
    document.body.style.overflow = "hidden";
    const holdTimer = setTimeout(() => setFading(true), PRELOAD_HOLD_MS);
    return () => clearTimeout(holdTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount; onDone identity is irrelevant here
  }, []);

  useEffect(() => {
    if (!fading) return;
    const fadeTimer = setTimeout(() => {
      setMounted(false);
      document.body.style.overflow = "";
      onDone();
    }, PRELOAD_FADE_MS);
    return () => clearTimeout(fadeTimer);
  }, [fading, onDone]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity ease-out ${fading ? "opacity-0" : "opacity-100"}`}
      style={{ transitionDuration: `${PRELOAD_FADE_MS}ms` }}
    >
      <img
        src={apelsinLogo}
        alt="APELSIN DETAILING"
        className="h-16 w-16 animate-spin rounded-full object-cover [animation-duration:1.4s]"
      />
    </div>
  );
}

const services = [
  {
    icon: Sparkles,
    title: "Полировка кузова",
    text: "Абразивная и защитная полировка: убираем риски, голограммы и мутность лака.",
  },
  {
    icon: ShieldCheck,
    title: "Керамическое покрытие",
    text: "Керамика 9H до 3 лет: гидрофобный эффект, глубина цвета и лёгкая мойка.",
  },
  {
    icon: Droplets,
    title: "Химчистка салона",
    text: "Полный разбор, экстракторная чистка, устранение запахов озоном.",
  },
  {
    icon: Car,
    title: "Антигравийная плёнка",
    text: "Оклейка полиуретаном зон риска или всего кузова, самовосстановление.",
  },
  {
    icon: Sun,
    title: "Тонировка стёкол",
    text: "Атермальные и тонирующие плёнки премиум-класса по ГОСТ.",
  },
  {
    icon: Truck,
    title: "Детейлинг грузовых фур",
    text: "Мойка и полировка тягачей и прицепов, чистка кабины, защита хрома и пластика.",
  },
  {
    icon: SprayCan,
    title: "Реставрация фар и кожи",
    text: "Полировка фар с защитой лаком, покраска и восстановление кожи салона.",
  },
];

const pricing = [
  {
    name: "Экспресс",
    price: "25 000 ₸",
    time: "3–4 часа",
    features: [
      "Двухфазная мойка кузова",
      "Обезжиривание и защитный воск",
      "Чистка стёкол и дисков",
      "Влажная уборка салона",
    ],
  },
  {
    name: "Керамика 9H",
    price: "180 000 ₸",
    time: "2 дня",
    popular: true,
    features: [
      "Абразивная полировка в 2 шага",
      "Керамика 9H, до 3 лет защиты",
      "Гидрофоб на стёкла",
      "Защита дисков и пластика",
      "Бесплатная мойка каждые 3 месяца",
    ],
  },
  {
    name: "Салон под ноль",
    price: "70 000 ₸",
    time: "1 день",
    features: [
      "Разбор и химчистка всех поверхностей",
      "Экстрактор + пароочиститель",
      "Озонирование от запахов",
      "Кондиционер для кожи",
    ],
  },
];

const reviews: { name: string; car: string; text: string }[] = [];

function BeforeAfter({ before, after, label }: { before: string; after: string; label: string }) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const move = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  };

  const transition = dragging ? "" : "transition-[clip-path,left] duration-500 ease-out";

  return (
    <figure className="surface-panel overflow-hidden rounded-lg">
      <div
        ref={ref}
        className="relative aspect-4/3 cursor-ew-resize select-none"
        onPointerMove={(e) => e.buttons === 1 && move(e.clientX)}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          move(e.clientX);
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        <img
          src={after}
          alt={`${label} — после`}
          loading="lazy"
          width={900}
          height={700}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className={`absolute inset-0 ${transition}`}
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <img
            src={before}
            alt={`${label} — до`}
            loading="lazy"
            width={900}
            height={700}
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div
          className={`absolute inset-y-0 w-0.5 bg-primary ${transition}`}
          style={{ left: `${pos}%` }}
        >
          <span className="absolute top-1/2 left-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white">
            <ArrowLeftRight className="h-8 w-8" strokeWidth={3} />
          </span>
        </div>
        <span className="absolute top-3 left-3 rounded bg-background/80 px-2 py-1 text-xs font-semibold tracking-widest uppercase">
          До
        </span>
        <span className="absolute top-3 right-3 rounded bg-primary px-2 py-1 text-xs font-semibold tracking-widest text-primary-foreground uppercase">
          После
        </span>
      </div>
      <figcaption className="px-4 py-3 text-sm text-muted-foreground">{label}</figcaption>
    </figure>
  );
}

const bookingSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя (минимум 2 символа)").max(80, "Имя слишком длинное"),
  phone: z
    .string()
    .trim()
    .min(10, "Укажите корректный номер телефона")
    .max(20, "Номер слишком длинный")
    .regex(/^[\d+()\-\s]+$/, "Номер может содержать только цифры и знаки + ( ) -"),
  car: z.string().trim().max(80, "Слишком длинное название авто"),
  service: z.string().trim().min(1).max(120),
  date: z.string().trim().max(20),
});

function BookingForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    car: "",
    service: "Керамическое покрытие",
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
    });

    if (dbError) {
      whatsappWindow?.close();
      setStatus("error");
      setError("Не удалось сохранить заявку. Попробуйте ещё раз или напишите нам в WhatsApp.");
      return;
    }

    const lines = [
      "Новая заявка с сайта APELSIN DETAILING",
      `Имя: ${d.name}`,
      `Телефон: ${d.phone}`,
      d.car ? `Авто: ${d.car}` : null,
      `Услуга: ${d.service}`,
      d.date ? `Желаемая дата: ${d.date}` : null,
    ].filter(Boolean);

    const url = `https://wa.me/${MANAGER_PHONE}?text=${encodeURIComponent(lines.join("\n"))}`;
    if (whatsappWindow) whatsappWindow.location.href = url;
    else window.open(url, "_blank", "noopener,noreferrer");

    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <div className="surface-panel rounded-lg p-8 text-center">
        <Check className="mx-auto h-10 w-10 text-primary" />
        <h3 className="mt-4 text-2xl">Заявка отправлена в WhatsApp</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {form.name}, ваша заявка открыта в WhatsApp менеджера — отправьте сообщение, и мы
          перезвоним на {form.phone} в течение 15 минут.
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
        <input
          maxLength={80}
          className={field}
          placeholder="Марка и модель авто"
          value={form.car}
          onChange={(e) => setForm({ ...form, car: e.target.value })}
        />
        <input
          type="date"
          className={field}
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
      </div>
      <select
        className={field}
        value={form.service}
        onChange={(e) => setForm({ ...form, service: e.target.value })}
      >
        {services.map((s) => (
          <option key={s.title} value={s.title}>
            {s.title}
          </option>
        ))}
      </select>
      <label className="flex items-start gap-3 text-xs text-muted-foreground">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary"
        />
        <span>
          Я согласен(на) на обработку указанных персональных данных (имя, телефон и данные об авто)
          в соответствии с{" "}
          <Link to="/privacy" className="text-primary hover:underline">
            политикой конфиденциальности
          </Link>{" "}
          — они будут использованы для оформления и обработки заявки на детейлинг.
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

function Index() {
  const nav = [
    ["Услуги", "#services"],
    ["Цены", "#pricing"],
    ["До/после", "#gallery"],
    ["Отзывы", "#reviews"],
    ["Контакты", "#contacts"],
  ];

  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!servicesOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!servicesRef.current?.contains(e.target as Node)) setServicesOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [servicesOpen]);

  const servicesReveal = useReveal<HTMLElement>();
  const pricingReveal = useReveal<HTMLElement>();
  const galleryReveal = useReveal<HTMLElement>();
  const reviewsReveal = useReveal<HTMLElement>();
  const bookingReveal = useReveal<HTMLElement>();
  const contactsReveal = useReveal<HTMLElement>();
  const footerReveal = useReveal<HTMLElement>();

  return (
    <div className="min-h-screen bg-background">
      {!ready && <Preloader onDone={() => setReady(true)} />}
      <div className="fixed top-1/2 left-4 z-30 hidden h-[600px] w-56 -translate-y-1/2 items-center justify-center rounded-lg border border-dashed border-border bg-graphite/30 text-center text-xs text-muted-foreground uppercase min-[1700px]:flex">
        Реклама
      </div>
      <div className="fixed top-1/2 right-4 z-30 hidden h-[600px] w-56 -translate-y-1/2 items-center justify-center rounded-lg border border-dashed border-border bg-graphite/30 text-center text-xs text-muted-foreground uppercase min-[1700px]:flex">
        Реклама
      </div>
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <a
            href="#top"
            className={`font-display text-2xl tracking-widest ${ready ? "animate-[fade-in-up_0.6s_ease_both]" : "opacity-0"}`}
          >
            APELSIN<span className="text-primary">.</span>DETAILING
          </a>
          <nav className="hidden gap-20 text-sm font-normal whitespace-nowrap text-muted-foreground lg:flex">
            {nav.map(([label, href]) =>
              label === "Услуги" ? (
                <div
                  key={href}
                  ref={servicesRef}
                  className="group relative flex items-center gap-1"
                  onKeyDown={(e) => {
                    if (e.key !== "Escape") return;
                    setServicesOpen(false);
                    (document.activeElement as HTMLElement | null)?.blur();
                  }}
                >
                  <a
                    href={href}
                    className="group/link relative transition-colors hover:text-primary"
                    style={{ WebkitTextStroke: "0.5px currentColor" }}
                  >
                    {label}
                    <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 bg-primary transition-transform duration-150 ease-out group-hover/link:scale-x-100" />
                  </a>
                  <button
                    type="button"
                    aria-label="Список услуг"
                    aria-expanded={servicesOpen}
                    aria-controls="services-menu"
                    onClick={() => setServicesOpen((v) => !v)}
                    className="-m-1 rounded p-1 transition-colors hover:text-primary"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    id="services-menu"
                    className={`absolute top-full left-1/2 z-50 w-64 -translate-x-1/2 pt-4 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-has-focus-visible:visible group-has-focus-visible:opacity-100 ${servicesOpen ? "visible opacity-100" : "invisible opacity-0"}`}
                  >
                    <div className="surface-panel rounded-lg py-2 shadow-[var(--shadow-panel)]">
                      {services.map((s) => (
                        <a
                          key={s.title}
                          href="#services"
                          onClick={() => setServicesOpen(false)}
                          className="group/item relative block px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-graphite hover:text-primary"
                        >
                          {s.title}
                          <span className="absolute bottom-1 left-5 h-px w-[calc(100%-2.5rem)] origin-left scale-x-0 bg-primary transition-transform duration-150 ease-out group-hover/item:scale-x-100" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  key={href}
                  href={href}
                  className="group/link relative transition-colors hover:text-primary"
                  style={{ WebkitTextStroke: "0.5px currentColor" }}
                >
                  {label}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 bg-primary transition-transform duration-150 ease-out group-hover/link:scale-x-100" />
                </a>
              ),
            )}
          </nav>
          <button
            type="button"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground"
          >
            <span className="relative flex h-4 w-5 flex-col justify-between">
              <span
                className={`h-0.5 w-full origin-center rounded-full bg-current transition-transform duration-300 ease-out ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
              />
              <span
                className={`h-0.5 w-full rounded-full bg-current transition-all duration-200 ease-out ${menuOpen ? "scale-x-0 opacity-0" : "opacity-100"}`}
              />
              <span
                className={`h-0.5 w-full origin-center rounded-full bg-current transition-transform duration-300 ease-out ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
      />
      <div
        inert={!menuOpen}
        className={`fixed top-0 right-0 z-45 flex h-full w-full max-w-[280px] flex-col gap-6 overflow-y-auto border-l border-border bg-background p-8 pt-24 transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <a
          href="#booking"
          onClick={() => setMenuOpen(false)}
          className="btn-ember rounded-md px-5 py-3 text-center text-sm"
        >
          Записаться
        </a>
        <nav className="flex flex-col gap-1 text-lg lg:hidden">
          {nav.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-3 py-3 transition-colors hover:bg-graphite hover:text-primary"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col gap-1 border-t border-border pt-6 text-lg">
          {["Грузовые", "Мото"].map((label) => (
            <span
              key={label}
              aria-disabled="true"
              className="flex items-center justify-between rounded-md px-3 py-3 text-muted-foreground"
            >
              {label}
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] tracking-wider uppercase">
                скоро
              </span>
            </span>
          ))}
        </div>
      </div>

      <section id="top" className="relative overflow-hidden">
        <img
          src={heroImg}
          alt="Детейлинг-центр в Астане"
          width={1600}
          height={1008}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/25" />
        <div className="relative mx-auto max-w-6xl px-4 py-28 sm:py-36">
          <p
            className={`eyebrow ${ready ? "animate-[fade-in-up_0.6s_ease_both] [animation-delay:60ms]" : "opacity-0"}`}
          >
            Астана · Apelsin Industrial Park · Алаш 46/2
          </p>
          <h1
            className={`mt-4 max-w-2xl text-5xl leading-[0.95] sm:text-7xl ${ready ? "animate-[fade-in-up_0.6s_ease_both] [animation-delay:120ms]" : "opacity-0"}`}
          >
            Детейлинг
            <span className="text-primary"> авто, фур и мото</span>
          </h1>
          <p
            className={`mt-6 max-w-xl text-lg text-muted-foreground ${ready ? "animate-[fade-in-up_0.6s_ease_both] [animation-delay:180ms]" : "opacity-0"}`}
          >
            APELSIN DETAILING — часть Apelsin Industrial Park. Керамика, полировка, химчистка и
            защитные плёнки в тёплых боксах: принимаем и седаны, и тягачи с прицепами. Совершенство
            в каждой детали.
          </p>
          <div
            className={`mt-9 flex flex-wrap gap-3 ${ready ? "animate-[fade-in-up_0.6s_ease_both] [animation-delay:240ms]" : "opacity-0"}`}
          >
            <a href="#booking" className="btn-ember rounded-md px-8 py-4 text-sm">
              Запись онлайн
            </a>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border px-8 py-4 text-sm font-semibold tracking-widest uppercase transition-colors hover:border-primary hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
          <dl
            className={`mt-14 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4 ${ready ? "animate-[fade-in-up_0.6s_ease_both] [animation-delay:300ms]" : "opacity-0"}`}
          >
            {[
              ["1 200+", "авто в год"],
              ["9 лет", "на рынке"],
              ["3 года", "гарантия керамики"],
              ["4.9", "рейтинг 2GIS"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-3xl text-primary">{v}</dt>
                <dd className="text-xs tracking-wider text-muted-foreground uppercase">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        id="services"
        ref={servicesReveal.ref}
        className={`mx-auto max-w-6xl px-4 py-24 ${servicesReveal.className}`}
      >
        <p className="eyebrow">Услуги</p>
        <h2 className="mt-3 text-4xl sm:text-5xl">Что делаем в боксах</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="surface-panel group rounded-lg p-6 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.05] hover:border-primary hover:shadow-[var(--shadow-panel)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded bg-graphite text-primary transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-6 w-6 transition-transform duration-300 group-hover:rotate-6" />
              </div>
              <h3 className="mt-5 text-2xl transition-colors duration-300 group-hover:text-primary">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="pricing"
        ref={pricingReveal.ref}
        className={`diag-stripes border-y border-border bg-graphite/40 ${pricingReveal.className}`}
      >
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="eyebrow">Цены</p>
          <h2 className="mt-3 text-4xl sm:text-5xl">Пакеты и стоимость</h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Цены указаны для седанов. Для кроссоверов и внедорожников +15–25%. Точную смету считаем
            после осмотра лака толщиномером.
          </p>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {pricing.map((p) => (
              <article
                key={p.name}
                className={`surface-panel relative flex h-full flex-col rounded-lg p-7 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[var(--shadow-panel)] ${p.popular ? "border-primary" : ""}`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-7 rounded bg-primary px-3 py-1 text-xs font-bold tracking-widest text-primary-foreground uppercase">
                    Хит
                  </span>
                )}
                <h3 className="text-3xl">{p.name}</h3>
                <p className="mt-2 flex items-center gap-2 text-xs tracking-wider text-muted-foreground uppercase">
                  <Clock className="h-3.5 w-3.5" /> {p.time}
                </p>
                <p className="font-display mt-5 text-4xl text-primary">{p.price}</p>
                <ul className="mt-6 mb-6 space-y-3 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#booking"
                  className={`mt-auto block rounded-md px-5 py-3 text-center text-xs font-semibold tracking-widest uppercase ${
                    p.popular
                      ? "btn-ember"
                      : "border border-border transition-colors hover:border-primary hover:text-primary"
                  }`}
                >
                  Выбрать пакет
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="gallery"
        ref={galleryReveal.ref}
        className={`mx-auto max-w-6xl px-4 py-24 ${galleryReveal.className}`}
      >
        <p className="eyebrow">Наши работы</p>
        <h2 className="mt-3 text-4xl sm:text-5xl">До и после</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Потяните ползунок, чтобы увидеть результат.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <BeforeAfter
            before={beforePaint}
            after={afterPaint}
            label="Полировка + керамика 9H, кузов"
          />
          <BeforeAfter
            before={beforeInterior}
            after={afterInterior}
            label="Химчистка салона с озонированием"
          />
        </div>
      </section>

      <section
        id="reviews"
        ref={reviewsReveal.ref}
        className={`border-y border-border bg-graphite/40 ${reviewsReveal.className}`}
      >
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="eyebrow">Отзывы</p>
          <h2 className="mt-3 text-4xl sm:text-5xl">Что говорят клиенты</h2>
          {reviews.length > 0 ? (
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {reviews.map((r) => (
                <article key={r.name} className="surface-panel rounded-lg p-6">
                  <div className="flex gap-1 text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                  <footer className="mt-6 border-t border-border pt-4">
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-xs tracking-wider text-muted-foreground uppercase">
                      {r.car}
                    </p>
                  </footer>
                </article>
              ))}
            </div>
          ) : (
            <div className="surface-panel mt-12 rounded-lg p-10 text-center">
              <div className="flex justify-center gap-1 text-muted-foreground/40">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Мы только начинаем собирать отзывы клиентов — первые появятся здесь совсем скоро.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-border bg-graphite/40">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-24 lg:grid-cols-2">
          <div>
            <p className="eyebrow">О нас</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Apelsin Industrial Park</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Собственный производственный комплекс с высокими боксами: сюда заезжают и легковые
              авто, и грузовые фуры с прицепами. Рядом — сервисные направления Apelsin: Truck, Moto,
              Construct и Shop, поэтому машину можно привести в порядок в одном месте.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
              {[
                "Высокие боксы под тягачи и полуприцепы",
                "Отдельная зона детейлинга легковых авто",
                "Фотоотчёт по каждому этапу работ",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <img
            src={parkAsset.url}
            alt="Комплекс Apelsin Industrial Park в Астане"
            loading="lazy"
            width={1600}
            height={900}
            className="surface-panel w-full rounded-lg object-cover"
          />
        </div>
      </section>

      <section
        id="booking"
        ref={bookingReveal.ref}
        className={`mx-auto max-w-6xl px-4 py-24 ${bookingReveal.className}`}
      >
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Запись</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Забронируйте место в боксе</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Оставьте заявку — перезвоним в течение 15 минут, подберём пакет и назовём точную
              стоимость по вашему авто. Загруженность бокса: 2–3 машины в день.
            </p>
            <ul className="mt-8 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <span>г. Астана, Apelsin Industrial Park, ул. Алаш 46/2</span>
              </li>
              <li className="flex gap-3">
                <Clock className="h-5 w-5 shrink-0 text-primary" />
                <span>Ежедневно 09:00 — 21:00</span>
              </li>
              <li className="flex gap-3">
                <Phone className="h-5 w-5 shrink-0 text-primary" />
                <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="hover:text-primary">
                  {PHONE}
                </a>
              </li>
            </ul>
          </div>
          <BookingForm />
        </div>
      </section>

      <section
        id="contacts"
        ref={contactsReveal.ref}
        className={`border-t border-border ${contactsReveal.className}`}
      >
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="eyebrow">Карта</p>
          <h2 className="mt-3 text-4xl sm:text-5xl">Как нас найти</h2>
          <div className="surface-panel mt-10 overflow-hidden rounded-lg">
            <iframe
              title="Карта — APELSIN DETAILING, Астана"
              src="https://www.openstreetmap.org/export/embed.html?bbox=71.46%2C51.19%2C71.54%2C51.23&layer=mapnik&marker=51.207227%2C71.497783"
              className="h-[420px] w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <footer
        ref={footerReveal.ref}
        className={`border-t border-border bg-graphite/50 ${footerReveal.className}`}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-xl tracking-widest">
            APELSIN<span className="text-primary">.</span>DETAILING
          </p>
          <div className="flex flex-col items-start gap-1 text-xs text-muted-foreground sm:items-end">
            <p>
              © {new Date().getFullYear()} Apelsin Industrial Park · Астана, Алаш 46/2. Все права
              защищены.
            </p>
            <Link to="/privacy" className="hover:text-primary">
              Политика конфиденциальности
            </Link>
          </div>
        </div>
      </footer>

      <a
        href={WHATSAPP}
        target="_blank"
        rel="noreferrer"
        aria-label="Написать в WhatsApp"
        className="fixed right-5 bottom-5 z-50 inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-4 text-sm font-semibold text-background shadow-[var(--shadow-panel)] transition-transform hover:-translate-y-1"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>
    </div>
  );
}
