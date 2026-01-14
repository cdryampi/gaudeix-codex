import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
export const menuItemsApi = {
    async list(params) {
        const response = await apiClient.get(API_ENDPOINTS.MENU_ITEMS.LIST, { params });
        return response.data.map(normalize);
    },
    async create(payload) {
        const response = await apiClient.post(API_ENDPOINTS.MENU_ITEMS.LIST, payload);
        return normalize(response.data);
    },
    async update(id, payload) {
        const response = await apiClient.patch(API_ENDPOINTS.MENU_ITEMS.DETAIL(String(id)), payload);
        return normalize(response.data);
    },
    async remove(id) {
        await apiClient.delete(API_ENDPOINTS.MENU_ITEMS.DETAIL(String(id)));
    },
};
function normalize(item) {
    return {
        ...item,
        parent: item.parent ?? null,
        category: item.category ?? null,
        static_page: item.static_page ?? null,
        category_id: item.category?.id ?? item.category_id ?? null,
        static_page_id: item.static_page?.id ?? item.static_page_id ?? null,
        label: item.label || "",
        url: item.url || "",
        order: item.order ?? 0,
        location: item.location || "header",
    };
}
