/**
 * Types for the Festes feature including Festa, Program, Venue and Sponsor entities.
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
  posters?: MediaItem[];
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
  poster_ids?: number[];
  program_pdf_id?: number | null;
  gallery_ids?: number[];
  event_ids?: number[];

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

// Program types
export type ProgramStatus = "draft" | "published";

export type Program = {
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
  translations?: {
    [lang: string]: {
      title: string;
      subtitle: string;
      description: string;
    };
  };
};

export type CreateProgramDTO = {
  festa_id: number;
  status: ProgramStatus;
  order?: number;
  start_date?: string | null;
  end_date?: string | null;
  translations: {
    [lang: string]: {
      title: string;
      subtitle?: string;
      description?: string;
    };
  };
};

export type UpdateProgramDTO = Partial<Omit<CreateProgramDTO, "festa_id">>;

// Venue types
export type Venue = {
  id: number;
  slug: string;
  name: string;
  description: string;
  address: string;
  postal_code: string | null;
  city: string;
  latitude: number | null;
  longitude: number | null;
  location: string; // computed from address/city
  is_published: boolean;
  is_accessible: boolean;
  created_at: string;
  updated_at: string;
  translations?: {
    [lang: string]: {
      name: string;
      description?: string;
    };
  };
};

export type CreateVenueDTO = {
  address: string;
  postal_code?: string | null;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  is_published?: boolean;
  is_accessible?: boolean;
  translations: {
    [lang: string]: {
      name: string;
      description?: string;
    };
  };
};

export type UpdateVenueDTO = Partial<CreateVenueDTO>;
