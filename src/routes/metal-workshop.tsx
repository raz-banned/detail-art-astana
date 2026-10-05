import { createFileRoute } from "@tanstack/react-router";
import {
  Ruler,
  Flame,
  Scissors,
  Truck,
  Fence,
  Warehouse,
  PaintRoller,
  ArrowUpDown,
  Wind,
  DoorOpen,
  Sun,
  MessageCircle,
} from "lucide-react";
import { ADDRESS, MANAGER_PHONE } from "@/lib/business-info";
import workshopImg from "@/assets/metal-workshop.jpg";

export const Route = createFileRoute("/metal-workshop")({
  head: () => ({
    meta: [
      { title: "Цех металлоконструкций — Apelsin Industrial Park" },
      {
        name: "description",
        content: `Цех металлоконструкций — ${ADDRESS}.`,
      },
    ],
  }),
  component: MetalWorkshopPage,
});

const METAL_WHATSAPP = `https://wa.me/${MANAGER_PHONE}?text=${encodeURIComponent("Здравствуйте! Хочу заказать работы в цехе металлоконструкций")}`;

// Draft copy written for the site, not confirmed by the company yet (see "Content reliability" in
// CLAUDE.md). The workshop features below describe what is visible in the photo; capacities,
// prices and timing are deliberately left out until the owner confirms them.
const works = [
  {
    icon: Ruler,
    title: "Изготовление по чертежам",
    text: "Каркасы, фермы, лестницы, площадки и нестандартные конструкции по вашим чертежам или эскизу — поможем довести идею до рабочего чертежа.",
  },
  {
    icon: Flame,
    title: "Сварочные работы",
    text: "Полуавтоматическая и аргонная сварка чёрного металла, нержавейки и алюминия — как в цехе, так и ремонт готовых изделий.",
  },
  {
    icon: Scissors,
    title: "Резка и гибка металла",
    text: "Раскрой листа, профиля и трубы в размер, гибка деталей — подготовим заготовки под вашу сборку или сделаем изделие целиком.",
  },
  {
    icon: Truck,
    title: "Ремонт рам и кузовов",
    text: "Восстановление и усиление рам грузовиков и прицепов, кронштейнов и навесного оборудования — рядом с нашим грузовым сервисом.",
  },
  {
    icon: Fence,
    title: "Навесы, ограждения, ворота",
    text: "Навесы для техники и парковок, заборы, ограждения, распашные и откатные ворота — изготовление и монтаж.",
  },
  {
    icon: Warehouse,
    title: "Стеллажи и складское оборудование",
    text: "Металлические стеллажи, полки, верстаки и тележки под размеры вашего склада или мастерской.",
  },
  {
    icon: PaintRoller,
    title: "Покраска и защита от коррозии",
    text: "Очистка, грунтование и покраска готовых конструкций, чтобы металл дольше служил на улице и в неотапливаемых помещениях.",
  },
];

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

const steps = [
  "Присылаете чертёж, эскиз или фото того, что нужно сделать",
  "Уточняем размеры и материалы, считаем стоимость и сроки",
  "Изготавливаем изделие в цехе",
  "Сдаём готовую работу, при необходимости — с доставкой и монтажом по договорённости",
];

function MetalWorkshopPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:pt-24">
        <p className="eyebrow">Металлообработка</p>
        <h1 className="mt-4 max-w-3xl text-5xl leading-[0.95] sm:text-7xl">
          Цех <span className="text-primary">металлоконструкций</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Изготавливаем и ремонтируем металлоконструкции в Apelsin Industrial Park: сварка, резка,
          сборка и покраска — от кронштейнов и рам до навесов, ворот и стеллажей.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a
            href={METAL_WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="btn-ember rounded-md px-8 py-4 text-sm"
          >
            Рассчитать заказ
          </a>
          <a
            href={METAL_WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border px-8 py-4 text-sm font-semibold tracking-widest uppercase transition-colors hover:border-primary hover:text-primary"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </div>
        <img
          src={workshopImg}
          alt="Цех металлоконструкций: кран-балка, сварочные посты с вытяжками и стеллажи"
          width={1000}
          height={667}
          className="mt-14 aspect-[3/2] w-full rounded-lg border border-border object-cover lg:aspect-[21/9]"
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24">
        <p className="eyebrow">Виды работ</p>
        <h2 className="mt-3 text-4xl sm:text-5xl">Что делаем из металла</h2>
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
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl">Есть чертёж или идея?</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Пришлите в WhatsApp чертёж, эскиз или фото — посчитаем стоимость и сроки изготовления.
          </p>
          <a
            href={METAL_WHATSAPP}
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
