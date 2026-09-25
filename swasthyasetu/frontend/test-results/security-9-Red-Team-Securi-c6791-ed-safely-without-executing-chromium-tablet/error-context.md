# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security.spec.js >> 9. Red-Team Security & Sanitization Suite >> XSS sanitization: Input payloads with script tags are rendered safely without executing
- Location: e2e\security.spec.js:5:3

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.fill: Test timeout of 45000ms exceeded.
Call log:
  - waiting for locator('input[placeholder*="Search"]')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link "SS SwasthyaSetu National Health Scheme Portal" [ref=e6] [cursor=pointer]:
        - /url: /
        - generic [ref=e7]: SS
        - generic [ref=e8]:
          - generic [ref=e9]: SwasthyaSetu
          - generic [ref=e10]: National Health Scheme Portal
      - navigation [ref=e11]:
        - generic [ref=e12]:
          - link "Login" [ref=e13] [cursor=pointer]:
            - /url: /login
          - link "Register" [ref=e14] [cursor=pointer]:
            - /url: /register
  - main [ref=e15]:
    - generic [ref=e17]:
      - generic [ref=e18]:
        - heading "Citizen Login" [level=1] [ref=e19]
        - paragraph [ref=e20]: Access SwasthyaSetu Health Insurance Portal
      - generic [ref=e21]:
        - generic [ref=e22]:
          - generic [ref=e23]: Email Address
          - textbox "name@example.com" [ref=e24]
        - generic [ref=e25]:
          - generic [ref=e26]: Password
          - textbox "••••••••" [ref=e27]
        - button "Login" [ref=e28]
      - generic [ref=e30]:
        - text: Don't have an account?
        - link "Create account" [ref=e31] [cursor=pointer]:
          - /url: /register
  - contentinfo [ref=e32]:
    - generic [ref=e33]:
      - paragraph [ref=e34]: © 2026 SwasthyaSetu Health Insurance Scheme Eligibility Finder. Government of India Initiative.
      - paragraph [ref=e35]: Phase 1 Foundation & Authentication Active
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('9. Red-Team Security & Sanitization Suite', () => {
  4  | 
  5  |   test('XSS sanitization: Input payloads with script tags are rendered safely without executing', async ({ page }) => {
  6  |     let alertTriggered = false;
  7  |     page.on('dialog', dialog => {
  8  |       alertTriggered = true;
  9  |       dialog.dismiss();
  10 |     });
  11 | 
  12 |     await page.goto('/schemes');
  13 |     const searchInput = page.locator('input[placeholder*="Search"]');
> 14 |     await searchInput.fill('<script>alert("XSS")</script>');
     |                       ^ Error: locator.fill: Test timeout of 45000ms exceeded.
  15 |     await page.click('button:has-text("Search")');
  16 | 
  17 |     await page.waitForTimeout(1000);
  18 |     expect(alertTriggered).toBeFalsy();
  19 |   });
  20 | 
  21 |   test('Secret Leakage Audit: Sensitive backend keys do not leak in window or localStorage', async ({ page }) => {
  22 |     await page.goto('/dashboard');
  23 | 
  24 |     const localStorageContent = await page.evaluate(() => JSON.stringify(window.localStorage));
  25 |     const sessionStorageContent = await page.evaluate(() => JSON.stringify(window.sessionStorage));
  26 | 
  27 |     expect(localStorageContent).not.toContain('service_role');
  28 |     expect(localStorageContent).not.toContain('GROQ_API_KEY');
  29 |     expect(sessionStorageContent).not.toContain('service_role');
  30 |   });
  31 | 
  32 | });
  33 | 
```