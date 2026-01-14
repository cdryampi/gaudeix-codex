import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
export const tagsApi = {
    async list(params) {
        const response = await apiClient.get(API_ENDPOINTS.TAGS.LIST, { params });
        return response.data.map(normalizeTag);
    },
    async create(payload) {
        const response = await apiClient.post(API_ENDPOINTS.TAGS.LIST, payload);
        return normalizeTag(response.data);
    },
    async update(id, payload) {
        const response = await apiClient.patch(API_ENDPOINTS.TAGS.DETAIL(String(id)), payload);
        return normalizeTag(response.data);
    },
    async remove(id) {
        await apiClient.delete(API_ENDPOINTS.TAGS.DETAIL(String(id)));
    },
};
function normalizeTag(tag) {
    return {
        ...tag,
        translations: tag.translations || {},
    };
}
