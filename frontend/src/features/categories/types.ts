export interface ImageFile {
  id: number;
  file: string;
  variant_thumbnail: string;
  variant_medium: string;
  variant_large: string;
  original_name?: string;
}

export interface DocumentFile {
  id: number;
  file: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
}

export interface Category {
  id: number;
  slug: string;
  nombre: string;
  descripcion: string;
  taxonomy: string;
  parent: number | null;
  icon: string;
  is_published: boolean;
  featured_media: ImageFile | null;
  attachments: DocumentFile[];
  created_at: string;
  updated_at: string;
}

export interface CategoryListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Category[];
}
