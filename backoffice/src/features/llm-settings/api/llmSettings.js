import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
function coerceArrayResponse(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.results))
    return data.results;
  return [];
}
export const llmSettingsApi = {
  async getConfig() {
    const response = await apiClient.get(API_ENDPOINTS.LLM.CONFIG);
    return response.data;
  },
  async updateConfig(id, payload) {
    const response = await apiClient.patch(
      `${API_ENDPOINTS.LLM.CONFIG}${id}/`,
      payload,
    );
    return response.data;
  },
  async listLogs(params) {
    const response = await apiClient.get(API_ENDPOINTS.LLM.LOGS, { params });
    return coerceArrayResponse(response.data);
  },
};
