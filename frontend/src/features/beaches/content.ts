import {
  Accessibility,
  CarFront,
  LifeBuoy,
  Palmtree,
  Route,
  ShowerHead,
  SunMedium,
  Trees,
  Umbrella,
  Waves,
  type LucideIcon,
} from "lucide-react";

import {
  BeachAccessibilityKey,
  BeachServiceKey,
  BeachType,
  RecommendedForKey,
} from "./types";

export const BEACH_TYPE_LABELS: Record<BeachType, string> = {
  urban: "Playa urbana",
  cove: "Cala",
  natural: "Playa natural",
};

export const RECOMMENDED_FOR_META: Record<
  RecommendedForKey,
  { label: string; icon: LucideIcon }
> = {
  families: { label: "Familias", icon: Umbrella },
  swimming: { label: "Baño", icon: Waves },
  snorkeling: { label: "Snorkel", icon: LifeBuoy },
  quiet_visit: { label: "Plan tranquilo", icon: Trees },
  sunset: { label: "Atardecer", icon: SunMedium },
};

export const BEACH_SERVICE_META: Record<
  BeachServiceKey,
  { label: string; icon: LucideIcon }
> = {
  showers: { label: "Duchas", icon: ShowerHead },
  foot_wash: { label: "Lavapiés", icon: Waves },
  toilets: { label: "Aseos", icon: Palmtree },
  lifeguard_point: { label: "Socorrismo", icon: LifeBuoy },
  sunbeds: { label: "Hamacas", icon: Umbrella },
  beach_bar: { label: "Chiringuito", icon: SunMedium },
};

export const BEACH_ACCESSIBILITY_META: Record<
  BeachAccessibilityKey,
  { label: string; icon: LucideIcon }
> = {
  accessible_access: { label: "Acceso accesible", icon: Accessibility },
  accessible_walkway: { label: "Pasarela accesible", icon: Route },
  assisted_bath: { label: "Baño asistido", icon: LifeBuoy },
  amphibious_chair: { label: "Silla anfibia", icon: Waves },
  adapted_toilet: { label: "Aseo adaptado", icon: CarFront },
};
