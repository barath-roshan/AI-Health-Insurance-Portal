# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: handoff.spec.js >> 7. Human Support & Handoff Suite >> User support requests page lists active customer care tickets
- Location: e2e\handoff.spec.js:5:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "My Human Assistance Requests"
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
  3  | test.describe('7. Human Support & Handoff Suite', () => {
  4  | 
  5  |   test('User support requests page lists active customer care tickets', async ({ page }) => {
  6  |     await page.goto('/support');
  7  | 
> 8  |     await expect(page.locator('h1')).toContainText('My Human Assistance Requests');
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  9  |   });
  10 | 
  11 | });
  12 | 
```