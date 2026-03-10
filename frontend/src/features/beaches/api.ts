import { apiGet } from "@/lib/api";

import { Beach, BeachListResponse } from "./types";

function normalizeBeach(beach: Beach): Beach {
  return {
    ...beach,
    description: beach.description || "",
    location_text: beach.location_text || "",
    phone: beach.phone || "",
    email: beach.email || "",
    website: beach.website || "",
    booking_url: beach.booking_url || "",
    environment_summary: beach.environment_summary || "",
    access_notes: beach.access_notes || "",
    parking_info: beach.parking_info || "",
    public_transport_info: beach.public_transport_info || "",
    recommended_for: beach.recommended_for || [],
    services: beach.services || {},
    accessibility_features: beach.accessibility_features || {},
    gallery: beach.gallery || [],
    attachments: beach.attachments || [],
  };
}

export async function getBeaches(
  params?: Record<string, string | number | boolean | null | undefined>,
): Promise<BeachListResponse | Beach[]> {
  const cleanParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      cleanParams.set(key, String(value));
    }
  });

  const queryString = cleanParams.size ? `?${cleanParams.toString()}` : "";
  const response = await apiGet<BeachListResponse | Beach[]>(
    `/beaches/${queryString}`,
  );

  if (Array.isArray(response)) {
    return response.map(normalizeBeach);
  }

  return {
    ...response,
    results: response.results.map(normalizeBeach),
  };
}

export async function getBeachBySlug(slug: string): Promise<Beach> {
  const response = await apiGet<Beach>(`/beaches/${slug}/`);
  return normalizeBeach(response);
}
