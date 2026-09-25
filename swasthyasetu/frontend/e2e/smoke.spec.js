import { test, expect } from '@playwright/test';

test.describe('1. Home & Navigation Suite', () => {

  test('Home page redirects to login/dashboard without Javascript error', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should redirect unauthenticated user to /login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('Citizen Login');
    expect(consoleErrors).toHaveLength(0);
  });

  test('All primary routes resolve cleanly without 404 or blank screen', async ({ page }) => {
    const routes = ['/login', '/register', '/dashboard', '/schemes', '/profile', '/results', '/chat', '/support', '/admin'];

    for (const route of routes) {
      const response = await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      expect(response.status()).toBeLessThan(400);

      // Verify page container rendered
      const rootElement = page.locator('#root');
      await expect(rootElement).toBeVisible();

      // Test browser refresh on route
      const refreshResponse = await page.reload();
      expect(refreshResponse.status()).toBeLessThan(400);
    }
  });

});
