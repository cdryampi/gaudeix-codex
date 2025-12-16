export type EventCategory =
  | "Cultura"
  | "Infantil"
  | "Esports"
  | "Fires i mercats"
  | "Formació"
  | "Música"
  | "Teatre"
  | "Altres";

export type EventItem = {
  id: string;
  title: string;
  category: EventCategory;
  imageUrl: string;
  startAt: string; // ISO 8601
  venueName: string;
  locationText: string;
  featured: boolean;
  slug: string;
  isFree: boolean;
  priceText?: string;
  descriptionShort: string;
  tags: string[];
};

const EVENT_IMAGES = [
  "/media/eventos/casa_trenc_alba.jpeg",
  "/media/eventos/fira_nadal.jpg",
  "/media/eventos/missatger_reis.jpg",
  "/media/eventos/reforc_escolar_Curs_2025-2026.png",
  "/media/eventos/XXXVI_cicle_de_concerts_de_orgue.jpeg",
] as const;

const VENUES = [
  { venueName: "Centre Cívic", locationText: "Plaça de l’Ajuntament" },
  { venueName: "Biblioteca Municipal", locationText: "Carrer de la Riera" },
  { venueName: "Casal d’Entitats", locationText: "Avinguda del Maresme" },
  { venueName: "Teatre La Sala", locationText: "Centre Cultural" },
  { venueName: "Pavelló Municipal", locationText: "Zona Esportiva" },
  { venueName: "Parc de la Nova Cançó Catalana", locationText: "Parc de la Nova Cançó Catalana" },
  { venueName: "Església Parroquial", locationText: "Plaça de l’Església" },
  { venueName: "Mercat a la plaça", locationText: "Plaça del Poble" },
] as const;

const TIME_SLOTS = ["11:00", "17:30", "18:00", "19:00", "19:30", "20:30"] as const;

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function toIsoLocal(date: Date) {
  const yyyy = date.getFullYear();
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const min = pad2(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:00`;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function setTime(base: Date, time: (typeof TIME_SLOTS)[number]) {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

function pick<T>(items: readonly T[], index: number): T {
  return items[index % items.length];
}

type EventTemplate = {
  title: string;
  category: EventCategory;
  descriptionShort: string;
  tags: string[];
  isFree?: boolean;
  priceText?: string;
};

const TEMPLATES: EventTemplate[] = [
  {
    title: "Mercat de producte local",
    category: "Fires i mercats",
    descriptionShort: "Parades de proximitat, degustacions i artesania al centre del poble.",
    tags: ["mercat", "producte-local", "artesania"],
    isFree: true,
  },
  {
    title: "Taller infantil: manualitats de temporada",
    category: "Infantil",
    descriptionShort: "Activitat creativa per a infants amb materials reciclats i naturals.",
    tags: ["infantil", "taller", "familia"],
    isFree: true,
  },
  {
    title: "Ruta guiada pel patrimoni de Cabrera",
    category: "Cultura",
    descriptionShort: "Passejada amb guia per descobrir racons històrics i curiositats locals.",
    tags: ["ruta", "patrimoni", "visita-guiada"],
    isFree: false,
    priceText: "5 €",
  },
  {
    title: "Sessió de teatre: comèdia a la fresca",
    category: "Teatre",
    descriptionShort: "Una comèdia amable per gaudir en comunitat en un entorn privilegiat.",
    tags: ["teatre", "comedia"],
    isFree: false,
    priceText: "10 €",
  },
  {
    title: "Concert de música clàssica (orgue)",
    category: "Música",
    descriptionShort: "Programa de repertori clàssic amb intèrprets convidats.",
    tags: ["musica", "concert", "classica"],
    isFree: false,
    priceText: "Entrada lliure (aportació voluntària)",
  },
  {
    title: "Xerrada: convivència i civisme",
    category: "Altres",
    descriptionShort: "Espai obert per compartir propostes i millorar el dia a dia del municipi.",
    tags: ["xerrada", "participacio"],
    isFree: true,
  },
  {
    title: "Formació: competències digitals bàsiques",
    category: "Formació",
    descriptionShort: "Sessió pràctica sobre tràmits online, correu electrònic i seguretat.",
    tags: ["formacio", "digital", "ajuda"],
    isFree: true,
  },
  {
    title: "Activitat esportiva: caminada popular",
    category: "Esports",
    descriptionShort: "Recorregut accessible per fomentar l’activitat física i el benestar.",
    tags: ["esports", "caminada", "salut"],
    isFree: true,
  },
  {
    title: "Reforç escolar: inscripcions obertes",
    category: "Formació",
    descriptionShort: "Servei de suport educatiu per al curs 2025–2026 (places limitades).",
    tags: ["educacio", "reforc", "inscripcions"],
    isFree: true,
  },
  {
    title: "Fira de Nadal: encesa de llums i paradetes",
    category: "Fires i mercats",
    descriptionShort: "Ambient nadalenc amb activitats familiars, música i artesania.",
    tags: ["nadal", "fira", "familia"],
    isFree: true,
  },
  {
    title: "Arribada del missatger dels Reis",
    category: "Infantil",
    descriptionShort: "Recepció de cartes i animació per a petits i grans.",
    tags: ["reis", "infantil", "tradicio"],
    isFree: true,
  },
];

function buildStartDates(now: Date, count: number): Date[] {
  const dates: Date[] = [];
  const dayOffsets = [
    0, 0, 1, 2, 3, 5, 6, // avui i setmana
    7, 9, 12, 14, 16, 19, 21, 24, 27, // aquest mes
    30, 35, 42, 50, 60, 75, 90, 120, // futur
  ];

  for (let i = 0; i < count; i++) {
    const day = pick(dayOffsets, i);
    const slot = pick(TIME_SLOTS, i * 2 + 1);
    dates.push(setTime(addDays(now, day), slot));
  }

  return dates;
}

function withDateSuffix(title: string, date: Date) {
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  return `${title} · ${dd}/${mm}`;
}

export const events: EventItem[] = (() => {
  const now = new Date();
  const total = 28;
  const dates = buildStartDates(now, total);

  const items: EventItem[] = [];

  for (let i = 0; i < total; i++) {
    const template = pick(TEMPLATES, i);
    const venue = pick(VENUES, i * 3 + 2);
    const imageUrl = pick(EVENT_IMAGES, i);
    const startDate = dates[i];
    const startAt = toIsoLocal(startDate);
    const baseTitle = i % 3 === 0 ? template.title : withDateSuffix(template.title, startDate);
    const slugBase = slugify(baseTitle);
    const dateKey = `${startDate.getFullYear()}${pad2(startDate.getMonth() + 1)}${pad2(startDate.getDate())}`;
    const slug = `${slugBase}-${dateKey}-${pad2(i + 1)}`;
    const id = `evt-${slug}`;

    const isFree = template.isFree ?? (i % 4 !== 0);
    const priceText = isFree ? undefined : template.priceText ?? (i % 2 === 0 ? "5 €" : "10 €");

    items.push({
      id,
      title: baseTitle,
      category: template.category,
      imageUrl,
      startAt,
      venueName: venue.venueName,
      locationText: venue.locationText,
      featured: false,
      slug,
      isFree,
      priceText,
      descriptionShort: template.descriptionShort,
      tags: [...template.tags],
    });
  }

  const featuredIndices = [0, 3, 7].slice(0, 3);
  featuredIndices.forEach((idx) => {
    if (items[idx]) items[idx] = { ...items[idx], featured: true };
  });

  return sortEventsByDate(items);
})();

export function getFeaturedEvents(list: EventItem[]) {
  return sortEventsByDate(list.filter((e) => e.featured)).slice(0, 3);
}

export function sortEventsByDate(list: EventItem[]) {
  return [...list].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

export function groupEventsByDay(list: EventItem[]) {
  const sorted = sortEventsByDate(list);
  const fmt = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "2-digit", month: "short" });
  const map = new Map<string, { dayLabel: string; items: EventItem[] }>();

  for (const item of sorted) {
    const d = new Date(item.startAt);
    const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    const dayLabel = fmt.format(d);
    const bucket = map.get(key) ?? { dayLabel, items: [] };
    bucket.items.push(item);
    map.set(key, bucket);
  }

  return Array.from(map.values());
}

