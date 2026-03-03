/**
 * API functions for the Routes feature.
 * Consumes /api/v1/routes/ endpoints.
 */

import { apiGet } from "@/lib/api";
import { Route, RouteListResponse, RouteFilters } from "./types";

export const getRoutes = async (
  params?: RouteFilters & Record<string, unknown>,
): Promise<RouteListResponse | Route[]> => {
  const cleanParams: Record<string, string> = {};

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "all") {
        cleanParams[k] = String(v);
      }
    });
  }

  const queryString = Object.keys(cleanParams).length
    ? "?" + new URLSearchParams(cleanParams).toString()
    : "";

  return apiGet<RouteListResponse | Route[]>(`/routes/${queryString}`);
};

export const getRouteBySlug = async (slug: string): Promise<Route> => {
  return apiGet<Route>(`/routes/${slug}/`);
};

export const getRouteItinerary = async (
  slug: string,
): Promise<import("./types").RouteItineraryResponse> => {
  return apiGet<import("./types").RouteItineraryResponse>(
    `/routes/${slug}/itinerary/`,
  );
};

export const getFeaturedRoutes = async (): Promise<Route[]> => {
  const params = new URLSearchParams({
    is_published: "true",
    is_featured: "true",
    limit: "6",
  });
  const response = await apiGet<RouteListResponse | Route[]>(
    `/routes/?${params.toString()}`,
  );
  if (Array.isArray(response)) {
    return response;
  }
  return response.results;
};
