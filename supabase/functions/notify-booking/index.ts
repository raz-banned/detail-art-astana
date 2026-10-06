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
    "🚗 Новая заявка с сайта APELSIN INDUSTRIAL",
    `Имя: ${record.name}`,
    `Телефон: ${record.phone}`,
    record.car ? `Авто: ${record.car}` : null,
    `Услуга: ${record.service}`,
    record.preferred_date ? `Желаемая дата: ${record.preferred_date}` : null,
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
