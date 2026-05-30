import type { MediaItem } from "@/features/media/types";

export type AccommodationType =
  | "hotel"
  | "hostel"
  | "apartment"
  | "campsite"
  | "rural"
  | "other";

export type AccommodationAmenities = {
  wifi?: boolean;
  pool?: boolean;
  parking?: boolean;
  ac?: boolean;
  heating?: boolean;
  breakfast?: boolean;
  gym?: boolean;
  spa?: boolean;
  pets_allowed?: boolean;
  wheelchair_access?: boolean;
};

export type Accommodation = {
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
  type: AccommodationType;
  stars?: number | null;
  amenities: AccommodationAmenities;
  check_in_time?: string | null;
  check_out_time?: string | null;
  translations?: {
    [lang: string]: { title: string; description?: string };
  };
};

export type AccommodationPayload = {
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
  type: AccommodationType;
  stars?: number | null;
  amenities?: AccommodationAmenities;
  check_in_time?: string | null;
  check_out_time?: string | null;
  translations?: {
    [lang: string]: { title: string; description?: string };
  };
};

export type AccommodationUpdatePayload = Partial<AccommodationPayload>;
