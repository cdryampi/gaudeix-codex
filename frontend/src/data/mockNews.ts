export type NewsCategory =
  | "Actualidad"
  | "Cultura"
  | "Deportes"
  | "Urbanismo"
  | "Turismo"
  | "Medio ambiente"
  | "Educación"
  | "Salud";

export type NewsItem = {
  id: string;
  title: string;
  category: NewsCategory;
  imageUrl: string;
  publishedAt: string; // ISO 8601
  slug: string;
  excerpt: string;
  featured?: boolean;
};

export const news: NewsItem[] = [
  {
    id: "new-festival-primavera-2026",
    title: "Cabrera de Mar celebra su primer Festival de Primavera",
    category: "Cultura",
    imageUrl: "/media/noticias/festival_primavera.jpg",
    publishedAt: "2026-01-14T10:00:00+01:00",
    slug: "festival-primavera-2026",
    excerpt: "El municipio se prepara para recibir artistas locales y regionales en un evento que promocionará la cultura y el talento del territorio.",
    featured: true,
  },
  {
    id: "new-parque-infantil-2026",
    title: "Nuevas áreas de juegos en el parque municipal",
    category: "Urbanismo",
    imageUrl: "/media/noticias/parque_infantil.jpg",
    publishedAt: "2026-01-12T14:30:00+01:00",
    slug: "nuevas-areas-juegos-parque-2026",
    excerpt: "El Ayuntamiento ha inaugurado las nuevas zonas recreativas con equipamientos seguros y accesibles para todas las edades.",
    featured: true,
  },
  {
    id: "new-campana-reciclaje-2026",
    title: "Lanzamiento de campaña de reciclaje y sostenibilidad",
    category: "Medio ambiente",
    imageUrl: "/media/noticias/reciclaje_sostenibilidad.jpg",
    publishedAt: "2026-01-10T09:15:00+01:00",
    slug: "campana-reciclaje-sostenibilidad-2026",
    excerpt: "Iniciativas para fomentar la reducción de residuos y promover prácticas ecológicas entre los ciudadanos.",
    featured: false,
  },
  {
    id: "new-ruta-bicicleta-2026",
    title: "Nueva ruta de bicicleta conecta el litoral",
    category: "Deportes",
    imageUrl: "/media/noticias/ruta_bicicleta_litoral.jpg",
    publishedAt: "2026-01-08T16:45:00+01:00",
    slug: "nueva-ruta-bicicleta-litoral-2026",
    excerpt: "Un nuevo corredor ciclado permite recorrer la costa de manera segura y sostenible.",
    featured: true,
  },
  {
    id: "new-programa-cultural-2026",
    title: "Presentación del programa cultural del primer trimestre",
    category: "Cultura",
    imageUrl: "/media/noticias/programa_cultural.jpg",
    publishedAt: "2026-01-05T11:00:00+01:00",
    slug: "programa-cultural-primer-trimestre-2026",
    excerpt: "Conciertos, exposiciones y actividades para todas las edades conforman la agenda cultural de enero a marzo.",
    featured: false,
  },
  {
    id: "new-mejora-acceso-playa-2026",
    title: "Mejoras en el acceso a la playa principal",
    category: "Turismo",
    imageUrl: "/media/noticias/acceso_playa_principal.jpg",
    publishedAt: "2026-01-03T08:00:00+01:00",
    slug: "mejoras-acceso-playa-principal-2026",
    excerpt: "Se han ampliado las zonas de paso y se han instalado nuevas pasarelas para facilitar el acceso a los bañistas.",
    featured: true,
  },
];
