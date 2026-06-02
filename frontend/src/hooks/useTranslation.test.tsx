import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useTranslation } from "./useTranslation";
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
});
