import { test, expect } from '@playwright/test';

import { DashboardPage } from './pages/dashboard.page';
import { EditorPage } from './pages/editor.page';

/**
 * ARXML 导入/导出 E2E（GH #13 测试缺口补全 — YAC-KNOWN-004）
 *
 * 覆盖：
 *  1. Export ▼ → Export ARXML → 目标 AUTOSAR 版本对话框 → 导出 → 触发 .arxml 文件下载
 *  2. Import ▼ → Import ARXML → 文件选择 → 解析成功（alert 提示模块数）→ 配置合并
 *
 * fixture：e2e/fixtures/ecuc-minimal.arxml（值层 + 定义层 ECUC Can 模块，取自
 * src/services/__tests__/arxml-ecuc-import.test.ts 的 BOTH_LAYERS_XML）
 */
test.describe('ARXML Import/Export', () => {
  let dashboard: DashboardPage;
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    editor = new EditorPage(page);

    // 经 Dashboard 打开第一个配置进入 Editor
    await dashboard.goto();
    await dashboard.configItems.first().click();
    await editor.waitForLoad();
  });

  test('Export ▼ → Export ARXML → 版本确认 → 下载 .arxml 文件', async ({ page }) => {
    // 1) 打开 Export 下拉，点击 Export ARXML
    await editor.exportButton.click();
    await expect(editor.exportArxmlOption).toBeVisible();
    await editor.exportArxmlOption.click();

    // 2) 目标 AUTOSAR 版本对话框出现
    const versionDialog = page.getByText('Export ARXML — 目标 AUTOSAR 版本');
    await expect(versionDialog).toBeVisible();

    // 3) 确认导出 → 触发浏览器下载，文件名以 .arxml 结尾
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.getByRole('button', { name: /导出（schema/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.arxml$/);

    // 4) 对话框关闭
    await expect(versionDialog).toBeHidden();
  });

  test('Import ▼ → Import ARXML → 文件选择 → 解析成功并合并模块', async ({ page }) => {
    // 监听成功 alert（导入成功后 Editor 弹出“ARXML 导入成功: N 个模块”）
    const dialogPromise = page.waitForEvent('dialog', { timeout: 15000 });

    // 1) 打开 Import 下拉，点击 Import ARXML（触发隐藏 file input）
    await editor.importButton.click();
    const importArxmlOption = page.getByRole('button', { name: /Import ARXML/i });
    await expect(importArxmlOption).toBeVisible();

    // 2) 选择 fixture 文件
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      importArxmlOption.click(),
    ]);
    await fileChooser.setFiles('e2e/fixtures/ecuc-minimal.arxml');

    // 3) 解析成功 → alert 提示导入模块数（Can = 1 个模块）
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('ARXML 导入成功');
    await dialog.accept();

    // 4) Editor 仍在正常状态（模块树可见）
    await expect(editor.moduleTree).toBeVisible();
  });
});
