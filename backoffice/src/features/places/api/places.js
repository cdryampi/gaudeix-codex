import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
export const placesApi = {
    async getAll(params) {
        const response = await apiClient.get(API_ENDPOINTS.PLACES.LIST, { params });
        return response.data.map(normalizePlace);
    },
    async create(payload) {
        const response = await apiClient.post(API_ENDPOINTS.PLACES.LIST, payload);
        return normalizePlace(response.data);
    },
    async update(id, payload) {
        const response = await apiClient.patch(API_ENDPOINTS.PLACES.DETAIL(String(id)), payload);
        return normalizePlace(response.data);
    },
    async delete(id) {
        await apiClient.delete(API_ENDPOINTS.PLACES.DETAIL(String(id)));
    },
    async autoTranslate(id, data) {
        const response = await apiClient.post(API_ENDPOINTS.PLACES.AUTO_TRANSLATE(String(id)), data);
        return response.data;
    },
};
function normalizePlace(place) {
    return {
        ...place,
        description: place.description || "",
        location_text: place.location_text || "",
        featured_media: place.featured_media ?? null,
        attachments: place.attachments || [],
    };
}
