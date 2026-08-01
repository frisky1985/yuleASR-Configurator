# Sprint Contract: Schema AUTOSAR 短期合规补全

> 2026-08-01 · 对应 TASK_STATUS P1-2/P1-4 + 合规评估短期路线

## Scope

- **What**: 三项 schema 合规补全
  1. 28 个缺 CommonPublishedInformation 的 schema 补齐（标准 8 字段）
  2. IoHwAb 空壳补全（IoHwAbDio/IoHwAbAdc 增加真实参数定义）
  3. 已知枚举参数 enum 化（PortPinDirection / GptChannelMode / 其他明确枚举）
- **In Scope**: 54 个 schema JSON + schema-validation 测试断言增强
- **Out of Scope**: 中期路线（x-multiplicity/x-config-class/crossReferences）、P0-1 Can/Mcu 编译 bug

## Architecture Decision

- **方式**: 脚本批量处理 CPI（确定性模板），手动/半自动处理 IoHwAb 与枚举（需判断）
- **CPI 模板**: 对齐现有 dio/gpt/spi 的 8 字段结构（ArRelease*3 + ModuleId + Sw*3 + VendorId）
- **枚举原则**: 严格用 AUTOSAR 规范名（PortPinDirection: PORT_PIN_IN/OUT），不猜测

## Testable Behaviors

- [ ] B1: 54/54 schema 均含 CommonPublishedInformation 容器（新增测试断言）
- [ ] B2: CPI 容器含 8 个标准字段，类型/范围一致
- [ ] B3: IoHwAb 的 IoHwAbDio/IoHwAbAdc 不再为空壳（有具体参数属性）
- [ ] B4: PortPinDirection / GptChannelMode 等已知枚举参数带 enum 值
- [ ] B5: schema-validation.test.ts 110 断言全过
- [ ] B6: 全量 core 测试不回归（保持 515 过 / 2 失败基线）

## Acceptance Criteria

| ID | Criterion | Pass Condition | Fail Condition | Priority | Owner |
|----|-----------|----------------|----------------|----------|-------|
| A1 | CPI 全覆盖 | 54/54 schema 有 CPI | 任一缺失 | P0 | Generator |
| A2 | CPI 结构一致 | 8 字段全齐且类型正确 | 缺字段/类型错 | P0 | Generator |
| A3 | IoHwAb 可用 | IoHwAbDio/IoHwAbAdc 有参数属性 | 仍为空对象 | P1 | Generator |
| A4 | 枚举合规 | 明确枚举参数用 AUTOSAR 枚举名 | 枚举值臆造 | P1 | Generator |
| A5 | 测试全绿 | 110 schema 断言 + 全量无新失败 | 断言失败/回归 | P0 | Evaluator |

## Responsibility Matrix

| Criterion | Responsible | Fallback |
|-----------|-------------|----------|
| A1/A2 | Generator (脚本+测试) | Evaluator (测试断言) |
| A3 | Generator (IoHwAb 设计) | architect-lead (字段校验) |
| A4 | Generator (规范对照) | Evaluator (枚举值核查) |
| A5 | Evaluator | Generator (修复) |

## Negotiation Log

| Round | Party | Action | Notes |
|-------|-------|--------|-------|
| 1 | Generator | 提案 | 老板指令"先从短期开始干"，contract 即提案 |
| 1 | architect-lead | APPROVE | 脚本批量 + 手动判断混合策略合理，不引入架构变化 |
| 1 | Evaluator | APPROVE | A1-A5 均可客观验证（grep + vitest），无模糊项 |

_Contract approved 2026-08-01 — 开始实现_
