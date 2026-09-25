# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> 2. Authentication & Authorization Suite >> Registration validation shows clear error messages for invalid input
- Location: e2e\auth.spec.js:5:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.bg-rose-50')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('.bg-rose-50') with timeout 10000ms
  - waiting for locator('.bg-rose-50')

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
  - heading "Create Account" [level=1]
  - paragraph: Register for SwasthyaSetu Citizen Portal
  - text: Full Name
  - textbox "Ramesh Kumar": Test Citizen
  - text: Email Address
  - textbox "ramesh@example.com": invalid-email
  - text: Password
  - textbox "At least 6 characters": "12345"
  - text: Confirm Password
  - textbox "Re-enter password": different
  - button "Register Account"
  - text: Already have an account?
  - link "Login here":
    - /url: /login
- contentinfo:
  - paragraph: © 2026 SwasthyaSetu Health Insurance Scheme Eligibility Finder. Government of India Initiative.
  - paragraph: Phase 1 Foundation & Authentication Active
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('2. Authentication & Authorization Suite', () => {
  4  | 
  5  |   test('Registration validation shows clear error messages for invalid input', async ({ page }) => {
  6  |     await page.goto('/register');
  7  | 
  8  |     // Mismatched passwords
  9  |     await page.fill('input[placeholder="Ramesh Kumar"]', 'Test Citizen');
  10 |     await page.fill('input[placeholder="ramesh@example.com"]', 'invalid-email');
  11 |     await page.fill('input[placeholder="At least 6 characters"]', '12345');
  12 |     await page.fill('input[placeholder="Re-enter password"]', 'different');
  13 |     await page.click('button[type="submit"]');
  14 | 
  15 |     // Email validation error
  16 |     const errorBox = page.locator('.bg-rose-50');
> 17 |     await expect(errorBox).toBeVisible();
     |                            ^ Error: expect(locator).toBeVisible() failed
  18 |   });
  19 | 
  20 |   test('Unauthenticated user attempting to access protected dashboard gets redirected', async ({ page }) => {
  21 |     await page.goto('/dashboard');
  22 |     await expect(page).toHaveURL(/\/login/);
  23 |   });
  24 | 
  25 |   test('Login form renders input fields and handles submit action', async ({ page }) => {
  26 |     await page.goto('/login');
  27 | 
  28 |     await expect(page.locator('input[type="email"]')).toBeVisible();
  29 |     await expect(page.locator('input[type="password"]')).toBeVisible();
  30 |     await expect(page.locator('button[type="submit"]')).toBeVisible();
  31 |   });
  32 | 
  33 | });
  34 | 
```