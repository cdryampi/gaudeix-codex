import { apiGet } from "@/lib/api";
import { Place, PlaceListResponse } from "./types";

export const getPlaces = async (
  params?: Record<string, any>,
): Promise<PlaceListResponse | Place[]> => {
  const cleanParams: Record<string, string> = {};
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        cleanParams[k] = String(v);
      }
    });
  }

  const queryString = Object.keys(cleanParams).length
    ? "?" + new URLSearchParams(cleanParams).toString()
    : "";

  return apiGet<PlaceListResponse | Place[]>(`/places/${queryString}`);
};

export const getPlaceBySlug = async (slug: string): Promise<Place> => {
  return apiGet<Place>(`/places/${slug}/`);
};

export const getFeaturedPlaces = async (): Promise<Place[]> => {
  const params = new URLSearchParams({ is_published: "true", limit: "6" });
  const response = await apiGet<PlaceListResponse | Place[]>(
    `/places/?${params.toString()}`,
  );
  if (Array.isArray(response)) {
    return response;
  }
  return response.results;
};
