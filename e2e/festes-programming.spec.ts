/**
 * Focused E2E coverage for Agenda <-> Festes linkage.
 */
import { test, expect } from "@playwright/test";

const agendaEventWithLink = {
  id: 101,
  slug: "event-linked",
  title: "Evento vinculado",
  summary: "Resumen evento",
  description: "Descripcion evento",
  start_at: "2026-06-20T18:00:00Z",
  is_free: true,
  venue_name: "Plaza Mayor",
  location_text: "Centro",
  category_name: "Festes",
  tags: [],
  attachments: [],
  dates: [{ id: 1, start_at: "2026-06-20T18:00:00Z" }],
  festes_activities: [
    {
      id: 501,
      slug: "acte-1",
      title: "Acte principal",
      festa_slug: "festa-major",
    },
  ],
};

const agendaEventWithoutLink = {
  ...agendaEventWithLink,
  id: 102,
  slug: "event-no-link",
  title: "Evento sin vinculo",
  festes_activities: [],
};

const activityDetail = {
  id: 501,
  slug: "acte-1",
  title: "Acte principal",
  summary: "Resumen actividad",
  description: "Descripcion actividad",
  start_at: "2026-06-20T18:00:00Z",
  end_at: "2026-06-20T20:00:00Z",
  venue_name: "Plaza Mayor",
  location_text: "Centro",
  event: {
    id: 101,
    slug: "event-linked",
    title: "Evento vinculado",
  },
};

const isApiRequest = (url: string) => /\/api(?:\/v1)?\//.test(url);

test.describe("Festes Programming - Agenda linkage", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === "backoffice",
      "This spec validates public frontend linkage only.",
    );

    await page.route("**/events/**", async (route) => {
      const requestUrl = route.request().url();
      if (!isApiRequest(requestUrl)) {
        await route.continue();
        return;
      }

      if (requestUrl.includes("/events/event-linked/")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(agendaEventWithLink),
        });
        return;
      }

      if (requestUrl.includes("/events/event-no-link/")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(agendaEventWithoutLink),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ results: [] }),
      });
    });

    await page.route("**/activities/**", async (route) => {
      const requestUrl = route.request().url();
      if (!isApiRequest(requestUrl)) {
        await route.continue();
        return;
      }

      if (requestUrl.includes("/activities/acte-1/")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(activityDetail),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ results: [] }),
      });
    });

    await page.route("**/festes/**", async (route) => {
      const requestUrl = route.request().url();
      if (!isApiRequest(requestUrl)) {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ results: [] }),
      });
    });
  });

  test("navigates Agenda -> Festa activity when linked", async ({ page }) => {
    await page.goto("/agenda/event-linked");
    await page.waitForLoadState("networkidle");

    const festaLink = page.getByRole("link", { name: /acte principal/i });
    await expect(festaLink).toHaveAttribute(
      "href",
      "/festes/activitats/acte-1",
    );

    await festaLink.click();
    await expect(page).toHaveURL(/\/festes\/activitats\/acte-1/);
    await expect(
      page.getByRole("heading", { name: /acte principal/i }),
    ).toBeVisible();
  });

  test("shows neutral fallback for non-linked agenda event", async ({
    page,
  }) => {
    await page.goto("/agenda/event-no-link");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/sin acto/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /acto de festa major/i }),
    ).toHaveCount(0);
  });
});
