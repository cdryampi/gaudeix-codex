import {
  Castle,
  Flag,
  Leaf,
  Mountain,
  PartyPopper,
  Umbrella,
} from "lucide-react";
export const CATEGORY_ICON_MAP = {
  mountain: Mountain,
  leaf: Leaf,
  "party-popper": PartyPopper,
  umbrella: Umbrella,
  flag: Flag,
  castle: Castle,
};
export const CATEGORY_ICON_OPTIONS = [
  {
    value: "mountain",
    labelEs: "Rutas autoguiadas",
    labelCa: "Rutes autoguiades",
    icon: Mountain,
  },
  { value: "leaf", labelEs: "Naturaleza", labelCa: "Natura", icon: Leaf },
  {
    value: "party-popper",
    labelEs: "Fiestas y tradiciones",
    labelCa: "Festes i tradicions",
    icon: PartyPopper,
  },
  { value: "umbrella", labelEs: "Playas", labelCa: "Platges", icon: Umbrella },
  {
    value: "flag",
    labelEs: "Visitas guiadas",
    labelCa: "Visites guiades",
    icon: Flag,
  },
  {
    value: "castle",
    labelEs: "Patrimonio histórico",
    labelCa: "Patrimoni històric",
    icon: Castle,
  },
];
export function getCategoryIcon(name) {
  if (!name) return null;
  const normalized = name.toLowerCase();
  return CATEGORY_ICON_MAP[normalized] || null;
}
