# Sprint Contract: Dashboard Service 层统计 (P1-3 / Phase 1.8)

> 2026-08-01

## Scope

- **What**:
  Dashboard 页增加按 AUTOSAR 层 (MCAL/ECUAL/Service/RTE/OS/ASW) 的模块统计
- **In Scope**: Dashboard.tsx stats 计算 + 层分布 UI 区块 + i18n (zh/en)
- **Out of
  Scope**: 依赖图 mock 替换 (handleShowGraph)、导出 mock 替换 (handleExportConfig)、Phase
  3 UI 组件库

## Architecture Decision

- 数据源: 现有 `configDetails` (localStorage 完整 ConfigFile[]) — 已有
  `modules[].layer`
- 统计方式: 按 layer 聚合 enabled 模块数，跨所有配置汇总
- UI: 在 4 个 stat-card 下方新增 "模块分布" 区块，每层一个进度条 + 计数，Service 层高亮
- i18n: zh.json + en.json 同步加 `dashboard.layerDistribution` /
  `dashboard.layer.*` keys

## Testable Behaviors

- [ ] B1: stats 增加 layerBreakdown (Record<Layer, number>)，聚合 enabled 模块
- [ ] B2: UI 渲染 6 层分布条 + 总数，Service 层有计数
- [ ] B3: 无配置时显示空态，不崩溃
- [ ] B4: zh/en 文案齐备
- [ ] B5: build + typecheck 通过

## Acceptance Criteria

| ID  | Criterion | Pass Condition                                          | Fail Condition | Priority |
| --- | --------- | ------------------------------------------------------- | -------------- | -------- |
| A1  | 数据正确  | layerBreakdown 计数与 configDetails 中 enabled 模块一致 | 计数不符       | P0       |
| A2  | UI 呈现   | 6 层分布条可见，Service 层高亮                          | 不渲染/缺层    | P0       |
| A3  | 空态安全  | 0 配置时不抛错                                          | 崩溃           | P1       |
| A4  | i18n 完整 | zh/en 无缺失 key                                        | 缺翻译         | P1       |
| A5  | 构建通过  | pnpm build 无 TS 错误                                   | 构建失败       | P0       |

## Responsibility Matrix

| Criterion | Responsible               | Fallback             |
| --------- | ------------------------- | -------------------- |
| A1/A2     | Generator (Dashboard.tsx) | Evaluator (数据核对) |
| A3/A5     | Generator                 | Evaluator (build)    |
| A4        | Generator (i18n)          | Evaluator (key 检查) |

## Negotiation Log

| Round | Party          | Action  | Notes                                     |
| ----- | -------------- | ------- | ----------------------------------------- |
| 1     | Generator      | 提案    | 沿用现有 configDetails 数据流，无架构变化 |
| 1     | architect-lead | APPROVE | 数据已有 (layer 字段), 纯 UI 增量         |
| 1     | Evaluator      | APPROVE | A1-A5 可客观验证 (build + 代码检查)       |

_Contract approved 2026-08-01 — 开始实现_
