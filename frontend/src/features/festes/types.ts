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
