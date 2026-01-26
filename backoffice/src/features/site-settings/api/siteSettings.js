import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";
export const siteSettingsApi = {
  async get() {
    const response = await apiClient.get(
      API_ENDPOINTS.STATIC_PAGES.LIST.replace("static-pages", "site-settings"),
    );
    return normalize(response.data);
  },
  async update(payload) {
    const hasFile = Object.values(payload).some(
      (value) => value instanceof File,
    );
    const body = hasFile ? buildFormData(payload) : payload;
    const headers = hasFile
      ? { "Content-Type": "multipart/form-data" }
      : undefined;
    const response = await apiClient.patch(
      API_ENDPOINTS.STATIC_PAGES.DETAIL(String(1)).replace(
        "static-pages",
        "site-settings",
      ),
      body,
      headers ? { headers } : undefined,
    );
    return normalize(response.data);
  },
};
function buildFormData(payload) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value === null) {
      // Avoid sending empty values for file inputs; DRF treats that as an invalid upload.
      if (key.endsWith("_file")) return;
      formData.append(key, "");
      return;
    }
    if (value instanceof File) {
      formData.append(key, value);
      return;
    }
    if (typeof value === "object") {
      return;
    }
    formData.append(key, String(value));
  });
  return formData;
}
function normalize(data) {
  return {
    ...data,
    default_metadescription: data.default_metadescription || "",
    default_metatitle: data.default_metatitle || "",
    youtube_url: data.youtube_url || "",
    video_enabled: data.video_enabled ?? true,
    video_title: data.video_title || "",
    video_description_internal: data.video_description_internal || "",
    logo: data.logo ?? null,
    logo_id: data.logo?.id ?? null,
    logo_dark: data.logo_dark ?? null,
    logo_dark_id: data.logo_dark?.id ?? null,
    favicon: data.favicon ?? null,
    favicon_id: data.favicon?.id ?? null,
    default_og_image: data.default_og_image ?? null,
    default_og_image_id: data.default_og_image?.id ?? null,
    background_video: data.background_video ?? null,
    background_video_id: data.background_video?.id ?? null,
    privacy_page: data.privacy_page ?? null,
    privacy_page_id: data.privacy_page?.id ?? null,
    cookies_page: data.cookies_page ?? null,
    cookies_page_id: data.cookies_page?.id ?? null,
    legal_page: data.legal_page ?? null,
    legal_page_id: data.legal_page?.id ?? null,
    inclusion_page: data.inclusion_page ?? null,
    inclusion_page_id: data.inclusion_page?.id ?? null,
  };
}
