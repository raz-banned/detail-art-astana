import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpDown,
  DoorOpen,
  Factory,
  Flame,
  Scissors,
  Sun,
  Warehouse,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import workshopImg from "@/assets/metal-workshop.webp";
import { ADDRESS, whatsappUrl } from "@/lib/business-info";
import { getDirection } from "@/lib/directions";
import { seoHead } from "@/lib/seo";
import { heroIn } from "@/lib/hero-in";
import {
  DirectionBooking,
  DirectionCtas,
  RevealSection,
  DirectionServices,
} from "@/components/site/direction-blocks";
import { ContactsSection } from "@/components/site/contacts-section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader, type NavItem } from "@/components/site/site-header";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";

export const Route = createFileRoute("/metal-workshop")({
  head: () =>
    seoHead({
      path: "/metal-workshop",
      title: "Металлоцех в Астане — APELSIN INDUSTRIAL",
      description: `Металлоцех в Apelsin Industrial Park: сварка, лазерная резка, металлоконструкции. ${ADDRESS}.`,
    }),
  component: MetalWorkshopPage,
});

const METAL_WHATSAPP = whatsappUrl("Здравствуйте! Хочу заказать работы в металлоцехе");

// The services come from the company (DIRECTIONS); only their icons are added here, keyed by
// service name (see DirectionServices).
const metal = getDirection("metal-workshop");
const serviceIcons: Record<string, LucideIcon> = {
  "Производство металлических изделий любой сложности": Factory,
  "Аргонная сварка": Flame,
  "Контактная сварка": Zap,
  "Сварка полуавтоматом": Flame,
  "Лазерная резка металла": Scissors,
  "Здания из металлоконструкций под ключ": Warehouse,
};

// TODO: draft copy from PR #22, not confirmed by the company (see "Content reliability" in
// CLAUDE.md). The features describe what's visible in the photo, whose origin is unconfirmed too.
const features = [
  {
    icon: ArrowUpDown,
    title: "Кран-балка",
    text: "Поднимаем и перемещаем тяжёлые детали и конструкции по всему цеху.",
  },
  {
    icon: Wind,
    title: "Вытяжка на сварочных постах",
    text: "Местные вытяжки убирают дым от сварки прямо от места работы.",
  },
  {
    icon: DoorOpen,
    title: "Высокие ворота",
    text: "Через секционные ворота в цех заезжает крупная техника и завозится металл.",
  },
  {
    icon: Sun,
    title: "Просторный светлый цех",
    text: "Большая площадь и хорошее освещение для сборки крупных изделий.",
  },
];

// TODO: draft from PR #22, confirm the order process with the company.
const steps = [
  "Присылаете чертёж, эскиз или фото того, что нужно сделать",
  "Уточняем размеры и материалы, считаем стоимость и сроки",
  "Изготавливаем изделие в цехе",
  "Сдаём готовую работу",
];

function MetalWorkshopPage() {
  const nav: NavItem[] = [
    ["Услуги", "#services"],
    ["Цех", "#workshop"],
    ["Заявка", "#booking"],
  ];

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <SiteHeader nav={nav} cta={{ label: "Оставить заявку", href: "#booking" }} />

      <section id="top" className="mx-auto max-w-6xl px-4 pt-16 sm:pt-24">
        <p className={`eyebrow ${heroIn(0)}`}>Металлообработка</p>
        <h1 className={`mt-4 max-w-3xl text-5xl leading-[0.95] sm:text-7xl ${heroIn(1)}`}>
          <span className="text-primary">Металлоцех</span> в Apelsin Industrial
        </h1>
        <p className={`mt-6 max-w-xl text-lg text-muted-foreground ${heroIn(2)}`}>
          Производство металлических изделий любой сложности, сварка, лазерная резка и здания из
          металлоконструкций под ключ.
        </p>
        <DirectionCtas
          bookLabel="Рассчитать заказ"
          whatsappHref={METAL_WHATSAPP}
          className={heroIn(3)}
        />
        <img
          src={workshopImg}
          alt="Цех: кран-балка, сварочные посты с вытяжками и стеллажи"
          width={1000}
          height={667}
          className="mt-14 aspect-[3/2] w-full rounded-lg border border-border object-cover lg:aspect-[21/9]"
        />
      </section>

      <DirectionServices direction={metal} icons={serviceIcons} title="Что делаем из металла" />

      <RevealSection id="workshop" className="border-y border-border bg-graphite/40">
        <div className="mx-auto grid max-w-6xl gap-14 px-4 py-24 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Цех</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Где работаем</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {features.map(({ icon: Icon, title, text }) => (
                <div key={title}>
                  <Icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-3 text-xl">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow">Порядок работы</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Как заказать</h2>
            <ol className="mt-10 space-y-5">
              {steps.map((step, i) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-graphite font-display text-lg text-primary">
                    {i + 1}
                  </span>
                  <span className="pt-1.5 text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </RevealSection>

      <DirectionBooking
        direction={metal}
        title="Есть чертёж или идея?"
        text="Оставьте заявку или пришлите чертёж, эскиз или фото в WhatsApp — посчитаем стоимость и сроки."
        carPlaceholder={null}
      />

      <ContactsSection />
      <SiteFooter />
      <WhatsAppFab href={METAL_WHATSAPP} />
    </div>
  );
}
