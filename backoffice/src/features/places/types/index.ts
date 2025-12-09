import { MediaItem } from "@/features/media/types";

export type Place = {
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
  category?: number | null;
  template_key?: string | null;
  featured_media?: MediaItem | null;
  attachments?: MediaItem[];
  translations?: {
    [lang: string]: {
      title: string;
      description?: string;
    };
  };
};

export type PlacePayload = {
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
  category_id?: number | null;
  featured_media_id?: number | null;
  attachments_ids?: number[];
  translations?: {
    [lang: string]: {
      title: string;
      description?: string;
    };
  };
};

export type PlaceUpdatePayload = Partial<PlacePayload>;
