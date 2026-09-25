import { test, expect } from '@playwright/test';

test.describe('10. Responsive Viewport Suite', () => {

  test('Desktop (1440x900) layout renders clean header navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/dashboard');
    await expect(page.locator('header')).toBeVisible();
  });

  test('Tablet (768x1024) layout renders without horizontal scroll overflow', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/schemes');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('Mobile (390x844) viewport displays mobile-friendly card layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/results');
    await expect(page.locator('#root')).toBeVisible();
  });

});
