import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { DIRECTIONS } from "@/lib/directions";

export type NavItem = [label: string, href: string];

const navLinkClass = "group/link relative transition-colors hover:text-primary";
const navUnderline =
  "absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 bg-primary transition-transform duration-150 ease-out group-hover/link:scale-x-100";
const menuItemClass =
  "flex items-center justify-between rounded-md px-3 py-3 transition-colors hover:bg-graphite hover:text-primary";

function SoonBadge() {
  return (
    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] tracking-wider text-muted-foreground uppercase">
      скоро
    </span>
  );
}

// Shared by every public page. `nav` holds the page's own section anchors; the "Направления"
// menu comes from DIRECTIONS, so a new direction page shows up here once it gets a `path`.
export function SiteHeader({
  nav,
  cta,
  ready = true,
}: {
  nav: NavItem[];
  cta: { label: string; href: string; onClick?: () => void; external?: boolean };
  /** False while the homepage preloader is up, so the logo animates in after it. */
  ready?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    // Padding in place of the hidden scrollbar keeps the page from shifting sideways.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [menuOpen]);

  const [directionsOpen, setDirectionsOpen] = useState(false);
  const directionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!directionsOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!directionsRef.current?.contains(e.target as Node)) setDirectionsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [directionsOpen]);

  // Close both menus on any navigation (back button included), not only on their own links.
  const pathname = useLocation({ select: (l) => l.pathname });
  useEffect(() => {
    setMenuOpen(false);
    setDirectionsOpen(false);
  }, [pathname]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            to="/"
            className={`font-display text-2xl tracking-widest ${ready ? "animate-[fade-in-up_0.6s_ease_both]" : "opacity-0"}`}
          >
            APELSIN<span className="text-primary">.</span>INDUSTRIAL
          </Link>
          <nav className="hidden items-center gap-16 text-sm font-normal whitespace-nowrap text-muted-foreground lg:flex">
            <div
              ref={directionsRef}
              className="group relative"
              onKeyDown={(e) => {
                if (e.key !== "Escape") return;
                setDirectionsOpen(false);
                (document.activeElement as HTMLElement | null)?.blur();
              }}
            >
              <button
                type="button"
                aria-expanded={directionsOpen}
                aria-controls="directions-menu"
                onClick={() => setDirectionsOpen((v) => !v)}
                className="flex items-center gap-1 transition-colors hover:text-primary"
                style={{ WebkitTextStroke: "0.5px currentColor" }}
              >
                Направления
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${directionsOpen ? "rotate-180" : ""}`}
                />
              </button>
              <div
                id="directions-menu"
                className={`absolute top-full left-1/2 z-50 w-72 -translate-x-1/2 pt-4 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-has-focus-visible:visible group-has-focus-visible:opacity-100 ${directionsOpen ? "visible opacity-100" : "invisible opacity-0"}`}
              >
                <div className="surface-panel rounded-lg py-2 shadow-[var(--shadow-panel)]">
                  {DIRECTIONS.map((d) =>
                    d.path ? (
                      <Link
                        key={d.slug}
                        to={d.path}
                        className="block px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-graphite hover:text-primary"
                      >
                        {d.title}
                      </Link>
                    ) : (
                      <span
                        key={d.slug}
                        aria-disabled="true"
                        className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm text-muted-foreground"
                      >
                        {d.title}
                        <SoonBadge />
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
            {nav.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className={navLinkClass}
                style={{ WebkitTextStroke: "0.5px currentColor" }}
              >
                {label}
                <span className={navUnderline} />
              </a>
            ))}
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
        onClick={closeMenu}
      />
      <div
        inert={!menuOpen}
        className={`fixed top-0 right-0 z-45 flex h-full w-full max-w-[280px] flex-col gap-6 overflow-y-auto border-l border-border bg-background p-8 pt-24 transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <a
          href={cta.href}
          onClick={() => {
            cta.onClick?.();
            closeMenu();
          }}
          {...(cta.external ? { target: "_blank", rel: "noreferrer" } : {})}
          className="btn-ember rounded-md px-5 py-3 text-center text-sm"
        >
          {cta.label}
        </a>
        <nav className="flex flex-col gap-1 text-lg lg:hidden">
          {nav.map(([label, href]) => (
            <a key={href} href={href} onClick={closeMenu} className={menuItemClass}>
              {label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col gap-1 border-t border-border pt-6 text-lg">
          <p className="eyebrow px-3 pb-2">Направления</p>
          {DIRECTIONS.map((d) =>
            d.path ? (
              <Link key={d.slug} to={d.path} onClick={closeMenu} className={menuItemClass}>
                {d.title}
              </Link>
            ) : (
              <span
                key={d.slug}
                aria-disabled="true"
                className="flex items-center justify-between gap-3 rounded-md px-3 py-3 text-muted-foreground"
              >
                {d.title}
                <SoonBadge />
              </span>
            ),
          )}
        </div>
      </div>
    </>
  );
}
