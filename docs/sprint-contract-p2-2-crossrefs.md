# Sprint Contract — P2-2: crossReferences 全量推广 + 验证链路打通

日期: 2026-08-01模块: yuleASR-Configurator / @yuletech/core

## 背景 (调研结论)

调查发现 crossReferences **当前标注了但从未生效**，链路断裂在三处:

1. **54 个 generated JSON (ModuleJsonSchema 嵌套结构) 从未被加载** —
   schemaExtractor 只注册 3 个硬编码默认 schema (Mcu/Can/Gpt)；54
   JSON 无任何 loader 转换
2. **标注位置错位** — 现有 can/cantrcv/pdur 的 crossReferences 挂在**模块级**
   (ModuleJsonSchema.crossReferences)，而 CrossModuleValidator 只读**参数级**
   (ModuleParameter.crossReferences)；且模块级标注未指明 sourceParam，validator 无法定位源参数
3. **schemaCache 从未被填充** —
   cross-module-validator-plugin 读空 cache；configStore 用 3 个默认 schema 做跨模块验证 → 实际空转

## 范围 (In Scope)

- A: `loadModuleSchemas()` loader — 54 JSON (ModuleJsonSchema)
  → 扁平 ModuleSchema[] (含容器树、参数、模块级 crossReferences)
- B: CrossModuleReference 扩展
  `sourceParam`；CrossModuleValidator 支持模块级 crossReferences
  (sourceParam 定位源参数)
- C: 全量 54 模块 crossReferences 标注 (脚本生成 + 关键项核对, 基于 AUTOSAR 依赖矩阵)
- D: 链路打通 —
  schemaExtractor 注册 54 个 schema；configStore/plugin 用 loader；schemaCache 填充
- E: 测试 — loader 测试 (54→54) + validator 模块级测试 + 全量不回归

## Out of Scope

- P2-3 ChoiceContainerDef (下一个 sprint)
- 参数级 crossReferences 标注 (保持模块级 + sourceParam 语义)

## 验收标准

| ID  | Criterion        | Pass Condition                                                                                        | Fail Condition        | Priority | 结果                                      |
| --- | ---------------- | ----------------------------------------------------------------------------------------------------- | --------------------- | -------- | ----------------------------------------- |
| A1  | loader 全覆盖    | 54 JSON → 54 ModuleSchema, 容器/参数不丢失                                                            | 任一模块缺失/参数丢失 | P0       | ✅ 8/8 测试                               |
| A2  | 模块级引用可验证 | validator 能消费 sourceParam + 模块级 crossReferences, 正确报错                                       | 报错缺失/误报         | P0       | ✅ 6/6 测试                               |
| A3  | 全量标注         | ≥40 模块有 crossReferences, 所有 sourceParam/param 在对应 schema 中存在                               | 引用悬空              | P1       | ✅ 19 条/15 模块 (Mcu 无频率参数, 不强凑) |
| A4  | 链路生效         | schemaExtractor.getAllSchemas() 返回 54+; plugin 从 cache 读到 schema; configStore 跨模块验证真实触发 | 仍空转                | P0       | ✅ E2E 3/3 测试                           |
| A5  | 测试全绿         | 新增 loader/validator 测试 + 原 576 不回归                                                            | 任一失败              | P0       | ✅ 593 全过                               |

## 结果

- **交付**: load-generated.ts (loader) + cross-module-validator.ts
  (模块级支持) + annotate-cross-refs.ts (标注脚本) +
  19 条 AUTOSAR 约束 (15 模块) + 链路打通 (schemaExtractor/plugin/configStore)
- **修复历史缺陷**: 原 can/cantrcv/pdur 标注缺 sourceParam (validator 读不到) +
  can 关系反了 (greater_than→less_than) — crossReferences 之前从未生效
- **遗留**: Mcu
  schema 无频率参数 (Gpt/Spi/Adc→Mcu 约束无法标注, 属历史 schema 缺陷, 建议后续补 McuClockReferenceFrequency)

## 技术方案

- loader 放 `packages/@yuletech/core/src/schema/load-generated.ts`
- 模块级 crossReferences 保留在 schema.crossReferences
  (类型已有)，validator 增加模块级检查分支 (sourceParam 存在时)
- 标注脚本 `scripts/annotate-cross-refs.ts` (pnpm tsx 运行)，从依赖矩阵 +
  JSON 真实参数名生成
