import { test, expect } from "@playwright/test";

test.describe("Portal Smoketest", () => {
  test("should load landing / launcher page", async ({ page }) => {
    await page.goto("http://localhost:5173");

    await expect(page.getByRole("banner")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Gaudeix Cabrera de Mar/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", {
        name: /Categor[ií]as|Categor[ií]es de experiencia principal/i,
      }),
    ).toBeVisible();

    const mainNav = page.getByRole("navigation", {
      name: /Navegaci[oó]n principal|Navegaci[oó] principal/i,
    });
    await expect(
      mainNav.getByRole("link", { name: /Descobreix/i }),
    ).toBeVisible();
    await expect(
      mainNav.getByRole("link", { name: "Rutes", exact: true }),
    ).toBeVisible();
    await expect(
      mainNav.getByRole("link", { name: "Festes", exact: true }),
    ).toBeVisible();
    await expect(
      mainNav.getByRole("link", { name: "Agenda", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /Aprovat el pressupost municipal 2025/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "ES", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "CA", exact: true }),
    ).toBeVisible();
  });
});
