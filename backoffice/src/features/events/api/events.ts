import apiClient from "@/lib/api/client";
import { CreateEventDTO, Event, UpdateEventDTO } from "../types";

export const eventsApi = {
  getAll: async () => {
    const response = await apiClient.get<Event[]>("/events/");
    return response.data.map(normalizeEvent);
  },

  getById: async (id: number) => {
    const response = await apiClient.get<Event>(`/events/${id}/`);
    return normalizeEvent(response.data);
  },

  create: async (data: CreateEventDTO) => {
    const payload = {
      ...data,
      attachments_ids: data.attachments_ids ?? [],
    };
    const response = await apiClient.post<Event>("/events/", payload);
    return normalizeEvent(response.data);
  },

  update: async (id: number, data: UpdateEventDTO) => {
    const payload = {
      ...data,
      attachments_ids: data.attachments_ids ?? [],
    };
    const response = await apiClient.patch<Event>(`/events/${id}/`, payload);
    return normalizeEvent(response.data);
  },

  delete: async (id: number) => {
    await apiClient.delete(`/events/${id}/`);
  },
};

function normalizeEvent(event: any): Event {
  return {
    ...event,
    attachments: event.attachments || [],
    featured_media: event.featured_media ?? null,
  };
}
