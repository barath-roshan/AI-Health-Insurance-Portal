import { test, expect } from '@playwright/test';

test.describe('KAAPAN Floating Chatbot & Contextual RAG Suite', () => {

  test('Desktop & Mobile Floating Assistant with Context-Aware RAG', async ({ page }) => {
    // 1. Page loads
    await page.goto('/');

    // 2. Floating button visible in bottom-right
    const floatingBtn = page.locator('#kaapan-chat-toggle-btn');
    await expect(floatingBtn).toBeVisible();

    // 3. Click floating button to open chat window
    await floatingBtn.click();
    const chatWindow = page.locator('#kaapan-chat-window');
    await expect(chatWindow).toBeVisible();

    // 4. Verify branding title
    await expect(chatWindow).toContainText('KAAPAN AI Assistant');

    // 5. Send: "What is CMCHIS?"
    const chatInput = page.locator('#kaapan-chat-input');
    await chatInput.fill('What is CMCHIS?');
    await page.locator('#kaapan-chat-send-btn').click();

    // Wait for response
    await page.waitForTimeout(2500);
    const messages = page.locator('.whitespace-pre-wrap');
    const response1Text = await messages.last().innerText();
    expect(response1Text).not.toContain('outside government health insurance domain');

    // 6. Send: "What government health schemes are available in Tamil Nadu?"
    await chatInput.fill('What government health schemes are available in Tamil Nadu?');
    await page.locator('#kaapan-chat-send-btn').click();
    await page.waitForTimeout(2500);

    // 7. Send: "What is PM-JAY eligibility?"
    await chatInput.fill('What is PM-JAY eligibility?');
    await page.locator('#kaapan-chat-send-btn').click();
    await page.waitForTimeout(2500);

    // 8. Send follow-up: "Tamil Nadu, 120000"
    await chatInput.fill('Tamil Nadu, 120000');
    await page.locator('#kaapan-chat-send-btn').click();
    await page.waitForTimeout(2500);

    const followUpText = await messages.last().innerText();
    expect(followUpText).not.toContain('outside government health insurance domain');
    expect(followUpText).not.toContain('I am specialized in Indian government');

    // 9. Close chatbot
    await page.locator('#kaapan-chat-close-btn').click();
    await expect(chatWindow).toBeHidden();

    // 10. Reopen chatbot & verify conversation remains
    await floatingBtn.click();
    await expect(chatWindow).toBeVisible();
    await expect(messages.count()).toBeGreaterThan(4);
  });

  test('Mobile viewport bottom sheet layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const floatingBtn = page.locator('#kaapan-chat-toggle-btn');
    await expect(floatingBtn).toBeVisible();
    await floatingBtn.click();

    const chatWindow = page.locator('#kaapan-chat-window');
    await expect(chatWindow).toBeVisible();
    await expect(page.locator('#kaapan-chat-close-btn')).toBeVisible();
  });

});
