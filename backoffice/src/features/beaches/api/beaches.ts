import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";

import { Beach, BeachPayload, BeachUpdatePayload } from "../types";

export const beachesApi = {
  async getAll(params?: { search?: string; is_published?: string }) {
    const response = await apiClient.get<Beach[]>(API_ENDPOINTS.BEACHES.LIST, {
      params,
    });
    return response.data.map(normalizeBeach);
  },

  async create(payload: BeachPayload) {
    const response = await apiClient.post<Beach>(
      API_ENDPOINTS.BEACHES.LIST,
      payload,
    );
    return normalizeBeach(response.data);
  },

  async update(slug: string, payload: BeachUpdatePayload) {
    const response = await apiClient.patch<Beach>(
      API_ENDPOINTS.BEACHES.DETAIL(slug),
      payload,
    );
    return normalizeBeach(response.data);
  },

  async delete(slug: string) {
    await apiClient.delete(API_ENDPOINTS.BEACHES.DETAIL(slug));
  },
};

function normalizeBeach(beach: Beach): Beach {
  return {
    ...beach,
    description: beach.description || "",
    environment_summary: beach.environment_summary || "",
    location_text: beach.location_text || "",
    access_notes: beach.access_notes || "",
    parking_info: beach.parking_info || "",
    public_transport_info: beach.public_transport_info || "",
    featured_media: beach.featured_media ?? null,
    gallery: beach.gallery || [],
    attachments: beach.attachments || [],
    recommended_for: beach.recommended_for || [],
    services: beach.services || {},
    accessibility_features: beach.accessibility_features || {},
  };
}
