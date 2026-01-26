import { SiteSettings, SiteSettingsUploadPayload } from "../types";
export declare const siteSettingsApi: {
  get(): Promise<SiteSettings>;
  update(payload: SiteSettingsUploadPayload): Promise<SiteSettings>;
};
