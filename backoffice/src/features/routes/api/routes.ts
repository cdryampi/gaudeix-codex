/**
 * API client for Routes endpoints.
 */
import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
import { CreateRouteDTO, Route, UpdateRouteDTO } from "../types";

export const routesApi = {
  getAll: async () => {
    const response = await apiClient.get<Route[]>(
      API_ENDPOINTS.ROUTES_HIKING.LIST,
    );
    return response.data.map(normalizeRoute);
  },

  getBySlug: async (slug: string) => {
    const response = await apiClient.get<Route>(
      API_ENDPOINTS.ROUTES_HIKING.DETAIL(slug),
    );
    return normalizeRoute(response.data);
  },

  create: async (data: CreateRouteDTO) => {
    const payload = {
      ...data,
      attachments_ids: data.attachments_ids ?? [],
      gallery_ids: data.gallery_ids ?? [],
      tag_ids: data.tag_ids ?? [],
    };
    const response = await apiClient.post<Route>(
      API_ENDPOINTS.ROUTES_HIKING.LIST,
      payload,
    );
    return normalizeRoute(response.data);
  },

  update: async (slug: string, data: UpdateRouteDTO) => {
    const payload = {
      ...data,
      attachments_ids: data.attachments_ids ?? [],
      gallery_ids: data.gallery_ids ?? [],
      tag_ids: data.tag_ids ?? [],
    };
    const response = await apiClient.patch<Route>(
      API_ENDPOINTS.ROUTES_HIKING.DETAIL(slug),
      payload,
    );
    return normalizeRoute(response.data);
  },

  delete: async (slug: string) => {
    await apiClient.delete(API_ENDPOINTS.ROUTES_HIKING.DETAIL(slug));
  },

  autoTranslate: async (slug: string) => {
    const response = await apiClient.post<Route>(
      API_ENDPOINTS.ROUTES_HIKING.AUTO_TRANSLATE(slug),
    );
    return normalizeRoute(response.data);
  },

  generateGpx: async (slug: string) => {
    const response = await apiClient.post<Route>(
      API_ENDPOINTS.ROUTES_HIKING.GENERATE_GPX(slug),
    );
    return normalizeRoute(response.data);
  },
};

function normalizeRoute(route: Route): Route {
  return {
    ...route,
    attachments: route.attachments || [],
    gallery: route.gallery || [],
    featured_media: route.featured_media ?? null,
    gpx_file: route.gpx_file ?? null,
    tags: route.tags || [],
    waypoints_list: route.waypoints_list || [],
  };
}
