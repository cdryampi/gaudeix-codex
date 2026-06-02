import { cn } from "@/lib/utils";
import { DynamicLucideIcon } from "@/components/atoms/LucideIcon";
import agendaIcon from "@/assets/category-icons/agenda.png";
import beachesIcon from "@/assets/category-icons/beaches.png";
import cultureIcon from "@/assets/category-icons/culture.png";
import heritageIcon from "@/assets/category-icons/heritage.png";
import natureIcon from "@/assets/category-icons/nature.png";
import routesIcon from "@/assets/category-icons/routes.png";

/* eslint-disable react-refresh/only-export-components */

export type CategoryBrandIconKey =
  | "routes"
  | "nature"
  | "agenda"
  | "beaches"
  | "culture"
  | "heritage";

const ICON_NAME_TO_KEY: Record<string, CategoryBrandIconKey> = {
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

const BRAND_ICONS: Record<CategoryBrandIconKey, string> = {
  routes: routesIcon,
  nature: natureIcon,
  agenda: agendaIcon,
  beaches: beachesIcon,
  culture: cultureIcon,
  heritage: heritageIcon,
};

export function resolveCategoryBrandIconKey(
  name?: string | null,
): CategoryBrandIconKey | null {
  if (!name) return null;
  const normalizedName = name.toLowerCase();

  if (normalizedName in BRAND_ICONS) {
    return normalizedName as CategoryBrandIconKey;
  }

  return ICON_NAME_TO_KEY[normalizedName] || null;
}

export function CategoryBrandIcon({
  iconName,
  className,
}: {
  iconName?: string | null;
  className?: string;
}) {
  const key = resolveCategoryBrandIconKey(iconName);

  if (key) {
    return (
      <img
        src={BRAND_ICONS[key]}
        alt=""
        data-category-brand-icon={key}
        className={cn("inline-flex shrink-0 object-contain", className)}
        aria-hidden="true"
      />
    );
  }

  if (iconName) {
    return (
      <DynamicLucideIcon
        name={iconName}
        className={className}
        aria-hidden="true"
        data-category-brand-icon="fallback"
      />
    );
  }

  return null;
}
