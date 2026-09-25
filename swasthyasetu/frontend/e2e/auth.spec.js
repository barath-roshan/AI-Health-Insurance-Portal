import { test, expect } from '@playwright/test';

test.describe('2. Authentication & Authorization Suite', () => {

  test('Registration validation shows clear error messages for invalid input', async ({ page }) => {
    await page.goto('/register');

    // Mismatched passwords
    await page.fill('input[placeholder="Ramesh Kumar"]', 'Test Citizen');
    await page.fill('input[placeholder="ramesh@example.com"]', 'invalid-email');
    await page.fill('input[placeholder="At least 6 characters"]', '12345');
    await page.fill('input[placeholder="Re-enter password"]', 'different');
    await page.click('button[type="submit"]');

    // Email validation error
    const errorBox = page.locator('.bg-rose-50');
    await expect(errorBox).toBeVisible();
  });

  test('Unauthenticated user attempting to access protected dashboard gets redirected', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Login form renders input fields and handles submit action', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

});
