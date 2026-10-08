import { MessageCircle } from "lucide-react";
import { GOALS, reachGoal } from "@/lib/analytics";
import { WHATSAPP } from "@/lib/business-info";

export function WhatsAppFab() {
  return (
    <a
      href={WHATSAPP}
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
