import { test, expect } from '@playwright/test';

test.describe('9. Red-Team Security & Sanitization Suite', () => {

  test('XSS sanitization: Input payloads with script tags are rendered safely without executing', async ({ page }) => {
    let alertTriggered = false;
    page.on('dialog', dialog => {
      alertTriggered = true;
      dialog.dismiss();
    });

    await page.goto('/schemes');
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('<script>alert("XSS")</script>');
    await page.click('button:has-text("Search")');

    await page.waitForTimeout(1000);
    expect(alertTriggered).toBeFalsy();
  });

  test('Secret Leakage Audit: Sensitive backend keys do not leak in window or localStorage', async ({ page }) => {
    await page.goto('/dashboard');

    const localStorageContent = await page.evaluate(() => JSON.stringify(window.localStorage));
    const sessionStorageContent = await page.evaluate(() => JSON.stringify(window.sessionStorage));

    expect(localStorageContent).not.toContain('service_role');
    expect(localStorageContent).not.toContain('GROQ_API_KEY');
    expect(sessionStorageContent).not.toContain('service_role');
  });

});
