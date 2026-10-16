import { MapPin, MessageCircle, Phone, Wrench, type LucideIcon } from "lucide-react";
import { GOALS, reachGoal } from "@/lib/analytics";
import { ADDRESS, PHONE, PHONE_HREF } from "@/lib/business-info";
import type { Direction } from "@/lib/directions";
import { BookingForm } from "@/components/site/booking-form";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

// Blocks shared by the direction pages (/trucks, /metal-workshop, …). Each page keeps its own
// hero and draft sections; these are the parts that only differ by text and direction.

// A section that fades in the first time it scrolls into view, like the detailing page's.
// Takes no ref of its own: the reveal observer needs it.
export function RevealSection({
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "ref">) {
  const reveal = useReveal<HTMLElement>();
  return <section {...props} ref={reveal.ref} className={cn(className, reveal.className)} />;
}

// The hero's two buttons: jump to the booking form, or open WhatsApp with the page's message.
// `className` lets the page add its entrance animation.
export function DirectionCtas({
  bookLabel,
  whatsappHref,
  className,
}: {
  bookLabel: string;
  whatsappHref: string;
  className?: string;
}) {
  return (
    <div className={cn("mt-9 flex flex-wrap gap-3", className)}>
      <a href="#booking" className="btn-ember rounded-md px-8 py-4 text-sm">
        {bookLabel}
      </a>
      <a
        href={whatsappHref}
        onClick={() => reachGoal(GOALS.whatsappClick)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-md border border-border px-8 py-4 text-sm font-semibold tracking-widest uppercase transition-colors hover:border-primary hover:text-primary"
      >
        <MessageCircle className="h-4 w-4" /> WhatsApp
      </a>
    </div>
  );
}

// Grid columns for the services cards, by how many services the direction has.
function gridColumns(count: number): string {
  // 2, 4, 8…: full rows of two.
  if (count % 2 === 0 && count % 3 !== 0) return "md:grid-cols-2";
  // Exactly one row of three.
  if (count === 3) return "md:grid-cols-3";
  // 5, 6, 7…: two on a tablet (long titles), three on a desktop. Full class names only: Tailwind
  // finds classes as literal strings in the source, so `md:grid-cols-${n}` wouldn't be generated.
  return "md:grid-cols-2 lg:grid-cols-3";
}

// The direction's services from directions.ts, as cards. Icons are matched by service name, so
// reordering the list doesn't shuffle them; an unknown service gets the Wrench. With no services
// yet the section isn't rendered at all, rather than showing a heading over an empty grid.
export function DirectionServices({
  direction,
  icons,
  title,
}: {
  direction: Direction;
  icons: Record<string, LucideIcon>;
  title: string;
}) {
  if (direction.services.length === 0) return null;
  return (
    <RevealSection id="services" className="mx-auto max-w-6xl px-4 py-24">
      <p className="eyebrow">Услуги</p>
      <h2 className="mt-3 text-4xl sm:text-5xl">{title}</h2>
      <div className={`mt-12 grid gap-5 ${gridColumns(direction.services.length)}`}>
        {direction.services.map((service) => {
          const Icon = icons[service] ?? Wrench;
          return (
            <article
              key={service}
              className="surface-panel group rounded-lg p-6 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-primary hover:shadow-[var(--shadow-panel)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded bg-graphite text-primary transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-2xl transition-colors duration-300 group-hover:text-primary">
                {service}
              </h3>
            </article>
          );
        })}
      </div>
    </RevealSection>
  );
}

// The booking section: a short intro with the address and phone, and the shared BookingForm
// sending this direction's slug and services.
export function DirectionBooking({
  direction,
  title,
  text,
  carPlaceholder,
}: {
  direction: Direction;
  title: string;
  text: string;
  carPlaceholder?: string | null | undefined;
}) {
  return (
    <RevealSection id="booking" className="mx-auto max-w-6xl px-4 py-24">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Заявка</p>
          <h2 className="mt-3 text-4xl sm:text-5xl">{title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{text}</p>
          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-primary" />
              <span>{ADDRESS}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="h-5 w-5 shrink-0 text-primary" />
              <a
                href={PHONE_HREF}
                onClick={() => reachGoal(GOALS.phoneClick)}
                className="hover:text-primary"
              >
                {PHONE}
              </a>
            </li>
          </ul>
        </div>
        <BookingForm
          direction={direction.slug}
          services={direction.services}
          // Only pass it when set, so BookingForm's own default placeholder applies otherwise.
          {...(carPlaceholder !== undefined && { carPlaceholder })}
        />
      </div>
    </RevealSection>
  );
}
