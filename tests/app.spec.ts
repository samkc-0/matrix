import { test, expect } from "@playwright/test";

test("app loads", async ({ page }) => {
  await page.goto("http://localhost:8081", { waitUntil: "networkidle" });
  await expect(page.locator("text=loading")).toHaveCount(0);
});
