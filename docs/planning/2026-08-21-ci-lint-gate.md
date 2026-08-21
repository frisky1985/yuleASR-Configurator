# 需求总体架构：CI lint 门禁修复（2026-08-21）

> 触发：老板确认「B 止血 + A 攻坚」组合方案。背景调研见对话记录（typescript-eslint 8.66/8.67 硬性拒绝 TS 7.0，上游 issue #10940 跟踪 TS≥7.1）。

## 已知事实（已实测）
- `pnpm lint:ci` = `eslint apps/yuleasr-desktop packages/@yuletech/plugin-sdk`，typescript-eslint index.js:52 硬编码 `if (versionMajor >= 7) throw` → CI lint-and-format job 必红
- typescript-eslint 8.67.0 稳定版 peerDeps 仍 `>=4.8.4 <6.1.0`，无 9.x；8.67.1-alpha 未放开
- TS 6.0.3 + typescript-eslint 8.66 实测 lint 正常（规则真实触发）
- pnpm 9.0.0/9.15.9/10.34.5 嵌套对象 overrides 报 `pref.startsWith is not a function`（疑似 pnpm bug）；`>` selector 对 peer 不生效
- vite 8 不依赖 typescript（peerDeps 无）

## 原子需求

### 原子 YAC-CI-001（P0）：lint 门禁止血
- 目标：CI lint-and-format job 不再阻塞 typecheck/test，CI 恢复绿
- 方案：Lint 步骤加 `continue-on-error: true`（步骤级，job 仍成功、format:check 照跑），或 job 级 continue-on-error + 依赖处理——以 GitHub Actions 行为为准选最小侵入
- 附带：登记 GitHub issue「typescript-eslint 支持 TS7 后恢复 lint 门禁」（关联上游 #10940）
- 验收：`.github/workflows/ci.yml` 改动提交；lint 失败不再红 CI（模拟验证或说明机制）

### 原子 YAC-CI-002（P1）：side-by-side TS6 攻坚
- 目标：主工程保留 TS 7.0.2，仅让 typescript-eslint 解析到 TS 6.0.3，`pnpm lint:ci` 真实通过
- 候选路径（自选，先验证后落地）：
  1. pnpm 11 嵌套 overrides（官方语法 `"typescript-eslint@8.66.0": { "typescript": "6.0.3" }`）——pnpm 11 可能修复 9/10 的 bug
  2. `pnpm.packageExtensions` 改 typescript-eslint 的 peer 声明
  3. pnpm patch typescript-eslint（跳过版本检查 + 显式解析 TS6）
  4. 其他你验证可行的方式
- 约束：不改主工程 typescript 版本；不破坏 typecheck/test/E2E；可回滚
- 验收：`pnpm lint:ci` 真实通过（0 error）；`pnpm typecheck` 仍用 TS7 正常；无 hack 残留在 lockfile 外
- **若 1-2h 内无可行方案，如实报告并维持 YAC-CI-001 止血态**，不强行 hack

## 验收总览
- 小明亲自复现 `pnpm lint:ci` + typecheck + CI 配置审查

## 状态
- [x] 方案定稿（B 止血 + A 攻坚）
- [x] YAC-CI-001（commit 4983be5f；门禁已随 002 恢复，见 #54）
- [x] YAC-CI-002（commit 29a13e6f + 15c336d4：root TS6 peer 侧载；候选 1/2 否决原因见 commit message）
