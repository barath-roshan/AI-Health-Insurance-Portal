# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: eligibility.spec.js >> 5. Deterministic Eligibility Engine Suite >> Client-side payload check: Backend is authoritative for eligibility decision
- Location: e2e\eligibility.spec.js:24:3

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
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
  3  | test.describe('5. Deterministic Eligibility Engine Suite', () => {
  4  | 
  5  |   test('Eligibility Results renders filter tabs and structured rule breakdown', async ({ page }) => {
  6  |     await page.goto('/results');
  7  | 
  8  |     await expect(page.locator('h1')).toContainText('Scheme Eligibility Results');
  9  | 
  10 |     // Filter tabs
  11 |     const allTab = page.locator('button:has-text("All Schemes")');
  12 |     const eligibleTab = page.locator('button:has-text("Eligible")');
  13 |     const nearMatchTab = page.locator('button:has-text("Near Match")');
  14 | 
  15 |     await expect(allTab).toBeVisible();
  16 |     await expect(eligibleTab).toBeVisible();
  17 |     await expect(nearMatchTab).toBeVisible();
  18 | 
  19 |     // Click Eligible tab
  20 |     await eligibleTab.click();
  21 |     await page.waitForTimeout(500);
  22 |   });
  23 | 
  24 |   test('Client-side payload check: Backend is authoritative for eligibility decision', async ({ page }) => {
  25 |     // Intercept POST /api/eligibility/check
  26 |     let backendCalculated = false;
  27 |     page.on('response', response => {
  28 |       if (response.url().includes('/api/eligibility/check') && response.status() === 200) {
  29 |         backendCalculated = true;
  30 |       }
  31 |     });
  32 | 
  33 |     await page.goto('/results');
  34 |     await page.waitForLoadState('networkidle');
  35 | 
> 36 |     expect(backendCalculated).toBeTruthy();
     |                               ^ Error: expect(received).toBeTruthy()
  37 |   });
  38 | 
  39 | });
  40 | 
```