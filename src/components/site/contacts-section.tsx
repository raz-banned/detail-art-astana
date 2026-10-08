import { Navigation } from "lucide-react";
import { ROUTE_LINKS, TWO_GIS_WIDGET } from "@/lib/business-info";
import { useReveal } from "@/hooks/use-reveal";

export function ContactsSection() {
  const reveal = useReveal<HTMLElement>();

  return (
    <section
      id="contacts"
      ref={reveal.ref}
      className={`border-t border-border ${reveal.className}`}
    >
      <div className="mx-auto max-w-6xl px-4 py-24">
        <p className="eyebrow">Карта</p>
        <h2 className="mt-3 text-4xl sm:text-5xl">Как нас найти</h2>
        <div className="surface-panel mt-10 overflow-hidden rounded-lg">
          <iframe
            title="Карта 2GIS — APELSIN INDUSTRIAL, Астана"
            src={TWO_GIS_WIDGET}
            className="h-[420px] w-full border-0"
            loading="lazy"
          />
        </div>
        <p className="mt-8 text-sm text-muted-foreground">Построить маршрут:</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {ROUTE_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-semibold tracking-widest uppercase transition-colors hover:border-primary hover:text-primary"
            >
              <Navigation className="h-4 w-4" /> {label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
