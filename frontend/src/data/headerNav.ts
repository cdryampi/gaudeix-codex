export type HeaderNavItem = {
  label: string;
  href?: string;
  children?: HeaderNavItem[];
};

export const HEADER_NAV: HeaderNavItem[] = [
  { label: "Inicio", href: "#inicio" },
  {
    label: "Qué hacer",
    children: [
      {
        label: "Rutas autoguiadas",
        children: [
          { label: "Castillo de Burriac", href: "#burriac" },
          { label: "Ruta del patrimonio histórico", href: "#patrimoni" },
          { label: "Itinerario de naturaleza", href: "#natura" },
          { label: "Ruta en bicicleta", href: "#bici" },
        ],
      },
      { label: "Naturaleza", href: "#natura" },
      { label: "Fiestas y tradiciones", href: "#festes" },
    ],
  },
  {
    label: "Dónde comer",
    children: [
      { label: "Gastronomía local", href: "#gastronomia" },
      { label: "Mercado local", href: "#mercado" },
    ],
  },
  { label: "Dónde dormir", href: "#alojamientos" },
  { label: "Agenda", href: "#eventos" },
  {
    label: "Descubre",
    children: [
      { label: "Mapa interactivo", href: "#mapa" },
      { label: "Cómo llegar", href: "#como-llegar" },
    ],
  },
];

