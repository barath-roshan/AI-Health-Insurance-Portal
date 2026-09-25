import { test, expect } from '@playwright/test';

test.describe('3. Profile Management & Wizard Suite', () => {

  test('4-Step Profile Wizard navigation & form persistence', async ({ page }) => {
    await page.goto('/profile');

    // Step 1: Location
    await expect(page.locator('h2')).toContainText('Step 1: State & District');
    await page.selectOption('select[name="state"]', 'Tamil Nadu');
    await page.fill('input[name="district"]', 'Chennai');
    await page.click('button:has-text("Next Step →")');

    // Step 2: Demographics
    await expect(page.locator('h2')).toContainText('Step 2: Age & Gender');
    await page.fill('input[name="age"]', '35');
    await page.selectOption('select[name="gender"]', 'male');
    await page.click('button:has-text("Next Step →")');

    // Step 3: Income & Work
    await expect(page.locator('h2')).toContainText('Step 3: Occupation & Annual Income');
    await page.selectOption('select[name="occupation"]', 'farmer');
    await page.fill('input[name="annual_income"]', '120000');
    await page.click('button:has-text("Next Step →")');

    // Step 4: Coverage & Family
    await expect(page.locator('h2')).toContainText('Step 4: Family Size & Existing Coverage');
    await page.fill('input[name="family_size"]', '4');

    // Submit & Save Profile
    await page.click('button:has-text("Save Profile & Check Eligibility →")');

    // Should navigate to /results
    await page.waitForURL(/\/results/);
    await expect(page.locator('h1')).toContainText('Scheme Eligibility Results');
  });

});
