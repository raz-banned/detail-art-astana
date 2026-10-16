// Supabase Database Webhook target: fires on INSERT into public.bookings.
// Sends a Telegram notification to the business owner via the Bot API.

interface BookingRecord {
  name: string;
  phone: string;
  car: string | null;
  service: string;
  preferred_date: string | null;
  // Missing until supabase/sql/2026-09-29-bookings-source.sql is applied.
  source?: string;
  // Missing until supabase/sql/2026-10-09-bookings-direction.sql is applied.
  direction?: string;
  // Missing until supabase/sql/2026-10-15-bookings-slots.sql is applied; null without a time.
  slot_start?: string | null;
}

// Titles for bookings.direction slugs, kept in sync with DIRECTIONS in src/lib/directions.ts
// (this function is deployed on its own and can't import from src/).
const DIRECTION_TITLES: Record<string, string> = {
  detailing: "Детейлинг",
  minibus: "Детейлинг микроавтобусов",
  trucks: "Грузовой сервис",
  "metal-workshop": "Металлоцех",
};

// No direction: the line is left out rather than guessed. An unknown slug (a direction added
// without redeploying this function) is shown as is, so the manager still sees it.
function directionLine(slug: string | undefined): string | null {
  if (!slug) return null;
  const title = Object.hasOwn(DIRECTION_TITLES, slug) ? DIRECTION_TITLES[slug] : slug;
  return `Направление: ${title}`;
}

// A direction without a services list (detailing for now) sends its own title as the service;
// that line would only repeat the direction.
function serviceLine(service: string, direction: string | undefined): string | null {
  if (direction && DIRECTION_TITLES[direction] === service) return null;
  return `Услуга: ${service}`;
}

// Astana is UTC+5 all year, the same fixed offset as src/lib/booking-slots.ts (keep in sync).
// Not timeZone: "Asia/Almaty": the runtime's time zone data may predate Kazakhstan's 2024 switch.
const ASTANA_OFFSET_MS = 5 * 60 * 60 * 1000;
// Spelled out rather than Intl's "ru-RU": a runtime without Russian locale data would silently
// print "Tuesday, October 20".
const WEEKDAYS = [
  "воскресенье",
  "понедельник",
  "вторник",
  "среда",
  "четверг",
  "пятница",
  "суббота",
];
const MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

// "Время: вторник, 20 октября, 10:00", the same as the site's WhatsApp message. Parsed as a
// date, not cut from the string: the webhook's JSON may carry any UTC offset ("+00:00", "Z").
// A value that isn't a usable date (anyone can insert through the API) is shown as stored, so
// the notification still goes out. Without a slot the preferred date is shown, as before.
function timeLine(record: BookingRecord): string | null {
  if (record.slot_start) {
    const astana = new Date(new Date(record.slot_start).getTime() + ASTANA_OFFSET_MS);
    // NaN for an unparsable string, and for a date pushed past JS's range by the offset.
    if (Number.isNaN(astana.getTime())) return `Время: ${record.slot_start}`;
    const day = `${WEEKDAYS[astana.getUTCDay()]}, ${astana.getUTCDate()} ${MONTHS[astana.getUTCMonth()]}`;
    return `Время: ${day}, ${astana.toISOString().slice(11, 16)}`;
  }
  return record.preferred_date ? `Желаемая дата: ${record.preferred_date}` : null;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: BookingRecord;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
  if (webhookSecret && req.headers.get("x-webhook-secret") !== webhookSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
  if (!botToken || !chatId) {
    console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID secret");
    return new Response("Server misconfigured", { status: 500 });
  }

  const payload: WebhookPayload = await req.json();
  // The CRM updates bookings (status, note); only new bookings are announced.
  if (payload.type !== "INSERT") {
    return new Response("Ignored", { status: 200 });
  }
  const record = payload.record;
  if (!record) {
    return new Response("No record in payload", { status: 400 });
  }
  // Bookings added by hand in the CRM are already known to the manager who added them.
  if (record.source && record.source !== "site") {
    return new Response("Ignored", { status: 200 });
  }

  const lines = [
    "📩 Новая заявка с сайта APELSIN INDUSTRIAL",
    directionLine(record.direction),
    `Имя: ${record.name}`,
    `Телефон: ${record.phone}`,
    record.car ? `Авто: ${record.car}` : null,
    serviceLine(record.service, record.direction),
    timeLine(record),
  ].filter(Boolean);

  const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: lines.join("\n") }),
  });

  if (!telegramResponse.ok) {
    console.error("Telegram API error", telegramResponse.status, await telegramResponse.text());
    return new Response("Failed to notify", { status: 502 });
  }

  return new Response("OK", { status: 200 });
});
