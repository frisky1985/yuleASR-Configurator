# yuleASR-Configurator 模块依赖关系总清单

> 依据：`docs/planning/2026-08-20-dependency-hardening.md`（YAC-DEP-001）
> 生成日期：2026-08-20
> 数据源（全部可 grep 验证）：
> - 声明层：`apps/yuleasr-web/src/data/mcal-config.ts`、`apps/yuleasr-web/src/data/ecual-config.ts`、`apps/yuleasr-web/src/data/all-modules.ts`
> - 隐式规则表：`apps/yuleasr-web/src/core/DependencyValidator.ts#validateCrossModuleReferences()`
> - 类型定义：`packages/@yuletech/core/src/types/module.ts`、`apps/yuleasr-web/src/types/config.ts`

---

## 1. 模块声明层全量依赖清单

### 1.1 概览

| 数据文件 | 含 dependencies 声明的模块数 | 依赖条目数 |
|---|---|---|
| `apps/yuleasr-web/src/data/mcal-config.ts` | 8（Mcu / Port / Dio / Gpt / Pwm / Adc / Spi / Can） | 14 |
| `apps/yuleasr-web/src/data/ecual-config.ts` | 7（CanIf / CanTrcv / Eth / Fr / NvM / Com / Dcm） | 15 |
| `apps/yuleasr-web/src/data/all-modules.ts` | 37（全量 BSW 模块） | **0（全部为 `dependencies: []`）** |
| **合计（去重后）** | 15 个模块声明了依赖 | **29 条唯一 (source → target) 依赖** |

> 说明：`all-modules.ts` 37 个模块的 `dependencies` 全部为空数组（`grep -n "dependencies:" apps/yuleasr-web/src/data/all-modules.ts` 可验证，37 行均为 `dependencies: [],`）。声明层依赖实际全部来自 mcal/ecual 两个手写配置文件。

### 1.2 总表（29 条，按源模块分组）

> 字段说明：required = `required` 字段（true=必需 / false=可选）；autoEnable = `autoEnable` 字段（- 表示未声明，视为 false）；severity = 声明层数据中的 `severity` 字段（**声明层 0 处使用**，web 端 `ModuleDependency` 类型根本没有该字段，见 §4）；数据来源 = 声明所在文件。

#### mcal-config.ts（8 模块 / 14 条）

| # | 源模块 | 目标模块 | required | autoEnable | severity(声明) | 数据来源文件 |
|---|---|---|---|---|---|---|
| 1 | Mcu | Port | false | - | - | mcal-config.ts |
| 2 | Mcu | Gpt | false | - | - | mcal-config.ts |
| 3 | Port | Dio | true | true | - | mcal-config.ts |
| 4 | Port | Mcu | true | true | - | mcal-config.ts |
| 5 | Dio | Port | true | true | - | mcal-config.ts |
| 6 | Gpt | Mcu | true | true | - | mcal-config.ts |
| 7 | Pwm | Mcu | true | true | - | mcal-config.ts |
| 8 | Pwm | Port | true | true | - | mcal-config.ts |
| 9 | Adc | Mcu | true | true | - | mcal-config.ts |
| 10 | Adc | Port | true | true | - | mcal-config.ts |
| 11 | Spi | Mcu | true | true | - | mcal-config.ts |
| 12 | Spi | Port | true | true | - | mcal-config.ts |
| 13 | Can | Mcu | true | true | - | mcal-config.ts |
| 14 | Can | Port | true | true | - | mcal-config.ts |

#### ecual-config.ts（7 模块 / 15 条）

| # | 源模块 | 目标模块 | required | autoEnable | severity(声明) | 数据来源文件 |
|---|---|---|---|---|---|---|
| 15 | CanIf | Can | true | true | - | ecual-config.ts |
| 16 | CanIf | Port | true | true | - | ecual-config.ts |
| 17 | CanTrcv | Can | true | true | - | ecual-config.ts |
| 18 | CanTrcv | Port | true | true | - | ecual-config.ts |
| 19 | CanTrcv | Dio | false | - | - | ecual-config.ts |
| 20 | Eth | Mcu | true | true | - | ecual-config.ts |
| 21 | Eth | Port | true | true | - | ecual-config.ts |
| 22 | Fr | Mcu | true | true | - | ecual-config.ts |
| 23 | Fr | Port | true | true | - | ecual-config.ts |
| 24 | NvM | Fee | true | true | - | ecual-config.ts |
| 25 | NvM | Ea | false | - | - | ecual-config.ts |
| 26 | Com | PduR | true | true | - | ecual-config.ts |
| 27 | Com | CanIf | true | true | - | ecual-config.ts |
| 28 | Dcm | PduR | true | true | - | ecual-config.ts |
| 29 | Dcm | CanTp | true | true | - | ecual-config.ts |

#### all-modules.ts（37 模块）

全部 37 个模块（Adc, Arti, Ble, BswM, Can, CanIf, CanNm, CanSM, CanTp, CanTrcv, Com, ComM, Crc, CryIf, Crypto, Csm, Dcm, Dem, Det, Dio, EcuM, Fee, Fls, Gpt, Icu, Iohwab, Mcl, Mcu, MemIf, Nm, NvM, Os, PduR, Port, Rte, Sbc, Spi）的 `dependencies` 均为空数组 → 0 条声明。

### 1.3 去重说明

29 条按 (源模块, 目标模块) 去重后无重复项（无跨文件重复声明）。注意方向性：`Port→Mcu`（#4）与 `Mcu→Port`（#1）是两条不同方向的依赖，均保留。

---

## 2. 校验器隐式规则表（14 条硬编码规则）

### 2.1 硬编码位置

- 文件：`apps/yuleasr-web/src/core/DependencyValidator.ts`
- 函数：`validateCrossModuleReferences()`（第 299 行起）
- 规则数组：`const dependencyRules` 字面量，第 **306–319 行**，逐条硬编码，不读取任何数据文件。

### 2.2 规则明细（按源码顺序）

| # | 源模块 | 目标模块 | severity | 触发条件 | 源码行号 |
|---|---|---|---|---|---|
| R1 | Can | CanTrcv | error | Can 已启用 且 CanTrcv 未启用/不在配置 | DependencyValidator.ts:306 |
| R2 | CanTp | Can | error | 同上 | DependencyValidator.ts:307 |
| R3 | CanNm | Can | error | 同上 | DependencyValidator.ts:308 |
| R4 | CanSM | Can | error | 同上 | DependencyValidator.ts:309 |
| R5 | CanSM | CanNm | error | 同上 | DependencyValidator.ts:310 |
| R6 | Dcm | CanTp | warning | 同上 | DependencyValidator.ts:311 |
| R7 | NvM | Fee | warning | 同上 | DependencyValidator.ts:312 |
| R8 | NvM | Fls | warning | 同上 | DependencyValidator.ts:313 |
| R9 | EcuM | Mcu | warning | 同上 | DependencyValidator.ts:314 |
| R10 | Csm | Crypto | warning | 同上 | DependencyValidator.ts:315 |
| R11 | Csm | CryIf | warning | 同上 | DependencyValidator.ts:316 |
| R12 | Crypto | CryIf | error | 同上 | DependencyValidator.ts:317 |
| R13 | CanIf | Can | error | 同上 | DependencyValidator.ts:318 |
| R14 | PduR | Can | info | 同上 | DependencyValidator.ts:319 |

### 2.3 判定逻辑（两种分支）

源码（DependencyValidator.ts:324-340）：

```
srcModule = moduleMap.get(rule.module); tgtModule = moduleMap.get(rule.requires);
if (!srcModule || !srcModule.enabled) continue;      // 源模块不存在或未启用 → 跳过
if (tgtModule && tgtModule.enabled) continue;        // 目标已启用 → 通过
issue: tgtModule ? 「requires X which is not enabled」      // 分支 A：目标存在但未启用
                 : 「requires X which is not in the configuration」 // 分支 B：目标不在配置中
```

- **分支 A**（目标模块存在但 `enabled: false`）：提示 `"X" requires "Y" which is not enabled`，severity 按表。
- **分支 B**（目标模块根本不在配置中）：提示 `"X" requires "Y" which is not in the configuration`，severity 按表。

---

## 3. 双源一致性说明（声明层 vs 隐式规则表）

### 3.1 关系

- **声明层**（§1）：模块数据文件里的 `dependencies` 数组，供 UI 展示、`validateModuleDependencies()`（required→error / optional→info）与 `getAutoEnableSuggestions()` 消费。
- **隐式规则表**（§2）：`DependencyValidator` 内硬编码的 AUTOSAR 语义规则，供 `validateCrossModuleReferences()` 消费。
- 两套机制**独立运行、互不派生**：声明层数据不会自动生成隐式规则，隐式规则也不回写声明层。

### 3.2 交集与差异

**方向一致且同时存在于双源的：**

| 关系 | 声明层（§1） | 隐式规则（§2） |
|---|---|---|
| CanIf → Can | #15 required=true, autoEnable | R13 error（一致：required ⇒ error 级） |
| NvM → Fee | #24 required=true, autoEnable | R7 warning（⚠️ 级别不一致，见下） |
| Dcm → CanTp | #29 required=true, autoEnable | R6 warning（⚠️ 级别不一致，见下） |
| CanTrcv → Can | #17 required=true, autoEnable | R1 是反向的 Can → CanTrcv（error） |

**仅声明层存在（隐式规则表无对应）：** Mcu→Port/Gpt、Port→Dio/Mcu、Dio→Port、Gpt→Mcu、Pwm→Mcu/Port、Adc→Mcu/Port、Spi→Mcu/Port、Can→Mcu/Port、CanIf→Port、CanTrcv→Port/Dio、Eth→Mcu/Port、Fr→Mcu/Port、NvM→Ea、Com→PduR/CanIf、Dcm→PduR —— 共 25 条。

**仅隐式规则表存在（声明层无对应）：** CanTp→Can、CanNm→Can、CanSM→Can、CanSM→CanNm、NvM→Fls、EcuM→Mcu、Csm→Crypto、Csm→CryIf、Crypto→CryIf、PduR→Can —— 共 10 条。这 10 条里的模块（CanTp、CanNm、CanSM、Fls、EcuM、Csm、Crypto、CryIf、PduR）在 `all-modules.ts` 中虽然存在，但**均未声明任何依赖**，只能靠硬编码规则兜底。

### 3.3 漂移风险（需关注）

1. **级别漂移**：`NvM→Fee`、`Dcm→CanTp` 在声明层是 `required=true`（`validateModuleDependencies` 报 **error**），隐式规则却是 **warning**。同一关系两条路径给出不同级别。
2. **反向漂移**：`CanTrcv→Can` 声明为 required，隐式规则却只覆盖反向 `Can→CanTrcv`（error）。若只启用 CanTrcv 而禁用 Can，声明层报 error；若只启用 Can 而禁用 CanTrcv，隐式规则报 error——两个方向行为不对称。
3. **新增/删除依赖两处都要改**：改声明层不会自动同步隐式规则，反之亦然。任何一端遗漏都会产生静默漂移。
4. **目标模块不存在于全量清单**：声明层 `NvM→Ea`（#25）的目标 `Ea` 不在 `all-modules.ts` 的 37 个模块中；`Eth`、`Fr`、`Pwm` 作为源模块也不在 37 清单中（仅存在于 mcal/ecual 手写配置）。跨清单引用意味着 UI 全量列表与声明层数据源存在第三处不一致。
5. **severity 字段在 web 端是死字段**：`@yuletech/core` 的 `ModuleDependency.severity` 在 web 数据文件中 0 处使用（见 §4），web 端 `ModuleDependency` 类型（`apps/yuleasr-web/src/types/config.ts:72-78`）只有 module/required/description/autoEnable，**没有 severity、没有 paramCheck**——web 与 core 两套 ModuleDependency 类型已分叉。

### 3.4 建议（不在本次范围）

将 14 条隐式规则下沉为数据（如 `all-modules.ts` 或独立规则文件），由校验器统一读取，消灭硬编码与双源漂移；统一 severity 语义（required ⇒ error 还是允许声明级覆盖）。

---

## 4. paramCheck 机制现状（如实标注：空转）

| 环节 | 位置 | 状态 |
|---|---|---|
| 类型定义 | `packages/@yuletech/core/src/types/module.ts:42`（`ModuleDependency.paramCheck`，支持 `container_not_empty` / `value_gt` / `value_equals`） | ✅ 已建 |
| 消费端 | `packages/@yuletech/core/src/validators/yuleasr-validator.ts:187`（`else if (dep.paramCheck)`，目标模块存在时做参数级校验） | ✅ 已实现 |
| 数据使用 | `apps/yuleasr-web/src/data/`（mcal-config.ts / ecual-config.ts / all-modules.ts） | ❌ **0 处使用**（`grep -rn "paramCheck" apps/yuleasr-web/src/data/` 无结果） |

**结论：paramCheck 机制 = 类型已建 + 消费端已实现，但没有任何数据文件声明它，属于空转机制。** 且由于 web 端 `ModuleDependency` 类型（`apps/yuleasr-web/src/types/config.ts:72`）未包含 paramCheck 字段，即使数据文件想用也无法通过 web 端类型检查——需先打通类型层。数据层补全不在本次范围（见需求文档边界）。

---

## 5. 验证方式（grep 命令速查）

```bash
# 声明层：mcal 8 模块依赖
grep -n "dependencies:" apps/yuleasr-web/src/data/mcal-config.ts
# 声明层：ecual 7 模块依赖
grep -n "dependencies:" apps/yuleasr-web/src/data/ecual-config.ts
# 声明层：all-modules 37 模块（全部为空）
grep -n "dependencies:" apps/yuleasr-web/src/data/all-modules.ts
# 隐式规则 14 条（306-319 行）
sed -n '299,345p' apps/yuleasr-web/src/core/DependencyValidator.ts
# paramCheck 数据层 0 使用
grep -rn "paramCheck" apps/yuleasr-web/src/data/   # 无输出
```
