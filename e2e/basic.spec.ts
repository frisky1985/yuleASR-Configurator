import { test, expect } from '@playwright/test';

/**
 * yuleASR Configurator 根级冒烟 E2E（YAC-KNOWN-007 修复）。
 *
 * 历史问题：旧断言 `/modules` 路由 + `[data-testid="module-list"]` 在 App.tsx 路由表
 * 与源码中均已不存在（路由重构后过时），CI 会误报。
 * 本套件更新为当前真实产品行为，断言模式对齐 apps/yuleasr-web/e2e/（home.spec.ts 等）：
 *   - 应用挂在 vite base `/configurator/` 下（dev server 端口 3000，见根 playwright.config.ts）
 *   - `/dashboard` 为当前真实路由（App.tsx：/、/dashboard、/templates、/settings …）
 */
test.describe('yuleASR Configurator - Basic E2E', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/configurator/');
    await expect(page).toHaveTitle(/yuleASR/);
  });

  test('should load the dashboard with navigation and primary actions', async ({ page }) => {
    await page.goto('/configurator/dashboard');
    // 应用名可见（header logo / 标题）
    await expect(page.locator('text=/yuleASR|Configurator/i').first()).toBeVisible();
    // 主导航存在（侧边栏链接，中文标签）
    const navCount = await page.getByRole('link').count();
    expect(navCount).toBeGreaterThan(3);
    // 主操作按钮（新建配置）
    await expect(
      page
        .locator('button')
        .filter({ hasText: /新建|New/i })
        .first()
    ).toBeVisible({ timeout: 10000 });
  });
});
