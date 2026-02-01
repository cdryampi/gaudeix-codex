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
}
