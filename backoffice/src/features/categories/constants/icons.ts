import agendaIcon from "@/assets/category-icons/agenda.png";
import beachesIcon from "@/assets/category-icons/beaches.png";
import cultureIcon from "@/assets/category-icons/culture.png";
import heritageIcon from "@/assets/category-icons/heritage.png";
import natureIcon from "@/assets/category-icons/nature.png";
import routesIcon from "@/assets/category-icons/routes.png";

export type CategoryIconKey =
  | "routes"
  | "nature"
  | "agenda"
  | "beaches"
  | "culture"
  | "heritage";

export type CategoryIconOption = {
  value: CategoryIconKey;
  labelEs: string;
  labelCa: string;
  src: string;
};

const CATEGORY_ICON_SRC: Record<CategoryIconKey, string> = {
  routes: routesIcon,
  nature: natureIcon,
  agenda: agendaIcon,
  beaches: beachesIcon,
  culture: cultureIcon,
  heritage: heritageIcon,
};

const LEGACY_ICON_TO_KEY: Record<string, CategoryIconKey> = {
  route: "routes",
  mountain: "routes",
  navigation: "routes",
  leaf: "nature",
  festes: "agenda",
  "party-popper": "agenda",
  sparkles: "agenda",
  waves: "beaches",
  umbrella: "beaches",
  "guided-visits": "culture",
  flag: "culture",
  castle: "heritage",
  landmark: "heritage",
};

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  {
    value: "routes",
    labelEs: "Rutas autoguiadas",
    labelCa: "Rutes autoguiades",
    src: routesIcon,
  },
  {
    value: "nature",
    labelEs: "Naturaleza",
    labelCa: "Natura",
    src: natureIcon,
  },
  {
    value: "agenda",
    labelEs: "Fiestas y tradiciones",
    labelCa: "Festes i tradicions",
    src: agendaIcon,
  },
  {
    value: "beaches",
    labelEs: "Playas",
    labelCa: "Platges",
    src: beachesIcon,
  },
  {
    value: "culture",
    labelEs: "Visitas guiadas",
    labelCa: "Visites guiades",
    src: cultureIcon,
  },
  {
    value: "heritage",
    labelEs: "Patrimonio historico",
    labelCa: "Patrimoni historic",
    src: heritageIcon,
  },
];

export function resolveCategoryIconKey(
  name?: string | null,
): CategoryIconKey | null {
  if (!name) return null;
  const normalized = name.toLowerCase();
  if (normalized in CATEGORY_ICON_SRC) return normalized as CategoryIconKey;
  return LEGACY_ICON_TO_KEY[normalized] || null;
}

export function getCategoryIconSrc(name?: string | null): string | null {
  const key = resolveCategoryIconKey(name);
  return key ? CATEGORY_ICON_SRC[key] : null;
}
