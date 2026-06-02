import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LanguageCode = "ca" | "es" | "en" | "fr";

interface LanguageState {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "ca", // Default language (matches DJANGO_LANGUAGE_CODE default)
      setLanguage: (lang) => {
        // Update document element lang attribute for accessibility/SEO
        document.documentElement.setAttribute("lang", lang);

        // Update django_language cookie so backend receives it too if it reads cookies
        document.cookie = `django_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;

        set({ language: lang });
      },
    }),
    {
      name: "gaudeix-language-storage",
    },
  ),
);
