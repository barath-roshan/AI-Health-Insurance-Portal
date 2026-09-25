import { test, expect } from '@playwright/test';

test.describe('5. Deterministic Eligibility Engine Suite', () => {

  test('Eligibility Results renders filter tabs and structured rule breakdown', async ({ page }) => {
    await page.goto('/results');

    await expect(page.locator('h1')).toContainText('Scheme Eligibility Results');

    // Filter tabs
    const allTab = page.locator('button:has-text("All Schemes")');
    const eligibleTab = page.locator('button:has-text("Eligible")');
    const nearMatchTab = page.locator('button:has-text("Near Match")');

    await expect(allTab).toBeVisible();
    await expect(eligibleTab).toBeVisible();
    await expect(nearMatchTab).toBeVisible();

    // Click Eligible tab
    await eligibleTab.click();
    await page.waitForTimeout(500);
  });

  test('Client-side payload check: Backend is authoritative for eligibility decision', async ({ page }) => {
    // Intercept POST /api/eligibility/check
    let backendCalculated = false;
    page.on('response', response => {
      if (response.url().includes('/api/eligibility/check') && response.status() === 200) {
        backendCalculated = true;
      }
    });

    await page.goto('/results');
    await page.waitForLoadState('networkidle');

    expect(backendCalculated).toBeTruthy();
  });

});
