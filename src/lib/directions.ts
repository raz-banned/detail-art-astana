// The park's directions: the hub homepage cards, the header menu and the footer are built from
// this list. `services` holds only what the company provided; add a direction's `path` once its
// page exists, until then it's shown as "скоро". `slug` is also stored in bookings.direction,
// and the database only accepts these values (bookings_direction_check in
// supabase/sql/2026-10-09-bookings-direction.sql): adding or renaming one needs an SQL change.
// The Telegram notification has its own copy of the titles (DIRECTION_TITLES in
// supabase/functions/notify-booking/index.ts): update it and redeploy the function too.

export const DIRECTION_SLUGS = ["detailing", "minibus", "trucks", "metal-workshop"] as const;
export type DirectionSlug = (typeof DIRECTION_SLUGS)[number];

export type Direction = {
  slug: DirectionSlug;
  title: string;
  services: string[];
  path: "/detailing" | "/minibus" | "/metal-workshop" | "/trucks" | null;
};

// For a direction page: fails at load with a clear message if the slug has no entry below.
export function getDirection(slug: DirectionSlug): Direction {
  const direction = DIRECTIONS.find((d) => d.slug === slug);
  if (!direction) throw new Error(`No direction "${slug}" in DIRECTIONS`);
  return direction;
}

export function directionTitle(slug: string): string {
  return DIRECTIONS.find((d) => d.slug === slug)?.title ?? slug;
}

export function directionServices(slug: string): string[] {
  return DIRECTIONS.find((d) => d.slug === slug)?.services ?? [];
}

// Detailing services that read as truck work: /detailing lists them under their own heading and
// the hub card leaves them out. They should move to the truck service once it has enough content
// for its own page; until then they stay in the detailing list, so the booking form and the CRM
// still offer them.
export const FUTURE_TRUCK_SERVICES = [
  "Сварочные работы по автомобилю",
  "Установка кран-балки",
  "Переоборудование под автодом",
];

export const DIRECTIONS: Direction[] = [
  {
    slug: "detailing",
    title: "Детейлинг",
    // TODO: "диагностика оборудования на лауднж" is left out until the company confirms the
    // wording.
    services: [
      "Полировка кузова",
      "Химчистка салона",
      "Тонировка стёкол",
      "Шумоизоляция автомобилей",
      "Услуги выездного сервиса",
      "Мелкий срочный ремонт",
      "Перетяжка салона",
      "Переделка салона под VIP",
      "Шиномонтаж",
      ...FUTURE_TRUCK_SERVICES,
    ],
    path: "/detailing",
  },
  {
    slug: "minibus",
    title: "Детейлинг микроавтобусов",
    services: ["Перетяжка салона", "Переделка салона под VIP"],
    path: "/minibus",
  },
  {
    slug: "trucks",
    title: "Грузовой сервис",
    services: [
      "Краткосрочные ремонты",
      "Капитальный ремонт грузовой техники",
      "Переоборудование грузовой техники",
    ],
    path: "/trucks",
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
    path: "/metal-workshop",
  },
];
