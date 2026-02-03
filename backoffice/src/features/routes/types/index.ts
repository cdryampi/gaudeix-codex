/**
 * Types for the Routes feature.
 */
import { MediaItem } from "@/features/media/types";
import { Tag } from "@/features/tags/types";

export type RouteType = "walking" | "cycling" | "guided" | "mixed";
export type DifficultyLevel = "easy" | "moderate" | "difficult" | "expert";

export type RouteWaypoint = {
  id: number;
  place_id: number;
  place_slug: string;
  place_title: string;
  order: number;
  instructions?: string;
  distance_from_previous_km?: number;
};

export type Route = {
  id: number;
  slug: string;
  title: string;
  summary?: string;
  description?: string;
  instructions?: string;
  route_type: RouteType;
  difficulty: DifficultyLevel;
  distance_km?: number;
  duration_minutes?: number;
  duration_formatted?: string;
  elevation_gain?: number;
  elevation_loss?: number;
  start_latitude?: number;
  start_longitude?: number;
  end_latitude?: number;
  end_longitude?: number;
  is_circular: boolean;
  is_published: boolean;
  is_featured?: boolean;
  category?: number | null;
  category_slug?: string;
  category_name?: string;
  tags?: Tag[];
  featured_media?: MediaItem | null;
  gpx_file?: MediaItem | null;
  attachments?: MediaItem[];
  gallery?: MediaItem[];
  image_url?: string;
  waypoints_list?: RouteWaypoint[];
  track_geojson?: unknown;
  created_at?: string;
  updated_at?: string;
  translations?: {
    [lang: string]: {
      title: string;
      summary?: string;
      description?: string;
      instructions?: string;
    };
  };
};

export type CreateRouteDTO = {
  title: string;
  summary?: string;
  description?: string;
  instructions?: string;
  route_type?: RouteType;
  difficulty?: DifficultyLevel;
  distance_km?: number;
  duration_minutes?: number;
  elevation_gain?: number;
  elevation_loss?: number;
  start_latitude?: number;
  start_longitude?: number;
  end_latitude?: number;
  end_longitude?: number;
  is_circular?: boolean;
  is_published?: boolean;
  is_featured?: boolean;
  category_id?: number | null;
  tag_ids?: number[];
  featured_media_id?: number | null;
  gpx_file_id?: number | null;
  attachments_ids?: number[];
  gallery_ids?: number[];
  track_geojson?: unknown;
  translations?: {
    [lang: string]: {
      title: string;
      summary?: string;
      description?: string;
      instructions?: string;
    };
  };
};

export type UpdateRouteDTO = Partial<CreateRouteDTO>;
