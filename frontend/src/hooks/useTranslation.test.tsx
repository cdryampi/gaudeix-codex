import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useTranslation, translations } from "./useTranslation";
import { useLanguageStore } from "../features/site-settings/languageStore";

describe("useTranslation hook", () => {
  beforeEach(() => {
    act(() => {
      useLanguageStore.getState().setLanguage("es");
    });
  });

  it("returns translations in Spanish", () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t("Inicio")).toBe("Inicio");
    expect(result.current.t("C\u00f3mo llegar")).toBe("C\u00f3mo llegar");
  });

  it("returns translations in Catalan when switched", () => {
    const { result } = renderHook(() => useTranslation());

    act(() => {
      useLanguageStore.getState().setLanguage("ca");
    });

    expect(result.current.t("Inicio")).toBe("Inici");
    expect(result.current.t("C\u00f3mo llegar")).toBe("Com arribar");
  });

  it("returns translations in English and French when switched", () => {
    const { result } = renderHook(() => useTranslation());

    // English
    act(() => {
      useLanguageStore.getState().setLanguage("en");
    });
    expect(result.current.t("Agenda tematizada")).toBe("Themed Agenda");
    expect(result.current.t("Total eventos")).toBe("Total events");
    expect(result.current.t("Proximos")).toBe("Upcoming");

    // French
    act(() => {
      useLanguageStore.getState().setLanguage("fr");
    });
    expect(result.current.t("Agenda tematizada")).toBe("Agenda thématique");
    expect(result.current.t("Total eventos")).toBe("Total des événements");
    expect(result.current.t("Proximos")).toBe("À venir");
  });

  it("translates the homepage storytelling eyebrow", () => {
    const { result } = renderHook(() => useTranslation());

    act(() => {
      useLanguageStore.getState().setLanguage("ca");
    });

    expect(result.current.t("home_storytelling_eyebrow")).toBe(
      "Mar, muntanya i patrimoni",
    );
  });

  it("falls back to the key itself if translation is not found in the dictionary", () => {
    const { result } = renderHook(() => useTranslation());

    act(() => {
      useLanguageStore.getState().setLanguage("ca");
    });

    expect(result.current.t("NonExistentKey")).toBe("NonExistentKey");
  });

  it("verifies that all keys in translations have definitions for es, ca, en, and fr", () => {
    const keys = Object.keys(translations);
    expect(keys.length).toBeGreaterThan(0);

    for (const key of keys) {
      const val = translations[key as keyof typeof translations];
      expect(val).toHaveProperty("es");
      expect(val).toHaveProperty("ca");
      expect(val).toHaveProperty("en");
      expect(val).toHaveProperty("fr");

      expect(typeof val.es).toBe("string");
      expect(typeof val.ca).toBe("string");
      expect(typeof val.en).toBe("string");
      expect(typeof val.fr).toBe("string");

      expect(val.es.length).toBeGreaterThan(0);
      expect(val.ca.length).toBeGreaterThan(0);
      expect(val.en.length).toBeGreaterThan(0);
      expect(val.fr.length).toBeGreaterThan(0);
    }
  });
});
