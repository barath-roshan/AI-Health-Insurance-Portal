# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile.spec.js >> 3. Profile Management & Wizard Suite >> 4-Step Profile Wizard navigation & form persistence
- Location: e2e\profile.spec.js:5:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h2')
Expected substring: "Step 1: State & District"
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" locator('h2') with timeout 10000ms
  - waiting for locator('h2')

```

```yaml
- banner:
  - link "SS SwasthyaSetu National Health Scheme Portal":
    - /url: /
  - navigation:
    - link "Login":
      - /url: /login
    - link "Register":
      - /url: /register
- main:
  - heading "Citizen Login" [level=1]
  - paragraph: Access SwasthyaSetu Health Insurance Portal
  - text: Email Address
  - textbox "name@example.com"
  - text: Password
  - textbox "••••••••"
  - button "Login"
  - text: Don't have an account?
  - link "Create account":
    - /url: /register
- contentinfo:
  - paragraph: © 2026 SwasthyaSetu Health Insurance Scheme Eligibility Finder. Government of India Initiative.
  - paragraph: Phase 1 Foundation & Authentication Active
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('3. Profile Management & Wizard Suite', () => {
  4  | 
  5  |   test('4-Step Profile Wizard navigation & form persistence', async ({ page }) => {
  6  |     await page.goto('/profile');
  7  | 
  8  |     // Step 1: Location
> 9  |     await expect(page.locator('h2')).toContainText('Step 1: State & District');
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  10 |     await page.selectOption('select[name="state"]', 'Tamil Nadu');
  11 |     await page.fill('input[name="district"]', 'Chennai');
  12 |     await page.click('button:has-text("Next Step →")');
  13 | 
  14 |     // Step 2: Demographics
  15 |     await expect(page.locator('h2')).toContainText('Step 2: Age & Gender');
  16 |     await page.fill('input[name="age"]', '35');
  17 |     await page.selectOption('select[name="gender"]', 'male');
  18 |     await page.click('button:has-text("Next Step →")');
  19 | 
  20 |     // Step 3: Income & Work
  21 |     await expect(page.locator('h2')).toContainText('Step 3: Occupation & Annual Income');
  22 |     await page.selectOption('select[name="occupation"]', 'farmer');
  23 |     await page.fill('input[name="annual_income"]', '120000');
  24 |     await page.click('button:has-text("Next Step →")');
  25 | 
  26 |     // Step 4: Coverage & Family
  27 |     await expect(page.locator('h2')).toContainText('Step 4: Family Size & Existing Coverage');
  28 |     await page.fill('input[name="family_size"]', '4');
  29 | 
  30 |     // Submit & Save Profile
  31 |     await page.click('button:has-text("Save Profile & Check Eligibility →")');
  32 | 
  33 |     // Should navigate to /results
  34 |     await page.waitForURL(/\/results/);
  35 |     await expect(page.locator('h1')).toContainText('Scheme Eligibility Results');
  36 |   });
  37 | 
  38 | });
  39 | 
```