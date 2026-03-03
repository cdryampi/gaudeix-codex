import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";

import { Place, PlacePayload, PlaceUpdatePayload } from "../types";

export const placesApi = {
  async getAll(params?: {
    search?: string;
    is_published?: string;
    category?: string | number;
  }) {
    const response = await apiClient.get<Place[]>(API_ENDPOINTS.PLACES.LIST, {
      params,
    });
    return response.data.map(normalizePlace);
  },

  async create(payload: PlacePayload) {
    const response = await apiClient.post<Place>(
      API_ENDPOINTS.PLACES.LIST,
      payload,
    );
    return normalizePlace(response.data);
  },

  async update(id: number, payload: PlaceUpdatePayload) {
    const response = await apiClient.patch<Place>(
      API_ENDPOINTS.PLACES.DETAIL(String(id)),
      payload,
    );
    return normalizePlace(response.data);
  },

  async delete(id: number) {
    await apiClient.delete(API_ENDPOINTS.PLACES.DETAIL(String(id)));
  },

  async autoTranslate(
    id: number,
    data: { source_lang?: string; target_langs?: string[] },
  ) {
    const response = await apiClient.post(
      API_ENDPOINTS.PLACES.AUTO_TRANSLATE(String(id)),
      data,
    );
    return response.data as {
      success: boolean;
      translations: Record<string, { title: string; description: string }>;
      errors?: Record<string, string>;
    };
  },
};

function normalizePlace(place: Place): Place {
  return {
    ...place,
    description: place.description || "",
    location_text: place.location_text || "",
    featured_media: place.featured_media ?? null,
    attachments: place.attachments || [],
  };
}
