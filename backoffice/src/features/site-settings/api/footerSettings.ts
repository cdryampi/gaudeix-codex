import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
import {
  FooterPublicPayload,
  FooterSettings,
  FooterSettingsPayload,
} from "../types";

export const footerSettingsApi = {
  async get() {
    const response = await apiClient.get<FooterSettings>(
      API_ENDPOINTS.FOOTER_SETTINGS.LIST,
    );
    return response.data;
  },
  async getPublic() {
    const response = await apiClient.get<FooterPublicPayload>(
      API_ENDPOINTS.FOOTER_SETTINGS.PUBLIC,
    );
    return response.data;
  },
  async update(payload: FooterSettingsPayload) {
    const response = await apiClient.patch<FooterSettings>(
      API_ENDPOINTS.FOOTER_SETTINGS.DETAIL("1"),
      payload,
    );
    return response.data;
  },
};
