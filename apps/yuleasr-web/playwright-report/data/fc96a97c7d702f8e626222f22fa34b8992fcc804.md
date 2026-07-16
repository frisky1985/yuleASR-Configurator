# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: config-tree.spec.ts >> Configuration Tree / Module Navigation >> should display Import Config button
- Location: e2e/config-tree.spec.ts:39:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /Import/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: /Import/i })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e7]:
      - generic [ref=e8]:
        - link "社区首页" [ref=e9] [cursor=pointer]:
          - /url: /community/#/
          - img [ref=e10]
          - text: 社区首页
        - link "论坛" [ref=e13] [cursor=pointer]:
          - /url: /community/#/forum
          - img [ref=e14]
          - text: 论坛
        - link "博客" [ref=e16] [cursor=pointer]:
          - /url: /community/#/blog
          - img [ref=e17]
          - text: 博客
        - link "文档" [ref=e19] [cursor=pointer]:
          - /url: /community/#/docs
          - img [ref=e20]
          - text: 文档
        - link "开源" [ref=e23] [cursor=pointer]:
          - /url: /community/#/opensource
          - img [ref=e24]
          - text: 开源
        - generic [ref=e30]:
          - img [ref=e31]
          - text: 配置器
      - generic [ref=e35]:
        - button "Free" [ref=e36] [cursor=pointer]:
          - img [ref=e37]
          - generic [ref=e39]: Free
        - text: yuleASR BSW Configurator
    - generic [ref=e42]:
      - link "YL yuleASR 配置器" [ref=e44] [cursor=pointer]:
        - /url: /configurator
        - generic [ref=e46]: YL
        - generic [ref=e47]: yuleASR 配置器
      - navigation [ref=e48]:
        - link "仪表盘" [ref=e49] [cursor=pointer]:
          - /url: /configurator/dashboard
          - img [ref=e50]
          - generic [ref=e53]: 仪表盘
        - link "插件" [ref=e54] [cursor=pointer]:
          - /url: /configurator/plugins
          - img [ref=e55]
          - generic [ref=e57]: 插件
        - link "模板" [ref=e58] [cursor=pointer]:
          - /url: /configurator/templates
          - img [ref=e59]
          - generic [ref=e64]: 模板
        - link "Migrate" [ref=e65] [cursor=pointer]:
          - /url: /configurator/migrate
          - img [ref=e66]
          - generic [ref=e69]: Migrate
        - link "Git 同步" [ref=e70] [cursor=pointer]:
          - /url: /configurator/sync
          - img [ref=e71]
          - generic [ref=e75]: Git 同步
        - link "设置" [ref=e76] [cursor=pointer]:
          - /url: /configurator/settings
          - img [ref=e77]
          - generic [ref=e80]: 设置
        - button "已启用 0 个插件" [ref=e82] [cursor=pointer]:
          - img [ref=e83]
        - button "EN" [ref=e86] [cursor=pointer]:
          - img [ref=e87]
          - generic [ref=e90]: EN
        - button "键盘快捷键 (Ctrl+/)" [ref=e91] [cursor=pointer]:
          - img [ref=e92]
        - button "Switch to dark mode (Ctrl+D)" [ref=e94] [cursor=pointer]:
          - img [ref=e95]
  - main [ref=e97]:
    - generic [ref=e98]:
      - generic [ref=e99]:
        - generic [ref=e100]:
          - heading "配置管理" [level=1] [ref=e101]
          - paragraph [ref=e102]: 管理您的 yuleASR 配置和模块
        - button "新建配置" [ref=e103] [cursor=pointer]:
          - img [ref=e104]
          - text: 新建配置
      - generic [ref=e105]:
        - generic [ref=e106]:
          - generic [ref=e107]:
            - paragraph [ref=e108]: 配置总数
            - img [ref=e110]
          - paragraph [ref=e115]: "3"
          - paragraph [ref=e116]: 3 个配置
        - generic [ref=e117]:
          - generic [ref=e118]:
            - paragraph [ref=e119]: 模块总数
            - img [ref=e121]
          - paragraph [ref=e125]: "85"
          - paragraph [ref=e126]: 跨所有配置
        - generic [ref=e127]:
          - generic [ref=e128]:
            - paragraph [ref=e129]: 平均完成度
            - img [ref=e131]
          - paragraph [ref=e134]: 0%
        - generic [ref=e136]:
          - generic [ref=e137]:
            - paragraph [ref=e138]: 警告
            - img [ref=e140]
          - paragraph [ref=e142]: "0"
          - paragraph [ref=e143]: 无警告 —— 一切正常
      - generic [ref=e144]:
        - heading "快速操作" [level=2] [ref=e145]
        - generic [ref=e146]:
          - button "打开现有配置 浏览本地配置文件" [ref=e147] [cursor=pointer]:
            - img [ref=e149]
            - heading "打开现有配置" [level=3] [ref=e151]
            - paragraph [ref=e152]: 浏览本地配置文件
          - button "导入 yuleASR 从 yuleASR 配置导入" [ref=e153] [cursor=pointer]:
            - img [ref=e155]
            - heading "导入 yuleASR" [level=3] [ref=e160]
            - paragraph [ref=e161]: 从 yuleASR 配置导入
          - button "模块向导 逐步配置模块" [ref=e162] [cursor=pointer]:
            - img [ref=e164]
            - heading "模块向导" [level=3] [ref=e167]
            - paragraph [ref=e168]: 逐步配置模块
          - button "依赖关系图 查看模块关系" [ref=e169] [cursor=pointer]:
            - img [ref=e171]
            - heading "依赖关系图" [level=3] [ref=e176]
            - paragraph [ref=e177]: 查看模块关系
      - generic [ref=e178]:
        - generic [ref=e179]:
          - heading "最近配置" [level=2] [ref=e180]
          - generic [ref=e181]: 3 个配置
        - generic [ref=e182]:
          - generic [ref=e184]:
            - generic [ref=e186] [cursor=pointer]:
              - img [ref=e188]
              - generic [ref=e191]:
                - heading "Default Configuration" [level=3] [ref=e192]
                - paragraph [ref=e193]: Complete yuleASR configuration with MCAL, BSW, OS layers
                - generic [ref=e194]:
                  - generic [ref=e195]:
                    - img [ref=e196]
                    - text: 37 个模块
                  - generic [ref=e200]:
                    - img [ref=e201]
                    - text: 2026年7月16日 21:29
                  - generic [ref=e204]: 已完成 0%
            - generic [ref=e207]:
              - button "dashboard.diffConfigs" [ref=e208] [cursor=pointer]:
                - img [ref=e209]
              - button "比较配置" [ref=e213] [cursor=pointer]:
                - img [ref=e214]
              - button "查看依赖关系图" [ref=e219] [cursor=pointer]:
                - img [ref=e220]
              - button "导出到 yuleASR" [ref=e225] [cursor=pointer]:
                - img [ref=e226]
              - button "编辑" [ref=e229] [cursor=pointer]:
                - img [ref=e230]
              - button "删除" [ref=e232] [cursor=pointer]:
                - img [ref=e233]
          - generic [ref=e237]:
            - generic [ref=e239] [cursor=pointer]:
              - img [ref=e241]
              - generic [ref=e244]:
                - heading "Production Config" [level=3] [ref=e245]
                - paragraph [ref=e246]: Production ready configuration with optimized settings
                - generic [ref=e247]:
                  - generic [ref=e248]:
                    - img [ref=e249]
                    - text: 11 个模块
                  - generic [ref=e253]:
                    - img [ref=e254]
                    - text: 2026年7月16日 21:29
                  - generic [ref=e257]: 已完成 0%
            - generic [ref=e260]:
              - button "dashboard.diffConfigs" [ref=e261] [cursor=pointer]:
                - img [ref=e262]
              - button "比较配置" [ref=e266] [cursor=pointer]:
                - img [ref=e267]
              - button "查看依赖关系图" [ref=e272] [cursor=pointer]:
                - img [ref=e273]
              - button "导出到 yuleASR" [ref=e278] [cursor=pointer]:
                - img [ref=e279]
              - button "编辑" [ref=e282] [cursor=pointer]:
                - img [ref=e283]
              - button "删除" [ref=e285] [cursor=pointer]:
                - img [ref=e286]
          - generic [ref=e290]:
            - generic [ref=e292] [cursor=pointer]:
              - img [ref=e294]
              - generic [ref=e297]:
                - heading "Development Config" [level=3] [ref=e298]
                - paragraph [ref=e299]: Development configuration with debug and diagnostic enabled
                - generic [ref=e300]:
                  - generic [ref=e301]:
                    - img [ref=e302]
                    - text: 37 个模块
                  - generic [ref=e306]:
                    - img [ref=e307]
                    - text: 2026年7月16日 21:29
                  - generic [ref=e310]: 已完成 0%
            - generic [ref=e313]:
              - button "dashboard.diffConfigs" [ref=e314] [cursor=pointer]:
                - img [ref=e315]
              - button "比较配置" [ref=e319] [cursor=pointer]:
                - img [ref=e320]
              - button "查看依赖关系图" [ref=e325] [cursor=pointer]:
                - img [ref=e326]
              - button "导出到 yuleASR" [ref=e331] [cursor=pointer]:
                - img [ref=e332]
              - button "编辑" [ref=e335] [cursor=pointer]:
                - img [ref=e336]
              - button "删除" [ref=e338] [cursor=pointer]:
                - img [ref=e339]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Configuration Tree / Module Navigation', () => {
  4  |   test('should render the dashboard with configuration list area', async ({ page }) => {
  5  |     await page.goto('/configurator/dashboard')
  6  |     // Dashboard should have a configuration list area or empty state
  7  |     const configSection = page.locator('text=/Recent Configurations|Create your first|No configurations/i')
  8  |     await expect(configSection).toBeVisible()
  9  |   })
  10 | 
  11 |   test('should display Quick Actions panel', async ({ page }) => {
  12 |     await page.goto('/configurator/dashboard')
  13 |     // The quick actions section should be visible
  14 |     const quickActions = page.locator('text=/Quick Actions/i')
  15 |     await expect(quickActions).toBeVisible()
  16 |   })
  17 | 
  18 |   test('should display stat cards', async ({ page }) => {
  19 |     await page.goto('/configurator/dashboard')
  20 |     // Dashboard should have stats cards (Total Configurations, Total Modules, etc.)
  21 |     const statCards = page.locator('.stat-card, [class*="stat"]')
  22 |     const count = await statCards.count()
  23 |     expect(count).toBeGreaterThanOrEqual(1)
  24 |   })
  25 | 
  26 |   test('should display dependency graph button', async ({ page }) => {
  27 |     await page.goto('/configurator/dashboard')
  28 |     // The dependency graph quick action button
  29 |     const depGraphBtn = page.getByRole('button', { name: /Dependency Graph/i })
  30 |     await expect(depGraphBtn).toBeVisible()
  31 |   })
  32 | 
  33 |   test('should display Module Wizard button', async ({ page }) => {
  34 |     await page.goto('/configurator/dashboard')
  35 |     const moduleWizardBtn = page.getByRole('button', { name: /Module Wizard/i })
  36 |     await expect(moduleWizardBtn).toBeVisible()
  37 |   })
  38 | 
  39 |   test('should display Import Config button', async ({ page }) => {
  40 |     await page.goto('/configurator/dashboard')
  41 |     const importBtn = page.getByRole('button', { name: /Import/i })
> 42 |     await expect(importBtn).toBeVisible()
     |                             ^ Error: expect(locator).toBeVisible() failed
  43 |   })
  44 | })
  45 | 
```