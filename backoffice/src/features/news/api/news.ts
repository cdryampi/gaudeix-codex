/**
 * News API client
 */
import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
import { CreateNewsDTO, News, UpdateNewsDTO, NewsApiResponse } from "../types";

export const newsApi = {
  getAll: async (params?: { category?: string }) => {
    const response = await apiClient.get<NewsApiResponse[]>(
      API_ENDPOINTS.NEWS.LIST,
      {
        params: {
          ...params,
          _ts: Date.now(),
        },
      },
    );
    return response.data.map(normalizeNews);
  },

  getById: async (slug: string) => {
    const response = await apiClient.get<NewsApiResponse>(
      API_ENDPOINTS.NEWS.DETAIL(slug),
    );
    return normalizeNews(response.data);
  },

  create: async (data: CreateNewsDTO) => {
    const payload = preparePayload(data);
    const response = await apiClient.post<NewsApiResponse>(
      API_ENDPOINTS.NEWS.LIST,
      payload,
    );
    return normalizeNews(response.data);
  },

  update: async (slug: string, data: UpdateNewsDTO) => {
    const payload = preparePayload(data);
    const response = await apiClient.patch<NewsApiResponse>(
      API_ENDPOINTS.NEWS.DETAIL(slug),
      payload,
    );
    return normalizeNews(response.data);
  },

  delete: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.NEWS.DELETE_BY_ID(String(id)));
  },
};

/**
 * Prepare payload for API: map frontend field names to backend field names
 */
function preparePayload(
  data: CreateNewsDTO | UpdateNewsDTO,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    ...data,
    attachments_ids: data.attachments_ids ?? [],
  };

  // Map frontend names to backend names
  if ("excerpt" in data) {
    payload.summary = data.excerpt;
    delete payload.excerpt;
  }
  if ("content" in data) {
    payload.body = data.content;
    delete payload.content;
  }
  if ("publish_date" in data) {
    payload.published_at = data.publish_date;
    delete payload.publish_date;
  }

  // Map translations field names
  if (data.translations) {
    const mappedTranslations: Record<
      string,
      { title: string; summary?: string; body?: string }
    > = {};
    for (const [lang, trans] of Object.entries(data.translations)) {
      mappedTranslations[lang] = {
        title: trans.title,
        summary: trans.excerpt,
        body: trans.content,
      };
    }
    payload.translations = mappedTranslations;
  }

  return payload;
}

/**
 * Normalize API response: map backend field names to frontend field names
 */
function normalizeNews(apiNews: NewsApiResponse): News {
  // Map translations from backend format to frontend format
  let translations: News["translations"];
  if (apiNews.translations) {
    translations = {};
    for (const [lang, trans] of Object.entries(apiNews.translations)) {
      translations[lang] = {
        title: trans.title,
        excerpt: trans.summary,
        content: trans.body,
      };
    }
  }

  return {
    id: apiNews.id,
    slug: apiNews.slug,
    title: apiNews.title,
    // Map backend names to frontend names
    excerpt: apiNews.summary,
    content: apiNews.body,
    is_published: apiNews.is_published,
    is_featured: apiNews.is_featured,
    publish_date: apiNews.published_at,
    category: apiNews.category,
    category_slug: apiNews.category_slug,
    category_name: apiNews.category_name,
    featured_media: apiNews.featured_media ?? null,
    attachments: apiNews.attachments || [],
    created_at: apiNews.fecha_creacion,
    updated_at: apiNews.fecha_modificacion,
    translations,
  };
}
