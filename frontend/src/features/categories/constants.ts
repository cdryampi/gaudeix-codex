/**
 * Category Constants Registry
 *
 * Defines metadata (icons, colors, labels) for all category slugs.
 * Used by CategoryDetailPage and related components for consistent styling.
 */

import {
  Utensils,
  Bed,
  Trees,
  Landmark,
  Waves,
  Palette,
  ShoppingBag,
  MapPin,
  Calendar,
  Clapperboard,
  PartyPopper,
  Baby,
  Users,
  Trophy,
  ShoppingCart,
  GraduationCap,
  Music,
  Drama,
  MoreHorizontal,
  LucideIcon,
} from "lucide-react";

export interface CategoryMeta {
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  text: string;
}

export const CATEGORY_REGISTRY: Record<string, CategoryMeta> = {
  // Root categories
  places: {
    label: "Lugares",
    icon: MapPin,
    color: "#6366f1",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    text: "text-indigo-600",
  },
  events: {
    label: "Eventos",
    icon: Calendar,
    color: "#f59e0b",
    bg: "bg-amber-50",
    border: "border-amber-100",
    text: "text-amber-600",
  },

  // Place templates (taxonomy=template)
  restaurants: {
    label: "Restaurantes",
    icon: Utensils,
    color: "#f97316",
    bg: "bg-orange-50",
    border: "border-orange-100",
    text: "text-orange-600",
  },
  accommodations: {
    label: "Dónde dormir",
    icon: Bed,
    color: "#3b82f6",
    bg: "bg-blue-50",
    border: "border-blue-100",
    text: "text-blue-600",
  },
  nature: {
    label: "Naturaleza",
    icon: Trees,
    color: "#22c55e",
    bg: "bg-green-50",
    border: "border-green-100",
    text: "text-green-600",
  },
  heritage: {
    label: "Patrimonio",
    icon: Landmark,
    color: "#64748b",
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-600",
  },
  beaches: {
    label: "Playas",
    icon: Waves,
    color: "#06b6d4",
    bg: "bg-cyan-50",
    border: "border-cyan-100",
    text: "text-cyan-600",
  },
  culture: {
    label: "Cultura",
    icon: Palette,
    color: "#a855f7",
    bg: "bg-purple-50",
    border: "border-purple-100",
    text: "text-purple-600",
  },
  shopping: {
    label: "Compras",
    icon: ShoppingBag,
    color: "#ec4899",
    bg: "bg-pink-50",
    border: "border-pink-100",
    text: "text-pink-600",
  },

  // Event subcategories (taxonomy=events)
  cultura: {
    label: "Cultura",
    icon: Clapperboard,
    color: "#8b5cf6",
    bg: "bg-violet-50",
    border: "border-violet-100",
    text: "text-violet-600",
  },
  festes: {
    label: "Fiestas",
    icon: PartyPopper,
    color: "#ef4444",
    bg: "bg-red-50",
    border: "border-red-100",
    text: "text-red-600",
  },
  infantil: {
    label: "Infantil",
    icon: Baby,
    color: "#f472b6",
    bg: "bg-pink-50",
    border: "border-pink-100",
    text: "text-pink-500",
  },
  joves: {
    label: "Jóvenes",
    icon: Users,
    color: "#0ea5e9",
    bg: "bg-sky-50",
    border: "border-sky-100",
    text: "text-sky-600",
  },
  esports: {
    label: "Deportes",
    icon: Trophy,
    color: "#14b8a6",
    bg: "bg-teal-50",
    border: "border-teal-100",
    text: "text-teal-600",
  },
  "fires-i-mercats": {
    label: "Ferias y mercados",
    icon: ShoppingCart,
    color: "#84cc16",
    bg: "bg-lime-50",
    border: "border-lime-100",
    text: "text-lime-600",
  },
  formacio: {
    label: "Formación",
    icon: GraduationCap,
    color: "#6366f1",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    text: "text-indigo-600",
  },
  musica: {
    label: "Música",
    icon: Music,
    color: "#d946ef",
    bg: "bg-fuchsia-50",
    border: "border-fuchsia-100",
    text: "text-fuchsia-600",
  },
  teatre: {
    label: "Teatro",
    icon: Drama,
    color: "#be185d",
    bg: "bg-rose-50",
    border: "border-rose-100",
    text: "text-rose-600",
  },
  altres: {
    label: "Otros",
    icon: MoreHorizontal,
    color: "#71717a",
    bg: "bg-zinc-50",
    border: "border-zinc-200",
    text: "text-zinc-600",
  },
};

export type CategoryKey = keyof typeof CATEGORY_REGISTRY;

/**
 * Get category metadata by slug.
 * Returns null if category is not found in registry.
 */
export const getCategoryMeta = (slug: string | null): CategoryMeta | null => {
  if (!slug) return null;
  return CATEGORY_REGISTRY[slug] || null;
};
