// The hero's entrance: the same staggered fade-in-up the detailing page plays after its
// preloader. Plain CSS, so on pages without a preloader it starts as soon as the HTML is painted.
// `step` 0–4 picks the delay; full class names only, since Tailwind finds classes as literal
// strings in the source. Hero images aren't animated: they're the page's largest paint (LCP), and
// starting them at opacity 0 delays it.
const HERO_IN = [
  "animate-[fade-in-up_0.6s_ease_both] [animation-delay:60ms]",
  "animate-[fade-in-up_0.6s_ease_both] [animation-delay:120ms]",
  "animate-[fade-in-up_0.6s_ease_both] [animation-delay:180ms]",
  "animate-[fade-in-up_0.6s_ease_both] [animation-delay:240ms]",
  "animate-[fade-in-up_0.6s_ease_both] [animation-delay:300ms]",
] as const;

export function heroIn(step: 0 | 1 | 2 | 3 | 4): string {
  return HERO_IN[step];
}
