import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  Landmark,
  Mountain,
  Palmtree,
  Sailboat,
  UtensilsCrossed,
  Hotel,
  Brush,
} from "lucide-react";

export type FeaturedCategory = {
  id: string;
  title: string;
  href: string;
  image_src: string;
  Icon: LucideIcon;
};

export const FEATURED_CATEGORIES: FeaturedCategory[] = [
  {
    id: "senderismo",
    title: "Rutas y senderismo",
    href: "#categorias",
    image_src: "/media/categorias/senderismo.jpg",
    Icon: Mountain,
  },
  {
    id: "playas",
    title: "Playas y calas",
    href: "#categorias",
    image_src: "/media/categorias/playas.jpg",
    Icon: Palmtree,
  },
  {
    id: "patrimonio_historico",
    title: "Patrimonio histórico",
    href: "#categorias",
    image_src: "/media/categorias/patrimonio_historico.jpg",
    Icon: Landmark,
  },
  {
    id: "gastronomia_local",
    title: "Gastronomía local",
    href: "#categorias",
    image_src: "/media/categorias/gastronomia_local.jpg",
    Icon: UtensilsCrossed,
  },
  {
    id: "eventos_culturales",
    title: "Eventos culturales",
    href: "#eventos",
    image_src: "/media/categorias/eventos_culturales.jpg",
    Icon: CalendarDays,
  },
  {
    id: "deportes_acuaticos",
    title: "Deportes acuáticos",
    href: "#categorias",
    image_src: "/media/categorias/deportes_acuaticos.jpg",
    Icon: Sailboat,
  },
  {
    id: "alojamientos",
    title: "Alojamientos con encanto",
    href: "#categorias",
    image_src: "/media/categorias/alojamientos.jpg",
    Icon: Hotel,
  },
  {
    id: "artesania",
    title: "Artesanía y tradiciones",
    href: "#categorias",
    image_src: "/media/categorias/artesanía.jpg",
    Icon: Brush,
  },
];
