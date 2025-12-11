export type StaticPage = {
  id: number;
  slug: string;
  template: StaticPageTemplate;
  is_published: boolean;
  titulo: string;
  cuerpo?: string;
  translations?: {
    [lang: string]: {
      titulo: string;
      cuerpo?: string;
    };
  };
  featured_media?: LinkedImage | null;
  attachment?: LinkedDocument | null;
  featured_media_id?: number | null;
  attachment_id?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type StaticPagePayload = {
  slug: string;
  template: StaticPageTemplate;
  is_published?: boolean;
  titulo: string;
  cuerpo?: string;
  translations?: {
    [lang: string]: {
      titulo: string;
      cuerpo?: string;
    };
  };
  featured_media_id?: number | null;
  attachment_id?: number | null;
};

export type StaticPageUpdatePayload = Partial<StaticPagePayload>;

export type StaticPageTemplate =
  | "info_point"
  | "privacy"
  | "legal_notice"
  | "cookies"
  | "contact"
  | "inclusion";

export type LinkedImage = {
  id: number;
  original_name: string;
  file: string;
  mime_type?: string;
  variant_thumbnail?: string;
  thumbnail_url?: string;
};

export type LinkedDocument = {
  id: number;
  original_name: string;
  file: string;
  mime_type?: string;
};
