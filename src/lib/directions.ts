// The park's directions: the hub homepage cards, the header menu and the footer are built from
// this list. `services` holds only what the company provided; add a direction's `path` once its
// page exists, until then it's shown as "скоро". `slug` is also stored in bookings.direction,
// and the database only accepts these values (bookings_direction_check in
// supabase/sql/2026-10-09-bookings-direction.sql): adding or renaming one needs an SQL change.

export const DIRECTION_SLUGS = ["detailing", "minibus", "trucks", "metal-workshop"] as const;
export type DirectionSlug = (typeof DIRECTION_SLUGS)[number];

export type Direction = {
  slug: DirectionSlug;
  title: string;
  services: string[];
  path: "/detailing" | null;
};

export const DIRECTIONS: Direction[] = [
  {
    slug: "detailing",
    title: "Детейлинг",
    // TODO: the company hasn't listed detailing services yet.
    services: [],
    path: "/detailing",
  },
  {
    slug: "minibus",
    title: "Детейлинг микроавтобусов",
    services: ["Перетяжка салона", "Переделка салона под VIP"],
    path: null,
  },
  {
    slug: "trucks",
    title: "Грузовой сервис",
    services: [
      "Краткосрочные ремонты",
      "Капитальный ремонт грузовой техники",
      "Переоборудование грузовой техники",
    ],
    path: null,
  },
  {
    slug: "metal-workshop",
    title: "Металлоцех",
    services: [
      "Производство металлических изделий любой сложности",
      "Аргонная сварка",
      "Контактная сварка",
      "Сварка полуавтоматом",
      "Лазерная резка металла",
      "Здания из металлоконструкций под ключ",
    ],
    path: null,
  },
];
