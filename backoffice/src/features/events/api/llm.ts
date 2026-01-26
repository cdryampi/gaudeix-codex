import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";

/**
 * Translation request payload
 */
export interface TranslateRequest {
  text: string;
  source_lang: string;
  target_lang: string;
}

/**
 * Translation response
 */
export interface TranslateResponse {
  translated_text: string;
  source_lang: string;
  target_lang: string;
  provider: string;
  model_name: string;
}

/**
 * Auto-translate event response
 */
export interface AutoTranslateEventResponse {
  success: boolean;
  source_lang: string;
  translations: {
    [lang: string]: {
      title: string;
      summary: string;
      description: string;
    };
  };
  errors?: {
    [lang: string]: string;
  };
}

/**
 * LLM API Client
 */
export const llmApi = {
  /**
   * Translate text from source language to target language
   */
  async translate(data: TranslateRequest): Promise<TranslateResponse> {
    const response = await apiClient.post<TranslateResponse>(
      API_ENDPOINTS.LLM.TRANSLATE,
      data,
    );
    return response.data;
  },

  /**
   * Auto-translate event to all configured languages
   */
  async autoTranslateEvent(id: string): Promise<AutoTranslateEventResponse> {
    const response = await apiClient.post<AutoTranslateEventResponse>(
      API_ENDPOINTS.LLM.AUTO_TRANSLATE_EVENT(id),
    );
    return response.data;
  },
};
