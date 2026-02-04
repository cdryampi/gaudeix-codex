/**
 * Constants for the Routes feature.
 * Difficulty colors, route type icons, and labels.
 */

import { Footprints, Bike, Users, Shuffle, LucideIcon } from "lucide-react";
import { RouteType, RouteDifficulty } from "./types";

export interface DifficultyConfig {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export const DIFFICULTY_CONFIG: Record<RouteDifficulty, DifficultyConfig> = {
  easy: {
    label: "Fácil",
    color: "text-green-600",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
  },
  moderate: {
    label: "Moderado",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
  },
  difficult: {
    label: "Difícil",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
  },
  expert: {
    label: "Experto",
    color: "text-red-600",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
  },
};

export interface RouteTypeConfig {
  label: string;
  icon: LucideIcon;
  color: string;
}

export const ROUTE_TYPE_CONFIG: Record<RouteType, RouteTypeConfig> = {
  walking: {
    label: "Senderismo",
    icon: Footprints,
    color: "text-emerald-600",
  },
  cycling: {
    label: "Ciclismo",
    icon: Bike,
    color: "text-blue-600",
  },
  guided: {
    label: "Guiada",
    icon: Users,
    color: "text-purple-600",
  },
  mixed: {
    label: "Mixta",
    icon: Shuffle,
    color: "text-slate-600",
  },
};

export const getDifficultyConfig = (
  difficulty: RouteDifficulty,
): DifficultyConfig => {
  return DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.easy;
};

export const getRouteTypeConfig = (routeType: RouteType): RouteTypeConfig => {
  return ROUTE_TYPE_CONFIG[routeType] || ROUTE_TYPE_CONFIG.walking;
};
