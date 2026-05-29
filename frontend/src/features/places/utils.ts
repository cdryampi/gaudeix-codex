import { Place } from "./types";

export function getPlaceDetailPath(
  place: Pick<Place, "slug" | "template_key">,
) {
  if (place.template_key === "beaches") {
    return `/playas/${place.slug}`;
  }

  return `/lugares/${place.slug}`;
}

// Las playas se excluyen del explorador general porque tienen
// su propia landing y navegación específica en /playas.
export function isPlaceVisibleInExplorer(place: Pick<Place, "template_key">) {
  return place.template_key !== "beaches";
}
