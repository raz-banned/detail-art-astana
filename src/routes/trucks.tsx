import { createFileRoute } from "@tanstack/react-router";
import {
  Wrench,
  Wind,
  ClipboardCheck,
  ScanLine,
  Cog,
  Flame,
  Zap,
  MessageCircle,
} from "lucide-react";
import { MANAGER_PHONE } from "@/lib/business-info";
import truckImg from "@/assets/truck-hero.jpg";

export const Route = createFileRoute("/trucks")({
  head: () => ({
    meta: [
      { title: "Ремонт грузовых авто — Apelsin Truck" },
      {
        name: "description",
        content:
          "Ремонт грузовых авто и тягачей в Apelsin Industrial Park: ходовая часть, пневмосистема, ТО по регламенту, компьютерная диагностика Launch, токарные и сварочные работы, электрика.",
      },
    ],
  }),
  component: TrucksPage,
});

const TRUCK_WHATSAPP = `https://wa.me/${MANAGER_PHONE}?text=${encodeURIComponent("Здравствуйте! Хочу записаться на ремонт грузового авто")}`;

const repairs = [
  {
    icon: Wrench,
    title: "Ремонт ходовой части",
    text: "Диагностика и ремонт подвески, рессор, амортизаторов и рулевого управления — восстанавливаем управляемость и ресурс ходовой части тягачей и прицепов.",
  },
  {
    icon: Wind,
    title: "Прокачка воздушной системы",
    text: "Обслуживание пневмосистемы тормозов и подвески: компрессор, ресиверы, клапаны, шланги — устраняем утечки воздуха и восстанавливаем давление в контуре.",
  },
  {
    icon: ClipboardCheck,
    title: "Полное ТО по регламенту",
    text: "Плановое техническое обслуживание по регламенту производителя: замена масел и фильтров, проверка узлов и агрегатов — без сюрпризов в дальнем рейсе.",
  },
  {
    icon: ScanLine,
    title: "Компьютерная диагностика",
    text: "Считываем и расшифровываем ошибки двигателя, АКПП, ABS и электроники на профессиональном сканере Launch — база более 140 моделей грузовых авто.",
  },
  {
    icon: Cog,
    title: "Токарные работы",
    text: "Восстановление и изготовление валов, втулок, шкивов и других деталей на собственном токарном оборудовании — не ждём заказ с завода, точим на месте.",
  },
  {
    icon: Flame,
    title: "Сварочные работы",
    text: "Ремонт рамы, кузова, кронштейнов и навесного оборудования: аргонная и полуавтоматическая сварка чёрного металла и алюминия.",
  },
  {
    icon: Zap,
    title: "Ремонт электрооборудования",
    text: "Диагностика и ремонт проводки, генератора, стартера, освещения и бортовой электроники — от короткого замыкания до перепрошивки блоков управления.",
  },
];

function TrucksPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:py-24 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="eyebrow">Apelsin Truck</p>
          <h1 className="mt-4 max-w-2xl text-5xl leading-[0.95] sm:text-7xl">
            Ремонт <span className="text-primary">грузовых авто</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Обслуживаем тягачи, фуры и прицепы в собственных высоких боксах Apelsin Industrial Park
            — от плановых регламентных работ до сложного ремонта ходовой, электрики и сварки.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href={TRUCK_WHATSAPP}
              target="_blank"
              rel="noreferrer"
              className="btn-ember rounded-md px-8 py-4 text-sm"
            >
              Записаться на ремонт
            </a>
            <a
              href={TRUCK_WHATSAPP}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border px-8 py-4 text-sm font-semibold tracking-widest uppercase transition-colors hover:border-primary hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
        <img
          src={truckImg}
          alt="Тягач Mercedes-Benz Actros"
          width={1100}
          height={1100}
          className="mx-auto w-full max-w-md lg:max-w-lg lg:translate-x-12"
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <p className="eyebrow">Виды работ</p>
        <h2 className="mt-3 text-4xl sm:text-5xl">Что делаем в боксах</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {repairs.map(({ icon: Icon, title, text }) => (
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

      <section className="border-t border-border bg-graphite/40">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl">Готовы принять ваш борт в бокс</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Опишите проблему в WhatsApp — подскажем ориентировочные сроки и стоимость ремонта ещё до
            приезда.
          </p>
          <a
            href={TRUCK_WHATSAPP}
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
