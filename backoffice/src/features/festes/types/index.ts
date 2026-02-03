/**
 * Types for the Festes feature.
 */
import { MediaItem } from "@/features/media/types";
import { Tag } from "@/features/tags/types";
import { Event } from "@/features/events/types";

export type SponsorTier =
  | "platinum"
  | "gold"
  | "silver"
  | "bronze"
  | "collaborator";

export type Sponsor = {
  id: number;
  name: string;
  logo?: MediaItem | null;
  website?: string;
  tier: SponsorTier;
  order: number;
};

export type Festa = {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  summary?: string;
  description?: string;
  program_text?: string;
  start_date: string;
  end_date: string;
  year: number;
  is_published: boolean;
  is_featured?: boolean;
  is_current: boolean;
  category?: number | null;
  category_slug?: string;
  category_name?: string;
  tags?: Tag[];
  featured_media?: MediaItem | null;
  poster?: MediaItem | null;
  program_pdf?: MediaItem | null;
  gallery?: MediaItem[];
  sponsors?: Sponsor[];
  events?: Event[];
  events_count?: number;
  duration_days?: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  translations?: {
    [lang: string]: {
      title: string;
      subtitle?: string;
      summary?: string;
      description?: string;
      program_text?: string;
    };
  };
};

export type CreateFestaDTO = {
  title: string;
  subtitle?: string;
  summary?: string;
  description?: string;
  program_text?: string;
  start_date: string;
  end_date: string;
  year: number;
  is_published?: boolean;
  is_featured?: boolean;
  is_current?: boolean;
  category_id?: number | null;
  tag_ids?: number[];
  featured_media_id?: number | null;
  poster_id?: number | null;
  program_pdf_id?: number | null;
  gallery_ids?: number[];
  translations?: {
    [lang: string]: {
      title: string;
      subtitle?: string;
      summary?: string;
      description?: string;
      program_text?: string;
    };
  };
};

export type UpdateFestaDTO = Partial<CreateFestaDTO>;

export type CreateSponsorDTO = {
  festa: number;
  name: string;
  logo_id?: number | null;
  website?: string;
  tier?: SponsorTier;
  order?: number;
};

export type UpdateSponsorDTO = Partial<Omit<CreateSponsorDTO, "festa">>;
