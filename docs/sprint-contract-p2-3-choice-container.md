# Sprint Contract — P2-3: AUTOSAR ECUC ChoiceContainerDef 补全

日期: 2026-08-01模块: yuleASR-Configurator / @yuletech/core

## 背景 (调研结论)

AUTOSAR
ECUC 元模型四要素中三个已落地 (ReferenceDef 通过 crossReferences、Multiplicity 通过 x-multiplicity、ConfigurationClass 通过 x-config-class)，
**ChoiceContainerDef (多选一容器) 仍缺**
— 无法表达"二选一"配置 (如看门狗触发模式、SPI 主从模式)。

调研发现 54 模块中有大量 type-selector 参数 (string 类型无 enum，如 CanTpChannelMode
/ SpiChannelType / WdgTriggeredMode)，这些是 AUTOSAR
ChoiceContainerDef 的典型场景 — 但大多退化为裸 string，且多数是单参数枚举 (非容器级互斥)。需要:

1. 类型层增加 ChoiceContainerDef 表达 (x-choice-container + x-choice-params)
2. loader 传递标注
3. ChoiceContainerValidator 校验互斥 (最多设置 1 个)
4. 真实场景标注 (wdg/wdgif/spi/cantp 4 模块)

## 范围 (In Scope)

- A: 类型层 — ModuleJsonSchema/ContainerSchema 加 x-choice-container /
  x-choice-params / x-choice-description
- B: loader — loadModuleSchemas 传递 choice 标注到 ContainerSchema
- C: ChoiceContainerValidator
  — 校验容器实例中互斥参数最多设置 1 个 (xChoiceParams 优先, 未指定回退容器全部参数/子容器)
- D: ValidationPipeline 集成 — choiceContainerErrors 字段
- E: 真实标注 — wdg.WdgDevice / wdgif.WdgIfDevice / spi.SpiDriver /
  cantp.CanTpConfig (脚本 annotate-choice-containers.ts)
- F: 测试 — validator 单测 + E2E + schema-validation 断言

## Out of Scope

- 单参数枚举 enum 化 (历史遗留, P1-5 已部分处理, 非本 sprint)
- UI 渲染 choice 控件 (能力就绪, 后续迭代)

## 验收标准

| ID  | Criterion      | Pass Condition                                          | Fail Condition | Priority | 结果        |
| --- | -------------- | ------------------------------------------------------- | -------------- | -------- | ----------- |
| A1  | 类型层         | x-choice-container/params/description 类型就绪          | 缺字段         | P0       | ✅          |
| A2  | loader 传递    | 54 JSON → ContainerSchema.xChoiceContainer/Params       | 标注丢失       | P0       | ✅          |
| A3  | validator 互斥 | 同容器 2+ 互斥参数同时设置 → CHOICE_CONTAINER_EXCLUSIVE | 漏报/误报      | P0       | ✅ 6 单测   |
| A4  | pipeline 集成  | result.choiceContainerErrors 存在且合并进 allErrors     | 字段缺失       | P0       | ✅ E2E      |
| A5  | 真实标注       | ≥4 模块标注, 参数存在性验证通过                         | 悬空引用       | P1       | ✅ 4 模块   |
| A6  | 测试全绿       | 原 593 不回归 + 新增 12                                 | 任一失败       | P0       | ✅ 605 全过 |

## 技术方案

- 语义修正: x-choice-container 标记容器, **x-choice-params 指定互斥参数组**
  (避免把容器内 Id 等非互斥参数误算) — 调研中发现若标记整个容器,
  WdgIfDeviceId 等参数会被误判为互斥成员
- 验证器优先用 xChoiceParams; 未指定时回退容器全部直接参数/子容器 (兼容)
- 脚本: scripts/annotate-choice-containers.ts (tsx 运行, 参数存在性校验)
