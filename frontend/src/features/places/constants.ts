import {
  Utensils,
  Hotel,
  Mountain,
  Landmark,
  Palmtree,
  Sailboat,
  Brush,
  MapPin,
  Church,
  Trees,
  ShoppingBag,
} from "lucide-react";

export const PLACE_CATEGORIES = {
  restaurants: {
    label: "Restaurantes",
    icon: Utensils,
    color: "#f97316", // Orange
    bg: "bg-orange-50",
    border: "border-orange-100",
    text: "text-orange-600",
  },
  accommodations: {
    label: "Donde dormir",
    icon: Hotel,
    color: "#3b82f6", // Blue
    bg: "bg-blue-50",
    border: "border-blue-100",
    text: "text-blue-600",
  },
  nature: {
    label: "Naturaleza",
    icon: Trees,
    color: "#22c55e", // Green
    bg: "bg-green-50",
    border: "border-green-100",
    text: "text-green-600",
  },
  heritage: {
    label: "Patrimonio",
    icon: Church,
    color: "#64748b", // Slate
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-600",
  },
  culture: {
    label: "Cultura",
    icon: Brush,
    color: "#a855f7", // Purple
    bg: "bg-purple-50",
    border: "border-purple-100",
    text: "text-purple-600",
  },
  shopping: {
    label: "Compras",
    icon: ShoppingBag,
    color: "#ec4899", // Pink
    bg: "bg-pink-50",
    border: "border-pink-100",
    text: "text-pink-600",
  },
};

export type PlaceCategoryKey = keyof typeof PLACE_CATEGORIES;

export const getCategoryData = (slug: string | null) => {
  if (!slug) return null;
  return PLACE_CATEGORIES[slug as PlaceCategoryKey] || null;
};
