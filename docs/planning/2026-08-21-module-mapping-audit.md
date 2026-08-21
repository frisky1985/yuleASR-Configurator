# 审计报告：yuleASR-Configurator ↔ yuleASR 静态代码 模块一一对应

> 审计日期：2026-08-21 01:10
> | 审计人：小明（自动脚本 + 人工核验）数据源：Configurator schema
> 117 文件（103 核心模块去变体）/ yuleASR src/bsw 全层 +
> middleware/autosar/soad/platform

## 结论摘要

| 项                                                      | 数量              |
| ------------------------------------------------------- | ----------------- |
| Configurator schema 核心模块（去 _ecual/_service 变体） | 103               |
| yuleASR 静态代码模块                                    | 99                |
| **一一对应**                                            | **89**            |
| A 缺口：Configurator 有、yuleASR 无                     | 14                |
| B 缺口：yuleASR 有、Configurator 无                     | 10                |
| 工具链 codegen 支持模块                                 | ~25（远小于 103） |

**总体判定：模块层对应率 86%（89/103），但工具链（codegen）仅覆盖 ~24%，三方完整闭环的模块很少——工具链与基础软件未一一对应，存在明显断层。**

## A 缺口：Configurator 有、yuleASR 静态代码无（14）

| 模块                 | 核验                         | 判定                                           |
| -------------------- | ---------------------------- | ---------------------------------------------- |
| appswc / compswc     | 无目录                       | ⚠️ ASW 应用层组件（非 BSW 静态代码，可能合理） |
| arti                 | 无目录                       | ❌ 缺失（Adaptive/ARTI 中间件）                |
| ble                  | 无目录                       | ❌ 缺失（BLE 协议栈）                          |
| mcl                  | 无目录                       | ❌ 缺失                                        |
| sbc                  | 无目录                       | ❌ 缺失（系统基础芯片驱动）                    |
| cddfvm               | cdd/src 有 Cdd_Fvm_1.0.0.c   | ✅ 实际存在（cdd 平铺结构，脚本未识别）        |
| dem_legacy           | dem 存在                     | ✅ dem_legacy 是变体，dem 对应                 |
| fr                   | 仅 frif                      | ⚠️ FR 控制器无，S32K312 可能无 FlexRay 外设    |
| linker               | platform/s32k312/linker      | ✅ 平台脚本（非 BSW 模块）                     |
| linmaster / linslave | 无独立目录                   | ⚠️ 疑在 linif/lintrcv 内或未实现               |
| nvmecchandler        | 无目录                       | ⚠️ 疑为 nvm 子容器                             |
| ostimingprotection   | os/src/Os_TimingProtection.c | ✅ os 内部文件，非独立模块                     |

**真实缺口：arti、ble、mcl、sbc（4 个配置了但无代码）；需确认：appswc/compsw、fr、linmaster/linslave、nvmecchandler（6 个）**

## B 缺口：yuleASR 静态代码有、Configurator 无（10）

| 模块           | 位置                          | 判定                                             |
| -------------- | ----------------------------- | ------------------------------------------------ |
| canm           | services/canm（内含 CanNm.c） | ✅ 实为 CanNm，命名差异，Configurator cannm 对应 |
| cdd            | bsw/cdd（Cdd.c Cdd_Fvm 等）   | ✅ Configurator cddfvm 对应                      |
| dds / microdds | middleware/                   | ❌ Configurator 无 dds schema（有 someip/soad）  |
| ethtsyn        | services/ethtsyn              | ❌ 真实缺失（以太网时间同步）                    |
| ldcom          | services/ldcom                | ❌ 真实缺失（LIN 诊断通信）                      |
| lntm           | services/lntm                 | ❌ 真实缺失                                      |
| tm             | services/tm                   | ❌ 真实缺失                                      |
| os.c / cdd.c   | 平铺文件名                    | ✅ 脚本误报                                      |

**真实缺口：dds、microdds、ethtsyn、ldcom、lntm、tm（6 个有代码但配置器不认）**

## 工具链（codegen/generator）覆盖

- `codegen.ts`
  MODULE_IDS 仅 13 个 MCAL（Mcu/Port/Dio/Can/Adc/Icu/Gpt/Pwm/Wdg/Lin/Spi/Fr/Eth）
- codegen switch 支持 ~25 模块：can canif cantrcv comm crc cryif crypto csm dio
  dlt doip ecum flash fls linker linslave lintrcv mqtt ostimingprotection
  ramsafety someip someipsd spi swc wdgm
- generator 插件：mcal-generator-plugin（通用模板，非逐模块）
- **103 个 schema 模块中仅 ~25 个有代码生成能力，78 个模块配置了但无法生成代码**

## 建议（待老板裁决）

1. **补 schema**：ethtsyn/ldcom/lntm/tm/dds 等 6 个有代码的模块补配置器支持
2. **清 schema**：arti/ble/mcl/sbc 等 4 个无代码模块标记"未实现"或移除
3. **扩 codegen**：78 个模块无生成能力是最大断层，需评估哪些必须生成
4. 命名归一：canm↔cannm、cddfvm↔cdd 建立显式映射表

## 老板裁决（2026-08-21 01:40）

- **ble / mcl / sbc**：从 Configurator 删除（无对应实现，不留死配置）
- **arti**：保留，标记为"运行时钩子函数声明"（非独立模块）
- **其余**：按上述建议推进（补 schema：ethtsyn/ldcom/lntm/tm/dds/microdds；命名映射表；codegen 覆盖评估）
