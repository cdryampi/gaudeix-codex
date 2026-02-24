/**
 * API client for Activities endpoints.
 */
import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
import {
  Activity,
  ActivityQueryFilters,
  CreateActivityDTO,
  UpdateActivityDTO,
} from "../types";

export const activitiesApi = {
  getAll: async (filters?: ActivityQueryFilters) => {
    const response = await apiClient.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results: Activity[];
    }>(API_ENDPOINTS.ACTIVITIES.LIST, { params: filters });
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await apiClient.get<Activity>(
      API_ENDPOINTS.ACTIVITIES.DETAIL(slug),
    );
    return response.data;
  },

  getByProgram: async (programSlug: string, filters?: ActivityQueryFilters) => {
    const response = await apiClient.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results: Activity[];
    }>(API_ENDPOINTS.ACTIVITIES.BY_PROGRAM(programSlug), {
      params: filters,
    });
    return response.data;
  },

  create: async (data: CreateActivityDTO) => {
    const response = await apiClient.post<Activity>(
      API_ENDPOINTS.ACTIVITIES.LIST,
      data,
    );
    return response.data;
  },

  update: async (slug: string, data: UpdateActivityDTO) => {
    const response = await apiClient.patch<Activity>(
      API_ENDPOINTS.ACTIVITIES.DETAIL(slug),
      data,
    );
    return response.data;
  },

  delete: async (slug: string) => {
    await apiClient.delete(API_ENDPOINTS.ACTIVITIES.DETAIL(slug));
  },
};
