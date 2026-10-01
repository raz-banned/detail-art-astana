// Yandex Metrika. The counter is off when VITE_YM_COUNTER_ID is empty (local dev, previews).

declare global {
  interface Window {
    ym?: (counterId: number, method: string, ...args: unknown[]) => void;
  }
}

const rawId = import.meta.env["VITE_YM_COUNTER_ID"] as string | undefined;
export const YM_COUNTER_ID = rawId && /^\d+$/.test(rawId) ? Number(rawId) : null;

// Goal identifiers must match the goals created in the Metrika interface (type "JavaScript event").
export const GOALS = {
  bookingSubmit: "booking_submit",
  whatsappClick: "whatsapp_click",
  phoneClick: "phone_click",
} as const;

export type Goal = (typeof GOALS)[keyof typeof GOALS];

// The staff CRM is never tracked: its pages show clients' names, phones and wa.me links.
export const isAdminPath = (pathname: string) =>
  pathname === "/admin" || pathname.startsWith("/admin/");

// Official loader snippet. `defer: true` turns off the automatic first page view, so every
// view (including the first one) is sent by trackPageView — one code path for SSR and SPA.
// Webvisor is off: it records what visitors type, and the booking form has name and phone.
export const metrikaSnippet = (id: number) => `
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
ym(${id}, "init", { defer: true, clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: false });
`;

export function trackPageView(url: string, referer?: string) {
  if (YM_COUNTER_ID === null || typeof window === "undefined" || !window.ym) return;
  window.ym(YM_COUNTER_ID, "hit", url, { referer });
}

export function reachGoal(goal: Goal) {
  if (YM_COUNTER_ID === null || typeof window === "undefined" || !window.ym) return;
  window.ym(YM_COUNTER_ID, "reachGoal", goal);
}
