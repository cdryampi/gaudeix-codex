/**
 * News API client
 */
import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
import { CreateNewsDTO, News, UpdateNewsDTO } from "../types";

export const newsApi = {
  getAll: async (params?: { category?: string }) => {
    const response = await apiClient.get<News[]>(API_ENDPOINTS.NEWS.LIST, {
      params,
    });
    return response.data.map(normalizeNews);
  },

  getById: async (id: number) => {
    const response = await apiClient.get<News>(
      API_ENDPOINTS.NEWS.DETAIL(String(id)),
    );
    return normalizeNews(response.data);
  },

  create: async (data: CreateNewsDTO) => {
    const payload = {
      ...data,
      attachments_ids: data.attachments_ids ?? [],
    };
    const response = await apiClient.post<News>(
      API_ENDPOINTS.NEWS.LIST,
      payload,
    );
    return normalizeNews(response.data);
  },

  update: async (id: number, data: UpdateNewsDTO) => {
    const payload = {
      ...data,
      attachments_ids: data.attachments_ids ?? [],
    };
    const response = await apiClient.patch<News>(
      API_ENDPOINTS.NEWS.DETAIL(String(id)),
      payload,
    );
    return normalizeNews(response.data);
  },

  delete: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.NEWS.DETAIL(String(id)));
  },
};

function normalizeNews(news: News): News {
  return {
    ...news,
    attachments: news.attachments || [],
    featured_media: news.featured_media ?? null,
  };
}
