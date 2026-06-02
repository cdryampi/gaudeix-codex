/**
 * Storytelling API client
 */
import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
import { CreateStoryDTO, Story } from "../types";

export const storytellingApi = {
  getAll: async (params?: {
    category?: string;
    search?: string;
    difficulty?: string;
  }) => {
    const response = await apiClient.get<Story[]>(
      API_ENDPOINTS.STORYTELLING.LIST,
      {
        params: {
          ...params,
          _ts: Date.now(),
        },
      },
    );
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await apiClient.get<Story>(
      API_ENDPOINTS.STORYTELLING.DETAIL(slug),
    );
    return response.data;
  },

  create: async (data: CreateStoryDTO) => {
    const response = await apiClient.post<Story>(
      API_ENDPOINTS.STORYTELLING.LIST,
      data,
    );
    return response.data;
  },

  update: async (slug: string, data: CreateStoryDTO) => {
    const response = await apiClient.put<Story>(
      API_ENDPOINTS.STORYTELLING.DETAIL(slug),
      data,
    );
    return response.data;
  },

  delete: async (slug: string) => {
    await apiClient.delete(API_ENDPOINTS.STORYTELLING.DETAIL(slug));
  },
};
