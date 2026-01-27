export interface EventDate {
  id: number;
  start_at: string;
  end_at: string | null;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface ImageFile {
  id: string;
  file: string;
  thumbnail: string;
  medium: string;
  large: string;
  title?: string;
}

export interface DocumentFile {
  id: string;
  file: string;
  title: string;
  file_size?: number;
}

export interface Event {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;

  // Dates
  start_at: string;
  end_at: string | null;
  dates: EventDate[];

  // Categorization
  category: number; // ID
  category_name: string;
  category_slug: string;
  tags: Tag[];

  // Location
  venue_name: string;
  location_text: string;

  // Details
  is_published: boolean;
  is_featured: boolean;
  is_free: boolean;
  price: string | null;
  price_text: string;
  points_value: number;

  // Media
  featured_media: ImageFile | null;
  image_url: string;
  attachments: DocumentFile[];

  // Metadata
  created_at: string;
  updated_at: string;

  // User specific
  is_favorited?: boolean;
  favorites_count?: number;
}

export interface EventListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Event[];
}
