import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { Event, EventListResponse } from "./types";

export const getEvents = async (
  params?: Record<string, any>,
): Promise<EventListResponse | Event[]> => {
  const cleanParams = Object.fromEntries(
    Object.entries(params ?? {}).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
  const searchParams = new URLSearchParams(
    Object.entries(cleanParams).map(([key, value]) => [key, String(value)]),
  );
  const queryString = searchParams.toString()
    ? `?${searchParams.toString()}`
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

export const getFavorites = async (token: string): Promise<Event[]> => {
  const response = await apiGet<EventListResponse | Event[]>(
    "/events/favorites/",
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (Array.isArray(response)) return response;
  return response.results;
};

export const addFavorite = async (
  slug: string,
  token: string,
): Promise<unknown> =>
  apiPost(
    `/events/${slug}/favorite/`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

export const removeFavorite = async (
  slug: string,
  token: string,
): Promise<unknown> =>
  apiDelete(`/events/${slug}/favorite/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
