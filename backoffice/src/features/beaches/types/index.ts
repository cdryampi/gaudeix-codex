import { MediaItem } from "@/features/media/types";

export type BeachType = "urban" | "cove" | "natural";

export type RecommendedForKey =
  | "families"
  | "swimming"
  | "snorkeling"
  | "quiet_visit"
  | "sunset";

export type BeachServiceKey =
  | "showers"
  | "foot_wash"
  | "toilets"
  | "lifeguard_point"
  | "sunbeds"
  | "beach_bar";

export type BeachAccessibilityKey =
  | "accessible_access"
  | "accessible_walkway"
  | "assisted_bath"
  | "amphibious_chair"
  | "adapted_toilet";

export type BeachBooleanMap = Record<string, boolean>;

export type Beach = {
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
  template_key?: string | null;
  featured_media?: MediaItem | null;
  attachments?: MediaItem[];
  beach_type: BeachType;
  environment_summary?: string;
  recommended_for: RecommendedForKey[];
  length_m?: number | null;
  access_notes?: string;
  parking_info?: string;
  public_transport_info?: string;
  services: BeachBooleanMap;
  accessibility_features: BeachBooleanMap;
  gallery?: MediaItem[];
  translations?: {
    [lang: string]: {
      title: string;
      description?: string;
    };
  };
};

export type BeachPayload = {
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
  gallery_ids?: number[];
  beach_type: BeachType;
  environment_summary?: string;
  recommended_for?: RecommendedForKey[];
  length_m?: number | null;
  access_notes?: string;
  parking_info?: string;
  public_transport_info?: string;
  services?: BeachBooleanMap;
  accessibility_features?: BeachBooleanMap;
  translations?: {
    [lang: string]: {
      title: string;
      description?: string;
    };
  };
};

export type BeachUpdatePayload = Partial<BeachPayload>;
