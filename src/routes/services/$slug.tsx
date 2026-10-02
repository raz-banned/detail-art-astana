import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, MessageCircle } from "lucide-react";
import { MANAGER_PHONE } from "@/lib/business-info";
import { getServicePage, SERVICE_PAGES, type ServiceFacts } from "@/lib/services";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = getServicePage(params.slug);
    if (!service) throw notFound();
    return service;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — APELSIN DETAILING` },
          { name: "description", content: loaderData.summary },
        ]
      : [],
  }),
  component: ServicePageView,
});

const FACT_LABELS: [keyof ServiceFacts, string][] = [
  ["price", "Стоимость"],
  ["duration", "Срок работ"],
  ["warranty", "Гарантия"],
  ["materials", "Материалы"],
];

function ServicePageView() {
  const service = Route.useLoaderData();
  const whatsapp = `https://wa.me/${MANAGER_PHONE}?text=${encodeURIComponent(`Здравствуйте! Хочу записаться: ${service.title}`)}`;
  const others = SERVICE_PAGES.filter((s) => s.slug !== service.slug);

  return (
    <div className="min-h-screen bg-background">
      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <a
            href="/#services"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Все услуги
          </a>
          <p className="eyebrow">Услуга</p>
          <h1 className="mt-4 max-w-3xl text-5xl leading-[0.95] sm:text-7xl">{service.title}</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{service.summary}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/" hash="booking" className="btn-ember rounded-md px-8 py-4 text-sm">
              Записаться
            </Link>
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border px-8 py-4 text-sm font-semibold tracking-widest uppercase transition-colors hover:border-primary hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 lg:grid-cols-[3fr_2fr]">
          <div>
            <h2 className="text-3xl sm:text-4xl">Об услуге</h2>
            <div className="mt-5 space-y-4 leading-relaxed text-muted-foreground">
              {service.about.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            <h2 className="mt-14 text-3xl sm:text-4xl">Что обычно входит</h2>
            <ul className="mt-5 space-y-3">
              {service.includes.map((item) => (
                <li key={item} className="flex gap-3 text-muted-foreground">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Точный состав работ согласуем с вами до начала.
            </p>

            <h2 className="mt-14 text-3xl sm:text-4xl">Как проходит работа</h2>
            <ol className="mt-5 space-y-4">
              {service.steps.map((step, i) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-graphite font-display text-lg text-primary">
                    {i + 1}
                  </span>
                  <span className="pt-1.5 text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <aside className="surface-panel h-fit rounded-lg p-6 sm:p-8 lg:sticky lg:top-24">
            <h2 className="text-2xl">Стоимость и сроки</h2>
            <dl className="mt-5 divide-y divide-border text-sm">
              {FACT_LABELS.map(([key, label]) => (
                <div key={key} className="flex justify-between gap-4 py-3">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right">{service.facts[key] ?? "уточняйте у менеджера"}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-sm text-muted-foreground">
              Стоимость зависит от автомобиля и объёма работ. Напишите в WhatsApp — ответим на
              вопросы и подберём время.
            </p>
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="btn-ember mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md px-6 py-4 text-sm"
            >
              <MessageCircle className="h-4 w-4" /> Написать в WhatsApp
            </a>
          </aside>
        </section>

        <section className="border-t border-border bg-graphite/40">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-3xl sm:text-4xl">Другие услуги</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {others.map((s) => (
                <Link
                  key={s.slug}
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="rounded-md border border-border px-4 py-2.5 text-sm transition-colors hover:border-primary hover:text-primary"
                >
                  {s.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
