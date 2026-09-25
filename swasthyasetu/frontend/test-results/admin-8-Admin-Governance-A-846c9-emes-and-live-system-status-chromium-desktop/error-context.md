# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.js >> 8. Admin Governance & Access Control Suite >> Admin portal loads tabs, handoffs, schemes, and live system status
- Location: e2e\admin.spec.js:5:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "SwasthyaSetu System Administration"
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
  3  | test.describe('8. Admin Governance & Access Control Suite', () => {
  4  | 
  5  |   test('Admin portal loads tabs, handoffs, schemes, and live system status', async ({ page }) => {
  6  |     await page.goto('/admin');
  7  | 
> 8  |     await expect(page.locator('h1')).toContainText('SwasthyaSetu System Administration');
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  9  | 
  10 |     // Admin Tabs
  11 |     const supportTab = page.locator('button:has-text("Support Handoffs")');
  12 |     const schemesTab = page.locator('button:has-text("Schemes & Versions")');
  13 |     const systemTab = page.locator('button:has-text("Services & Redis Status")');
  14 | 
  15 |     await expect(supportTab).toBeVisible();
  16 |     await expect(schemesTab).toBeVisible();
  17 |     await expect(systemTab).toBeVisible();
  18 | 
  19 |     // Click System Status Tab
  20 |     await systemTab.click();
  21 |     await page.waitForTimeout(500);
  22 | 
  23 |     await expect(page.locator('text=KAAPAN FastAPI Backend')).toBeVisible();
  24 |     await expect(page.locator('text=PostgreSQL Database')).toBeVisible();
  25 |   });
  26 | 
  27 | });
  28 | 
```