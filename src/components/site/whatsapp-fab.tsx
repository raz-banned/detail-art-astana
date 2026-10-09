import { MessageCircle } from "lucide-react";
import { GOALS, reachGoal } from "@/lib/analytics";
import { WHATSAPP } from "@/lib/business-info";

// `href` lets a direction page prefill its own first message; the default is park-wide.
export function WhatsAppFab({ href = WHATSAPP }: { href?: string }) {
  return (
    <a
      href={href}
      onClick={() => reachGoal(GOALS.whatsappClick)}
      target="_blank"
      rel="noreferrer"
      aria-label="Написать в WhatsApp"
      className="fixed right-5 bottom-5 z-50 inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-4 text-sm font-semibold text-background shadow-[var(--shadow-panel)] transition-transform hover:-translate-y-1"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
