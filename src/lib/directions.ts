// The park's directions: the hub homepage cards, the header menu and the footer are built from
// this list. `services` holds only what the company provided; add a direction's `path` once its
// page exists, until then it's shown as "скоро".

export type Direction = {
  slug: string;
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
