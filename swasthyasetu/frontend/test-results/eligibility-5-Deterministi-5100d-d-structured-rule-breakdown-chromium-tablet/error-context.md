# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: eligibility.spec.js >> 5. Deterministic Eligibility Engine Suite >> Eligibility Results renders filter tabs and structured rule breakdown
- Location: e2e\eligibility.spec.js:5:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Scheme Eligibility Results"
Received string:    "Citizen Login"
Timeout: 10000ms

Call log:
  - Expect "toContainText" locator('h1') with timeout 10000ms
  - waiting for locator('h1')
    23 × locator resolved to <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Citizen Login</h1>
       - unexpected value "Citizen Login"

```

```yaml
- heading "Citizen Login" [level=1]
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
> 8  |     await expect(page.locator('h1')).toContainText('Scheme Eligibility Results');
     |                                      ^ Error: expect(locator).toContainText(expected) failed
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
  36 |     expect(backendCalculated).toBeTruthy();
  37 |   });
  38 | 
  39 | });
  40 | 
```