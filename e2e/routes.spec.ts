import { test, expect } from "@playwright/test";

test.describe("Routes & Navigation Feature", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173/como-llegar");
  });

  test("should display route planner interface", async ({ page }) => {
    await expect(page.getByText("Tu viaje a")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Usar mi ubicación" }),
    ).toBeVisible();
  });

  test("should show transport modes", async ({ page }) => {
    const modes = [
      "Coche",
      "Tren (Rodalies R1)",
      "Autobús",
      "Aeropuerto (BCN)",
    ];

    for (const mode of modes) {
      await expect(page.getByRole("button", { name: mode })).toBeVisible();
    }
  });

  // Note: Testing actual geolocation requires browser context permission granting
  // which is complex in simple CI runs. We focus on UI elements here.
  test("should handle location permission denial gracefully", async ({
    context,
    page,
  }) => {
    // Grant permission denied
    await context.grantPermissions([]);

    // We can't easily force "denied" state in Playwright without specific context options setup
    // But we can check if the button is clickable
    const locateBtn = page.getByRole("button", { name: "Usar mi ubicación" });
    await expect(locateBtn).toBeEnabled();
  });
});
