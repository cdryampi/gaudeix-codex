import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
/**
 * LLM API Client
 */
export const llmApi = {
    /**
     * Translate text from source language to target language
     */
    async translate(data) {
        const response = await apiClient.post(API_ENDPOINTS.LLM.TRANSLATE, data);
        return response.data;
    },
    /**
     * Auto-translate event to all configured languages
     */
    async autoTranslateEvent(id) {
        const response = await apiClient.post(API_ENDPOINTS.LLM.AUTO_TRANSLATE_EVENT(id));
        return response.data;
    },
};
