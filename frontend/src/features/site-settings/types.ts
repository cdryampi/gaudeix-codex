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
}
