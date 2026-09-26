import { test, expect } from '@playwright/test';

test.describe('8. Admin Governance & Access Control Suite', () => {

  test('Admin portal loads tabs, handoffs, schemes, and live system status', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.locator('h1')).toContainText('KAAPAN System Governance');

    // Admin Tabs
    const supportTab = page.locator('button:has-text("Support Handoffs")');
    const schemesTab = page.locator('button:has-text("Schemes & Versioning")');
    const systemTab = page.locator('button:has-text("Services & Infrastructure")');

    await expect(supportTab).toBeVisible();
    await expect(schemesTab).toBeVisible();
    await expect(systemTab).toBeVisible();

    // Click System Status Tab
    await systemTab.click();
    await page.waitForTimeout(500);

    await expect(page.locator('text=KAAPAN FastAPI Backend')).toBeVisible();
    await expect(page.locator('text=PostgreSQL Database')).toBeVisible();
  });

});
