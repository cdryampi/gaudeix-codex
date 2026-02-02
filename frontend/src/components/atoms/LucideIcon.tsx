import * as Lucide from "lucide-react";
import type { LucideProps } from "lucide-react";

export interface DynamicLucideIconProps extends LucideProps {
  /** The name of the icon (camelCase, kebab-case, or PascalCase) */
  name: string;
}

/**
 * DynamicLucideIcon component
 *
 * Takes an icon name string (e.g., "map-pin", "Utensils", "bed")
 * and renders the corresponding Lucide component.
 * Fallbacks to a generic "HelpCircle" if not found.
 */
export function DynamicLucideIcon({ name, ...props }: DynamicLucideIconProps) {
  // 1. Normalize name to PascalCase for searching in Lucide exports
  const normalizedName = name
    .toLowerCase()
    .replace(/(^\w|-\w)/g, (match) => match.replace("-", "").toUpperCase());

  // 2. Get the component
  const IconComponent = (Lucide as any)[normalizedName];

  // 3. Fallback
  if (!IconComponent) {
    console.warn(
      `Lucide icon "${name}" (normalized: "${normalizedName}") not found. Rendering fallback.`,
    );
    return <Lucide.HelpCircle {...props} />;
  }

  return <IconComponent {...props} />;
}
