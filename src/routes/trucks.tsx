import { createFileRoute } from "@tanstack/react-router";
import {
  ClipboardCheck,
  Cog,
  Drill,
  Flame,
  ScanLine,
  Timer,
  Truck,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import truckImg from "@/assets/truck-hero.webp";
import { ADDRESS, whatsappUrl } from "@/lib/business-info";
import { getDirection } from "@/lib/directions";
import { seoHead } from "@/lib/seo";
import {
  DirectionBooking,
  DirectionCtas,
  DirectionServices,
} from "@/components/site/direction-blocks";
import { ContactsSection } from "@/components/site/contacts-section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader, type NavItem } from "@/components/site/site-header";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";

export const Route = createFileRoute("/trucks")({
  head: () =>
    seoHead({
      path: "/trucks",
      title: "Грузовой сервис в Астане — APELSIN INDUSTRIAL",
      description: `Грузовой сервис в Apelsin Industrial Park: краткосрочный и капитальный ремонт, переоборудование грузовой техники. ${ADDRESS}.`,
    }),
  component: TrucksPage,
});

const TRUCKS_WHATSAPP = whatsappUrl("Здравствуйте! Хочу записаться на ремонт грузовой техники");

// The services come from the company (DIRECTIONS); only their icons are added here, keyed by
// service name (see DirectionServices).
const trucks = getDirection("trucks");
const serviceIcons: Record<string, LucideIcon> = {
  "Краткосрочные ремонты": Timer,
  "Капитальный ремонт грузовой техники": Cog,
  "Переоборудование грузовой техники": Truck,
};

// TODO: draft copy from PR #9, not confirmed by the company (see "Content reliability" in
// CLAUDE.md), including the Launch scanner and the in-house lathe.
const repairs = [
  {
    icon: Wrench,
    title: "Ремонт ходовой части",
    text: "Диагностика и ремонт подвески, рессор, амортизаторов и рулевого управления тягачей и прицепов.",
  },
  {
    icon: Wind,
    title: "Прокачка воздушной системы",
    text: "Обслуживание пневмосистемы тормозов и подвески: компрессор, ресиверы, клапаны, шланги.",
  },
  {
    icon: ClipboardCheck,
    title: "Полное ТО по регламенту",
    text: "Плановое обслуживание по регламенту производителя: замена масел и фильтров, проверка узлов и агрегатов.",
  },
  {
    icon: ScanLine,
    title: "Компьютерная диагностика",
    text: "Считываем и расшифровываем ошибки двигателя, АКПП, ABS и электроники на сканере Launch.",
  },
  {
    icon: Drill,
    title: "Токарные работы",
    text: "Восстановление и изготовление валов, втулок, шкивов и других деталей на месте.",
  },
  {
    icon: Flame,
    title: "Сварочные работы",
    text: "Ремонт рамы, кузова, кронштейнов и навесного оборудования: аргонная и полуавтоматическая сварка.",
  },
  {
    icon: Zap,
    title: "Ремонт электрооборудования",
    text: "Диагностика и ремонт проводки, генератора, стартера, освещения и бортовой электроники.",
  },
];

function TrucksPage() {
  const nav: NavItem[] = [
    ["Услуги", "#services"],
    ["Виды работ", "#repairs"],
    ["Заявка", "#booking"],
  ];

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <SiteHeader nav={nav} cta={{ label: "Оставить заявку", href: "#booking" }} />

      <section
        id="top"
        className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-16 sm:pt-24 lg:grid-cols-[1fr_auto]"
      >
        <div>
          <p className="eyebrow">Грузовая техника</p>
          <h1 className="mt-4 max-w-2xl text-5xl leading-[0.95] sm:text-7xl">
            <span className="text-primary">Грузовой сервис</span> в Apelsin Industrial
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Краткосрочный и капитальный ремонт, переоборудование грузовой техники.
          </p>
          <DirectionCtas bookLabel="Записаться на ремонт" whatsappHref={TRUCKS_WHATSAPP} />
        </div>
        {/* Stock photo, not the park's own truck (the company allowed it). Its black background
            is faded at the edges to blend into the page's. */}
        <img
          src={truckImg}
          alt="Седельный тягач"
          width={1024}
          height={1024}
          className="mx-auto w-full max-w-md [mask-image:radial-gradient(closest-side,black_70%,transparent)] lg:max-w-lg"
        />
      </section>

      <DirectionServices direction={trucks} icons={serviceIcons} title="Что делаем" />

      <section id="repairs" className="border-y border-border bg-graphite/40">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="eyebrow">Виды работ</p>
          <h2 className="mt-3 text-4xl sm:text-5xl">Что делаем в боксах</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {repairs.map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 text-xl">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DirectionBooking
        direction={trucks}
        title="Записаться на ремонт"
        text="Оставьте заявку или опишите проблему в WhatsApp — менеджер свяжется с вами."
        carPlaceholder="Марка и модель техники"
      />

      <ContactsSection />
      <SiteFooter />
      <WhatsAppFab href={TRUCKS_WHATSAPP} />
    </div>
  );
}
