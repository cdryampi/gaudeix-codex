import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
import { Category, CategoryPayload, CategoryUpdatePayload } from "../types";

export const categoriesApi = {
  async list(params?: { search?: string; taxonomy?: string; slug?: string }) {
    const response = await apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.LIST, { params });
    return response.data.map(normalizeCategory);
  },

  async create(payload: CategoryPayload) {
    const response = await apiClient.post<Category>(API_ENDPOINTS.CATEGORIES.LIST, payload);
    return normalizeCategory(response.data);
  },

  async update(id: number, payload: CategoryUpdatePayload) {
    const response = await apiClient.patch<Category>(API_ENDPOINTS.CATEGORIES.DETAIL(String(id)), payload);
    return normalizeCategory(response.data);
  },

  async remove(id: number) {
    await apiClient.delete(API_ENDPOINTS.CATEGORIES.DETAIL(String(id)));
  },

  async autoTranslate(id: number, data: { source_lang?: string; target_langs?: string[] }) {
    const response = await apiClient.post(API_ENDPOINTS.CATEGORIES.AUTO_TRANSLATE(String(id)), data);
    return response.data as {
      success: boolean;
      translations: Record<string, { nombre: string; descripcion: string }>;
      errors?: Record<string, string>;
    };
  },
};

function normalizeCategory(category: Category): Category {
  return {
    ...category,
    descripcion: category.descripcion || "",
    translations: category.translations || {},
    icon: category.icon || "",
  };
}
