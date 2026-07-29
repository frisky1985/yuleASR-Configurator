import { test, expect } from '@playwright/test';

test.describe('yuleASR Configurator - Basic E2E', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/yuleASR/);
  });

  test('should show module list', async ({ page }) => {
    await page.goto('/modules');
    await page.waitForSelector('[data-testid="module-list"]', { timeout: 5000 });
    const items = page.locator('[data-testid="module-item"]');
    await expect(items).not.toHaveCount(0);
  });
});
