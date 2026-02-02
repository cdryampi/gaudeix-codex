export type HeaderNavItem = {
  label: string;
  href?: string;
  children?: HeaderNavItem[];
};

export const HEADER_NAV: HeaderNavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Categorías", href: "/categorias" },
  {
    label: "Explora",
    href: "/lugares",
    children: [
      { label: "Patrimonio", href: "/lugares?category=heritage" },
      { label: "Naturaleza", href: "/lugares?category=nature" },
      { label: "Playas", href: "/lugares?category=beaches" },
      { label: "Cultura", href: "/lugares?category=culture" },
      { label: "Compras", href: "/lugares?category=shopping" },
    ],
  },
  {
    label: "Gastronomía",
    href: "/lugares?category=restaurants",
    children: [
      { label: "Restaurantes", href: "/lugares?category=restaurants" },
    ],
  },
  { label: "Alojamiento", href: "/lugares?category=accommodations" },
  { label: "Agenda", href: "/agenda" },
  {
    label: "Información",
    href: "/#mapa",
    children: [
      { label: "Mapa interactivo", href: "/#mapa" },
      { label: "Cómo llegar", href: "/como-llegar" },
      { label: "Noticias", href: "/#noticias" },
    ],
  },
];
