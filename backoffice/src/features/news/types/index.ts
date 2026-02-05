/**
 * News feature TypeScript types
 */
import { MediaItem } from "@/features/media/types";

/**
 * Frontend News type - uses frontend field names
 */
export type News = {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  is_published: boolean;
  is_featured?: boolean;
  publish_date?: string | null;
  category?: number | null;
  category_slug?: string;
  category_name?: string;
  featured_media?: MediaItem | null;
  attachments?: MediaItem[];
  created_at?: string;
  updated_at?: string;
  translations?: {
    [lang: string]: {
      title: string;
      excerpt?: string;
      content?: string;
    };
  };
};

/**
 * Backend API response type - uses backend field names
 */
export type NewsApiResponse = {
  id: number;
  slug: string;
  title: string;
  summary?: string;
  body?: string;
  is_published: boolean;
  is_featured?: boolean;
  published_at?: string | null;
  category?: number | null;
  category_slug?: string;
  category_name?: string;
  featured_media?: MediaItem | null;
  attachments?: MediaItem[];
  fecha_creacion?: string;
  fecha_modificacion?: string;
  translations?: {
    [lang: string]: {
      title: string;
      summary?: string;
      body?: string;
    };
  };
};

export type CreateNewsDTO = {
  title: string;
  excerpt?: string;
  content?: string;
  is_published?: boolean;
  is_featured?: boolean;
  publish_date?: string | null;
  category_id?: number | null;
  featured_media_id?: number | null;
  attachments_ids?: number[];
  translations?: {
    [lang: string]: {
      title: string;
      excerpt?: string;
      content?: string;
    };
  };
};

export type UpdateNewsDTO = Partial<CreateNewsDTO>;
