import { apiGet } from "@/lib/api";
import { Event, EventListResponse } from "./types";

export const getEvents = async (
  params?: Record<string, any>,
): Promise<EventListResponse | Event[]> => {
  const queryString = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)]),
      ).toString()
    : "";
  return apiGet<EventListResponse | Event[]>(`/events/${queryString}`);
};

export const getEventBySlug = async (slug: string): Promise<Event> => {
  return apiGet<Event>(`/events/${slug}/`);
};

export const getFeaturedEvents = async (): Promise<Event[]> => {
  const params = new URLSearchParams({ is_featured: "true", page_size: "3" });
  const response = await apiGet<EventListResponse | Event[]>(
    `/events/?${params.toString()}`,
  );
  if (Array.isArray(response)) {
    return response;
  }
  return response.results;
};
