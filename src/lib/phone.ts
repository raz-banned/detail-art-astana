// Phone links for the CRM's list and schedule, so both pages dial the same number.

// Kazakhstan numbers: "8 7xx..." is the local form of "+7 7xx...", and the booking form
// also accepts 10 digits without the country code ("7xx...").
export function phoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) return `7${digits.slice(1)}`;
  if (digits.length === 10) return `7${digits}`;
  return digits;
}

export function whatsappUrl(phone: string, text?: string): string {
  const url = `https://wa.me/${phoneDigits(phone)}`;
  return text ? `${url}?text=${encodeURIComponent(text)}` : url;
}
