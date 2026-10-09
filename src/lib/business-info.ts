// Production origin, no trailing slash. Canonical, og:url, sitemap.xml and robots.txt are built
// from it, so preview/Lovable domains all point search engines at the real site.
// TODO: switch to the company's own domain once it's bought (a .kz one needs hosting in KZ).
export const SITE_URL = "https://apelsin-industrial.vercel.app";

export const MANAGER_PHONE = "77084254181";
export const PHONE = "+7 708 425 4181";
export const PHONE_HREF = `tel:${PHONE.replace(/\s/g, "")}`;

export const ADDRESS = "г. Астана, Apelsin Industrial Park, ул. Алаш 46/2";
export const HOURS = "Ежедневно 09:00 — 21:00";

// TODO: fill in once confirmed by the owner; the footer hides these while empty.
// Official accounts only, e.g. { label: "Instagram", href: "https://instagram.com/..." }.
export const SOCIAL_LINKS: { label: string; href: string }[] = [];
// Legal entity, confirmed by the company (2026-10-09). The footer shows the name, the privacy
// policy names it with the BIN as the personal-data operator.
export const LEGAL_ENTITY = { name: "ТОО «АСТ-Сервисгрупп»", bin: "160340004084" };

export const WHATSAPP = `https://wa.me/${MANAGER_PHONE}?text=${encodeURIComponent("Здравствуйте! Хочу записаться на детейлинг")}`;

export const LOCATION = { lat: 51.207227, lon: 71.497783 };
export const TWO_GIS_ID = "70000001116395659";
export const TWO_GIS_REVIEWS = `https://2gis.kz/astana/firm/${TWO_GIS_ID}/tab/reviews`;
// Copied by hand from the 2GIS card; `null` hides the rating badge and the hero stat.
// TWO_GIS_ID is the whole park's card, which matches the homepage. TODO: 2GIS doesn't show a
// rating for it yet (10 ratings, no average), fill in once the card displays one.
export const TWO_GIS_RATING: { rating: number; count: number } | null = null;

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
