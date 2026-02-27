/**
 * API functions for the Festes (Festivals) feature.
 * Consumes /api/v1/festes/ endpoints.
 */

import { apiGet } from "@/lib/api";
import { Festa, FestaListResponse, FestaFilters } from "./types";

export const getFestes = async (
  params?: FestaFilters & Record<string, unknown>,
): Promise<FestaListResponse | Festa[]> => {
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

  return apiGet<FestaListResponse | Festa[]>(`/festes/${queryString}`);
};

export const getFestaBySlug = async (slug: string): Promise<Festa> => {
  return apiGet<Festa>(`/festes/${slug}/`);
};

export const getCurrentFesta = async (): Promise<Festa | null> => {
  try {
    return await apiGet<Festa>("/festes/current/");
  } catch {
    // No current festa set
    return null;
  }
};

export const getFeaturedFestes = async (): Promise<Festa[]> => {
  const params = new URLSearchParams({
    is_published: "true",
    limit: "6",
  });
  const response = await apiGet<FestaListResponse | Festa[]>(
    `/festes/?${params.toString()}`,
  );
  if (Array.isArray(response)) {
    return response;
  }
  return response.results;
};

import {
  Program,
  ProgramListResponse,
  ProgramFilters,
  Venue,
  VenueListResponse,
  VenueFilters,
} from "./types";

// ============================================================================
// Program API Functions
// ============================================================================

export const getPrograms = async (
  params?: ProgramFilters & Record<string, unknown>,
): Promise<ProgramListResponse> => {
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

  return apiGet<ProgramListResponse>(`/programs/${queryString}`);
};

export const getProgramBySlug = async (slug: string): Promise<Program> => {
  return apiGet<Program>(`/programs/${slug}/`);
};

export const getProgramsByFesta = async (
  festaSlug: string,
  params?: Omit<ProgramFilters, "festa">,
): Promise<ProgramListResponse> => {
  const cleanParams: Record<string, string> = { festa: festaSlug };

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        cleanParams[k] = String(v);
      }
    });
  }

  const queryString = "?" + new URLSearchParams(cleanParams).toString();
  return apiGet<ProgramListResponse>(`/programs/${queryString}`);
};

// ============================================================================
// Venue API Functions
// ============================================================================

export const getVenues = async (
  params?: VenueFilters & Record<string, unknown>,
): Promise<VenueListResponse> => {
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

  return apiGet<VenueListResponse>(`/venues/${queryString}`);
};

export const getVenueBySlug = async (slug: string): Promise<Venue> => {
  return apiGet<Venue>(`/venues/${slug}/`);
};
