import { test, expect } from "@playwright/test";

const festa = {
  id: 1,
  slug: "festa-major-cabrera-2025",
  title: "Festa Major de Cabrera de Mar 2025",
  subtitle: "Programa oficial",
  summary: "Celebracio principal",
  description: "Programa de festa",
  program_text: "Divendres: pregó",
  start_date: "2025-08-15",
  end_date: "2025-08-20",
  year: 2025,
  duration_days: 6,
  is_published: true,
  is_featured: true,
  is_current: true,
  category: 1,
  category_slug: "festes",
  category_name: "Festes",
  tags: [],
  featured_media: null,
  posters: [],
  program_pdf: null,
  gallery: [],
  image_url: "",
  sponsors: [],
  events: [],
  events_count: 12,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const event = {
  id: 101,
  slug: "correfoc-festa-major",
  title: "Correfoc de Festa Major",
  summary: "Foc i cultura popular",
  description: "Acte principal",
  start_at: "2026-06-20T18:00:00Z",
  end_at: "2026-06-20T20:00:00Z",
  dates: [{ id: 1, start_at: "2026-06-20T18:00:00Z", end_at: null }],
  category: 1,
  category_name: "Festes",
  category_slug: "festes",
  tags: [],
  venue_name: "Plaza Mayor",
  location_text: "Centro",
  is_published: true,
  is_featured: true,
  is_outdoor: true,
  is_free: true,
  price: null,
  price_text: "",
  points_value: 20,
  weather_forecast: null,
  featured_media: null,
  image_url: "",
  attachments: [],
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  occurrences_count: 1,
  event_status: "upcoming",
};

const isApiRequest = (url: string) => /\/api(?:\/v1)?\//.test(url);

test.describe("Festes pages", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === "backoffice",
      "This spec validates public frontend Festes pages only.",
    );

    await page.route("**/festes/**", async (route) => {
      const requestUrl = route.request().url();
      if (!isApiRequest(requestUrl)) {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          count: 1,
          next: null,
          previous: null,
          results: [festa],
        }),
      });
    });

    await page.route("**/events/**", async (route) => {
      const requestUrl = route.request().url();
      if (!isApiRequest(requestUrl)) {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          count: 1,
          next: null,
          previous: null,
          results: [event],
        }),
      });
    });
  });

  test("loads Festes listing with year filter and program card", async ({
    page,
  }) => {
    await page.goto("/festes");

    await expect(
      page.getByRole("heading", { name: /FESTES\s+MAJORS/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Totes" })).toBeVisible();
    await expect(page.getByRole("button", { name: "2025" })).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /Festa Major de Cabrera de Mar 2025/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Ver programa/i }),
    ).toHaveAttribute("href", "/festes/festa-major-cabrera-2025");
  });

  test("loads programming page with filters and event view controls", async ({
    page,
  }) => {
    await page.goto("/festes/programacio");

    await expect(
      page.getByRole("heading", { name: /PROGRAMA\s+DE FESTES/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Limpiar filtros/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Llista/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Calendari/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Mapa/i })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Correfoc de Festa Major/i }),
    ).toBeVisible();
  });
});
