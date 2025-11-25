import { MediaItem } from "@/features/media/types";

export type Event = {
  id: number;
  slug: string;
  title: string;
  description?: string;
  start_at: string;
  end_at?: string | null;
  is_published: boolean;
  location_text?: string;
  featured_media?: MediaItem | null;
  attachments?: MediaItem[];
  created_at?: string;
  updated_at?: string;
};

export type CreateEventDTO = {
  title: string;
  description?: string;
  start_at: string;
  end_at?: string | null;
  is_published?: boolean;
  location_text?: string;
  featured_media_id?: number | null;
  attachments_ids?: number[];
};

export type UpdateEventDTO = Partial<CreateEventDTO>;
