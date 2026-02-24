/**
 * TypeScript interfaces for the Festes (Festivals) feature.
 * Matches backend API responses from /api/v1/festes/
 */

import { ImageFile, DocumentFile, Tag, Event } from "@/features/events/types";

export type SponsorTier =
  | "platinum"
  | "gold"
  | "silver"
  | "bronze"
  | "collaborator";

export interface Sponsor {
  id: number;
  name: string;
  logo: ImageFile | null;
  website: string;
  tier: SponsorTier;
  order: number;
}

export interface Festa {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  description: string;
  program_text: string;

  // Dates
  start_date: string;
  end_date: string;
  year: number;
  duration_days: number;

  // Status
  is_published: boolean;
  is_featured: boolean;
  is_current: boolean;

  // Categorization
  category: number;
  category_slug: string;
  category_name: string;
  tags: Tag[];

  // Media
  featured_media: ImageFile | null;
  poster: ImageFile | null;
  program_pdf: DocumentFile | null;
  gallery: ImageFile[];
  image_url: string;

  // Related
  sponsors: Sponsor[];
  events?: Event[];
  events_count: number;

  // Metadata
  created_at: string;
  updated_at: string;
}

export interface FestaListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Festa[];
}

export interface FestaFilters {
  year?: number;
  is_published?: boolean;
  is_current?: boolean;
}


// ============================================================================
// Program Types
// ============================================================================

export type ProgramStatus = "draft" | "published";

export interface ProgramTranslations {
  [languageCode: string]: {
    title: string;
    subtitle?: string;
    description?: string;
  };
}

export interface Program {
  id: number;
  slug: string;
  festa: number;
  festa_slug: string;
  title: string;
  subtitle: string;
  description: string;
  status: ProgramStatus;
  is_published: boolean;
  order: number;
  start_date: string | null;
  end_date: string | null;
  activities_count: number;
  created_at: string;
  updated_at: string;
  translations?: ProgramTranslations;
}

export interface ProgramListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Program[];
}

export interface ProgramFilters {
  festa?: number | string;
  is_published?: boolean | string;
  status?: ProgramStatus;
  ordering?: string;
}

// ============================================================================
// Venue Types
// ============================================================================

export interface VenueTranslations {
  [languageCode: string]: {
    name: string;
    description?: string;
  };
}

export interface Venue {
  id: number;
  slug: string;
  name: string;
  description: string;
  address: string;
  postal_code: string | null;
  city: string;
  latitude: number | null;
  longitude: number | null;
  location: string;
  is_published: boolean;
  is_accessible: boolean;
  created_at: string;
  updated_at: string;
  translations?: VenueTranslations;
}

export interface VenueListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Venue[];
}

export interface VenueFilters {
  is_published?: boolean | string;
  is_accessible?: boolean | string;
  city?: string;
  search?: string;
}

// ============================================================================
// Activity Types
// ============================================================================

export type ActivityStatus = "draft" | "published" | "cancelled";

export interface ActivityTranslations {
  [languageCode: string]: {
    title: string;
    summary?: string;
    description?: string;
  };
}

export interface Activity {
  id: number;
  slug: string;
  festa: number;
  festa_slug: string;
  program: number;
  program_slug: string;
  venue: number | null;
  venue_slug: string | null;
  venue_name: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  location: string;
  start_at: string;
  end_at: string;
  is_free: boolean;
  price: number | null;
  price_text: string;
  ticket_url: string | null;
  status: ActivityStatus;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  translations?: ActivityTranslations;
}

export interface ActivityListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Activity[];
}

export interface ActivityFilters {
  festa?: number | string;
  program?: number | string;
  venue?: number | string;
  date_from?: string;
  date_to?: string;
  category?: string;
  location?: string;
  is_free?: boolean | string;
  search?: string;
  is_published?: boolean | string;
  status?: ActivityStatus;
  ordering?: string;
}