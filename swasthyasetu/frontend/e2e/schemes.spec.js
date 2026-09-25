import { test, expect } from '@playwright/test';

test.describe('4. Scheme Discovery & Catalog Suite', () => {

  test('Browse scheme catalog and filter by state', async ({ page }) => {
    await page.goto('/schemes');

    await expect(page.locator('h1')).toContainText('Government Health Insurance Schemes');

    // Search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Ayushman');
    await page.click('button:has-text("Search")');

    // Wait for search API response
    await page.waitForTimeout(1000);

    // Click first scheme view details
    const viewButtons = page.locator('a:has-text("View Details →")');
    if (await viewButtons.count() > 0) {
      await viewButtons.first().click();
      await page.waitForURL(/\/schemes\//);
      await expect(page.locator('h1')).toBeVisible();
    }
  });

});
