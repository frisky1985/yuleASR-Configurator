# yuleASR Configurator 桌面工作台改造设计（DaVinci 范式复刻）

- 日期：2026-11-16
- 状态：待评审
- 范围：`apps/yuleasr-web`（共享 UI）+ `apps/yuleasr-desktop`（Electron 增量）
- 参考：Vector DaVinci Configurator Classic 的 Basic Editor、校验、生成工作流

## 1. 目标

把桌面端从「网页套壳」改成符合 AUTOSAR 配置工具心智的工作台：

1. 保留 DaVinci 的核心闭环：模块树 → 参数编辑 → 校验 → 应用修复 → 生成，不追求像素级一致。
2. 用第一性原理回答「工程师每一步要看到什么」，把问题反馈放在决策点旁边：参数行内标错、右侧检查器给元信息和修复、底部面板留全局清单。
3. 用 Electron 补齐网页做不了的事：多窗口、全局快捷键、本地 ARXML 拖拽、草稿静默保存与恢复、启动工作台。

## 2. 非目标

- 不改 Dashboard、模板、Git Sync、Compare/Diff、设置等功能页的页面内容（只换外层导航）。
- 不实现结构级自动修复（缺容器、缺引用的自动创建）。
- 不重做 schema、校验器、代码生成器的业务规则。
- 不做 DaVinci 的 Groovy/Kotlin 脚本自动化或 CLI 客户端。

## 3. 已确认的决策

| 决策 | 结论 |
| --- | --- |
| 复刻档位 | 范式复刻 + 桌面增强（非像素级、非 Evo2 风格） |
| 骨架 | 方案 A 的底部问题面板 + 方案 B 的右侧检查器 |
| 页面范围 | 全局外壳 + 编辑器页；其余功能页内容不动 |
| 代码落点 | 共享改造 + 桌面增量（桌面能力用 `window.electronAPI` 门控） |
| 修复能力 | 只做可执行修复：夹值到边界、必填填默认、依赖模块自动启用 |
| 桌面能力 | 全部纳入：多窗口、快捷键、ARXML 拖拽、静默保存、启动工作台 |

## 4. 布局与信息架构

单窗口自上而下：

1. **顶栏**：工程名、文件菜单、窗口控制区（桌面端）。
2. **段标签**：Basic Editor / BSW 管理 / 通信 / 诊断 / 生成。Basic Editor 展示全部模块，其余标签按模块分类过滤，分类复用 schema 中已有的层/类别字段；生成标签只切换底部面板到「生成」Tab。
3. **面包屑 + 工具栏**：`Can / CanConfigSet / CanController_0`；右侧为搜索、折叠全部、撤销/重做、保存、校验、生成。
4. **主区（可拖拽三栏）**：
   - 左：模块/容器树，26%，节点显示错误/警告计数徽标。
   - 中：参数区，弹性宽度，表头固定，行内 severity 颜色与单位列。
   - 右：检查器，24%，含「当前项 / 修复建议 / 元信息 / 引用」四段。
5. **底部面板**：问题 / 生成 / 输出 / 控制台四个 Tab，默认问题；可折叠，高度可拖拽。
6. **状态栏**：保存状态、校验摘要（错误/警告数）、参数总数、上次生成时间。

面板宽度、折叠状态、当前段标签、底部 Tab 持久化到 `settingsStore`（沿用现有持久化机制）。

## 5. 组件拆分

新增目录 `apps/yuleasr-web/src/components/workbench/`：

| 组件 | 职责 | 依赖 |
| --- | --- | --- |
| `WorkbenchShell` | 三段式布局、分隔条拖拽、面板折叠、快捷键挂载 | settingsStore |
| `WorkbenchTopBar` | 段标签、面包屑、工具栏按钮 | 路由、configStore |
| `ConfigTreePane` | 包装现有 ConfigTree，注入问题徽标与选中联动 | ConfigTree |
| `ParameterPane` | 包装 ContainerParameterList / ParameterEditor，注入行内 severity | configStore |
| `InspectorPane` | 当前选中项、建议、元信息、引用、可执行修复按钮 | issues、schema |
| `ProblemsPanel` | 问题列表、严重级过滤、确认/忽略、双击定位 | issues |
| `WorkbenchStatusBar` | 状态摘要 | configStore、settingsStore |

`Editor.tsx` 退化为编排层：读路由参数、加载配置、维持弹窗状态，把数据传给上述组件。现有 `ValidationPanel`、`ConfigurationStatusPanel` 继续复用或降级为嵌入视图。

### 落地分两步

1. **纯抽取**：把现有 JSX 片段抽成组件，不改行为，跑通测试。
2. **换布局**：接入 `WorkbenchShell`，替换原布局，删除旧结构。

## 6. 问题模型与联动

在 `ValidationIssue`（[config.ts](file:///workspace/apps/yuleasr-web/src/types/config.ts#L250-L262)）上扩展可选字段：

```ts
type FixDescriptor =
  | { kind: 'clamp-min'; module: string; containerPath?: string; parameter: string; value: number }
  | { kind: 'clamp-max'; module: string; containerPath?: string; parameter: string; value: number }
  | { kind: 'set-default'; module: string; containerPath?: string; parameter: string; value: unknown }
  | { kind: 'enable-module'; module: string };

interface ValidationIssue {
  // ...现有字段
  fix?: FixDescriptor;
  acknowledged?: boolean;
}
```

- 校验器只在能安全执行时填 `fix`；其余问题保留 `suggestion` 文本。
- 四处共享同一份「当前选中问题」，点击树徽标、参数行、底部列表、检查器其余三处同步定位。
- 支持按 severity 过滤与「确认」隐藏单条消息（DaVinci 的 acknowledge 机制）。

## 7. 可执行修复流程

1. `ProblemsPanel` / `InspectorPane` 检测 `fix` 字段，渲染「应用」按钮。
2. 点击后调用 `configStore` 的既有更新动作（修改参数值或启用模块）。
3. 更新后自动重跑校验，问题从列表消失，状态栏计数刷新。
4. 所有修复走现有 undo/redo 栈，可撤销。
5. 无 `fix` 的问题只显示建议与「定位到参数」。

## 8. 桌面增量（`window.electronAPI` 门控）

| 能力 | 实现要点 |
| --- | --- |
| 全局快捷键 | 渲染进程统一监听：`Ctrl+S` 保存、`Ctrl+F` 参数搜索、`Ctrl+Shift+V` 校验、`Ctrl+Shift+G` 生成；与现有 `KeyboardShortcutsHelp` 对齐 |
| 多窗口 | 主进程新增 `window:new` IPC，菜单与快捷键触发；同一工程可在新窗口打开 |
| ARXML 拖拽 | 渲染层 `drop` 事件取 `path`，经 `readFile` 读取后走现有导入流程 |
| 静默保存 + 恢复 | 编辑变更防抖写草稿（`app.getPath('userData')/drafts`），启动时提示恢复 |
| 启动工作台 | 新增启动页：最近工程、新建、导入 ARXML；受 `isElectron` 门控，Web 端直接进 Dashboard |

主进程改动集中在 [main.mjs](file:///workspace/apps/yuleasr-desktop/electron/main.mjs) 与 [preload.mjs](file:///workspace/apps/yuleasr-desktop/electron/preload.mjs)，IPC 一律走白名单，文件写入沿用 `desktop-utils.mjs` 的校验。

## 9. 错误处理

- 配置加载失败：主区显示空状态 + 重试，状态栏标红，不阻塞导航。
- 校验器异常：沿用 `validationDegraded` 标记，底部面板提示「校验降级」，不隐藏旧结果。
- 修复失败（值不合法或模块不可启用）：检查器就地显示失败原因，不回滚其他改动。
- 草稿写入失败：状态栏提示「自动保存不可用」，保留手动保存。
- 拖拽非 ARXML 或超大文件：直接拒绝并提示，不进入解析。

## 10. 测试与验收

**自动化**

- 新增单测：`FixDescriptor` 生成与执行、问题选中联动 reducer、`settingsStore` 布局持久化。
- 组件测试：`ProblemsPanel` 过滤与确认、`InspectorPane` 修复按钮显隐。
- 命令：`pnpm --filter yuleasr-web test`、`pnpm --filter yuleasr-web typecheck`、`pnpm lint:ci`。

**手动清单**

1. 桌面端启动 → 启动工作台 → 打开最近工程。
2. 树中点模块 → 参数区渲染 → 底部出现对应问题。
3. 点问题 → 定位到参数 → 检查器显示元信息。
4. 应用「夹值」修复 → 问题消失 → `Ctrl+Z` 可撤销。
5. 折叠/展开底部面板、拖拽栏宽 → 重启后保持。
6. 拖入 ARXML → 正常导入；拖入 txt → 拒绝并提示。
7. 编辑后强杀进程 → 重开提示恢复草稿。
8. Web 端验证：不出现多窗口/启动工作台入口，布局正常。

## 11. 风险

| 风险 | 缓解 |
| --- | --- |
| `Editor.tsx` 1200+ 行，一次性重排易回归 | 分两步：先纯抽取不改行为，再换布局 |
| 共享 UI 改动影响 Web 端 | 布局改动对两端口径一致；桌面专属能力全部走 `electronAPI` 门控 |
| 校验器新增 `fix` 字段影响现有测试 | 字段可选，先补测试再填值 |
| 多窗口与现有 store 单例冲突 | 每个窗口独立渲染进程，状态从持久化层加载，不做跨窗口实时同步（后续再议） |
