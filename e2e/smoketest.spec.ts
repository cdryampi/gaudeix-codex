import { test, expect } from "@playwright/test";

test.describe("Portal Smoketest", () => {
    test("should load landing / launcher page", async ({ page }) => {
        // Both projects can verify the main landing if they share the network
        // But we target port 5173 specifically as discovery showed it's the portal
        await page.goto("http://localhost:5173");
        await expect(page.getByRole("heading", { name: "Gaudeix", exact: true })).toBeVisible();
        await expect(page.getByRole("heading", { name: /Panel de Administración/i })).toBeVisible();
    });
});
