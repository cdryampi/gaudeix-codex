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
    id: "evt-fira-producte-hivern-2026",
    title: "Mercat d'Hivern i Proximitat",
    category: "Fires i mercats",
    imageUrl: "/media/eventos/fira_nadal.jpg",
    startAt: "2026-01-24T17:30:00+01:00",
    venueName: "Plaça de l'Ajuntament",
    locationText: "Cabrera de Mar",
    featured: true,
    slug: "fira-hivern-2026",
    isFree: true,
    descriptionShort: "Productes de temporada, artesania local i tallers per a totes les edats.",
    tags: ["hivern", "mercat"],
  },
  {
    id: "evt-taller-ceramtica-2026",
    title: "Taller de Ceràmica Romana",
    category: "Cultura",
    imageUrl: "/media/eventos/casa_trenc_alba.jpeg",
    startAt: "2026-01-25T11:00:00+01:00",
    venueName: "Casa Trenc Alba",
    locationText: "Cabrera de Mar",
    featured: true,
    slug: "taller-ceramica-romana-2026",
    isFree: false,
    priceText: "8 €",
    descriptionShort: "Aprèn les tècniques dels antics romans en aquest taller pràctic.",
    tags: ["cultura", "taller", "historia"],
  },
  {
    id: "evt-concert-jazz-gener-2026",
    title: "Vespres de Jazz: Quartet Maresme",
    category: "Música",
    imageUrl: "/media/eventos/XXXVI_cicle_de_concerts_de_orgue.jpeg",
    startAt: "2026-01-28T19:00:00+01:00",
    venueName: "Centre Cívic",
    locationText: "Cabrera de Mar",
    featured: false,
    slug: "concert-jazz-gener-2026",
    isFree: false,
    priceText: "12 €",
    descriptionShort: "Una nit de jazz clàssic amb els millors músics de la comarca.",
    tags: ["musica", "jazz"],
  },
  {
    id: "evt-animacio-infantil-2026",
    title: "Espectacle Infantil: Les Aventures del Cavaller",
    category: "Infantil",
    imageUrl: "/media/eventos/missatger_reis.jpg",
    startAt: "2026-02-01T12:00:00+01:00",
    venueName: "Teatre La Sala",
    locationText: "Cabrera de Mar",
    featured: true,
    slug: "animacio-infantil-cavaller-2026",
    isFree: true,
    descriptionShort: "Un espectacle ple de màgia i rialles per als més petits.",
    tags: ["infantil", "teatre"],
  },
  {
    id: "evt-caminada-castell-2026",
    title: "Caminada Guiada al Castell de Burriac",
    category: "Esports",
    imageUrl: "/media/eventos/reforc_escolar_Curs_2025-2026.png",
    startAt: "2026-02-05T09:00:00+01:00",
    venueName: "Punt d'Informació Turística",
    locationText: "Cabrera de Mar",
    featured: false,
    slug: "caminada-castell-burriac-2026",
    isFree: true,
    descriptionShort: "Descobreix el paisatge i la història de la nostra talaia més emblemàtica.",
    tags: ["esports", "natura"],
  },
  {
    id: "evt-tast-vins-maresme-2026",
    title: "Tast de Vins de la DO Alella",
    category: "Cultura",
    imageUrl: "/media/eventos/fira_nadal.jpg",
    startAt: "2026-02-12T19:30:00+01:00",
    venueName: "Celler de la Vila",
    locationText: "Cabrera de Mar",
    featured: false,
    slug: "tast-vins-alella-2026",
    isFree: false,
    priceText: "15 €",
    descriptionShort: "Vins de proximitat i maridatge amb formatges locals.",
    tags: ["gastronomia", "cultura"],
  },
  {
    id: "evt-teatre-comedia-hivern-2026",
    title: "Teatre: 'Res no és el que sembla'",
    category: "Teatre",
    imageUrl: "/media/eventos/casa_trenc_alba.jpeg",
    startAt: "2026-02-15T18:30:00+01:00",
    venueName: "Teatre La Sala",
    locationText: "Cabrera de Mar",
    featured: false,
    slug: "teatre-comedia-hivern-2026",
    isFree: false,
    priceText: "10 €",
    descriptionShort: "Una comèdia d'embolics que et farà riure de principi a fi.",
    tags: ["teatre", "comedia"],
  },
];
