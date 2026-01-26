import { test, expect } from "@playwright/test";

test.describe("Portal Smoketest", () => {
  test("should load landing / launcher page", async ({ page }) => {
    // Both projects can verify the main landing if they share the network
    // But we target port 5173 specifically as discovery showed it's the portal
    await page.goto("http://localhost:5173");

    // Basic, locale-agnostic smoke assertions
    const banner = page.getByRole("banner");

    await expect(banner).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(
      banner.getByRole("button", { name: "ES", exact: true }),
    ).toBeVisible();
    await expect(
      banner.getByRole("button", { name: "CA", exact: true }),
    ).toBeVisible();
    await expect(
      banner.getByRole("button", { name: "EN", exact: true }),
    ).toBeVisible();
  });
});
