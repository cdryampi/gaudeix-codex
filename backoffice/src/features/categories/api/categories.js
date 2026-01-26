import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
export const categoriesApi = {
  async list(params) {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.LIST, {
      params,
    });
    return response.data.map(normalizeCategory);
  },
  async create(payload) {
    const response = await apiClient.post(
      API_ENDPOINTS.CATEGORIES.LIST,
      payload,
    );
    return normalizeCategory(response.data);
  },
  async update(id, payload) {
    const response = await apiClient.patch(
      API_ENDPOINTS.CATEGORIES.DETAIL(String(id)),
      payload,
    );
    return normalizeCategory(response.data);
  },
  async remove(id) {
    await apiClient.delete(API_ENDPOINTS.CATEGORIES.DETAIL(String(id)));
  },
  async autoTranslate(id, data) {
    const response = await apiClient.post(
      API_ENDPOINTS.CATEGORIES.AUTO_TRANSLATE(String(id)),
      data,
    );
    return response.data;
  },
};
function normalizeCategory(category) {
  return {
    ...category,
    parent: category.parent ?? null,
    descripcion: category.descripcion || "",
    translations: category.translations || {},
    icon: category.icon || "",
  };
}
