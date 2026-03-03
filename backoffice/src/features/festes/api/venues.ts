/**
 * API client for Venues endpoints.
 */
import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
import { CreateVenueDTO, Venue, UpdateVenueDTO } from "../types";

export type PaginatedListResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export const venuesApi = {
  getAll: async (params?: Record<string, string | number | boolean>) => {
    const response = await apiClient.get<PaginatedListResponse<Venue>>(
      API_ENDPOINTS.VENUES.LIST,
      { params },
    );
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await apiClient.get<Venue>(
      API_ENDPOINTS.VENUES.DETAIL(slug),
    );
    return response.data;
  },

  create: async (data: CreateVenueDTO) => {
    const response = await apiClient.post<Venue>(
      API_ENDPOINTS.VENUES.LIST,
      data,
    );
    return response.data;
  },

  update: async (slug: string, data: UpdateVenueDTO) => {
    const response = await apiClient.patch<Venue>(
      API_ENDPOINTS.VENUES.DETAIL(slug),
      data,
    );
    return response.data;
  },

  delete: async (slug: string) => {
    await apiClient.delete(API_ENDPOINTS.VENUES.DETAIL(slug));
  },
};
