export type HeaderNavItem = {
  label: string;
  href?: string;
  children?: HeaderNavItem[];
};

export const HEADER_NAV: HeaderNavItem[] = [
  { label: "Inicio", href: "/" },
  {
    label: "Descubre",
    href: "/categorias",
    children: [
      { label: "Categorías", href: "/categorias" },
      { label: "Patrimonio", href: "/lugares?category=heritage" },
      { label: "Naturaleza", href: "/lugares?category=nature" },
      { label: "Playas", href: "/lugares?category=beaches" },
      { label: "Cultura", href: "/lugares?category=culture" },
      { label: "Gastronomía", href: "/lugares?category=restaurants" },
      { label: "Alojamiento", href: "/lugares?category=accommodations" },
      { label: "Compras", href: "/lugares?category=shopping" },
    ],
  },
  { label: "Rutas", href: "/rutas" },
  { label: "Festes", href: "/festes" },
  { label: "Agenda", href: "/agenda" },
  {
    label: "Info",
    href: "/noticias",
    children: [
      { label: "Noticias", href: "/noticias" },
      { label: "Mapa interactivo", href: "/#mapa" },
      { label: "Cómo llegar", href: "/como-llegar" },
      { label: "Rankings", href: "/rankings" },
    ],
  },
];
