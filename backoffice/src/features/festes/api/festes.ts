/**
 * API client for Festes endpoints.
 */
import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
import { CreateFestaDTO, Festa, UpdateFestaDTO } from "../types";

export const festesApi = {
  getAll: async () => {
    const response = await apiClient.get<Festa[]>(API_ENDPOINTS.FESTES.LIST);
    return response.data.map(normalizeFesta);
  },

  getBySlug: async (slug: string) => {
    const response = await apiClient.get<Festa>(
      API_ENDPOINTS.FESTES.DETAIL(slug),
    );
    return normalizeFesta(response.data);
  },

  getCurrent: async () => {
    const response = await apiClient.get<Festa>(API_ENDPOINTS.FESTES.CURRENT);
    return normalizeFesta(response.data);
  },

  create: async (data: CreateFestaDTO) => {
    const payload = {
      ...data,
      gallery_ids: data.gallery_ids ?? [],
      tag_ids: data.tag_ids ?? [],
    };
    const response = await apiClient.post<Festa>(
      API_ENDPOINTS.FESTES.LIST,
      payload,
    );
    return normalizeFesta(response.data);
  },

  update: async (slug: string, data: UpdateFestaDTO) => {
    const payload = {
      ...data,
      gallery_ids: data.gallery_ids ?? [],
      tag_ids: data.tag_ids ?? [],
    };
    const response = await apiClient.patch<Festa>(
      API_ENDPOINTS.FESTES.DETAIL(slug),
      payload,
    );
    return normalizeFesta(response.data);
  },

  delete: async (slug: string) => {
    await apiClient.delete(API_ENDPOINTS.FESTES.DETAIL(slug));
  },

  autoTranslate: async (slug: string) => {
    const response = await apiClient.post<Festa>(
      API_ENDPOINTS.FESTES.AUTO_TRANSLATE(slug),
    );
    return normalizeFesta(response.data);
  },
};

function normalizeFesta(festa: Festa): Festa {
  return {
    ...festa,
    gallery: festa.gallery || [],
    featured_media: festa.featured_media ?? null,
    program_pdf: festa.program_pdf ?? null,
    tags: festa.tags || [],
    sponsors: festa.sponsors || [],
    events: festa.events || [],
  };
}
