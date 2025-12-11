import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
import { StaticPage, StaticPagePayload, StaticPageUpdatePayload } from "../types";

export const staticPagesApi = {
  async list(params?: { search?: string; template?: string; is_published?: string | boolean }) {
    const response = await apiClient.get<StaticPage[]>(API_ENDPOINTS.STATIC_PAGES.LIST, { params });
    return response.data.map(normalizeStaticPage);
  },

  async create(payload: StaticPagePayload) {
    const response = await apiClient.post<StaticPage>(API_ENDPOINTS.STATIC_PAGES.LIST, payload);
    return normalizeStaticPage(response.data);
  },

  async update(id: number, payload: StaticPageUpdatePayload) {
    const response = await apiClient.patch<StaticPage>(API_ENDPOINTS.STATIC_PAGES.DETAIL(String(id)), payload);
    return normalizeStaticPage(response.data);
  },

  async remove(id: number) {
    await apiClient.delete(API_ENDPOINTS.STATIC_PAGES.DETAIL(String(id)));
  },

  async autoTranslate(id: number, data: { source_lang?: string; target_langs?: string[] }) {
    const response = await apiClient.post(API_ENDPOINTS.STATIC_PAGES.AUTO_TRANSLATE(String(id)), data);
    return response.data as {
      success: boolean;
      translations: Record<string, { titulo: string; cuerpo: string }>;
      errors?: Record<string, string>;
    };
  },
};

function normalizeStaticPage(page: StaticPage): StaticPage {
  return {
    ...page,
    cuerpo: page.cuerpo || "",
    translations: page.translations || {},
    featured_media: page.featured_media ?? null,
    attachment: page.attachment ?? null,
    featured_media_id: page.featured_media?.id ?? null,
    attachment_id: page.attachment?.id ?? null,
  };
}
