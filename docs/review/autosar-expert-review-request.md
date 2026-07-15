# AUTOSAR Code Generator — 专家技术评审请求

## 项目概述

yuleASR-Configurator 的 **ECUC（Ecu Configuration）C 代码生成器**，负责从 JSON Schema 配置输入自动生成 AUTOSAR 4.4 兼容的模块配置头文件和源文件。支持 MCAL 层模块（Can、Mcu、Port 等）。

**代码位置：** `packages/@yuletech/core/src/generator/`
**评审包路径：** `/tmp/ecuc-review-package/`（本机）

---

## 评审范围

### 核心文件 (3)

| 文件 | 行数 | 作用 |
|:-----|:----:|:-----|
| `ecuc-generator.ts` | ~670 | 主生成器 — 头文件 + 源文件 + PBcfg + Lcfg |
| `autosar-format.ts` | ~130 | AUTOSAR C 格式化工具层 |
| `index.ts` | ~70 | CodeGenerator 接口定义 |

### 生成产物 (12 个文件，3 模块)

```
generated/
├── Can_Cfg.h           ← Can 模块头文件
├── Ecuc_Can.c           ← Can 模块源文件
├── Ecuc_Can_PBcfg.c     ← Can Post-Build 配置
├── Ecuc_Can_Lcfg.c      ← Can Link-Time 配置
├── Mcu_Cfg.h            ← Mcu 模块头文件
├── Ecuc_Mcu.c           ← Mcu 模块源文件
├── Ecuc_Mcu_PBcfg.c     ← Mcu Post-Build 配置
├── Ecuc_Mcu_Lcfg.c      ┆
├── Port_Cfg.h           ┆
├── Ecuc_Port.c          ┆
├── Ecuc_Port_PBcfg.c    ┆
└── Ecuc_Port_Lcfg.c     ┆
```

### 测试覆盖率

- **165 个 vitest 测试** — 9 个测试文件，全通过
- **所有生成代码通过 gcc -fsyntax-only** — 12 个 .h/.c 文件均通过
- **集成脚本** — `scripts/generate-and-compile.sh` (一键生成 + 编译验证)

---

## 架构设计

### 数据流

```
JSON Schema (ModuleSchema) ─┐
JSON Config (ModuleConfig) ─┤──→ EcucCodeGenerator.generate()
                            │       ├── generateHeaderFile()  → <Module>_Cfg.h
                            │       ├── generateSourceFile()  → Ecuc_<Module>.c
                            │       ├── generatePBcfgFile()   → Ecuc_<Module>_PBcfg.c
                            │       └── generateLcfgFile()    → Ecuc_<Module>_Lcfg.c
                            │
                            └── autosar-format.ts (8 个工具函数)
                                 ├── formatCValue()     — JS→C 字面量
                                 ├── getCType()         — JS 类型→C 类型
                                 ├── toHex()            — 数字→4位十六进制
                                 ├── parseVersion()     — semver→{major,minor,patch}
                                 ├── getModuleHeaderName() — AUTOSAR 标准头文件名
                                 ├── getModuleId()     — AUTOSAR 标准 Module ID
                                 ├── toGuardName()     — 文件名→include guard
                                 └── toDefineName()    — camelCase→UPPER_SNAKE_CASE
```

### 头文件生成内容

每个 `<Module>_Cfg.h` 包含：
- Include guard（`<MODULE>_CFG_H`）
- AUTOSAR Module ID / Vendor ID 宏
- 参数宏定义（如 `CAN_CANBAUDRATE ((uint16)500000U)`）
- 版本信息宏（SW_MAJOR/MINOR/PATCH_VERSION）
- 容器类型定义（`typedef struct { ... } <Module>_<Container>Type;`）
- Config type 定义（`typedef struct { ... } <Module>_ConfigType;`）
- 外部变量声明（`extern const <Module>_ConfigType <Module>_Config;`）
- Init/DeInit/GetVersionInfo 函数声明

### 源文件生成内容

每个 `Ecuc_<Module>.c` 包含：
- 模块版本信息结构体（const）
- 容器实例定义
- 容器实例数组
- 主配置结构体定义

---

## 关键架构决策

| 决策 | 选择 | 理由 |
|:-----|:-----|:------|
| 类型系统 | 从 JSON Schema 参数推导 C 类型 | 单一数据源，Schema 驱动生成 |
| 头文件命名 | AUTOSAR 标准：`<Module>_Cfg.h` | 与 yuleASR 现有代码命名一致 |
| Module ID | AUTOSAR 规范定义的表 | 避免手动维护 |
| 命名约定 | 无 `ECUC_` 前缀 | 对齐标准 AUTOSAR 宏名 |
| 实例数组 | 值类型（非指针数组） | 简化初始值语义，无运行时分配 |
| 配置引用 | 直接引用实例名 | 初始值必须是编译期常量，不能用数组下标 |

---

## 待专家评审的问题

### 🔴 P0 — 架构级

1. **ConfigType 结构体设计**

   当前 `Can_ConfigType` 包含 moduleId、versionInfo、instanceCount 以及所有参数和容器字段。这是否符合 AUTOSAR MCAL 模块配置的典型模式？还是应该将配置数据拆分为独立的 struct（如 `Can_ConfigSetType`）？

2. **Post-Build 与 Link-Time 支持**

   当前 PBcfg 和 Lcfg 文件使用与主配置相同的 `Can_ConfigType` 类型。PBcfg 会筛选 `readonly=false` 的参数输出，Lcfg 目前为零初始化。AUTOSAR 规范中 PB 和 LT 配置的结构层级应该如何设计？

3. **容器实例引用**

   主 Config 结构体中通过直接值引用容器实例（`CanController_Instance_0`）。对于 `multiple` 数组容器，直接值引用不在编译期常量范围内 — 当前方案是通过硬编码单个字段绕过。如果需完全动态的实例数组支持，有什么推荐的 AUTOSAR 模式？

### 🟡 P1 — 实现级

4. **`static const` 与 `extern const` 的区隔**

   当前实例定义为 `static const`（文件内部），Config 结构体为 `extern const`（跨文件可见）。这是 AUTOSAR 配置模块的常见内存布局吗？

5. **格式层函数签名**

   `formatCValue(value, type)` 接受泛型 `unknown` + 字符串 type。是否应该使用 discriminated union 或更强的类型约束来提升类型安全？

6. **文件命名约定**

   头文件 = `<Module>_Cfg.h`，源文件 = `Ecuc_<Module>.c`。`Ecuc_` 前缀是否符合 AUTOSAR 命名惯例，还是应该统一格式？

### 🟢 P2 — 增强建议

7. **MemMap.h 集成**

   当前需要 stub `MemMap.h` 才能编译。生成器中加入 `#include "MemMap.h"` 和 `#pragma section` 内存映射支持是否必要？

8. **测试策略**

   当前 165 个测试覆盖了单元测试 + gcc 语法验证。是否有必要加入运行时结构匹配（用 Python ctypes 或 C 包装器验证生成的 C 结构体能被正确加载）？

---

## 测试结果

```text
Test Files  9 passed (9)
     Tests  165 passed (165)
  Start at  07:41:41
  Duration  1.01s

GitHub: All generated files pass syntax check (14/14)
  ✅ Can_Cfg.h  ✅ Mcu_Cfg.h  ✅ Port_Cfg.h
  ✅ Ecuc_Can.c  ✅ Ecuc_Mcu.c  ✅ Ecuc_Port.c
  ✅ Ecuc_Can_PBcfg.c  ✅ Ecuc_Mcu_PBcfg.c  ✅ Ecuc_Port_PBcfg.c
  ✅ Ecuc_Can_Lcfg.c   ✅ Ecuc_Mcu_Lcfg.c   ✅ Ecuc_Port_Lcfg.c
```

---

## 交付物清单

- [x] `ecuc-generator.ts` — 主生成器
- [x] `autosar-format.ts` — AUTOSAR C 格式工具
- [x] 12 个生成产物（Can/Mcu/Port 各 4 文件）
- [x] 165 个 vitest 测试（单元 + E2E + gcc 语法验证）
- [x] 集成脚本 `scripts/generate-and-compile.sh`
- [x] 差距分析文档 `docs/analysis/generated-vs-handwritten-can.md`
- [x] Sprint 2 计划 `docs/plans/2026-07-12-sprint-2-compile-verify.md`

---

*评审文档由 AI 辅助生成，yuleASR-Configurator 项目维护。请将评审意见反馈至本文档或直接在 Feishu 中评论。*
