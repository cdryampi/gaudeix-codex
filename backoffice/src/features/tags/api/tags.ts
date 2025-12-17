import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
import { Tag, TagPayload, TagUpdatePayload } from "../types";

export const tagsApi = {
  async list(params?: { search?: string; slug?: string }) {
    const response = await apiClient.get<Tag[]>(API_ENDPOINTS.TAGS.LIST, { params });
    return response.data.map(normalizeTag);
  },

  async create(payload: TagPayload) {
    const response = await apiClient.post<Tag>(API_ENDPOINTS.TAGS.LIST, payload);
    return normalizeTag(response.data);
  },

  async update(id: number, payload: TagUpdatePayload) {
    const response = await apiClient.patch<Tag>(API_ENDPOINTS.TAGS.DETAIL(String(id)), payload);
    return normalizeTag(response.data);
  },

  async remove(id: number) {
    await apiClient.delete(API_ENDPOINTS.TAGS.DETAIL(String(id)));
  },
};

function normalizeTag(tag: Tag): Tag {
  return {
    ...tag,
    translations: tag.translations || {},
  };
}

