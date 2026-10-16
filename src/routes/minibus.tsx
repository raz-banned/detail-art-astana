import { createFileRoute } from "@tanstack/react-router";
import {
  Armchair,
  Briefcase,
  Crown,
  Gem,
  Layers,
  Lightbulb,
  MonitorPlay,
  Paintbrush,
  Sofa,
  Tent,
  Thermometer,
  Users,
  VolumeX,
  type LucideIcon,
} from "lucide-react";
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

export const Route = createFileRoute("/minibus")({
  head: () =>
    seoHead({
      path: "/minibus",
      title: "Детейлинг микроавтобусов в Астане — APELSIN INDUSTRIAL",
      description: `Детейлинг микроавтобусов в Apelsin Industrial Park: перетяжка салона и переделка салона под VIP. ${ADDRESS}.`,
    }),
  component: MinibusPage,
});

const MINIBUS_WHATSAPP = whatsappUrl("Здравствуйте! Хочу обсудить салон микроавтобуса");

// The services come from the company (DIRECTIONS); only their icons are added here, keyed by
// service name (see DirectionServices).
const minibus = getDirection("minibus");
const serviceIcons: Record<string, LucideIcon> = {
  "Перетяжка салона": Sofa,
  "Переделка салона под VIP": Crown,
};

// TODO: draft copy from PR #23 (written for Mercedes-Benz Sprinter), not confirmed by the company
// (see "Content reliability" in CLAUDE.md). Prices, timing and equipment brands are left out.
const works = [
  {
    icon: Armchair,
    title: "Сиденья и перепланировка",
    text: "Установка пассажирских и VIP-кресел, диванов и столиков, перепланировка салона под ваши задачи и количество мест.",
  },
  {
    icon: VolumeX,
    title: "Шумо- и теплоизоляция",
    text: "Обработка кузова, пола и дверей изоляционными материалами — в салоне тише и дольше держится тепло зимой.",
  },
  {
    icon: Layers,
    title: "Обшивка салона",
    text: "Новые потолок, стены и пол: экокожа, алькантара, ковролин, панели — подбираем материалы и цвета под проект.",
  },
  {
    icon: Lightbulb,
    title: "Освещение",
    text: "Светодиодная подсветка потолка, ниш и пола, «звёздное небо», индивидуальные светильники для пассажиров.",
  },
  {
    icon: Thermometer,
    title: "Климат и автономный отопитель",
    text: "Дополнительная печь и кондиционер для пассажирского салона, автономный отопитель для стоянки зимой.",
  },
  {
    icon: MonitorPlay,
    title: "Мультимедиа",
    text: "Телевизоры, акустика, розетки и USB у каждого места, перегородка с экраном между водителем и салоном.",
  },
  {
    icon: Paintbrush,
    title: "Внешний тюнинг",
    text: "Тонировка, оклейка плёнкой, диски, пороги и обвес — чтобы внешний вид соответствовал салону.",
  },
];

// TODO: draft from PR #23, confirm which conversions the company actually does.
const variants = [
  {
    icon: Gem,
    title: "VIP-салон",
    text: "Бизнес-кресла, столик, мультимедиа и освещение — для трансфера руководителей и гостей.",
  },
  {
    icon: Users,
    title: "Пассажирский",
    text: "Микроавтобус с удобными сиденьями и климатом для пассажирских и туристических перевозок.",
  },
  {
    icon: Tent,
    title: "Автодом",
    text: "Спальные места, кухонный блок и автономное отопление для путешествий.",
  },
  {
    icon: Briefcase,
    title: "Мобильный офис или мастерская",
    text: "Рабочее место, стеллажи и электрика для выездной работы и сервиса.",
  },
];

// TODO: draft from PR #23, confirm the order process with the company.
const steps = [
  "Обсуждаем задачу: для чего будет использоваться микроавтобус и сколько нужно мест",
  "Предлагаем планировку и материалы, считаем стоимость и сроки",
  "Выполняем работы в нашем боксе",
  "Сдаём готовый автомобиль и показываем все функции салона",
];

function MinibusPage() {
  const nav: NavItem[] = [
    ["Услуги", "#services"],
    ["Виды работ", "#works"],
    ["Как заказать", "#order"],
    ["Заявка", "#booking"],
  ];

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <SiteHeader nav={nav} cta={{ label: "Оставить заявку", href: "#booking" }} />

      <section id="top" className="mx-auto max-w-6xl px-4 pt-16 sm:pt-24">
        <p className={`eyebrow ${heroIn(0)}`}>Микроавтобусы</p>
        <h1 className={`mt-4 max-w-3xl text-5xl leading-[0.95] sm:text-7xl ${heroIn(1)}`}>
          <span className="text-primary">Детейлинг</span> микроавтобусов
        </h1>
        <p className={`mt-6 max-w-xl text-lg text-muted-foreground ${heroIn(2)}`}>
          Перетяжка салона и переделка салона под VIP.
        </p>
        <DirectionCtas
          bookLabel="Обсудить проект"
          whatsappHref={MINIBUS_WHATSAPP}
          className={heroIn(3)}
        />
      </section>

      <DirectionServices direction={minibus} icons={serviceIcons} title="Что делаем" />

      <RevealSection id="works" className="border-y border-border bg-graphite/40">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="eyebrow">Виды работ</p>
          <h2 className="mt-3 text-4xl sm:text-5xl">Что входит в работы с салоном</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {works.map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 text-xl">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      <RevealSection id="order" className="mx-auto grid max-w-6xl gap-14 px-4 py-24 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Проекты</p>
          <h2 className="mt-3 text-4xl sm:text-5xl">Варианты переоборудования</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {variants.map(({ icon: Icon, title, text }) => (
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
      </RevealSection>

      {/* Both this and the section above have no background: the line keeps them apart. */}
      <div className="border-t border-border">
        <DirectionBooking
          direction={minibus}
          title="Каким должен быть ваш салон?"
          text="Оставьте заявку или напишите в WhatsApp модель микроавтобуса и что хотите получить — менеджер свяжется с вами."
          carPlaceholder="Марка и модель микроавтобуса"
        />
      </div>

      <ContactsSection />
      <SiteFooter />
      <WhatsAppFab href={MINIBUS_WHATSAPP} />
    </div>
  );
}
