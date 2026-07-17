# ADR-004: 代码生成器与 GeneratorRegistry 模式

## 状态

已采纳 · 2025-08-15

## 背景

yuleASR-Configurator 需要为不同的 AutoSAR BSW 模块生成 ECUC 配置 C 代码（`.c` /
`.h` 文件）。代码生成的复杂度因模块而异：

- **标准模块（Can、Mcu、Port 等 ~60 个 BSW 模块）** — 需要 AUTOSAR
  4.4 标准化的文件头、宏定义、容器数据结构和 Post-Build 配置。
- **特殊模块（RTE、OS、SWC）**
  — 需要完全不同的生成逻辑（RTE 生成调度代码，OS 生成任务/报警定义，SWC 生成组件骨架）。
- **第三方/自定义模块** — 用户可能通过插件提供自定义代码生成器。

核心设计问题：如何组织这些生成器，使其既可以复用公共的 ECUC 生成逻辑，又能够灵活地为不同模块注入特殊的生成策略？

## 决策

采用 **GeneratorRegistry（注册表） + CodeGenerator 接口 + 插件委托**
的组合模式，而非传统的继承层次。

### 核心接口：`CodeGenerator`（`generator/index.ts`）

```typescript
interface CodeGenerator {
  name: string;
  version: string;
  supportedModules: string[];
  generate(config, schema, options): Promise<GenerationResult>;
  supports(moduleName: string): boolean;
}
```

### 注册表：`GeneratorRegistry`（`generator/index.ts`）

```typescript
class GeneratorRegistry {
  register(generator: CodeGenerator): void;
  unregister(name: string): void;
  findForModule(moduleName: string): CodeGenerator | undefined;
}
```

### 插件委托机制（`ecuc-generator.ts:EcucCodeGenerator`）

`EcucCodeGenerator.generate()` 在执行前检查 `pluginRegistry`：

```typescript
const pluginGen = pluginRegistry.findCodeGeneratorForModule(config.module);
if (pluginGen) {
  // 完全委托给插件生成器，跳过内置生成逻辑
  return await pluginGen.generate(config, options);
}
```

如果插件注册了同名模块的代码生成器，内置的 `EcucCodeGenerator` 自动退让。

### 内置生成器

| 生成器              | 适用模块                        | 输出文件                                                   |
| ------------------- | ------------------------------- | ---------------------------------------------------------- |
| `EcucCodeGenerator` | 所有标准 BSW 模块（通配符 `*`） | `<Module>_Cfg.h`、`Ecuc_<Module>.c`、`_PBcfg.c`、`_Lcfg.c` |
| `RteGenerator`      | RTE                             | RTE 调度表 + 组件骨架                                      |
| `SwcGenerator`      | AppSwc / CompSwc                | SWC 实现骨架                                               |
| `OsGenerator`       | OS                              | 任务/报警/资源/事件定义                                    |

## 后果

### 优点

1. **取代继承** — 传统的 `BaseGenerator → EcucGenerator → McuGenerator`
   继承链会产生脆弱的抽象类和重写泛滥。注册表模式中每个生成器是独立的接口实现，组合优于继承。
2. **运行时热注册** — 插件可以在应用运行时注册新的生成器，无需重新编译。
3. **模块级优先级覆盖** — `pluginRegistry.findCodeGeneratorForModule()`
   确保插件生成器优先于内置生成器，用户可以精确替换某个模块的生成逻辑而不影响其他模块。
4. **灵活的匹配策略** — `supportedModules` 支持通配符 `*`，标准生成器通过一个
   `['*']` 覆盖所有未匹配模块；特殊生成器通过具体名称精确匹配。
5. **四文件输出规范** — `EcucCodeGenerator` 按照 AUTOSAR
   4.4 标准生成四个文件（头文件、源文件、Post-Build 配置、Link-Time 配置），为所有标准模块提供一致的代码结构。

### 缺点

1. **委托语义隐式** — 调用 `EcucCodeGenerator.generate()`
   可能实际执行的是插件生成器。调用方不一定意识到这种转发。日志中明确记录了委托事件（`logPluginDelegation`）以作透明化。
2. **缺乏生成器流程编排**
   — 当前委托是"全有或全无"的：插件要么完全接管，要么完全不参与。不支持插件在标准生成前后插入钩子（pre/post
   hooks）。未来可能需要引入生成管道的概念。

## 备选方案

### 方案 A: 抽象类继承层次（已否决）

```
BaseGenerator
 ├── EcucGenerator (通用 ECUC 逻辑)
 │    ├── McuGenerator (MCU 特定覆盖)
 │    ├── CanGenerator (CAN 特定覆盖)
 │    └── ...
 ├── RteGenerator
 ├── OsGenerator
 └── SwcGenerator
```

- **问题**：
  - 每新增一个模块需要新建子类，工厂方法膨胀。
  - 用户无法在不修改核心包的情况下替换单个模块的生成逻辑。
  - 插件无法注入自己的生成器，因为子类列表在编译时固定。

### 方案 B: 策略模式 + DI 容器（已否决）

通过依赖注入容器注册生成器策略，由容器决定使用哪个策略。

- **问题**：增加了 DI 容器的运行时依赖；对于 CLI 工具来说 DI 容器过重。注册表 Map 相比容器的查表更加轻量和可控。
