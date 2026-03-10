/**
 * Category Layout Template Registry
 *
 * Maps category slugs to lazy-loaded layout components.
 * Enables code-splitting and specialized UI per category type.
 */

import { lazy, LazyExoticComponent, ComponentType } from "react";
import { CategoryLayoutProps } from "./types";

export type CategoryLayout = LazyExoticComponent<
  ComponentType<CategoryLayoutProps>
>;

// Lazy-loaded layout components
const DefaultCategoryLayout = lazy(
  () => import("./layouts/DefaultCategoryLayout"),
);
const EventsCategoryLayout = lazy(
  () => import("./layouts/EventsCategoryLayout"),
);
const NatureCategoryLayout = lazy(
  () => import("./layouts/NatureCategoryLayout"),
);
const BeachesCategoryLayout = lazy(
  () => import("./layouts/BeachesCategoryLayout"),
);
const AccommodationsCategoryLayout = lazy(
  () => import("./layouts/AccommodationsCategoryLayout"),
);
const RestaurantsCategoryLayout = lazy(
  () => import("./layouts/RestaurantsCategoryLayout"),
);

/**
 * Registry mapping category slugs to their layout components.
 * Categories not listed here will use DefaultCategoryLayout.
 */
const categoryLayoutRegistry: Record<string, CategoryLayout> = {
  // Events root and subcategories
  events: EventsCategoryLayout,
  cultura: EventsCategoryLayout,
  festes: EventsCategoryLayout,
  infantil: EventsCategoryLayout,
  joves: EventsCategoryLayout,
  esports: EventsCategoryLayout,
  "fires-i-mercats": EventsCategoryLayout,
  formacio: EventsCategoryLayout,
  musica: EventsCategoryLayout,
  teatre: EventsCategoryLayout,
  altres: EventsCategoryLayout,

  // Nature/Heritage group
  nature: NatureCategoryLayout,
  heritage: NatureCategoryLayout,
  beaches: BeachesCategoryLayout,
  culture: NatureCategoryLayout,

  // Specialized place categories
  accommodations: AccommodationsCategoryLayout,
  restaurants: RestaurantsCategoryLayout,
};

/**
 * Get the appropriate layout component for a category slug.
 * Returns DefaultCategoryLayout if no specific layout is registered.
 *
 * @param slug - The category slug to look up
 * @returns A lazy-loaded React component for the category layout
 */
export function getCategoryLayout(slug: string | undefined): CategoryLayout {
  if (!slug) return DefaultCategoryLayout;
  return categoryLayoutRegistry[slug] || DefaultCategoryLayout;
}

export { DefaultCategoryLayout };
