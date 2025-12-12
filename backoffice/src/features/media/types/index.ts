export type MediaType = "image" | "document" | "video";

export type MediaItem = {
  id: number;
  type: MediaType;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  file: string;
  created_at?: string;
  updated_at?: string;
  // Images
  variant_thumbnail?: string;
  variant_medium?: string;
  variant_large?: string;
  thumbnail_url?: string;
  // Videos (no variantes específicas)
};
