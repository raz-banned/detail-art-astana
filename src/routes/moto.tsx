import { createFileRoute } from "@tanstack/react-router";
import {
  Droplets,
  Sparkles,
  ShieldCheck,
  Gem,
  Link2,
  Armchair,
  Car,
  MessageCircle,
} from "lucide-react";
import { ADDRESS, MANAGER_PHONE } from "@/lib/business-info";

export const Route = createFileRoute("/moto")({
  head: () => ({
    meta: [
      { title: "Детейлинг мотоциклов — APELSIN DETAILING" },
      {
        name: "description",
        content: `Детейлинг мотоциклов — ${ADDRESS}.`,
      },
    ],
  }),
  component: MotoPage,
});

const MOTO_WHATSAPP = `https://wa.me/${MANAGER_PHONE}?text=${encodeURIComponent("Здравствуйте! Хочу записаться на детейлинг мотоцикла")}`;

// Neutral descriptions of typical motorcycle detailing work. The studio's actual moto services,
// prices and timing are not confirmed yet (see "Content reliability" in CLAUDE.md), so the copy
// avoids promises about equipment, materials or durations.
const works = [
  {
    icon: Droplets,
    title: "Бережная мойка",
    text: "Ручная мойка с защитой электрики и узлов от воды: очищаем раму, двигатель, диски и труднодоступные места от дорожной грязи и масла.",
  },
  {
    icon: Sparkles,
    title: "Полировка бака и пластика",
    text: "Убираем мелкие царапины и потёртости с бака, обтекателей и пластиковых панелей, возвращаем глубину цвета и блеск.",
  },
  {
    icon: ShieldCheck,
    title: "Защитное покрытие",
    text: "Покрытие лака и пластика защитным составом: грязь и насекомые меньше прилипают, мотоцикл легче мыть.",
  },
  {
    icon: Gem,
    title: "Чистка и защита хрома",
    text: "Очищаем хромированные детали и выхлопную систему от налёта и окислов и наносим защиту от повторного потускнения.",
  },
  {
    icon: Link2,
    title: "Чистка и смазка цепи",
    text: "Снимаем старую смазку и грязь с цепи и звёзд, наносим свежую смазку — цепь работает тише и служит дольше.",
  },
  {
    icon: Armchair,
    title: "Уход за сиденьем",
    text: "Чистка сиденья из кожи или кожзаменителя и обработка средствами, которые защищают материал от пересыхания и трещин.",
  },
  {
    icon: Car,
    title: "Антигравийная плёнка",
    text: "Оклейка бака и зон риска прозрачной плёнкой, которая принимает на себя потёртости от экипировки и сколы от камней.",
  },
];

function MotoPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <p className="eyebrow">Мото</p>
        <h1 className="mt-4 max-w-2xl text-5xl leading-[0.95] sm:text-7xl">
          Детейлинг <span className="text-primary">мотоциклов</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Уход за мотоциклами в Apelsin Industrial Park — от бережной мойки до полировки и защитных
          покрытий, чтобы мотоцикл выглядел ухоженно весь сезон.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a
            href={MOTO_WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="btn-ember rounded-md px-8 py-4 text-sm"
          >
            Записаться на детейлинг
          </a>
          <a
            href={MOTO_WHATSAPP}
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
        <h2 className="mt-3 text-4xl sm:text-5xl">Что делаем с мотоциклом</h2>
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

      <section className="border-t border-border bg-graphite/40">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl">Готовы принять ваш мотоцикл</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Напишите в WhatsApp модель мотоцикла и что хотите сделать — подскажем стоимость и сроки
            и подберём время.
          </p>
          <a
            href={MOTO_WHATSAPP}
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
