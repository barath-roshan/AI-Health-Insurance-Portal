import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('KAAPAN UI/UX Screenshot Capture', () => {

  test('Capture screenshots for Login and Register pages', async ({ page }, testInfo) => {
    const projectName = testInfo.project.name || 'desktop';

    // 1. Login Page
    await page.goto('/login');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `./e2e/screenshots/${projectName}_01_login.png`,
      fullPage: true
    });

    // 2. Register Page
    await page.goto('/register');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `./e2e/screenshots/${projectName}_02_register.png`,
      fullPage: true
    });
  });

});
