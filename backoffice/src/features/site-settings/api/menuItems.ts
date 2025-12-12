import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
import { MenuItem, MenuItemPayload } from "../types/menuItems";

export const menuItemsApi = {
  async list(params?: { location?: string; parent?: number | null }) {
    const response = await apiClient.get<MenuItem[]>(API_ENDPOINTS.MENU_ITEMS.LIST, { params });
    return response.data.map(normalize);
  },

  async create(payload: MenuItemPayload) {
    const response = await apiClient.post<MenuItem>(API_ENDPOINTS.MENU_ITEMS.LIST, payload);
    return normalize(response.data);
  },

  async update(id: number, payload: MenuItemPayload) {
    const response = await apiClient.patch<MenuItem>(API_ENDPOINTS.MENU_ITEMS.DETAIL(String(id)), payload);
    return normalize(response.data);
  },

  async remove(id: number) {
    await apiClient.delete(API_ENDPOINTS.MENU_ITEMS.DETAIL(String(id)));
  },
};

function normalize(item: MenuItem): MenuItem {
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
    location: (item.location as any) || "header",
  };
}

