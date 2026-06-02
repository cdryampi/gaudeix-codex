import { Category } from "@/features/categories/types";
import { ImageFile, DocumentFile } from "@/features/media/types";

export interface StoryTranslation {
  title: string;
  summary?: string;
  content?: string;
  audio_file?: DocumentFile | null;
  audio_file_id?: number | null;
}

export interface Story {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  is_published: boolean;
  historical_period: string;
  reading_time: number;
  difficulty: string;
  category?: Category | null;
  category_id?: number | null;
  featured_media?: ImageFile | null;
  featured_media_id?: string | null;
  attachments?: DocumentFile[];
  attachments_ids?: string[];
  source_url?: string;
  source_name?: string;
  created_at?: string;
  updated_at?: string;
  translations?: Record<string, StoryTranslation>;
  audio_file?: DocumentFile | null;
  audio_file_id?: number | null;
}

export interface CreateStoryDTO {
  title: string;
  summary?: string;
  content?: string;
  is_published?: boolean;
  historical_period?: string;
  reading_time?: number;
  difficulty?: string;
  category_id?: number | null;
  featured_media_id?: string | null;
  attachments_ids?: string[];
  source_url?: string;
  source_name?: string;
  translations?: Record<string, StoryTranslation>;
  audio_file_id?: number | null;
}
