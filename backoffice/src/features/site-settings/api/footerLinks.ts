import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
import { FooterLink, FooterLinkPayload } from "../types";

export const footerLinksApi = {
  async list(params?: { section?: string; is_active?: boolean }) {
    const response = await apiClient.get<FooterLink[]>(
      API_ENDPOINTS.FOOTER_LINKS.LIST,
      { params },
    );
    return response.data;
  },
  async create(payload: FooterLinkPayload) {
    const response = await apiClient.post<FooterLink>(
      API_ENDPOINTS.FOOTER_LINKS.LIST,
      payload,
    );
    return response.data;
  },
  async update(id: number, payload: FooterLinkPayload) {
    const response = await apiClient.patch<FooterLink>(
      API_ENDPOINTS.FOOTER_LINKS.DETAIL(String(id)),
      payload,
    );
    return response.data;
  },
  async remove(id: number) {
    await apiClient.delete(API_ENDPOINTS.FOOTER_LINKS.DETAIL(String(id)));
  },
};
