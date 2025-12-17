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

export const events: EventItem[] = [
  {
    id: "evt-fira-nadal-2025",
    title: "Fira de Nadal",
    category: "Fires i mercats",
    imageUrl: "/media/eventos/fira_nadal.jpg",
    startAt: "2025-12-20T17:30:00+01:00",
    venueName: "Plaça del Poble",
    locationText: "Cabrera de Mar",
    featured: true,
    slug: "fira-de-nadal-2025",
    isFree: true,
    descriptionShort: "Paradetes, ambient familiar i activitats de temporada al centre del poble.",
    tags: ["nadal", "fira"],
  },
  {
    id: "evt-mercat-producte-local-2025",
    title: "Mercat de producte local",
    category: "Fires i mercats",
    imageUrl: "/media/eventos/fira_nadal.jpg",
    startAt: "2025-12-21T11:00:00+01:00",
    venueName: "Plaça de l'Ajuntament",
    locationText: "Cabrera de Mar",
    featured: false,
    slug: "mercat-producte-local-2025",
    isFree: true,
    descriptionShort: "Parades de proximitat, degustacions i artesania.",
    tags: ["mercat", "producte-local"],
  },
  {
    id: "evt-taller-infantil-2025",
    title: "Taller infantil: manualitats de temporada",
    category: "Infantil",
    imageUrl: "/media/eventos/missatger_reis.jpg",
    startAt: "2025-12-22T18:00:00+01:00",
    venueName: "Centre Cívic",
    locationText: "Cabrera de Mar",
    featured: false,
    slug: "taller-infantil-manualitats-2025",
    isFree: true,
    descriptionShort: "Activitat creativa per a infants i famílies.",
    tags: ["infantil", "taller"],
  },
  {
    id: "evt-ruta-patrimoni-2025",
    title: "Ruta guiada pel patrimoni de Cabrera",
    category: "Cultura",
    imageUrl: "/media/eventos/casa_trenc_alba.jpeg",
    startAt: "2025-12-28T11:00:00+01:00",
    venueName: "Casa Trenc Alba",
    locationText: "Cabrera de Mar",
    featured: true,
    slug: "ruta-guiada-patrimoni-2025",
    isFree: false,
    priceText: "5 €",
    descriptionShort: "Passejada amb guia per descobrir racons històrics i curiositats locals.",
    tags: ["ruta", "patrimoni"],
  },
  {
    id: "evt-missatger-reis-2026",
    title: "Arribada del missatger dels Reis",
    category: "Infantil",
    imageUrl: "/media/eventos/missatger_reis.jpg",
    startAt: "2026-01-03T18:00:00+01:00",
    venueName: "Plaça de l'Ajuntament",
    locationText: "Cabrera de Mar",
    featured: true,
    slug: "missatger-dels-reis-2026",
    isFree: true,
    descriptionShort: "Recepció de cartes i animació familiar.",
    tags: ["reis", "infantil"],
  },
  {
    id: "evt-caminada-popular-2026",
    title: "Activitat esportiva: caminada popular",
    category: "Esports",
    imageUrl: "/media/eventos/reforc_escolar_Curs_2025-2026.png",
    startAt: "2026-01-05T11:00:00+01:00",
    venueName: "Zona Esportiva",
    locationText: "Cabrera de Mar",
    featured: false,
    slug: "caminada-popular-2026",
    isFree: true,
    descriptionShort: "Recorregut accessible per fomentar el benestar.",
    tags: ["esports", "salut"],
  },
  {
    id: "evt-concert-orgue-2026",
    title: "Concert d'orgue",
    category: "Música",
    imageUrl: "/media/eventos/XXXVI_cicle_de_concerts_de_orgue.jpeg",
    startAt: "2026-01-10T20:30:00+01:00",
    venueName: "Església parroquial",
    locationText: "Cabrera de Mar",
    featured: false,
    slug: "concert-orgue-2026",
    isFree: false,
    priceText: "Entrada lliure (aportació voluntària)",
    descriptionShort: "Programa musical amb intèrprets convidats.",
    tags: ["musica", "concert"],
  },
  {
    id: "evt-teatre-2026",
    title: "Sessió de teatre: comèdia a la fresca",
    category: "Teatre",
    imageUrl: "/media/eventos/casa_trenc_alba.jpeg",
    startAt: "2026-01-12T19:00:00+01:00",
    venueName: "Teatre La Sala",
    locationText: "Cabrera de Mar",
    featured: false,
    slug: "teatre-comedia-2026",
    isFree: false,
    priceText: "10 €",
    descriptionShort: "Una comèdia amable per gaudir en comunitat.",
    tags: ["teatre", "comedia"],
  },
];

