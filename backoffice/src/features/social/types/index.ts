export type SocialLink = {
  id: number;
  name: string;
  url: string;
  icon_class: string;
  color: string;
  available_in_ca: boolean;
  available_in_es: boolean;
  available_in_en: boolean;
  available_in_fr: boolean;
  order: number;
  is_active: boolean;
};

export type CreateSocialLinkDTO = Omit<SocialLink, "id">;
export type UpdateSocialLinkDTO = Partial<CreateSocialLinkDTO>;
