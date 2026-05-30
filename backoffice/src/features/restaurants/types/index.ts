import type { MediaItem } from "@/features/media/types";

export type CuisineType =
  | "mediterranean"
  | "italian"
  | "asian"
  | "fast_food"
  | "traditional"
  | "tapas"
  | "vegan"
  | "other";

export type RestaurantAmenities = {
  wifi?: boolean;
  terrace?: boolean;
  pet_friendly?: boolean;
  parking?: boolean;
  wheelchair_access?: boolean;
  takeaway?: boolean;
  kids_area?: boolean;
};

export type Restaurant = {
  id: number;
  slug: string;
  title: string;
  description?: string;
  location_text?: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string;
  email?: string;
  website?: string;
  booking_url?: string;
  is_published: boolean;
  featured_media?: MediaItem | null;
  attachments?: MediaItem[];
  cuisine_type: CuisineType;
  amenities: RestaurantAmenities;
  capacity?: number | null;
  translations?: {
    [lang: string]: { title: string; description?: string };
  };
};

export type RestaurantPayload = {
  title: string;
  description?: string;
  location_text?: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string;
  email?: string;
  website?: string;
  booking_url?: string;
  is_published?: boolean;
  featured_media_id?: number | null;
  cuisine_type: CuisineType;
  amenities?: RestaurantAmenities;
  capacity?: number | null;
  translations?: {
    [lang: string]: { title: string; description?: string };
  };
};

export type RestaurantUpdatePayload = Partial<RestaurantPayload>;
