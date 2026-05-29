export interface ThemeConfig {
  primary?: string;
  secondary?: string;
  accent?: string;
  background_light?: string;
  background_dark?: string;
  surface?: string;
  surface_muted?: string;
  text_primary?: string;
  text_secondary?: string;
  radius_scale?: number;
  shadow_preset?: "none" | "sm" | "md" | "lg";
  theme_preset?: "classic" | "modern" | "vibrant" | "oceanic" | "sunset";
}

export interface SiteSettings {
  id: number;
  site_name: string;
  tagline: string;
  address: string;
  phone: string;
  contact_email: string;
  latitude: number | null;
  longitude: number | null;
  maps_base_url: string;
  is_alert_active?: boolean;
  alert_message?: string;
  alert_link?: string;
  current_weather?: {
    tempmax: number;
    tempmin: number;
    weather_code: number;
    precip_prob: number;
    datetime: string;
  } | null;
  theme_config?: ThemeConfig;
}

export interface LinkedImage {
  id: number;
  original_name: string;
  file: string;
  mime_type?: string;
  variant_thumbnail?: string;
  thumbnail_url?: string;
}

export type FooterLinkSection = "explore" | "institutional";
export type FooterLinkType = "category" | "static_page" | "custom";

export interface FooterLink {
  id: number;
  section: FooterLinkSection;
  order: number;
  type: FooterLinkType;
  label: string;
  url: string;
  category: { id: number; slug: string; nombre: string } | null;
  static_page: { id: number; slug: string; titulo: string } | null;
}

export interface FooterBadge {
  id: number;
  title: string;
  alt_text: string;
  url: string;
  image: LinkedImage | null;
  order: number;
}

export interface FooterLegalBlock {
  privacy_page?: {
    id: number;
    slug: string;
    template: string;
    titulo: string;
  } | null;
  cookies_page?: {
    id: number;
    slug: string;
    template: string;
    titulo: string;
  } | null;
  legal_page?: {
    id: number;
    slug: string;
    template: string;
    titulo: string;
  } | null;
  inclusion_page?: {
    id: number;
    slug: string;
    template: string;
    titulo: string;
  } | null;
}

export interface FooterPublicPayload {
  id: number;
  eyebrow: string;
  title: string;
  description: string;
  show_social_links: boolean;
  show_contact_block: boolean;
  show_badges_block: boolean;
  copyright_text: string;
  branding: {
    site_name: string;
    tagline: string;
    logo: LinkedImage | null;
    logo_dark: LinkedImage | null;
    favicon: LinkedImage | null;
  };
  contact: {
    phone: string;
    support_email: string;
    contact_email: string;
    address: string;
    schedule: string;
    maps_base_url: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  social: {
    facebook_url: string;
    instagram_url: string;
    twitter_url: string;
    youtube_url: string;
  };
  legal: FooterLegalBlock;
  links: Record<FooterLinkSection, FooterLink[]>;
  badges: FooterBadge[];
}
