import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
export const eventsApi = {
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.EVENTS.LIST);
    return response.data.map(normalizeEvent);
  },
  getById: async (id) => {
    const response = await apiClient.get(
      API_ENDPOINTS.EVENTS.DETAIL(String(id)),
    );
    return normalizeEvent(response.data);
  },
  create: async (data) => {
    const payload = {
      ...data,
      attachments_ids: data.attachments_ids ?? [],
      tag_ids: data.tag_ids ?? [],
    };
    const response = await apiClient.post(API_ENDPOINTS.EVENTS.LIST, payload);
    return normalizeEvent(response.data);
  },
  update: async (id, data) => {
    const payload = {
      ...data,
      attachments_ids: data.attachments_ids ?? [],
      tag_ids: data.tag_ids ?? [],
    };
    const response = await apiClient.patch(
      API_ENDPOINTS.EVENTS.DETAIL(String(id)),
      payload,
    );
    return normalizeEvent(response.data);
  },
  delete: async (id) => {
    await apiClient.delete(API_ENDPOINTS.EVENTS.DETAIL(String(id)));
  },
};
function normalizeEvent(event) {
  return {
    ...event,
    attachments: event.attachments || [],
    featured_media: event.featured_media ?? null,
    tags: event.tags || [],
  };
}
