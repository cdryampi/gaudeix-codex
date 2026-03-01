import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getValidBaseUrl } from "@/lib/api";

describe("getValidBaseUrl", () => {
  const fallbackUrl = "http://localhost:8000/api/v1";
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("should return fallback URL and log error when URL is undefined", () => {
    const result = getValidBaseUrl(undefined);
    expect(result).toBe(fallbackUrl);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "VITE_API_BASE_URL is not defined. Falling back to default: " + fallbackUrl
    );
  });

  it("should return fallback URL and log error when URL is empty", () => {
    const result = getValidBaseUrl("");
    expect(result).toBe(fallbackUrl);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "VITE_API_BASE_URL is not defined. Falling back to default: " + fallbackUrl
    );
  });

  it("should return fallback URL and log error when URL is invalid", () => {
    const invalidUrl = "not-a-valid-url";
    const result = getValidBaseUrl(invalidUrl);
    expect(result).toBe(fallbackUrl);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `VITE_API_BASE_URL is invalid: "${invalidUrl}". Falling back to default: ` + fallbackUrl
    );
  });

  it("should return normalized URL when URL is valid and doesn't end with /api", () => {
    const validUrl = "https://example.com/custom-api";
    const result = getValidBaseUrl(validUrl);
    expect(result).toBe(validUrl);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("should return normalized URL with /v1 when URL is valid and ends with /api", () => {
    const validUrl = "https://example.com/api";
    const result = getValidBaseUrl(validUrl);
    expect(result).toBe("https://example.com/api/v1");
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("should strip trailing slashes", () => {
    const validUrl = "https://example.com/api/";
    const result = getValidBaseUrl(validUrl);
    expect(result).toBe("https://example.com/api/v1");
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
