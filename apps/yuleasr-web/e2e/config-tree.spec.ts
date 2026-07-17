import { test, expect } from '@playwright/test';

test.describe('Configuration Tree / Module Navigation', () => {
  test('should render the dashboard with configuration list area', async ({ page }) => {
    await page.goto('/configurator/dashboard');
    // Dashboard should have a configuration list area or empty state
    const configSection = page.locator('text=/最近配置|Create your first|No configurations/i');
    await expect(configSection).toBeVisible();
  });

  test('should display Quick Actions panel', async ({ page }) => {
    await page.goto('/configurator/dashboard');
    // The quick actions section should be visible
    const quickActions = page.locator('text=/快速操作/');
    await expect(quickActions).toBeVisible();
  });

  test('should display stat cards', async ({ page }) => {
    await page.goto('/configurator/dashboard');
    // Dashboard should have stats cards (Total Configurations, Total Modules, etc.)
    const statCards = page.locator('.stat-card, [class*="stat"]');
    const count = await statCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should display dependency graph button', async ({ page }) => {
    await page.goto('/configurator/dashboard');
    // The dependency graph quick action button — Chinese label with hint
    const depGraphBtn = page.locator('button').filter({ hasText: /依赖关系图/i });
    await expect(depGraphBtn).toBeVisible();
  });

  test('should display Module Wizard button', async ({ page }) => {
    await page.goto('/configurator/dashboard');
    const moduleWizardBtn = page.getByRole('button', { name: /模块向导/i });
    await expect(moduleWizardBtn).toBeVisible();
  });

  test('should display Import Config button', async ({ page }) => {
    await page.goto('/configurator/dashboard');
    const importBtn = page.getByRole('button', { name: /导入/i });
    await expect(importBtn).toBeVisible();
  });
});
