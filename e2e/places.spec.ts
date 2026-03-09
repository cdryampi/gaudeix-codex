import { test, expect } from "@playwright/test";

test.describe("Places Feature", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to places page
    await page.goto("http://localhost:5173/lugares");
  });

  test("should display places list and map toggle", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        name: /Explora lugares, patrimonio y recursos con una herramienta mas clara/i,
      }),
    ).toBeVisible();

    const searchInput = page.getByPlaceholder("Buscar lugares...");
    await expect(searchInput).toBeVisible();

    await expect(page.getByRole("button", { name: "Vista mapa" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Vista lista" })).toBeVisible();

    const placeCards = page.locator('a[href^="/lugares/"]');
    await expect(placeCards.first()).toBeVisible({ timeout: 10000 });
  });

  test("should filter by category", async ({ page }) => {
    const restaurantFilter = page.getByRole("button", { name: "Restaurantes" });
    await restaurantFilter.click();

    await expect(page).toHaveURL(/category=restaurants/);
  });

  test("should navigate to details", async ({ page }) => {
    const firstPlace = page.locator('a:has-text("Detalles")').first();
    await expect(firstPlace).toBeVisible();

    await firstPlace.click();

    await expect(page).toHaveURL(/\/lugares\/.+/);

    await expect(page.getByRole("link", { name: "Inicio" })).toBeVisible();
  });
});
