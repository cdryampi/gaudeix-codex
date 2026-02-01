import { ImageFile, DocumentFile } from "../events/types";

export interface Place {
  id: number;
  slug: string;
  title: string;
  description: string;
  location_text: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  email: string;
  website: string;
  booking_url: string;
  is_published: boolean;
  category: number;
  template_key: string | null;
  featured_media: ImageFile | null;
  attachments: DocumentFile[];
  created_at: string;
  updated_at: string;
}

export interface Restaurant extends Place {
  cuisine_type: string;
  amenities: string;
  capacity: number | null;
}

export interface Accommodation extends Place {
  type: string;
  stars: number | null;
  amenities: string;
  check_in_time: string | null;
  check_out_time: string | null;
}

export interface PlaceListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Place[];
}
