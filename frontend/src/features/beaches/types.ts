import { ImageFile, DocumentFile } from "@/features/events/types";
import { Place } from "@/features/places/types";

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

export type BeachBooleanMap = Partial<
  Record<BeachServiceKey | BeachAccessibilityKey, boolean>
>;

export interface Beach extends Place {
  featured_media: ImageFile | null;
  attachments: DocumentFile[];
  beach_type: BeachType;
  environment_summary: string;
  recommended_for: RecommendedForKey[];
  length_m: number | null;
  access_notes: string;
  parking_info: string;
  public_transport_info: string;
  services: Partial<Record<BeachServiceKey, boolean>>;
  accessibility_features: Partial<Record<BeachAccessibilityKey, boolean>>;
  gallery: ImageFile[];
}

export interface BeachListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Beach[];
}
