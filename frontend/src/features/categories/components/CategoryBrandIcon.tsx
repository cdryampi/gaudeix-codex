import { cn } from "@/lib/utils";
import { DynamicLucideIcon } from "@/components/atoms/LucideIcon";
import agendaIcon from "@/assets/category-icons/agenda.svg?raw";
import beachesIcon from "@/assets/category-icons/beaches.svg?raw";
import cultureIcon from "@/assets/category-icons/culture.svg?raw";
import heritageIcon from "@/assets/category-icons/heritage.svg?raw";
import natureIcon from "@/assets/category-icons/nature.svg?raw";
import routesIcon from "@/assets/category-icons/routes.svg?raw";

export type CategoryBrandIconKey =
  | "routes"
  | "nature"
  | "agenda"
  | "beaches"
  | "culture"
  | "heritage";

const ICON_NAME_TO_KEY: Record<string, CategoryBrandIconKey> = {
  mountain: "routes",
  navigation: "routes",
  leaf: "nature",
  "party-popper": "agenda",
  sparkles: "agenda",
  umbrella: "beaches",
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
      <span
        aria-hidden="true"
        data-category-brand-icon={key}
        className={cn(
          "inline-flex shrink-0 [&_svg]:h-full [&_svg]:w-full [&_svg]:overflow-visible [&_svg]:stroke-current [&_svg]:[stroke-width:1.85]",
          className,
        )}
        dangerouslySetInnerHTML={{ __html: BRAND_ICONS[key] }}
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
