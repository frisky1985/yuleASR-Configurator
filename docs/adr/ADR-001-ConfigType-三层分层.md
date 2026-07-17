# ADR-001: ConfigType 三层分层结构

## 状态

已采纳 · 2025-08-15

## 背景

在 yuleASR-Configurator 的设计初期，我们需要决定如何组织 AutoSAR 模块的配置数据结构。AutoSAR 的 BSW 模块配置天然具有三层结构：

1. **ContainerType（容器类型）** — 一个模块包含多个容器（如
   `CanConfigSet`、`CanController`）
2. **ConfigSetType（配置集类型）** — 每个容器包含一个具体的配置集实例
3. **ConfigType（配置类型）** — 每个配置集包含具体的参数定义

竞品方案（Vector DaVinci、EB
tresos）通常采用扁平化的键值对存储，把所有参数摊平到一个大 Map 中。我们需要决定是否沿用这种扁平方案，还是设计一个反映 AutoSAR 固有层次的三层结构。

## 决策

采用三层分层结构，而不是扁平 Schema。核心类型定义如下：

```
ContainerSchema (容器描述)
    ↓ 多实例
ContainerConfig (容器实例, 含 id + parameters + children)
    ↓ 嵌套
ModuleParameter / ParameterDefinition (具体参数定义)
```

### 实现要点

- **Layer 1 —
  ContainerSchema（`types/module.ts:ContainerSchema`）**：描述容器的结构元信息，包括名称、标签、嵌套子容器、多实例计数约束（`multiple`/`minInstances`/`maxInstances`）。
- **Layer 2 —
  ContainerConfig（`types/module.ts:ContainerConfig`）**：运行时的容器实例数据，携带唯一
  `id`、实例名称、实际参数值、子容器实例。
- **Layer 3 —
  ParameterDefinition（`types/parameter.ts:ParameterDefinition`）**：具体的参数定义，含类型、约束、验证规则、UI 配置、可见性条件等。

ModuleConfig 通过 `containers?: Record<string, ContainerConfig[]>`
引用多实例容器，与 AutoSAR ECU Configuration 的 XPath 语义一致。

## 后果

### 优点

1. **语义保真** — 直接映射 AutoSAR ARXML 的 Container →
   Parameter 结构，Schema 提取器可从 ARXML 直接生成匹配的类型，无需额外转换层。
2. **多实例原生支持** — 容器级别的 `multiple`/`minInstances`/`maxInstances`
   约束可直接在类型层面表达，不需在验证逻辑中做特殊处理。
3. **路径可预测** — 条件表达式和跨模块引用中的容器路径（如
   `Can.adcConfigSet[0].hwUnit`）可直接沿树状结构解析，O(1) 跳转，不需扁平化映射表。
4. **UI 渲染友好**
   — 前端表单可直接递归遍历嵌套容器，生成分组/标签页/表格等结构化控件。

### 缺点

1. **存储体积略增**
   — 每条路径需要完整的嵌套对象链，而非扁平 KV。但 AutoSAR 项目通常在几十到几百 KB 级别，差异可忽略。
2. **查询复杂度增加**
   — 跨多层容器的参数查询需要递归遍历，而非直接 Map.get()。ConditionEvaluator 用三段路径（module.container[index].param）解析，避免了全量扫描。

### 权衡

选择三层结构意味着放弃扁平方案在极致简单查询上的优势，但换来了与 AutoSAR 生态标准的零摩擦兼容。对于 AutoSAR
BSW 配置这种高度结构化的领域，语义保真比查询便利更关键。

## 备选方案

### 方案 A: 扁平 KV Schema（已否决）

所有参数摊平到一个 `Record<string, unknown>` 中，容器信息通过命名约定编码（如
`Can_AdcConfigSet_0_HwUnit`）。

- **优点**：查询 O(1)，实现最简单。
- **缺点**：失去了类型安全的多实例约束；路径解析需要手写 split + 前缀匹配；无法表达嵌套容器的 min/maxInstances 约束；与 ARXML 的映射需要额外转换。

### 方案 B: 仅运行时嵌套，编译期扁平（已否决）

编译期用扁平接口暴露所有参数，运行时再提供嵌套访问器。

- **优点**：兼顾 API 便利性和运行时语义。
- **缺点**：维护两套类型系统（flat +
  nested）增加认知负担；插件/生成器需要同时兼容两种访问模式。

### 方案 C: 全类型安全泛型树（已否决）

用 TypeScript 泛型递归约束容器层次，编译期校验所有路径合法性。

- **缺点**：AutoSAR 模块的容器深度和名称在编译期不可知（取决于 ARXML 输入），运行时动态注册的 Schema 无法享受泛型约束红利。
