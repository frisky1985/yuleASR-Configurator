# 原子需求 YAC-CI-004：CI 全绿修复（tsup+TS7 构建链 + build 前置 + prettier）（2026-08-21）

> 提出：老板 19:43「继续」| 编排：小明 | 依据：YAC-CI-003 触发排障（CI 首次真实运行暴露仓库既有债）状态：待开发 | 负责：小克 | 验收：小明（不采信自报，真实 CI 验证）

## 背景与根因（小明已实测确认）

YAC-CI-003 首次真实触发 CI，发现**该仓库 CI 从未真正跑绿过**（此前所有 job 在 Setup
pnpm 秒挂）。触发后暴露 3 层问题（前 2 层已修：pnpm/action-setup
version 冲突、空 with 块、GNU tar 兼容——`cb92bf2d` 后 linkage
gate 的 scratch 步骤已在 CI 通过）。剩余阻塞：

### 根因 A：tsup 8.5.1 dts 生成崩溃（build 链断裂）

- **现象**：`npx tsup`（plugin-sdk/ui）报
  `TypeError: Cannot read properties of undefined (reading 'useCaseSensitiveFileNames')`，本地同样复现
- **根因**：tsup 8.5.1 内置 bundle 的 rollup-plugin-dts 6.1.1 与 TS
  7.0.2（Go 重构版）不兼容。TS7 的 `require('typescript')` 主入口只返回
  `lib/version.cjs`（仅 `{"version":"7.0.2"}`），完整 API 移到
  `dist/api/*`（unstable 前缀）→ rollup-plugin-dts 内部
  `ts.sys.useCaseSensitiveFileNames` 读取 undefined
- **已验证无效**：① pnpm overrides
  rollup-plugin-dts@6.5.1（无效——rollup-plugin-dts 被 tsup bundle 进
  `dist/rollup.js`，overrides 无法替换 bundle 内代码）；② 单包降 TS 到 6.0.3（仍 DTS
  Build error，需深查）
- **候选方案**（小克自行验证选择）：a)
  tsup 配置改用 api-extractor 生成 dts（tsup peer 有
  `@microsoft/api-extractor ^7.36.0`，需验证其对 TS7 兼容）b) 给 rollup-plugin-dts 打补丁/换版本（需确认 tsup 是否支持外部化 dts 插件）c) 降 TS 到 6.x（注意 YAC-CI-002 成果是 root
  TS6 工具位 + 9 包 ^7.0.2 side-by-side，typecheck 5/5 绿 core
  tsc=7.0.2 实测——降级需重新评估，尽量不动 typecheck 成果）d) 其他（如 dts:
  false + 单独 tsc emitDeclarationOnly 等）

### 根因 B：CI 全新环境缺 build 产物（dist）

- typecheck/test/integration/linkage 均依赖 `@yuletech/plugin-sdk`
  等 workspace 包的 dist（exports 指向 dist）
- CI 只 `pnpm install` 不 build →
  `Cannot find module '@yuletech/plugin-sdk'`（TS2307）连锁失败
- **修复**：相关 job 在跑测试前先 build 依赖包（`pnpm -r build` 或按需
  `pnpm --filter`），或全仓 build 顺序调整

### 根因 C：prettier 326 文件格式漂移

- `format:check` 报 326 文件 prettier 问题（基线 commit 就存在，本地同样复现）
- **修复**：`prettier --write` 全仓格式化（或确认是否需要全量）

## 验收标准（SHALL，全达成才算完成）

1. **build 全绿**：`pnpm -r build`（或等价）在本地真实跑通，plugin-sdk/ui/core 等全部产出 dist，无 tsup 崩溃
2. **typecheck/test 全绿**：全仓 vitest ≥ 1616/1616（core 991 + web
   325 基线）、typecheck 全绿
3. **CI 真实运行绿**：push 后 GitHub
   Actions 全 job 绿（含 configurator-linkage：dry-run 109/109 → build exit 0 →
   ctest 55/55 → rollback 109/109 → dirty=0）
4. **format:check 通过**：prettier 0 文件问题
5. **小批量独立 commit([AI-GENERATED]) + push**，message 注 YAC-CI-004

## 约束

- yuleASR 仓库只读；模型只用 deepseek-v4-flash，禁止 pro
- 尽量不破坏 YAC-CI-002 成果（root TS6 工具位 + 包内 TS7
  side-by-side、lint 门禁）
- 被截断时写 checkpoint 标注"需接力"，列明各根因完成度

## 输出

报告：各根因修复方案与证据、build/typecheck/vitest/format 实测数字、CI 真实运行结果（run 链接）、commit 清单、遗留项。
