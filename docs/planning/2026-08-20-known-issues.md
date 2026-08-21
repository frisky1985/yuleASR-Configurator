# 需求总体架构：yuleASR-Configurator 已知问题修复（2026-08-20）

> 触发：老板指令「修复 yuleasr-web 已知问题」。基于 GitHub open
> issues + 仓库既有测试问题梳理。

## 已知问题清单（调研结论）

| ID            | 问题                                  | 来源                   | 优先级 | 根因                                                                                                                                                                                                                                                        |
| ------------- | ------------------------------------- | ---------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| YAC-KNOWN-001 | 纯净 win11 0.4.0 无法启动             | GH #49（真实用户 bug） | P0     | `apps/yuleasr-desktop/electron/main.mjs:10` 用 `import { autoUpdater } from 'electron-updater'`，但 electron-updater 是 CJS 模块（`out/main.js` + `exports.xxx`），ESM named import 在打包后 Electron 崩溃 → main 进程启动即挂。修复：default import + 解构 |
| YAC-KNOWN-002 | 全仓 vitest 无法运行                  | 实测复现               | P0     | 根 `vitest.config.ts` 用 `test.workspace`（Vitest 3 API），Vitest 4 已移除 → 需迁移 `test.projects`                                                                                                                                                         |
| YAC-KNOWN-003 | replace-cfgh 2 测试文件 import 失败   | 小克 YAC-DEP 报告      | P1     | `scripts/replace-cfgh.ts:25` 导入 `@yuletech/core/schema/load-generated`，但 core package.json `exports` 无该子路径（仅 `.` 和 `./plugins`）→ module not found                                                                                              |
| YAC-KNOWN-004 | ARXML E2E + 空状态 + 下拉菜单测试缺口 | GH #13（李工评审）     | P2     | 测试缺口：Export ARXML 按钮/下拉、空状态 Dashboard/Editor/Generate、Save/Export/Import/overflow 下拉                                                                                                                                                        |
| YAC-KNOWN-005 | CrossModuleValidator 全局状态风险     | GH #11（陈工评审）     | P2     | 单例注册模式，多配置并行时校验状态污染；建议 TODO 标记 + 实例绑定（当前单配置不受影响）                                                                                                                                                                     |

**不纳入**（enhancement，非"已知问题"）：#12 Save Split Button（P3 polish）、#10
GeneratorRegistry 版本感知（P2，需 4.2 时再做）、Dependabot PR #50/51/52。

## 原子需求

### 原子 YAC-KNOWN-001：electron-updater CJS import 修复（P0）

- 交付：`apps/yuleasr-desktop/electron/main.mjs` 修复 + 验证
- 修复：`import pkg from 'electron-updater'; const { autoUpdater } = pkg;`
- 验收：Node 侧可解析（`node -e "const p=require('electron-updater'); typeof p.autoUpdater"`
  非 undefined）；eslint 通过；desktop-utils.test.mjs 通过

### 原子 YAC-KNOWN-002：vitest 4 workspace→projects 迁移（P0）

- 交付：根 `vitest.config.ts` 迁移 + 全仓单测恢复
- 验收：`pnpm vitest run` 能启动并跑完（yuleasr-web 全绿；yulecommunity
  8 失败属既有问题需单列——如时间允许一并排查，否则如实记录）

### 原子 YAC-KNOWN-003：replace-cfgh import 修复（P1）

- 交付：`@yuletech/core` package.json `exports` 补
  `./schema/load-generated`（或改导入路径），replace-cfgh 2 测试可运行
- 验收：2 个 replace-cfgh 测试文件不再 import 失败

### 原子 YAC-KNOWN-004：测试缺口补全（P2，可选本轮）

- 交付：按 #13 清单补 ARXML E2E + 空状态 + 下拉菜单测试
- 验收：新增测试全绿

### 原子 YAC-KNOWN-005：CrossModuleValidator TODO 标记（P2，可选本轮）

- 交付：加 TODO 注释 + 文档标注
- 验收：无行为变更，仅注释/文档

## 验收总览

- 小明亲自复现：`pnpm vitest run` 启动 + yuleasr-web 全绿 +
  replace-cfgh 不再 import 失败；#49 修复方案代码审查（不采信自报）

## 状态

- [x] 问题清单调研落盘（本文档）
- [ ] 原子逐一开发
- [ ] 小明终审验收
