import { apiGet } from "@/lib/api";
import { SiteSettings } from "../types";

export const getSiteSettings = async (): Promise<SiteSettings> => {
  return apiGet<SiteSettings>("/site-settings/");
};
