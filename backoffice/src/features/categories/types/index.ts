import { MediaItem } from "@/features/media/types";

export type Category = {
  id: number;
  slug: string;
  taxonomy?: string;
  parent?: number | null;
  icon?: string;
  nombre: string;
  descripcion?: string;
  translations?: {
    [lang: string]: {
      nombre: string;
      descripcion?: string;
    };
  };
  created_at?: string;
  updated_at?: string;
  is_published?: boolean;
  featured_media_id?: number | null;
  featured_media?: MediaItem;
  attachments_ids?: number[];
  attachments?: MediaItem[];
  seo_title?: string;
  seo_description?: string;
};

export type CategoryPayload = {
  slug: string;
  taxonomy?: string;
  parent?: number | null;
  icon?: string;
  nombre: string;
  descripcion?: string;
  translations?: {
    [lang: string]: {
      nombre: string;
      descripcion?: string;
    };
  };
  is_published?: boolean;
  featured_media_id?: number | null;
  attachments_ids?: number[];
  seo_title?: string;
  seo_description?: string;
};

export type CategoryUpdatePayload = Partial<CategoryPayload>;
