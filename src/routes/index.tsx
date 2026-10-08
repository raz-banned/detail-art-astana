import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, Check, MessageCircle, Star } from "lucide-react";
import { GOALS, reachGoal } from "@/lib/analytics";
import { TWO_GIS_RATING, TWO_GIS_REVIEWS, WHATSAPP } from "@/lib/business-info";
import { DIRECTIONS, type Direction } from "@/lib/directions";
import { seoHead } from "@/lib/seo";
import { useReveal } from "@/hooks/use-reveal";
import { ContactsSection } from "@/components/site/contacts-section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader, type NavItem } from "@/components/site/site-header";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";
import parkAsset from "@/assets/apelsin-park.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () =>
    seoHead({
      path: "/",
      title: "APELSIN INDUSTRIAL — детейлинг, грузовой сервис и металлоцех в Астане",
      description:
        "Apelsin Industrial Park, Астана, Алаш 46/2: детейлинг авто и микроавтобусов, ремонт и переоборудование грузовой техники, металлоцех с лазерной резкой и сваркой.",
    }),
  component: Hub,
});

const nav: NavItem[] = [
  ["Отзывы", "#reviews"],
  ["Контакты", "#contacts"],
];

const twoGisRatingText = TWO_GIS_RATING?.rating.toLocaleString("ru-RU", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const reviewPlural = new Intl.PluralRules("ru-RU");
const reviewForms: Partial<Record<Intl.LDMLPluralRule, string>> = {
  one: "отзыв",
  few: "отзыва",
  many: "отзывов",
};
// "1 отзыв", "3 отзыва", "12 отзывов".
function reviewCountLabel(count: number) {
  return `${count} ${reviewForms[reviewPlural.select(count)] ?? "отзывов"}`;
}

// TODO: real client reviews only, with their permission. `about` is the direction or the work
// done, shown under the name. While the list is empty the section shows just the 2GIS link.
const reviews: { name: string; about: string; text: string; stars: 1 | 2 | 3 | 4 | 5 }[] = [];

function DirectionCard({ direction }: { direction: Direction }) {
  return (
    <article className="surface-panel flex flex-col rounded-lg p-6 sm:p-8">
      <h3 className="text-2xl sm:text-3xl">{direction.title}</h3>
      {direction.services.length > 0 && (
        <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
          {direction.services.map((s) => (
            <li key={s} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {s}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto pt-8">
        {direction.path ? (
          <Link
            to={direction.path}
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest text-primary uppercase hover:underline"
          >
            Подробнее <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground">Страница скоро</span>
        )}
      </div>
    </article>
  );
}

// Sections that lived on the homepage before it became the hub; old links such as /#booking
// (ads, messengers, bookmarks) are sent to the same section on /detailing.
const DETAILING_HASHES = ["#services", "#pricing", "#gallery", "#booking"];

function Hub() {
  useEffect(() => {
    const { hash } = window.location;
    if (DETAILING_HASHES.includes(hash)) window.location.replace(`/detailing${hash}`);
  }, []);

  const directionsReveal = useReveal<HTMLElement>();
  const reviewsReveal = useReveal<HTMLElement>();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        nav={nav}
        cta={{
          label: "Написать в WhatsApp",
          href: WHATSAPP,
          onClick: () => reachGoal(GOALS.whatsappClick),
          external: true,
        }}
      />

      <section id="top" className="relative isolate overflow-hidden bg-background">
        <img
          src={parkAsset.url}
          alt=""
          width={1600}
          height={900}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="relative mx-auto max-w-6xl px-4 py-28 sm:py-36">
          <p className="eyebrow animate-[fade-in-up_0.6s_ease_both] [animation-delay:60ms]">
            Астана · Apelsin Industrial Park · Алаш 46/2
          </p>
          <h1 className="mt-4 max-w-3xl animate-[fade-in-up_0.6s_ease_both] text-5xl leading-[0.95] [animation-delay:120ms] sm:text-7xl">
            Добро пожаловать в<span className="text-primary"> Apelsin Industrial</span>
          </h1>
          <p className="mt-6 max-w-xl animate-[fade-in-up_0.6s_ease_both] text-lg text-muted-foreground [animation-delay:180ms]">
            Детейлинг, грузовой сервис и металлоцех на одной территории в Астане.
          </p>
          <div className="mt-9 flex animate-[fade-in-up_0.6s_ease_both] flex-wrap gap-3 [animation-delay:240ms]">
            <a href="#directions" className="btn-ember rounded-md px-8 py-4 text-sm">
              Выбрать направление
            </a>
            <a
              href={WHATSAPP}
              onClick={() => reachGoal(GOALS.whatsappClick)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border px-8 py-4 text-sm font-semibold tracking-widest uppercase transition-colors hover:border-primary hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section
        id="directions"
        ref={directionsReveal.ref}
        className={`mx-auto max-w-6xl px-4 py-24 ${directionsReveal.className}`}
      >
        <p className="eyebrow">Направления</p>
        <h2 className="mt-3 text-4xl sm:text-5xl">Выберите направление</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {DIRECTIONS.map((d) => (
            <DirectionCard key={d.slug} direction={d} />
          ))}
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
          {reviews.length > 0 && (
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {reviews.map((r) => (
                <article key={r.name} className="surface-panel rounded-lg p-6">
                  <div className="flex gap-1" role="img" aria-label={`Оценка ${r.stars} из 5`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${r.stars >= i + 1 ? "text-primary fill-current" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                  <footer className="mt-6 border-t border-border pt-4">
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-xs tracking-wider text-muted-foreground uppercase">
                      {r.about}
                    </p>
                  </footer>
                </article>
              ))}
            </div>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={TWO_GIS_REVIEWS}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-semibold tracking-widest uppercase transition-colors hover:border-primary hover:text-primary"
            >
              <Star className="h-4 w-4" /> Отзывы в 2GIS
            </a>
            {TWO_GIS_RATING && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-current text-primary" />
                <span className="font-semibold text-foreground">{twoGisRatingText}</span>·{" "}
                {reviewCountLabel(TWO_GIS_RATING.count)}
              </p>
            )}
          </div>
        </div>
      </section>

      <ContactsSection />
      <SiteFooter />
      <WhatsAppFab />
    </div>
  );
}
