/**
 * TypeScript interfaces for the Routes feature.
 * Matches backend API responses from /api/v1/routes/
 */

import { ImageFile, DocumentFile, Tag } from "@/features/events/types";

export type RouteType = "walking" | "cycling" | "guided" | "mixed";
export type RouteDifficulty = "easy" | "moderate" | "difficult" | "expert";

export interface RouteWaypoint {
  id: number;
  place_id: number;
  place_slug: string;
  place_title: string;
  order: number;
  instructions: string;
  distance_from_previous_km: number | null;
}

export interface RouteCheckpoint {
  id: number;
  order: number;
  title: string;
  description: string;
  image_url: string;
  lat: number | null;
  lng: number | null;
  is_active: boolean;
}

export interface RouteBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface RouteSegment {
  from_order: number;
  to_order: number;
  distance_km: number | null;
  duration_minutes: number | null;
}

export interface RouteItinerarySummary {
  distance_km: number | null;
  duration_minutes: number | null;
  elevation_gain: number | null;
  elevation_loss: number | null;
  waypoints_count: number;
  checkpoints_count: number;
}

export interface RouteItineraryResponse {
  route: {
    id: number;
    slug: string;
    title: string;
    route_type: RouteType;
    difficulty: RouteDifficulty;
    is_circular: boolean;
  };
  start: { lat: number; lng: number } | null;
  end: { lat: number; lng: number } | null;
  bounds: RouteBounds | null;
  track_geojson: Record<string, any> | null; // GeoJSON Object
  waypoints: RouteWaypoint[];
  checkpoints: RouteCheckpoint[];
  segments: RouteSegment[];
  summary: RouteItinerarySummary;
}

// Alias for convenience
export type RouteItinerary = RouteItineraryResponse;

export interface Route {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  instructions: string;

  // Route characteristics
  route_type: RouteType;
  difficulty: RouteDifficulty;
  distance_km: number | null;
  duration_minutes: number | null;
  duration_formatted: string;
  elevation_gain: number | null;
  elevation_loss: number | null;

  // Geo data
  start_latitude: number | null;
  start_longitude: number | null;
  end_latitude: number | null;
  end_longitude: number | null;
  is_circular: boolean;
  track_geojson: Record<string, any> | null;

  // Status
  is_published: boolean;
  is_featured: boolean;

  // Categorization
  category: number;
  category_slug: string;
  category_name: string;
  ios_app_url?: string;
  android_app_url?: string;
  tags: Tag[];

  // Media
  featured_media: ImageFile | null;
  gpx_file: DocumentFile | null;
  attachments: DocumentFile[];
  gallery: ImageFile[];
  image_url: string;

  // Waypoints
  waypoints_list: RouteWaypoint[];

  // Metadata
  created_at: string;
  updated_at: string;
}

export interface RouteListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Route[];
}

export interface RouteFilters {
  difficulty?: RouteDifficulty | "all";
  route_type?: RouteType | "all";
  is_published?: boolean;
  is_featured?: boolean;
  search?: string;
}
