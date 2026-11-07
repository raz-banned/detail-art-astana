// The park's directions: the hub homepage cards, the header menu and the footer are built from
// PUBLIC_DIRECTIONS. `services` holds only what the company provided; a direction with `path: null`
// is shown as "скоро", and `public: false` hides it from the site. A hidden direction stays in
// DIRECTIONS: its old bookings still need a title in the CRM, and the database only stores the
// slug. Its page is kept too and redirects to the hub, see acceptsBookings().
// The database only accepts these slugs in bookings.direction (bookings_direction_check in
// supabase/sql/2026-10-09-bookings-direction.sql): adding or renaming one needs an SQL change.
// The Telegram notification has its own copy of the titles (DIRECTION_TITLES in
// supabase/functions/notify-booking/index.ts): update it and redeploy the function too.

export const DIRECTION_SLUGS = ["detailing", "minibus", "trucks", "metal-workshop"] as const;
export type DirectionSlug = (typeof DIRECTION_SLUGS)[number];

export type Direction = {
  slug: DirectionSlug;
  title: string;
  services: string[];
  public: boolean;
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
    public: true,
    path: "/detailing",
  },
  {
    slug: "minibus",
    title: "Детейлинг микроавтобусов",
    services: ["Перетяжка салона", "Переделка салона под VIP"],
    public: false,
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
    public: true,
    // TODO: back to "/trucks" once the page has enough confirmed content.
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
    public: false,
    path: "/metal-workshop",
  },
];

// What the site shows: the hub cards, the header menu and the footer.
export const PUBLIC_DIRECTIONS = DIRECTIONS.filter((d) => d.public);

// Whether a direction takes new bookings. Decides if its page opens or redirects to the hub, if
// the CRM's manual booking offers it, and if the schedule gets a column for it.
export function acceptsBookings(slug: DirectionSlug): boolean {
  const direction = getDirection(slug);

  if (!direction.public || !direction.path) return false;
  return true;
}
