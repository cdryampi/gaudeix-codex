import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
import { CreateEventDTO, Event, UpdateEventDTO } from "../types";

export const eventsApi = {
  getAll: async (params?: { exclude_children?: boolean }) => {
    const response = await apiClient.get<Event[]>(API_ENDPOINTS.EVENTS.LIST, {
      params: {
        exclude_children: params?.exclude_children,
      },
    });
    return response.data.map(normalizeEvent);
  },

  getById: async (id: number) => {
    const response = await apiClient.get<Event>(
      API_ENDPOINTS.EVENTS.DETAIL(String(id)),
    );
    return normalizeEvent(response.data);
  },

  getOccurrences: async (id: number) => {
    // This endpoint now returns EventDate[] objects
    const response = await apiClient.get<any[]>(
      `${API_ENDPOINTS.EVENTS.DETAIL(String(id))}occurrences/`,
    );
    return response.data; // Already in correct format or needing minimal transform
  },

  create: async (data: CreateEventDTO) => {
    const payload = {
      ...data,
      attachments_ids: data.attachments_ids ?? [],
      tag_ids: data.tag_ids ?? [],
    };
    const response = await apiClient.post<Event>(
      API_ENDPOINTS.EVENTS.LIST,
      payload,
    );
    return normalizeEvent(response.data);
  },

  update: async (id: number, data: UpdateEventDTO) => {
    const payload = {
      ...data,
      attachments_ids: data.attachments_ids ?? [],
      tag_ids: data.tag_ids ?? [],
    };
    const response = await apiClient.patch<Event>(
      API_ENDPOINTS.EVENTS.DETAIL(String(id)),
      payload,
    );
    return normalizeEvent(response.data);
  },

  delete: async (id: number) => {
    await apiClient.delete(API_ENDPOINTS.EVENTS.DETAIL(String(id)));
  },

  getTopFavorites: async (limit = 5) => {
    // Fetch events ordered by favorites_count descending
    const response = await apiClient.get<any>(API_ENDPOINTS.EVENTS.LIST, {
      params: { page_size: limit, ordering: "-favorites_count" },
    });
    const items = Array.isArray(response.data)
      ? response.data
      : (response.data.results ?? []);
    return items.slice(0, limit).map(normalizeEvent);
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
