# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chat.spec.js >> 6. Chatbot / RAG Integration Suite >> AI Assistant chat interface loads and handles citizen prompt
- Location: e2e\chat.spec.js:5:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "SwasthyaSetu AI Assistant"
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
  3  | test.describe('6. Chatbot / RAG Integration Suite', () => {
  4  | 
  5  |   test('AI Assistant chat interface loads and handles citizen prompt', async ({ page }) => {
  6  |     await page.goto('/chat');
  7  | 
> 8  |     await expect(page.locator('h1')).toContainText('SwasthyaSetu AI Assistant');
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  9  | 
  10 |     // Input prompt
  11 |     const chatInput = page.locator('input[placeholder*="Type your question"]');
  12 |     await expect(chatInput).toBeVisible();
  13 | 
  14 |     await chatInput.fill('What is Ayushman Bharat PM-JAY eligibility?');
  15 |     await page.click('button[type="submit"]:has-text("Send")');
  16 | 
  17 |     // Wait for response bubble
  18 |     await page.waitForTimeout(3000);
  19 | 
  20 |     const messages = page.locator('.whitespace-pre-wrap');
  21 |     await expect(messages.count()).toBeGreaterThan(1);
  22 |   });
  23 | 
  24 | });
  25 | 
```