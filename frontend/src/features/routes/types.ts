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
  track_geojson: object | null;

  // Status
  is_published: boolean;
  is_featured: boolean;

  // Categorization
  category: number;
  category_slug: string;
  category_name: string;
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
