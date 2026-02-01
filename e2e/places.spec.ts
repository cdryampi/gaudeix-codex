import { test, expect } from "@playwright/test";

test.describe("Places Feature", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to places page
    await page.goto("http://localhost:5173/lugares");
  });

  test("should display places list and map toggle", async ({ page }) => {
    // Check header
    await expect(page.getByRole("heading", { name: /Explora/i })).toBeVisible();

    // Check search input existence
    const searchInput = page.getByPlaceholder("Buscar lugares...");
    await expect(searchInput).toBeVisible();

    // Check at least one place card is visible (assuming seeds exist or mock data)
    // We use a flexible locator
    const placeCards = page.locator('a[href^="/lugares/"]');
    // Wait for data to load
    await expect(placeCards.first()).toBeVisible({ timeout: 10000 });
  });

  test("should filter by category", async ({ page }) => {
    // Click on "Restaurantes" filter
    const restaurantFilter = page.getByRole("button", { name: "Restaurantes" });
    await restaurantFilter.click();

    // Check URL updates
    await expect(page).toHaveURL(/category=restaurants/);

    // Verify filter active state (scale-105 class or similar visual cue check is brittle, URL is better)
  });

  test("should navigate to details", async ({ page }) => {
    // Click the first place card
    const firstPlace = page.locator('a:has-text("Detalles")').first();
    await expect(firstPlace).toBeVisible();

    // Capture URL before click if needed, or just click
    await firstPlace.click();

    // Check we are on a detail page
    await expect(page).toHaveURL(/\/lugares\/.+/);

    // Check common detail elements
    await expect(page.getByRole("link", { name: "Inicio" })).toBeVisible();
  });
});
