import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
import {
  LLMProviderConfig,
  LLMProviderConfigUpdatePayload,
  TranslationLog,
} from "../types";

function coerceArrayResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (
    data &&
    typeof data === "object" &&
    "results" in data &&
    Array.isArray((data as Record<string, unknown>).results)
  )
    return (data as Record<string, unknown>).results as T[];
  return [];
}

export const llmSettingsApi = {
  async getConfig(): Promise<LLMProviderConfig> {
    const response = await apiClient.get<LLMProviderConfig>(
      API_ENDPOINTS.LLM.CONFIG,
    );
    return response.data;
  },

  async updateConfig(
    id: number,
    payload: LLMProviderConfigUpdatePayload,
  ): Promise<LLMProviderConfig> {
    const response = await apiClient.patch<LLMProviderConfig>(
      `${API_ENDPOINTS.LLM.CONFIG}${id}/`,
      payload,
    );
    return response.data;
  },

  async listLogs(params?: {
    provider?: string;
    success?: boolean;
    source_lang?: string;
    target_lang?: string;
  }) {
    const response = await apiClient.get(API_ENDPOINTS.LLM.LOGS, { params });
    return coerceArrayResponse<TranslationLog>(response.data);
  },
};
