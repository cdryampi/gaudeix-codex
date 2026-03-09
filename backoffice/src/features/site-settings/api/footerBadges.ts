import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
import { FooterBadge, FooterBadgePayload } from "../types";

export const footerBadgesApi = {
  async list(params?: { is_active?: boolean }) {
    const response = await apiClient.get<FooterBadge[]>(
      API_ENDPOINTS.FOOTER_BADGES.LIST,
      { params },
    );
    return response.data;
  },
  async create(payload: FooterBadgePayload) {
    const response = await apiClient.post<FooterBadge>(
      API_ENDPOINTS.FOOTER_BADGES.LIST,
      payload,
    );
    return response.data;
  },
  async update(id: number, payload: FooterBadgePayload) {
    const response = await apiClient.patch<FooterBadge>(
      API_ENDPOINTS.FOOTER_BADGES.DETAIL(String(id)),
      payload,
    );
    return response.data;
  },
  async remove(id: number) {
    await apiClient.delete(API_ENDPOINTS.FOOTER_BADGES.DETAIL(String(id)));
  },
};
