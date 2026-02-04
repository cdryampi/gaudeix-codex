/**
 * Constants for the Festes (Festivals) feature.
 * Sponsor tier colors and labels.
 */

import { SponsorTier } from "./types";

export interface TierConfig {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  size: "xl" | "lg" | "md" | "sm" | "xs";
}

export const TIER_CONFIG: Record<SponsorTier, TierConfig> = {
  platinum: {
    label: "Platino",
    bgColor: "bg-gradient-to-br from-slate-100 to-slate-200",
    textColor: "text-slate-700",
    borderColor: "border-slate-300",
    size: "xl",
  },
  gold: {
    label: "Oro",
    bgColor: "bg-gradient-to-br from-amber-50 to-amber-100",
    textColor: "text-amber-800",
    borderColor: "border-amber-300",
    size: "lg",
  },
  silver: {
    label: "Plata",
    bgColor: "bg-gradient-to-br from-slate-50 to-slate-100",
    textColor: "text-slate-600",
    borderColor: "border-slate-200",
    size: "md",
  },
  bronze: {
    label: "Bronce",
    bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
    textColor: "text-orange-800",
    borderColor: "border-orange-200",
    size: "sm",
  },
  collaborator: {
    label: "Colaborador",
    bgColor: "bg-white",
    textColor: "text-slate-500",
    borderColor: "border-slate-100",
    size: "xs",
  },
};

export const getTierConfig = (tier: SponsorTier): TierConfig => {
  return TIER_CONFIG[tier] || TIER_CONFIG.collaborator;
};

// Size mappings for logos
export const TIER_LOGO_SIZES: Record<TierConfig["size"], string> = {
  xl: "h-24 w-48",
  lg: "h-20 w-40",
  md: "h-16 w-32",
  sm: "h-12 w-24",
  xs: "h-10 w-20",
};
