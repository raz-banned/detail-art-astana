import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SERVICE_PAGES } from "@/lib/services";

// Public site header, rendered once for every page by the root layout (`src/routes/__root.tsx`),
// so new pages get it without extra code. Links point at homepage sections with absolute
// `/#...` hashes: on the homepage that just scrolls, elsewhere it opens the homepage section.
const nav = [
  ["Услуги", "/#services"],
  ["Цены", "/#pricing"],
  ["До/после", "/#gallery"],
  ["Отзывы", "/#reviews"],
  ["Контакты", "/#contacts"],
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [menuOpen]);

  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!servicesOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!servicesRef.current?.contains(e.target as Node)) setServicesOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [servicesOpen]);

  // The header outlives page changes, so close the menus on any navigation (back button included),
  // not only when one of their own links is clicked.
  const pathname = useLocation({ select: (l) => l.pathname });
  useEffect(() => {
    setMenuOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <a
            href="/#top"
            className="animate-[fade-in-up_0.6s_ease_both] font-display text-2xl tracking-widest"
          >
            APELSIN<span className="text-primary">.</span>DETAILING
          </a>
          <nav className="hidden gap-20 text-sm font-normal whitespace-nowrap text-muted-foreground lg:flex">
            {nav.map(([label, href]) =>
              label === "Услуги" ? (
                <div
                  key={href}
                  ref={servicesRef}
                  className="group relative flex items-center gap-1"
                  onKeyDown={(e) => {
                    if (e.key !== "Escape") return;
                    setServicesOpen(false);
                    (document.activeElement as HTMLElement | null)?.blur();
                  }}
                >
                  <a
                    href={href}
                    className="group/link relative transition-colors hover:text-primary"
                    style={{ WebkitTextStroke: "0.5px currentColor" }}
                  >
                    {label}
                    <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 bg-primary transition-transform duration-150 ease-out group-hover/link:scale-x-100" />
                  </a>
                  <button
                    type="button"
                    aria-label="Список услуг"
                    aria-expanded={servicesOpen}
                    aria-controls="services-menu"
                    onClick={() => setServicesOpen((v) => !v)}
                    className="-m-1 rounded p-1 transition-colors hover:text-primary"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    id="services-menu"
                    className={`absolute top-full left-1/2 z-50 w-64 -translate-x-1/2 pt-4 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-has-focus-visible:visible group-has-focus-visible:opacity-100 ${servicesOpen ? "visible opacity-100" : "invisible opacity-0"}`}
                  >
                    <div className="surface-panel rounded-lg py-2 shadow-[var(--shadow-panel)]">
                      {SERVICE_PAGES.map((s) => (
                        <Link
                          key={s.slug}
                          to="/services/$slug"
                          params={{ slug: s.slug }}
                          onClick={() => setServicesOpen(false)}
                          className="group/item relative block px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-graphite hover:text-primary"
                        >
                          {s.title}
                          <span className="absolute bottom-1 left-5 h-px w-[calc(100%-2.5rem)] origin-left scale-x-0 bg-primary transition-transform duration-150 ease-out group-hover/item:scale-x-100" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  key={href}
                  href={href}
                  className="group/link relative transition-colors hover:text-primary"
                  style={{ WebkitTextStroke: "0.5px currentColor" }}
                >
                  {label}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 bg-primary transition-transform duration-150 ease-out group-hover/link:scale-x-100" />
                </a>
              ),
            )}
          </nav>
          <button
            type="button"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground"
          >
            <span className="relative flex h-4 w-5 flex-col justify-between">
              <span
                className={`h-0.5 w-full origin-center rounded-full bg-current transition-transform duration-300 ease-out ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
              />
              <span
                className={`h-0.5 w-full rounded-full bg-current transition-all duration-200 ease-out ${menuOpen ? "scale-x-0 opacity-0" : "opacity-100"}`}
              />
              <span
                className={`h-0.5 w-full origin-center rounded-full bg-current transition-transform duration-300 ease-out ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
      />
      <div
        inert={!menuOpen}
        className={`fixed top-0 right-0 z-45 flex h-full w-full max-w-[280px] flex-col gap-6 overflow-y-auto border-l border-border bg-background p-8 pt-24 transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <a
          href="/#booking"
          onClick={() => setMenuOpen(false)}
          className="btn-ember rounded-md px-5 py-3 text-center text-sm"
        >
          Записаться
        </a>
        <nav className="flex flex-col gap-1 text-lg lg:hidden">
          {nav.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-3 py-3 transition-colors hover:bg-graphite hover:text-primary"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col gap-1 border-t border-border pt-6 text-lg">
          <Link
            to="/trucks"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-between rounded-md px-3 py-3 transition-colors hover:bg-graphite hover:text-primary"
          >
            Грузовые
          </Link>
          <Link
            to="/moto"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-between rounded-md px-3 py-3 transition-colors hover:bg-graphite hover:text-primary"
          >
            Мото
          </Link>
          <Link
            to="/metal-workshop"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-between rounded-md px-3 py-3 transition-colors hover:bg-graphite hover:text-primary"
          >
            Металлоконструкции
          </Link>
        </div>
      </div>
    </>
  );
}
