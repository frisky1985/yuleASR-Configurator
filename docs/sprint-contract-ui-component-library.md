# Sprint Contract: Phase 3 UI 组件库 (P2-1)

> 2026-08-01

## Scope

- **What**: 把 @yuletech/ui 从空壳变为可用的共享组件库
- **In Scope**:
  1. 8 个基础组件: Button / Input / Select / FormField / Modal / Tooltip / Tree
     / PropertyPanel
  2. lib 工具: cn() (clsx + tailwind-merge)
  3. 构建链: tsup (已配置) + vitest 测试 + typecheck
  4. 测试: 每个组件 smoke test (渲染/交互/className 合并)
- **Out of Scope**: web 应用大规模迁移到新组件库（后续迭代）、VS
  Code 扩展接入（后续）

## Architecture Decision

- **技术栈**: React 18+ + TypeScript + CVA (class-variance-authority) + clsx +
  tailwind-merge（与 web 应用现有工具链一致，shadcn 风格）
- **样式策略**: 组件类名直接引用 shadcn HSL tokens
  (border/input/ring/card) 与 app-* tokens
  (app-bg/app-text/app-border)，**不引入 tailwind 构建**——由消费方 (web
  app) 的 tailwind 提供这些类，组件库只输出 className 字符串（这是共享组件库的标准做法:
  UI 包不打包 CSS，样式由宿主应用解析）
- **依赖**: react, clsx, tailwind-merge, class-variance-authority, lucide-react
  (图标)
- **peerDependencies**: react >= 18, react-dom >= 18

## Testable Behaviors

- [ ] B1: `pnpm --filter @yuletech/ui build` 产出 dist (cjs+esm+dts)
- [ ] B2: `pnpm --filter @yuletech/ui test` 全部通过 (每组件 ≥1 测试)
- [ ] B3: `pnpm --filter @yuletech/ui typecheck` 通过
- [ ] B4: index.ts 导出全部 8 组件 + cn
- [ ] B5: web 应用能 import 组件库并渲染 (验证集成)

## Acceptance Criteria

| ID  | Criterion | Pass Condition                 | Fail Condition | Priority |
| --- | --------- | ------------------------------ | -------------- | -------- |
| A1  | 组件齐全  | 8 组件 + cn 全部实现并导出     | 缺组件         | P0       |
| A2  | 类型安全  | typecheck 0 错误               | 类型错误       | P0       |
| A3  | 测试通过  | vitest 全绿                    | 测试失败       | P0       |
| A4  | 构建成功  | tsup 产出 cjs/esm/dts          | 构建失败       | P0       |
| A5  | 可集成    | web 应用 import 组件渲染正常   | 集成失败       | P1       |
| A6  | 命名规范  | 无 utils/helpers/common 类泛名 | 违规命名       | P1       |

## Responsibility Matrix

| Criterion | Responsible               | Fallback                 |
| --------- | ------------------------- | ------------------------ |
| A1/A2/A4  | Generator                 | Evaluator                |
| A3        | Generator (写测试)        | Evaluator (跑测试)       |
| A5        | Generator (集成示例)      | Evaluator (build+浏览器) |
| A6        | architect-lead (命名审查) | —                        |

## Negotiation Log

| Round | Party          | Action  | Notes                                            |
| ----- | -------------- | ------- | ------------------------------------------------ |
| 1     | Generator      | 提案    | CVA + tailwind-merge 方案, 8 组件, 宿主解析样式  |
| 1     | architect-lead | APPROVE | UI 包不打包 CSS 是标准实践, 避免 tailwind 构建链 |
| 1     | Evaluator      | APPROVE | A1-A6 均可客观验证 (typecheck/build/test/import) |

_Contract approved 2026-08-01 — 开始实现_
