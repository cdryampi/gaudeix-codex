/**
 * API client for Sponsors endpoints.
 */
import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
import { CreateSponsorDTO, Sponsor, UpdateSponsorDTO } from "../types";

export const sponsorsApi = {
  list: async (filters?: { festa?: string | number; tier?: string }) => {
    const params = new URLSearchParams();
    if (filters?.festa) params.append("festa", filters.festa.toString());
    if (filters?.tier) params.append("tier", filters.tier);

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.SPONSORS.LIST}?${queryString}`
      : API_ENDPOINTS.SPONSORS.LIST;

    const response = await apiClient.get<Sponsor[]>(url);
    return response.data;
  },

  create: async (data: CreateSponsorDTO) => {
    const response = await apiClient.post<Sponsor>(
      API_ENDPOINTS.SPONSORS.LIST,
      data,
    );
    return response.data;
  },

  update: async (id: number, data: UpdateSponsorDTO) => {
    const response = await apiClient.patch<Sponsor>(
      API_ENDPOINTS.SPONSORS.DETAIL(id.toString()),
      data,
    );
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.SPONSORS.DETAIL(id.toString()));
  },
};
