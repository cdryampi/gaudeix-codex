import { StaticPage } from "@/features/static-pages/types";

export type ThemeConfig = {
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
};

export type BuildJob = {
  id: number;
  status: "pending" | "running" | "success" | "failed";
  created_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  error_message?: string;
  theme_config: ThemeConfig;
};

export type LinkedImage = {
  id: number;
  original_name: string;
  file: string;
  mime_type?: string;
  variant_thumbnail?: string;
  thumbnail_url?: string;
};

export type SiteSettings = {
  id?: number;
  site_name: string;
  tagline: string;
  logo?: LinkedImage | null;
  logo_id?: number | null;
  logo_dark?: LinkedImage | null;
  logo_dark_id?: number | null;
  favicon?: LinkedImage | null;
  favicon_id?: number | null;
  phone: string;
  support_email: string;
  contact_email: string;
  address: string;
  schedule: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  youtube_url: string;
  video_enabled: boolean;
  video_title: string;
  video_description_internal: string;
  background_video?: LinkedVideo | null;
  background_video_id?: number | null;
  maps_base_url: string;
  analytics_id: string;
  captcha_site_key: string;
  show_language_switcher: boolean;
  show_social_footer: boolean;
  privacy_page?: StaticPage | null;
  privacy_page_id?: number | null;
  cookies_page?: StaticPage | null;
  cookies_page_id?: number | null;
  legal_page?: StaticPage | null;
  legal_page_id?: number | null;
  inclusion_page?: StaticPage | null;
  inclusion_page_id?: number | null;
  default_metatitle: string;
  default_metadescription: string;
  default_og_image?: LinkedImage | null;
  default_og_image_id?: number | null;
  alert_enabled?: boolean;
  alert_message?: string;
  alert_type?: "info" | "success" | "warning" | "danger";
  alert_link?: string;
  alert_start_at?: string | null;
  alert_end_at?: string | null;
  is_alert_active?: boolean;
  theme_config?: ThemeConfig;
  theme_config_published?: ThemeConfig;
};

export type LinkedVideo = {
  id: number;
  original_name: string;
  file: string;
  mime_type?: string;
};

export type SiteSettingsPayload = Partial<SiteSettings>;

export type FooterLinkSection = "explore" | "institutional";

export type FooterLinkType = "category" | "static_page" | "custom";

export type FooterSettings = {
  id: number;
  site_settings_id: number;
  eyebrow: string;
  title: string;
  description: string;
  show_social_links: boolean;
  show_contact_block: boolean;
  show_badges_block: boolean;
  copyright_text: string;
};

export type FooterSettingsPayload = Partial<
  Omit<FooterSettings, "id" | "site_settings_id">
>;

export type FooterLink = {
  id: number;
  footer_settings_id: number;
  section: FooterLinkSection;
  order: number;
  is_active: boolean;
  type: FooterLinkType;
  label: string;
  url: string;
  category?: import("@/features/categories/types").Category | null;
  category_id?: number | null;
  static_page?: StaticPage | null;
  static_page_id?: number | null;
};

export type FooterLinkPayload = Partial<
  Omit<FooterLink, "id" | "footer_settings_id" | "category" | "static_page">
>;

export type FooterBadge = {
  id: number;
  footer_settings_id: number;
  title: string;
  alt_text: string;
  url: string;
  image?: LinkedImage | null;
  image_id?: number | null;
  order: number;
  is_active: boolean;
};

export type FooterBadgePayload = Partial<
  Omit<FooterBadge, "id" | "footer_settings_id" | "image">
>;

export type FooterLegalBlock = {
  privacy_page?: Pick<StaticPage, "id" | "slug" | "template" | "titulo"> | null;
  cookies_page?: Pick<StaticPage, "id" | "slug" | "template" | "titulo"> | null;
  legal_page?: Pick<StaticPage, "id" | "slug" | "template" | "titulo"> | null;
  inclusion_page?: Pick<
    StaticPage,
    "id" | "slug" | "template" | "titulo"
  > | null;
};

export type FooterPublicPayload = {
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
    logo?: LinkedImage | null;
    logo_dark?: LinkedImage | null;
    favicon?: LinkedImage | null;
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
  links: Record<
    FooterLinkSection,
    Omit<
      FooterLink,
      "footer_settings_id" | "is_active" | "category_id" | "static_page_id"
    >[]
  >;
  badges: Omit<FooterBadge, "footer_settings_id" | "is_active" | "image_id">[];
};
