# Sprint 3: Web UI + Desktop App

**周期：** 2周（2026-07-12 ~ 2026-07-26）

## Phase 1: Web UI 集成（7天）

### Task 1 — UI Adapter 层

- `apps/yuleasr-web/src/services/ui-adapter.ts`
- 将 `ConfigModule`（UI 格式：嵌套容器 + 参数数组）→ `ModuleSchema` +
  `ModuleConfig`（generator 格式：平面容器 + 参数对象）
- 处理子容器递归展平、参数值提取、类型映射
- 15+ 测试

### Task 2 — 替换 codegen.ts 为 core generator

- 现有 `codegen.ts` 是自实现（只生成 .h），替换为调用 `EcucCodeGenerator`
- 生成全部 4 文件（.h + .c + \_PBcfg.c + \_Lcfg.c）
- 保持现有 `generateAllHeaders()` / `generateHeader()` API 签名不变

### Task 3 — 下载体验

- JSZip 打包所有生成文件为 `.zip`
- 浏览器触发下载
- 内联预览面板（CodeMirror 或 monaco）

### Task 4 — 更新 Editor UI

- Generate 按钮改为下拉菜单："生成代码" / "下载 ZIP"
- 生成后自动打开预览面板
- 已启用模块数量提示

## Phase 2: Desktop App（7天）

### Task 5 — Electron 脚手架

- `apps/yuleasr-desktop/`
- 封装 Vite + Electron
- 菜单栏 + 文件拖入

### Task 6 — Desktop 特有功能

- 本地文件系统输出（选择目录 → 生成 .h/.c 文件直接落盘）
- 集成 `gcc -fsyntax-only` 本地验证
- 状态栏显示编译结果

### Task 7 — 跨端统一

- 共享 UI 组件库
- 打包脚本（dmg / .exe / AppImage）

---

开始执行？我先从 **Task 1 (UI Adapter)** 开始，这是后面所有任务的前提。
