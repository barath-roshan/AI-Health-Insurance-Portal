# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: schemes.spec.js >> 4. Scheme Discovery & Catalog Suite >> Browse scheme catalog and filter by state
- Location: e2e\schemes.spec.js:5:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Government Health Insurance Schemes"
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
  3  | test.describe('4. Scheme Discovery & Catalog Suite', () => {
  4  | 
  5  |   test('Browse scheme catalog and filter by state', async ({ page }) => {
  6  |     await page.goto('/schemes');
  7  | 
> 8  |     await expect(page.locator('h1')).toContainText('Government Health Insurance Schemes');
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  9  | 
  10 |     // Search input
  11 |     const searchInput = page.locator('input[placeholder*="Search"]');
  12 |     await expect(searchInput).toBeVisible();
  13 |     await searchInput.fill('Ayushman');
  14 |     await page.click('button:has-text("Search")');
  15 | 
  16 |     // Wait for search API response
  17 |     await page.waitForTimeout(1000);
  18 | 
  19 |     // Click first scheme view details
  20 |     const viewButtons = page.locator('a:has-text("View Details →")');
  21 |     if (await viewButtons.count() > 0) {
  22 |       await viewButtons.first().click();
  23 |       await page.waitForURL(/\/schemes\//);
  24 |       await expect(page.locator('h1')).toBeVisible();
  25 |     }
  26 |   });
  27 | 
  28 | });
  29 | 
```