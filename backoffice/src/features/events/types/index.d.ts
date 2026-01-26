import { MediaItem } from "@/features/media/types";
import { Tag } from "@/features/tags/types";
export type Event = {
  id: number;
  slug: string;
  title: string;
  summary?: string;
  description?: string;
  start_at: string;
  end_at?: string | null;
  is_published: boolean;
  venue_name?: string;
  location_text?: string;
  is_featured?: boolean;
  is_free?: boolean;
  price?: string | number | null;
  price_text?: string;
  category?: number | null;
  category_slug?: string;
  category_name?: string;
  tags?: Tag[];
  image_url?: string;
  featured_media?: MediaItem | null;
  attachments?: MediaItem[];
  created_at?: string;
  updated_at?: string;
  translations?: {
    [lang: string]: {
      title: string;
      summary?: string;
      description?: string;
    };
  };
};
export type CreateEventDTO = {
  title: string;
  summary?: string;
  description?: string;
  start_at: string;
  end_at?: string | null;
  is_published?: boolean;
  venue_name?: string;
  location_text?: string;
  is_featured?: boolean;
  is_free?: boolean;
  price?: string | number | null;
  price_text?: string;
  category_id?: number | null;
  tag_ids?: number[];
  featured_media_id?: number | null;
  attachments_ids?: number[];
  translations?: {
    [lang: string]: {
      title: string;
      summary?: string;
      description?: string;
    };
  };
};
export type UpdateEventDTO = Partial<CreateEventDTO>;
