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

export type RouteCheckpoint = {
  id: number;
  order: number;
  title: string;
  description?: string;
  image_url?: string;
  lat?: number | null;
  lng?: number | null;
  is_active: boolean;
};

export type Route = {
  is_featured: boolean | undefined;
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
  category?: number | null;
  category_slug?: string;
  category_name?: string;
  ios_app_url?: string;
  android_app_url?: string;
  tags?: Tag[];
  featured_media?: MediaItem | null;
  gpx_file?: MediaItem | null;
  attachments?: MediaItem[];
  gallery?: MediaItem[];
  image_url?: string;
  waypoints_list?: RouteWaypoint[];
  checkpoints_list?: RouteCheckpoint[];
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
  ios_app_url?: string;
  android_app_url?: string;
  category_id?: number | null;
  tag_ids?: number[];
  featured_media_id?: number | null;
  gpx_file_id?: number | null;
  attachments_ids?: number[];
  gallery_ids?: number[];
  track_geojson?: unknown;
  waypoints_input?: {
    place_id: number;
    order: number;
    instructions?: string;
    distance_from_previous_km?: number | null;
  }[];
  checkpoints_input?: {
    order: number;
    title: string;
    description?: string;
    latitude?: number | null;
    longitude?: number | null;
    is_active?: boolean;
  }[];
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
