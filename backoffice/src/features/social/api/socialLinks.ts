import apiClient from "@/lib/api/client";
import { SocialLink, CreateSocialLinkDTO, UpdateSocialLinkDTO } from "../types";

const BASE_PATH = "/social-links/";

function withTranslations<T extends CreateSocialLinkDTO | UpdateSocialLinkDTO>(
  payload: T
) {
  const name = payload.name || "";
  const translations = {
    en: { name },
    es: { name },
    ca: { name },
    fr: { name },
  };
  return { ...payload, translations };
}

export const socialLinksApi = {
  async getAll() {
    const { data } = await apiClient.get<SocialLink[]>(BASE_PATH);
    return data;
  },

  async create(payload: CreateSocialLinkDTO) {
    const { data } = await apiClient.post<SocialLink>(
      BASE_PATH,
      withTranslations(payload)
    );
    return data;
  },

  async update(id: number, payload: UpdateSocialLinkDTO) {
    const { data } = await apiClient.put<SocialLink>(
      `${BASE_PATH}${id}/`,
      withTranslations(payload)
    );
    return data;
  },

  async delete(id: number) {
    await apiClient.delete(`${BASE_PATH}${id}/`);
  },
};
