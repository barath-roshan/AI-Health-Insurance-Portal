import { test, expect } from '@playwright/test';

test.describe('6. Chatbot / RAG Integration Suite', () => {

  test('AI Assistant chat interface loads and handles citizen prompt', async ({ page }) => {
    await page.goto('/chat');

    await expect(page.locator('h1')).toContainText('SwasthyaSetu AI Assistant');

    // Input prompt
    const chatInput = page.locator('input[placeholder*="Type your question"]');
    await expect(chatInput).toBeVisible();

    await chatInput.fill('What is Ayushman Bharat PM-JAY eligibility?');
    await page.click('button[type="submit"]:has-text("Send")');

    // Wait for response bubble
    await page.waitForTimeout(3000);

    const messages = page.locator('.whitespace-pre-wrap');
    await expect(messages.count()).toBeGreaterThan(1);
  });

});
