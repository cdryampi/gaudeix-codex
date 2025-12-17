import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
import { CreateEventDTO, Event, UpdateEventDTO } from "../types";

export const eventsApi = {
  getAll: async () => {
    const response = await apiClient.get<Event[]>(API_ENDPOINTS.EVENTS.LIST);
    return response.data.map(normalizeEvent);
  },

  getById: async (id: number) => {
    const response = await apiClient.get<Event>(API_ENDPOINTS.EVENTS.DETAIL(String(id)));
    return normalizeEvent(response.data);
  },

  create: async (data: CreateEventDTO) => {
    const payload = {
      ...data,
      attachments_ids: data.attachments_ids ?? [],
      tag_ids: data.tag_ids ?? [],
    };
    const response = await apiClient.post<Event>(API_ENDPOINTS.EVENTS.LIST, payload);
    return normalizeEvent(response.data);
  },

  update: async (id: number, data: UpdateEventDTO) => {
    const payload = {
      ...data,
      attachments_ids: data.attachments_ids ?? [],
      tag_ids: data.tag_ids ?? [],
    };
    const response = await apiClient.patch<Event>(API_ENDPOINTS.EVENTS.DETAIL(String(id)), payload);
    return normalizeEvent(response.data);
  },

  delete: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.EVENTS.DETAIL(String(id)));
  },
};

function normalizeEvent(event: any): Event {
  return {
    ...event,
    attachments: event.attachments || [],
    featured_media: event.featured_media ?? null,
    tags: event.tags || [],
  };
}
