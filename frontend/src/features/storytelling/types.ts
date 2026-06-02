import type { ImageFile } from "@/features/events/types";

export type StoryDifficulty = "easy" | "medium" | "hard" | string;

export interface Story {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  is_published: boolean;
  historical_period: string;
  reading_time: number;
  difficulty: StoryDifficulty;
  source_url?: string;
  source_name?: string;
  featured_media?: ImageFile | null;
  category?: number | null;
  audio_file?: {
    id: number;
    file: string;
    original_name: string;
    mime_type: string;
    size_bytes: number;
  } | null;
}
