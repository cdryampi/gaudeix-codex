import { apiGet } from "@/lib/api";
import { SiteSettings } from "../types";
export { getFooterPublic } from "./footerApi";

export const getSiteSettings = async (): Promise<SiteSettings> => {
  return apiGet<SiteSettings>("/site-settings/");
};
