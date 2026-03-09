import { test, expect } from "@playwright/test";

test.describe("Portal Smoketest", () => {
  test("should load landing / launcher page", async ({ page }) => {
    await page.goto("http://localhost:5173");

    const banner = page.getByRole("banner");

    await expect(banner).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /Turismo alegre, informacion util y una agenda que se mueve contigo/i,
      }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Ver agenda destacada/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "ES", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "CA", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "EN", exact: true })).toBeVisible();
  });
});
