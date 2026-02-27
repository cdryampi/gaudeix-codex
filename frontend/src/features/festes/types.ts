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
  posters: ImageFile[];
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
