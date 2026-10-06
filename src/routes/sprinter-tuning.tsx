import { createFileRoute } from "@tanstack/react-router";
import {
  Armchair,
  VolumeX,
  Lightbulb,
  Thermometer,
  MonitorPlay,
  Layers,
  Paintbrush,
  Crown,
  Users,
  Tent,
  Briefcase,
  MessageCircle,
} from "lucide-react";
import { ADDRESS, MANAGER_PHONE } from "@/lib/business-info";

export const Route = createFileRoute("/sprinter-tuning")({
  head: () => ({
    meta: [
      { title: "Тюнинг Sprinter — Apelsin Industrial Park" },
      {
        name: "description",
        content: `Тюнинг Mercedes-Benz Sprinter — ${ADDRESS}.`,
      },
    ],
  }),
  component: SprinterTuningPage,
});

const SPRINTER_WHATSAPP = `https://wa.me/${MANAGER_PHONE}?text=${encodeURIComponent("Здравствуйте! Хочу обсудить тюнинг Sprinter")}`;

// Draft copy written for the site, not confirmed by the company yet (see "Content reliability" in
// CLAUDE.md). Prices, timing, brands of seats/equipment and certification are deliberately left
// out until the owner confirms them.
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

const variants = [
  {
    icon: Crown,
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

const steps = [
  "Обсуждаем задачу: для чего будет использоваться Sprinter и сколько нужно мест",
  "Предлагаем планировку и материалы, считаем стоимость и сроки",
  "Выполняем переоборудование в нашем боксе",
  "Сдаём готовый автомобиль и показываем все функции салона",
];

function SprinterTuningPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <p className="eyebrow">Mercedes-Benz Sprinter</p>
        <h1 className="mt-4 max-w-3xl text-5xl leading-[0.95] sm:text-7xl">
          Тюнинг <span className="text-primary">Sprinter</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Переоборудуем Sprinter под ваши задачи: VIP-салон, пассажирский микроавтобус, автодом или
          мобильный офис — от шумоизоляции и обшивки до кресел, света и мультимедиа.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a
            href={SPRINTER_WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="btn-ember rounded-md px-8 py-4 text-sm"
          >
            Обсудить проект
          </a>
          <a
            href={SPRINTER_WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border px-8 py-4 text-sm font-semibold tracking-widest uppercase transition-colors hover:border-primary hover:text-primary"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <p className="eyebrow">Виды работ</p>
        <h2 className="mt-3 text-4xl sm:text-5xl">Что делаем со Sprinter</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {works.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="surface-panel group rounded-lg p-6 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:border-primary hover:shadow-[var(--shadow-panel)]"
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

      <section className="border-y border-border bg-graphite/40">
        <div className="mx-auto grid max-w-6xl gap-14 px-4 py-24 lg:grid-cols-2">
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
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl">Расскажите, каким должен быть ваш Sprinter</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Напишите в WhatsApp год и версию автомобиля и что хотите получить — предложим планировку
            и посчитаем стоимость.
          </p>
          <a
            href={SPRINTER_WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="btn-ember mt-8 inline-flex items-center gap-2 rounded-md px-8 py-4 text-sm"
          >
            <MessageCircle className="h-4 w-4" /> Написать в WhatsApp
          </a>
        </div>
      </section>

      <footer className="border-t border-border bg-graphite/50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-xl tracking-widest">
            APELSIN<span className="text-primary">.</span>DETAILING
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Apelsin Industrial Park. Часть комплекса Apelsin Detailing.
          </p>
        </div>
      </footer>
    </div>
  );
}
