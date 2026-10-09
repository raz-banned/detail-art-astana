import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { GOALS, reachGoal } from "@/lib/analytics";
import { ADDRESS, DETAILING_WHATSAPP, HOURS, PHONE, PHONE_HREF } from "@/lib/business-info";

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
  Check,
  MessageCircle,
  Truck,
  ArrowLeftRight,
} from "lucide-react";

import heroImg from "@/assets/hero-car.webp";
import apelsinLogo from "@/assets/apelsin-logo.webp";
import beforePaint from "@/assets/before-paint.jpg";
import afterPaint from "@/assets/after-paint.jpg";
import beforeInterior from "@/assets/before-interior.jpg";
import afterInterior from "@/assets/after-interior.jpg";
import { seoHead } from "@/lib/seo";
import { useReveal } from "@/hooks/use-reveal";
import { BookingForm } from "@/components/site/booking-form";
import { ContactsSection } from "@/components/site/contacts-section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader, type NavItem } from "@/components/site/site-header";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";

export const Route = createFileRoute("/detailing")({
  head: () =>
    seoHead({
      path: "/detailing",
      title: "Детейлинг в Астане — APELSIN INDUSTRIAL",
      description:
        "Детейлинг в Apelsin Industrial Park, Астана, Алаш 46/2: запись онлайн и связь в WhatsApp.",
    }),
  component: DetailingPage,
});

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
    // Leaving the page mid-animation unmounts this before the fade unlocks scrolling.
    return () => {
      clearTimeout(holdTimer);
      document.body.style.overflow = "";
    };
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
        alt="APELSIN INDUSTRIAL"
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

// TODO: подтвердить у владельца. `value: null` hides the stat; only confirmed numbers go here.
const heroStats: { value: string | null; label: string }[] = [
  { value: null, label: "авто в год" },
  { value: null, label: "на рынке" },
  { value: null, label: "гарантия керамики" },
];
const filteredHeroStats = heroStats.filter(
  (s): s is { value: string; label: string } => s.value !== null,
);

// TODO: подтвердить у владельца пакеты, состав и цены. `price` / `time` stay null until then:
// the card shows "Цена по запросу" and no duration.
const pricing: {
  name: string;
  price: string | null;
  time: string | null;
  popular?: boolean;
  features: string[];
}[] = [
  {
    name: "Экспресс",
    price: null,
    time: null,
    features: [
      "Двухфазная мойка кузова",
      "Обезжиривание и защитный воск",
      "Чистка стёкол и дисков",
      "Влажная уборка салона",
    ],
  },
  {
    name: "Керамика 9H",
    price: null,
    time: null,
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
    price: null,
    time: null,
    features: [
      "Разбор и химчистка всех поверхностей",
      "Экстрактор + пароочиститель",
      "Озонирование от запахов",
      "Кондиционер для кожи",
    ],
  },
];

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

function DetailingPage() {
  const nav: NavItem[] = [
    ["Услуги", "#services"],
    ["Цены", "#pricing"],
    ["До/после", "#gallery"],
    ["Запись", "#booking"],
  ];

  const [ready, setReady] = useState(false);

  const servicesReveal = useReveal<HTMLElement>();
  const pricingReveal = useReveal<HTMLElement>();
  const galleryReveal = useReveal<HTMLElement>();
  const bookingReveal = useReveal<HTMLElement>();

  return (
    <div className="min-h-screen bg-background">
      {!ready && <Preloader onDone={() => setReady(true)} />}
      <div className="fixed top-1/2 left-4 z-30 hidden h-[600px] w-56 -translate-y-1/2 items-center justify-center rounded-lg border border-dashed border-border bg-graphite/30 text-center text-xs text-muted-foreground uppercase min-[1700px]:flex">
        Реклама
      </div>
      <div className="fixed top-1/2 right-4 z-30 hidden h-[600px] w-56 -translate-y-1/2 items-center justify-center rounded-lg border border-dashed border-border bg-graphite/30 text-center text-xs text-muted-foreground uppercase min-[1700px]:flex">
        Реклама
      </div>
      <SiteHeader nav={nav} cta={{ label: "Записаться", href: "#booking" }} ready={ready} />

      <section id="top" className="relative isolate overflow-hidden bg-background">
        {/* Portrait photo: full-bleed on mobile, beside the text on desktop. `lighten` drops the
            photo's own dark backdrop so only the lit car shows, and the mask fades the rest. */}
        <img
          src={heroImg}
          alt=""
          width={1179}
          height={2564}
          fetchPriority="high"
          className="absolute inset-y-0 right-0 h-full w-full object-cover object-[50%_60%] opacity-60 mix-blend-lighten [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_60%,transparent)] lg:right-[max(4%,calc(50%-40rem))] lg:w-[55%] lg:max-w-[50rem] lg:opacity-100 lg:[mask-image:radial-gradient(closest-side_at_50%_55%,black_60%,transparent)]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/25 lg:via-background/40 lg:to-transparent" />
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
            <span className="text-primary"> авто и фур</span>
          </h1>
          <p
            className={`mt-6 max-w-xl text-lg text-muted-foreground ${ready ? "animate-[fade-in-up_0.6s_ease_both] [animation-delay:180ms]" : "opacity-0"}`}
          >
            APELSIN INDUSTRIAL — детейлинг-центр в Астане. Керамика, полировка, химчистка и защитные
            плёнки в тёплых боксах: принимаем и седаны, и тягачи с прицепами. Совершенство в каждой
            детали.
          </p>
          <div
            className={`mt-9 flex flex-wrap gap-3 ${ready ? "animate-[fade-in-up_0.6s_ease_both] [animation-delay:240ms]" : "opacity-0"}`}
          >
            <a href="#booking" className="btn-ember rounded-md px-8 py-4 text-sm">
              Запись онлайн
            </a>
            <a
              href={DETAILING_WHATSAPP}
              onClick={() => reachGoal(GOALS.whatsappClick)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border px-8 py-4 text-sm font-semibold tracking-widest uppercase transition-colors hover:border-primary hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>

          {filteredHeroStats.length > 0 && (
            <dl
              className={`mt-14 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4 ${ready ? "animate-[fade-in-up_0.6s_ease_both] [animation-delay:300ms]" : "opacity-0"}`}
            >
              {filteredHeroStats.map(({ value, label }) => (
                <div key={label}>
                  <dt className="font-display text-3xl text-primary">{value}</dt>
                  <dd className="text-xs tracking-wider text-muted-foreground uppercase">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          )}
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
            Прайс уточняется. Стоимость зависит от автомобиля и его состояния — назовём её после
            осмотра.
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
                {p.time && (
                  <p className="mt-2 flex items-center gap-2 text-xs tracking-wider text-muted-foreground uppercase">
                    <Clock className="h-3.5 w-3.5" /> {p.time}
                  </p>
                )}
                <p className="font-display mt-5 text-4xl text-primary">
                  {p.price ?? "Цена по запросу"}
                </p>
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
                <span>{ADDRESS}</span>
              </li>
              <li className="flex gap-3">
                <Clock className="h-5 w-5 shrink-0 text-primary" />
                <span>{HOURS}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="h-5 w-5 shrink-0 text-primary" />
                <a
                  href={PHONE_HREF}
                  onClick={() => reachGoal(GOALS.phoneClick)}
                  className="hover:text-primary"
                >
                  {PHONE}
                </a>
              </li>
            </ul>
          </div>
          <BookingForm direction="detailing" services={services.map((s) => s.title)} />
        </div>
      </section>

      <ContactsSection />
      <SiteFooter />
      <WhatsAppFab href={DETAILING_WHATSAPP} />
    </div>
  );
}
