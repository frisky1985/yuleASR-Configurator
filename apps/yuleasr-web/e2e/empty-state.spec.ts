import { test, expect } from '@playwright/test';

/**
 * 空状态 / 兜底行为 E2E（GH #13 测试缺口补全 — YAC-KNOWN-004）
 *
 * 实测结论（2026-08-20）：Dashboard/Editor 的“空状态”UI 在当前产品行为下不可达——
 *  1. configStore.loadConfigList：列表为空时自动播种 4 个示例配置（config-default/production/dev/full）
 *  2. configStore.loadConfig：按 ID 找不到配置时自动 createDefaultConfig 兜底
 * 因此本文件覆盖可观测的兜底行为 + Generate 空状态：
 *  1. Dashboard：清空 localStorage → 自动播种示例配置（列表非空）
 *  2. Editor：访问不存在的配置 ID → 自动创建默认配置（Editor 正常可用，无崩溃）
 *  3. Generate：未生成代码前 Code Generation Preview 弹窗不出现
 *     （Generate 面板无独立空态 UI——未生成时预览弹窗整体不渲染；无 schema 场景走
 *     alert 浏览器弹窗路径，E2E 不模拟）
 */
test.describe('Empty States / Fallback Behaviors', () => {
  test('Dashboard：清空数据后自动播种示例配置（空状态不可达）', async ({ page }) => {
    // 清空 localStorage → 触发 loadConfigList 的自动播种
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/configurator/');

    // 播种后配置列表非空（config-full 等示例配置可见）
    await expect(page.getByText('Default Configuration').first()).toBeVisible();
    await expect(page.getByText('Production Config').first()).toBeVisible();
  });

  test('Editor：不存在的配置 ID 自动创建默认配置（空状态不可达）', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/configurator/editor/nonexistent-config-xyz');

    // loadConfig 兜底 createDefaultConfig → Editor 正常加载（模块树可见）
    await expect(page.getByText('Configuration Tree')).toBeVisible({ timeout: 10000 });
  });

  test('Generate 空状态：未生成代码前预览弹窗不出现', async ({ page }) => {
    // 经 Dashboard 进入 Editor（首个配置）
    await page.goto('/configurator/');
    await page.locator('div[class*="cursor-pointer"]').first().click();
    await expect(page.getByText('Configuration Tree')).toBeVisible();

    // 未点击 Generate 前，Code Generation Preview 弹窗不应存在
    await expect(page.getByText('Code Generation Preview')).toHaveCount(0);
  });
});
