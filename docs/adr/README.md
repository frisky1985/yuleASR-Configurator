# 架构决策记录（Architecture Decision Records）

> yuleASR-Configurator 项目的关键架构决策记录。
> 遵循 [MADR 2.0](https://adr.github.io/madr/) 格式标准撰写。

## 索引

| ADR | 标题 | 状态 | 日期 |
|-----|------|------|------|
| [ADR-001](./ADR-001-ConfigType-三层分层.md) | ConfigType 三层分层结构 | 已采纳 | 2025-08-15 |
| [ADR-002](./ADR-002-双条件引擎设计.md) | 双条件引擎设计 | 已采纳 | 2025-08-15 |
| [ADR-003](./ADR-003-跨模块验证器架构.md) | 跨模块验证器架构 | 已采纳 | 2025-08-15 |
| [ADR-004](./ADR-004-代码生成器与GeneratorRegistry模式.md) | 代码生成器与 GeneratorRegistry 模式 | 已采纳 | 2025-08-15 |
| [ADR-005](./ADR-005-熔断与安全策略.md) | 熔断与安全策略 | 已采纳 | 2025-08-15 |

## 决策总览

| 决策 | 核心模式 | 相关源码 |
|------|---------|---------|
| 类型系统 | `ContainerSchema → ContainerConfig → ParameterDefinition` 三层分层 | `types/module.ts`, `types/parameter.ts` |
| 条件引擎 | `ConditionEvaluator`（UI 布尔条件）与 `ConstraintPropagator`（值传播）分离 | `conditions/evaluator.ts`, `conditions/propagator.ts` |
| 跨模块验证 | 工厂函数创建 + 全量/增量双模式 + `ValidationPipeline` 三阶段管道 | `validators/cross-module-validator.ts`, `validators/validation-pipeline.ts` |
| 代码生成 | `GeneratorRegistry` 注册表 + `CodeGenerator` 接口 + 插件委托 | `generator/index.ts`, `generator/ecuc-generator.ts` |
| 安全熔断 | 三层深度限制（MAX_DEPTH=50 条件求值 / 20 依赖图 / fail-closed 路径解析） | `conditions/evaluator.ts`, `conditions/depends.ts` |

## 快速导航

- **新增 ADR**：新建文件 `ADR-XXX-标题.md`，更新本索引
- **模板参考**：[MADR 2.0 Template](https://github.com/adr/madr/blob/main/template/template.md)
- **状态约定**：`已采纳` / `提议中` / `已弃用` / `已替换`

---

*Last updated: 2025-08-15*
