/**
 * API client for Programs endpoints.
 */
import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
import { CreateProgramDTO, Program, UpdateProgramDTO } from "../types";

export type PaginatedListResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export const programsApi = {
  getAll: async (params?: Record<string, any>) => {
    const response = await apiClient.get<PaginatedListResponse<Program>>(
      API_ENDPOINTS.PROGRAMS.LIST,
      { params },
    );
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await apiClient.get<Program>(
      API_ENDPOINTS.PROGRAMS.DETAIL(slug),
    );
    return response.data;
  },

  getByFesta: async (festaSlug: string, params?: Record<string, any>) => {
    const response = await apiClient.get<PaginatedListResponse<Program>>(
      API_ENDPOINTS.PROGRAMS.BY_FESTA(festaSlug),
      { params },
    );
    return response.data;
  },

  create: async (data: CreateProgramDTO) => {
    const response = await apiClient.post<Program>(
      API_ENDPOINTS.PROGRAMS.LIST,
      data,
    );
    return response.data;
  },

  update: async (slug: string, data: UpdateProgramDTO) => {
    const response = await apiClient.patch<Program>(
      API_ENDPOINTS.PROGRAMS.DETAIL(slug),
      data,
    );
    return response.data;
  },

  delete: async (slug: string) => {
    await apiClient.delete(API_ENDPOINTS.PROGRAMS.DETAIL(slug));
  },
};
