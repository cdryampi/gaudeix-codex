import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
export const staticPagesApi = {
    async list(params) {
        const response = await apiClient.get(API_ENDPOINTS.STATIC_PAGES.LIST, { params });
        return response.data.map(normalizeStaticPage);
    },
    async create(payload) {
        const response = await apiClient.post(API_ENDPOINTS.STATIC_PAGES.LIST, payload);
        return normalizeStaticPage(response.data);
    },
    async update(id, payload) {
        const response = await apiClient.patch(API_ENDPOINTS.STATIC_PAGES.DETAIL(String(id)), payload);
        return normalizeStaticPage(response.data);
    },
    async remove(id) {
        await apiClient.delete(API_ENDPOINTS.STATIC_PAGES.DETAIL(String(id)));
    },
    async autoTranslate(id, data) {
        const response = await apiClient.post(API_ENDPOINTS.STATIC_PAGES.AUTO_TRANSLATE(String(id)), data);
        return response.data;
    },
};
function normalizeStaticPage(page) {
    return {
        ...page,
        cuerpo: page.cuerpo || "",
        translations: page.translations || {},
        featured_media: page.featured_media ?? null,
        attachment: page.attachment ?? null,
        featured_media_id: page.featured_media?.id ?? null,
        attachment_id: page.attachment?.id ?? null,
    };
}
