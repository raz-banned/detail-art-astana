export const MANAGER_PHONE = "77084254181";
export const PHONE = "+7 708 425 4181";
export const PHONE_HREF = `tel:${PHONE.replace(/\s/g, "")}`;

export const ADDRESS = "г. Астана, Apelsin Industrial Park, ул. Алаш 46/2";
export const HOURS = "Ежедневно 09:00 — 21:00";

// TODO: fill in once confirmed by the owner; the footer hides these while empty.
// Official accounts only, e.g. { label: "Instagram", href: "https://instagram.com/..." }.
export const SOCIAL_LINKS: { label: string; href: string }[] = [];
// Legal entity shown in the footer and privacy policy, e.g. "ТОО «…», БИН 000000000000".
export const LEGAL_ENTITY = "";

export const WHATSAPP = `https://wa.me/${MANAGER_PHONE}?text=${encodeURIComponent("Здравствуйте! Хочу записаться на детейлинг")}`;

export const LOCATION = { lat: 51.207227, lon: 71.497783 };
export const TWO_GIS_ID = "70000001116395659";

const TWO_GIS_WIDGET_OPTIONS = {
  pos: { lat: LOCATION.lat, lon: LOCATION.lon, zoom: 16 },
  opt: { city: "astana" },
  org: TWO_GIS_ID,
};

export const TWO_GIS_WIDGET = `https://widgets.2gis.com/widget?type=firmsonmap&options=${encodeURIComponent(JSON.stringify(TWO_GIS_WIDGET_OPTIONS))}`;

// Route from the visitor's current location; opens the native app on phones when installed.
export const ROUTE_LINKS = [
  {
    label: "2GIS",
    href: `https://2gis.kz/astana/directions/points/%7C${LOCATION.lon}%2C${LOCATION.lat}%3B${TWO_GIS_ID}`,
  },
  {
    label: "Яндекс Карты",
    href: `https://yandex.kz/maps/?rtext=~${LOCATION.lat},${LOCATION.lon}&rtt=auto`,
  },
  {
    label: "Google Maps",
    href: `https://www.google.com/maps/dir/?api=1&destination=${LOCATION.lat},${LOCATION.lon}`,
  },
];
