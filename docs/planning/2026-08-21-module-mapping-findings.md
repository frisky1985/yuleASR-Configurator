# 模块映射文件级核实结论 + 可执行补全清单

> 核实日期：2026-08-21 01:35
> | 核实人：小克（文件级证据核实）上游：`docs/planning/2026-08-21-module-mapping-audit.md`（小明初版审计）数据源：yuleASR 仓库实际
> `find src` 全仓扫描 + Configurator
> `schema/generated/`、`verification/extracted-cfgh/`、`apps/yuleasr-web/src/services/codegen.ts`、`packages/@yuletech/core/src/plugins/builtins/`
> 排期表：https://jhepa4n0x5.feishu.cn/base/RwCWb1povaJlFCsMMyTc5kcjnjd（原子10）
> 📌 计数勘误（YAC-MAP-003，2026-08-21）：本文件中"extracted-cfgh
> 110 个"系 YAC-MAP-002 时点快照。2026-08-21 重跑 F1 后
> `verification/extracted-cfgh/` 为 **109 个**（dlt_ecual 随 yuleASR
> ecual/dlt→services/dlt 重构并入 dlt，见
> `2026-08-21-module-mapping-f1-resync.md`），文中涉及计数一并更新为 109；结论不变。

---

## 0. 总体结论（相对初版审计的 3 个重大修正）

| #   | 初版审计结论                                | 文件级核实结论                                                                                                                          | 修正依据                                                                                                                                                                                                                                                                              |
| --- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | A 缺口 14 项中 7 项"无目录"                 | **仅 4 项真实缺失**（arti/ble/mcl/sbc）；7 项实际有代码（cddfvm/dem_legacy/linker/linmaster/linslave/nvmecchandler/ostimingprotection） | `verification/extracted-cfgh/` 109 个文件全部是从 yuleASR `*_Cfg.h` 提取（F1 脚本；YAC-MAP-003 起 110→109），其中含上述 7 项 schema → 源 Cfg.h 必然存在；find 初筛因命名变体（LinMaster__、NvM_EccHandler__、Os_TimingProtection__、Linker_Cfg.h、Cdd_Fvm__、dem/legacy/ 目录）漏匹配 |
| 2   | B 缺口 10 项中 6 项"真实缺 schema"          | **确认 6 项真实缺 schema**（dds/microdds/ethtsyn/ldcom/lntm/tm），canm/cdd 为命名差异                                                   | `schema/generated/` + `extracted-cfgh/` 均无这 6 项；canm→`cannm.json`+`cannm_ecual.json` 已存在；cdd 家族仅 `cddfvm.json`                                                                                                                                                            |
| 3   | 工具链 codegen 仅覆盖 ~25 模块、78 个无生成 | **codegen 是 schema 驱动全量生成（117 全可生成）**，"78 无生成"结论作废                                                                 | `generateHeadersFromSchemas`（codegen.ts:1062）对任意 ModuleSchema 无白名单全量生成；`generateHeadersFromConfig`（codegen.ts:1265）生成集合=全部 schema；`scripts/replace-cfgh.ts` 已对 109 个宏名版 schema 全量生成验证（YAC-MAP-003 起 110→109）（V2 139/139 编译通过）             |

**最终缺口盘点：**

- 配置了但 yuleASR 无代码（应清理）：**4 项**（arti、ble、mcl、sbc）
- yuleASR 有代码但无法配置/生成（应补）：**6 项**（dds、microdds、ethtsyn、ldcom、lntm、tm）
- 需要决策项：**3 项**（appswc/compswc 属 ASW 层合理保留；fr 依赖 S32K312 无 FlexRay 外设）

---

## 1. A 缺口文件级核实（Configurator 有 schema，yuleASR 疑无代码）

### 1.1 逐模块证据

| 模块                   | schema 位置                                                                                                               | yuleASR 源码证据                                                                                                                                                                      | 判定                                                                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **cddfvm**             | `schema/generated/cddfvm.json` + `extracted-cfgh/cddfvm.json`                                                             | `src/bsw/cdd/src/Cdd_Fvm_1.0.0.c`、`Cdd_Fvm_Hw.c`、`include/Cdd_Fvm_Cfg.h`、`Cdd_Fvm.h`                                                                                               | ✅ **真实存在**（cdd 平铺结构，初筛 `-iname "*cddfvm*"` 因文件名 `Cdd_Fvm_*` 未匹配）                                                                                                      |
| **dem_legacy**         | `schema/generated/dem_legacy.json` + `extracted-cfgh/dem_legacy.json`                                                     | `src/bsw/services/dem/legacy/`（dem_freeze_frame.c/h、dem_nvm.c/h、dem_queue.c/h 等 + `legacy/config/Dem_Cfg.h`）                                                                     | ✅ **真实存在**（dem 变体，独立 legacy 目录）                                                                                                                                              |
| **linker**             | `schema/generated/linker.json` + `extracted-cfgh/linker.json`                                                             | `src/platform/s32k312/linker/Linker_Cfg.h`（+ `src/bsw/boot/config/Boot_Linker.ld`）                                                                                                  | ✅ **真实存在**（平台链接脚本，非 BSW 模块但 schema 完整；KNOWN_MIXED_HEADERS 在册，27 拼接模块之一）                                                                                      |
| **linmaster**          | `schema/generated/linmaster.json` + `extracted-cfgh/linmaster.json`                                                       | `src/bsw/mcal/lin/include/LinMaster.h`、`LinMaster_Cfg.h`、`LinMaster_Tp.h`、`LinMaster_Diagnostic.h` 等 + `src/LinMaster_Tp.c`、`LinMaster_Diagnostic.c`、`LinMaster_Hal.c`          | ✅ **真实存在**（在 MCAL Lin 驱动内，**不是** linif 子容器；是独立 Cfg.h 头文件）                                                                                                          |
| **linslave**           | `schema/generated/linslave.json` + `extracted-cfgh/linslave.json`                                                         | `src/bsw/mcal/lin/include/LinSlave.h`、`LinSlave_Cfg.h`、`LinSlave_CfgTable.h`、`LinSlave_Tp.h`、`LinSlave_Pid.h` 等 + `src/LinSlave_Pid.c`、`LinSlave_Tp.c` 等                       | ✅ **真实存在**（同上，MCAL Lin 驱动内；KNOWN_MIXED_HEADERS 在册）                                                                                                                         |
| **nvmecchandler**      | `schema/generated/nvmecchandler.json` + `extracted-cfgh/nvmecchandler.json`                                               | `src/bsw/services/nvm/include/NvM_EccHandler.h`、`NvM_EccHandler_Cfg.h` + `src/NvM_EccHandler.c`、`NvM_EccHandler_Cfg.c`                                                              | ✅ **真实存在**（**是 nvm 子容器**，但独立 Cfg.h；初筛 `-iname "*nvmecchandler*"` 因 `NvM_Ecc*` 命名未匹配）                                                                               |
| **ostimingprotection** | `schema/generated/ostimingprotection.json` + `extracted-cfgh/ostimingprotection.json`                                     | `src/bsw/os/include/Os_TimingProtection_Cfg.h` + `src/bsw/os/src/Os_TimingProtection.c`                                                                                               | ✅ **真实存在**（os 内部模块，独立 Cfg.h；KNOWN_MIXED_HEADERS 在册）                                                                                                                       |
| **appswc**             | `schema/generated/appswc.json`（仅 generated，**无** extracted，x-layer=ASW）                                             | `src/application/` 有 ASW 组件：communication_manager、engine_control、io_control、mode_manager、vehicle_dynamics 等（含 asw_interfaces.h），但**无 `*_Cfg.h`**                       | ⚠️ **需决策**：ASW 应用层组件合理存在（非 BSW 静态库），但无配置头可提取 → schema 目前是 ARXML 组件描述型（ComponentName/ComponentDescription），配置→生成无落地                           |
| **compswc**            | `schema/generated/compswc.json`（仅 generated，无 extracted，x-layer=ASW）                                                | 同上（src/application 组件组合）                                                                                                                                                      | ⚠️ **需决策**：同 appswc，属 ASW 非 BSW                                                                                                                                                    |
| **fr**                 | `schema/generated/fr.json`（仅 generated，**无** extracted）                                                              | 无 `Fr_*.c/h`（MCAL Fr 控制器驱动**不存在**）；仅 `src/bsw/ecual/frif/`（FrIf.c 517 行、19 处 FrIf_* API 实装，非 stub）+ `src/bsw/ecual/frtp/`（FrTp.c/Rx/Tx/TxSm 共 2469 行，实装） | ⚠️ **需决策**：S32K312 平台（`src/platform/s32k312/include/S32K312.h`）**无 FlexRay 外设**（全仓无 flexray 寄存器/驱动）→ fr schema 配置无硬件载体；frif/frtp 是协议层代码（为兼容保留？） |
| **arti**               | `schema/generated/arti.json`（仅 generated，无 extracted；11.1KB，含 ArtiOs/ArtiHardware 参数）                           | **无任何代码**（全仓 `find src -iname "*arti*"` 仅误匹配 bootloader 的 `bl_partition.c/h`）                                                                                           | ❌ **确认缺失**（Adaptive/ARTI 中间件未实现；os.json 无 usearti 引用，配置无落地）                                                                                                         |
| **ble**                | `schema/generated/ble.json`（仅 generated，无 extracted；20.2KB）                                                         | **无任何代码**（find 仅误匹配 LinSlave_CfgTable 中的 "ble" 子串、test_double_bit_errors 的 "double"）                                                                                 | ❌ **确认缺失**（BLE 协议栈未实现）                                                                                                                                                        |
| **mcl**                | `schema/generated/mcl.json`（仅 generated，无 extracted；17.2KB）                                                         | **无任何代码**                                                                                                                                                                        | ❌ **确认缺失**（MCL 未实现；无 Mcl_* 文件）                                                                                                                                               |
| **sbc**                | `schema/generated/sbc.json`（仅 generated，无 extracted；5.8KB，含 sbc-clk/sbc-int/sbc-rst/sbc-mosi 引脚、watchdog 参数） | **无 SBC 驱动代码**（无 Sbc_* 文件）；仅 ICU 配置含 `icuchannel_sbcint` 引脚引用（all-modules.ts 证据）                                                                               | ❌ **确认缺失**（系统基础芯片驱动未实现；但 schema 引脚参数与 ICU/SPI 有 crossReference 语义，移除需谨慎）                                                                                 |

### 1.2 A 缺口汇总

- ✅ 真实存在（初版误判，实际有代码有 schema）：**7 项** —
  cddfvm、dem_legacy、linker、linmaster、linslave、nvmecchandler、ostimingprotection
- ⚠️ 需决策：**3 项** —
  appswc、compswc（ASW 层合理）、fr（S32K312 无 FlexRay 外设）
- ❌ 确认缺失（配置了但无代码）：**4 项** — arti、ble、mcl、sbc

---

## 2. B 缺口文件级核实（yuleASR 有代码，Configurator 无 schema）

### 2.1 逐模块证据

| 模块                  | yuleASR 源码位置（目录 + 代表文件）                                                                                                                                               | Configurator schema 现状                                                                                                                                     | 判定                                                                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **canm**              | `src/bsw/services/canm/`（CanNm.c 1.4K 行、CanNm_Cfg.h）+ `src/bsw/ecual/canNm/`（CanNm.c、CanNm_Lcfg.c）                                                                         | `cannm.json` + `cannm_ecual.json` **已存在**（extracted-cfgh 亦有；`cannm_ecual.json` 的 `x-source-file: src/bsw/ecual/canNm/include/CanNm_Cfg.h` 精确对应） | ✅ **实为命名差异**（AUTOSAR 标准名 CanNm；Configurator id=cannm 正确，**无需新增 schema**，建议在映射表落文档）                             |
| **cdd**               | `src/bsw/cdd/`（Cdd.c、Cdd_Boot_1.0.0.c、Cdd_Fvm_1.0.0.c、Cdd_Hsm_1.0.0.c、Cdd_Lockstep_1.0.0.c、Cdd_RamEcc_1.0.0.c、Cdd_Safety_1.0.0.c + Cdd_Fvm_Cfg.h 等 8 头）                 | 仅 `cddfvm.json`（generated + extracted）                                                                                                                    | ⚠️ **部分映射**：cddfvm 已对应；但 Cdd_Hsm/Lockstep/RamEcc/Safety/Boot 5 个子模块**无 schema**（无独立 Cfg.h，配置宏内嵌 Cdd_*.c？需按需补） |
| **os.c / cdd.c 平铺** | `src/bsw/os/src/Os.c`、`src/bsw/cdd/src/Cdd.c`                                                                                                                                    | 已有 `os.json`、`cddfvm.json`                                                                                                                                | ✅ 脚本误报（初版审计已识别）                                                                                                                |
| **dds**               | `src/middleware/dds/`（core/pubsub/rtps/runtime/security/transport，含 dds_eth_transport.c、dds_soad_adapter.c、dds_tcpip_compat.h）+ `src/middleware/microdds/`（microdds.h 等） | **无 dds schema、无 microdds schema**（generated/ 与 extracted-cfgh/ 均无）                                                                                  | ❌ **真实缺 schema**（DDS 中间件 3.2 万行，属 middleware 层非 AUTOSAR 标准 BSW——需决策补多大粒度）                                           |
| **microdds**          | 同上 `src/middleware/microdds/`                                                                                                                                                   | 无                                                                                                                                                           | ❌ **真实缺 schema**（dds 的子集/轻量实现）                                                                                                  |
| **ethtsyn**           | `src/bsw/services/ethtsyn/`（EthTSyn.c 268 行、EthTSyn.h、SchM_EthTSyn.h）                                                                                                        | 无                                                                                                                                                           | ❌ **真实缺 schema**（以太网时间同步，AUTOSAR 标准模块，**应补**）                                                                           |
| **ldcom**             | `src/bsw/services/ldcom/`（LdCom.c 154 行、LdCom.h）                                                                                                                              | 无                                                                                                                                                           | ❌ **真实缺 schema**（LIN 诊断通信，**应补**）                                                                                               |
| **lntm**              | `src/bsw/services/lntm/`（LinTp.c 1058 行、**LinTp_Cfg.h**、LinTp.h）                                                                                                             | 无（注意：现有 `lintp.json` 在 Configurator 是 ECUAL 版 `src/bsw/ecual/lintp` 的？需核对，见 2.2）                                                           | ❌ **真实缺 schema**（LIN TP 网络层；命名需澄清 lntm vs lintp 双实现）                                                                       |
| **tm**                | `src/bsw/services/tm/`（Tm.c 193 行、Tm.h）                                                                                                                                       | 无                                                                                                                                                           | ❌ **真实缺 schema**（Time Management，AUTOSAR 标准模块，**应补**）                                                                          |

### 2.2 重要补充发现（初版审计未覆盖）

1. **lntm vs lintp 双实现**：yuleASR 同时有
   `src/bsw/services/lntm/`（LinTp.c，Service 层）和
   `src/bsw/ecual/lintp/`（ECUAL 层，Configurator
   `lintp.json`+`lintp_ecual.json`
   已存在）。两者共用 LinTp 命名，**需要确认哪个是活跃实现**，否则补 schema 会重复。建议：以
   `extract-schemas-from-cfgh.ts`
   提取结果为准（两个都有 Cfg.h 就都补，用 x-source-file 区分，与 DoIP 双版先例一致）。

2. **ethtsyn/ldcom/tm 无独立 `*_Cfg.h`**：这三个模块的配置宏内嵌在 `.c/.h`
   内（如
   `EthTSyn.c:15 #define ETHTSYN_DEV_ERROR_DETECT STD_ON`、`LdCom.c:8 #define LDCOM_DEV_ERROR_DETECT STD_ON`），**不满足 F1 提取前提**（`*_Cfg.h`
   纯宏提取）。补 schema 需手写（参考 generated/ 手工 schema 结构）或先重构 yuleASR 侧拆出 Cfg.h（但 yuleASR 只读，需走需求单）。

3. **cdd 家族**：Configurator 仅
   `cddfvm.json`，yuleASR 另有 Cdd_Hsm/Cdd_Lockstep/Cdd_RamEcc/Cdd_Safety/Cdd_Boot
   5 个实现，均无 schema。若交付需要（Hsm/Lockstep 属功能安全交付项），需评估补 schema。

### 2.3 B 缺口汇总

- ✅ 命名差异（建议显式映射落文档）：canm↔cannm（含 ecual 双版）
- ⚠️ 部分映射：cdd 家族（cddfvm 已映射，5 子模块未映射）
- ❌ 真实缺 schema：**6 项** — dds、microdds、ethtsyn、ldcom、lntm、tm

---

## 3. 工具链覆盖文件级核实（重点）

### 3.1 codegen.ts 真实能力（初版审计"~25 模块/78 无生成"作废）

`apps/yuleasr-web/src/services/codegen.ts`（1322 行）三条生成路径：

| 入口                                       | 行号 | 生成范围                                                                                              | 白名单                             |
| ------------------------------------------ | ---- | ----------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `generateAllHeaders(modules)`              | 987  | 遍历传入模块，仅 enabled；can 走专用 `generateCanMacroHeader`，其余走通用 `generateMacroOnlyHeader`   | 无模块白名单（**任意模块可生成**） |
| `generateHeadersFromSchemas(schemas)`      | 1062 | **对全部传入 schema 全量生成**（含拼接路径：27 个 KNOWN_MIXED_HEADERS 自动 splice 手写非宏段）        | 无白名单                           |
| `generateHeadersFromConfig(configModules)` | 1265 | **生成集合 = 全部 schema（117 个），不因配置未启用而跳过**；仅 enabled 配置的参数值覆盖 schema 默认值 | 无白名单                           |

- `MODULE_IDS`（13 项：Mcu/Port/Dio/Can/Adc/Icu/Gpt/Pwm/Wdg/Lin/Spi/Fr/Eth）仅用于**头文件名推导**（`getHeaderFilename`）与 AUTOSAR 模块 ID 数字，**不是生成白名单**。
- `getModuleShortName`
  known 表 22 项（can/mcu/port/dio/adc/icu/gpt/pwm/wdg/lin/spi/fr/eth/os/rte/boot/crypto/e2e/flash/secoc/someip/tcpip/udpnm）是 PascalCase 别名映射，**不是覆盖清单**。
- **实锤**：`scripts/replace-cfgh.ts`（V2 全量闭环验证）用
  `generateHeadersFromSchemas` 对 `verification/extracted-cfgh/`
  **109 个宏名版 schema 全部生成**（YAC-MAP-003 起 110→109），manifest 记录拼接结果（27 模块 spliced=true），V2 验证 139/139 编译通过、ctest
  45/45。

### 3.2 builtins 插件

`packages/@yuletech/core/src/plugins/builtins/` 共 4 个正式插件 +
register-builtins.ts：

| 插件                               | 支持模块                                                                           | 性质                                                                                                                   |
| ---------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `mcal-generator-plugin.ts`         | `MCAL_MODULES` 13 项：Can/CanTrcv/Lin/LinTrcv/Spi/Mcu/Dio/Pwm/Icu/Adc/Gpt/Wdg/Port | 注册到 generatorRegistry 的通用模板生成器（**plugin 层注册表，非 codegen.ts 实际路径**；UI 走 codegen.ts schema 驱动） |
| `arxml-export-plugin.ts`           | 无模块绑定（ARXML 导出）                                                           | 导出工具                                                                                                               |
| `cross-module-validator-plugin.ts` | 全模块（跨模块校验）                                                               | 校验器                                                                                                                 |
| `schema-validator-plugin.ts`       | 全模块（schema 校验）                                                              | 校验器                                                                                                                 |

### 3.3 三方矩阵（schema 117 × codegen × yuleASR 落地）

**维度定义：**

- **有 schema**：`schema/generated/`
  117 个（含变体 14 个：`*_ecual`/`*_service`，去变体 103 核心模块）
- **可生成**：codegen 对 117 全部可生成（3.1 实锤）
- **可落地**：生成的 `<Module>_Cfg.h` 能在 yuleASR 找到对应手写头替换 →
  **有宏名版 schema（extracted-cfgh 109 个，YAC-MAP-003 起）**
  才可落地；7 个回退 generated/ 的模块 yuleASR 无对应 Cfg.h

| 分类                                                 | 数量    | 模块                                                                                       | 配置→生成→落地闭环                                                   |
| ---------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| ✅ **完整闭环**（schema+codegen+yuleASR 代码+Cfg.h） | **102** | extracted-cfgh 109 − 7 个无代码模块 = 102 核心模块（含变体后 109；YAC-MAP-003 起 110→109） | ✅ 配置 → 生成（宏名版）→ 替换 yuleASR Cfg.h 编译验证通过（139/139） |
| ⚠️ **配置可生成但 yuleASR 无落地**                   | **7**   | appswc、arti、ble、compswc、fr、mcl、sbc（仅 generated/，无 extracted）                    | ⚠️ 可配置 → 可生成宏头 → **yuleASR 无对应 Cfg.h，生成产物无法落地**  |
| ❌ **yuleASR 有代码但无 schema 无法配置/生成**       | **6**   | dds、microdds、ethtsyn、ldcom、lntm、tm                                                    | ❌ 无 schema → 无法配置 → 无法生成（配置→生成→落地全断）             |

**最大断层修正：**

- 初版审计说"78 个配置了但无法生成" →
  **错误**。实际 codegen 全量可生成，103 个已完整闭环（YAC-MAP-003 起 110→109，闭环数 103→102）。
- **真正的最大断层** = 6 个"有代码无 schema"模块（配置/生成/落地全断）+
  7 个"配置可生成但落地为空"模块（生成产物无意义）。
- 次断层 =
  cdd 家族 5 子模块（Cdd_Hsm/Lockstep/RamEcc/Safety/Boot 有代码无 schema，未计入 103 因 Configurator 从未建 schema）。

---

## 4. 可执行补全清单（分优先级）

### P0 — 真实缺口，影响交付

| 模块               | 现状证据                                                                                                                                                          | 建议动作                                                                                                                                                                                                                                                     | 工作量                                   |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| **ethtsyn**        | 有代码无 schema：`src/bsw/services/ethtsyn/EthTSyn.c`（268 行）；无 `EthTSyn_Cfg.h`（宏内嵌 .c）                                                                  | 手写 `ethtsyn.json` schema（参考 generated/ 手工 schema 结构，参数：EthTSynDevErrorDetect 等）+ 注册 generated/index.ts + all-modules.ts 重生成                                                                                                              | **S**（1-2h）                            |
| **ldcom**          | 有代码无 schema：`src/bsw/services/ldcom/LdCom.c`（154 行）；无 `LdCom_Cfg.h`                                                                                     | 手写 `ldcom.json`（同上；参数 LdComDevErrorDetect 等）                                                                                                                                                                                                       | **S**（1-2h）                            |
| **tm**             | 有代码无 schema：`src/bsw/services/tm/Tm.c`（193 行）；无 `Tm_Cfg.h`                                                                                              | 手写 `tm.json`（同上；参数 TmDevErrorDetect、TmMaxGtmCount 等按源码提取）                                                                                                                                                                                    | **S**（1-2h）                            |
| **lntm**           | 有代码无 schema：`src/bsw/services/lntm/LinTp.c`（1058 行）**有 `LinTp_Cfg.h`** 可 F1 提取；但与 ECUAL lintp 双实现并存（`lintp.json`+`lintp_ecual.json` 已存在） | ① 先确认 lntm vs ecual/lintp 哪个活跃（查 CMakeLists/构建引用）；② 用 `extract-schemas-from-cfgh.ts` 对 `services/lntm/include/LinTp_Cfg.h` 跑 F1 提取生成 `lntm.json`；③ 若双版都编译则仿 DoIP 双版先例补 `x-source-file` 区分                              | **M**（3-4h，含双版甄别）                |
| **dds / microdds** | 有代码无 schema：`src/middleware/dds/` + `src/middleware/microdds/` 共 **32554 行**（core/pubsub/rtps/transport/security）；无 Cfg.h                              | **建议先决策粒度再补**：DDS 非 AUTOSAR 标准 BSW，选项：a) 补最小 schema（仅使能/传输类型/IP 端口等 5-10 参数，S）b) 完整 schema（L）c) 声明"中间件直连，不经 Configurator"（移除出矩阵，S）。**推荐 a+c 组合**：先补最小 schema 打通闭环，完整配置走代码直连 | **M**（最小 schema 3-4h）/ **L**（完整） |
| **arti**           | schema 11.1KB，**yuleASR 零代码**                                                                                                                                 | 建议标记"未实现"（schema 保留 + UI 标注 Unimplemented badge），或按老板裁决移除。保留更稳（os 参数体系预留了 Arti 钩子）                                                                                                                                     | **S**（标注/移除均 <1h）                 |
| **ble**            | schema 20.2KB，yuleASR 零代码                                                                                                                                     | 同上：标记"未实现"或移除                                                                                                                                                                                                                                     | **S**                                    |
| **mcl**            | schema 17.2KB，yuleASR 零代码                                                                                                                                     | 同上                                                                                                                                                                                                                                                         | **S**                                    |
| **sbc**            | schema 5.8KB，yuleASR 零代码（但 ICU/SPI 配置含 sbc 引脚 crossReference：icuchannel_sbcint、sbc-clk/sbc-mosi 等）                                                 | 标记"未实现"**但保留 schema**（有 crossReference 引用，移除会破坏 ICU 校验）；UI 标 Unimplemented                                                                                                                                                            | **S**                                    |

### P1 — 命名映射表落文档 + 实现

| 项                     | 现状证据                                                                                              | 建议动作                                                                                                                                                                                                                   | 工作量                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **canm↔cannm 映射**    | yuleASR `services/canm/CanNm.*` + `ecual/canNm/`；Configurator `cannm.json`+`cannm_ecual.json` 已正确 | 在 `docs/planning/` 建**命名映射表文档**（或并入本文件附录）：yuleASR 文件名/目录名 ↔ Configurator schema id 对照；实现方式：`getModuleShortName` known 表补充显式条目（`cannm: 'CanNm'` 已有隐式能力，建议显式化 + 单测） | **S**（1h）                              |
| **cdd 家族映射**       | yuleASR `cdd/` 8 文件；Configurator 仅 `cddfvm.json`                                                  | 映射表登记：Cdd_Fvm→cddfvm ✅、Cdd_Hsm/Lockstep/RamEcc/Safety/Boot→**待补**（进 P0.5 评估：若功能安全交付需要则补 schema，否则登记为"未映射-低优先"）                                                                      | **S**（登记）+ **M**（若补 5 个 schema） |
| **lntm↔lintp 命名**    | 双实现（见 P0 lntm）                                                                                  | 映射表登记 + 决策活跃实现                                                                                                                                                                                                  | 含在 P0                                  |
| **codegen 已知别名表** | `getModuleShortName` known 22 项硬编码                                                                | 建议从映射表文档生成（或至少注释引用文档），防漂移                                                                                                                                                                         | **S**                                    |

### P2 — codegen 覆盖评估（初版"78 无生成"结论更新）

| 项                                         | 现状证据                                                                                   | 建议动作                                                                                                                             | 工作量          |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| **102 闭环模块**（YAC-MAP-003 起 103→102） | replace-cfgh 109 宏名版全量生成验证通过（YAC-MAP-003 起）（V2 139/139 编译 + ctest 45/45） | **维持现状，无需补**。建议把 replace-cfgh 纳入 CI 门禁（YAC-CI 已有先例）防回归                                                      | **S**           |
| **7 个"仅配置不生成"模块**                 | appswc/arti/ble/compswc/fr/mcl/sbc 有 schema 可配置，生成产物无落地                        | **声明"仅配置不生成"**：codegen.ts 加显式 NOLANDING_MODULES 集合（或 UI 禁用生成按钮），生成时跳过并提示；fr 待 S32K312 FlexRay 决策 | **S**（0.5-1h） |
| **fr 模块决策**                            | S32K312 无 FlexRay 外设；frif/frtp 协议层代码实装                                          | 老板决策：a) fr schema 标记"硬件不支持-仅配置" b) 移除 fr/frif/frtp schema（保守建议 a，代码保留）                                   | **决策项**      |
| **appswc/compswc**                         | ASW 层组件实存（src/application），无 Cfg.h                                                | 声明"ASW 组件配置-仅配置不生成"（当前 schema 即组件描述型，与生成语义一致）；后续如出 RTE 生成再联动                                 | **S**           |

---

## 5. 汇总表（老板速览）

| 类别                                            | 数量 | 明细                                                                     |
| ----------------------------------------------- | ---- | ------------------------------------------------------------------------ |
| ✅ 完整闭环（配置→生成→落地）                   | 102  | extracted-cfgh 109 − 7 无代码模块（YAC-MAP-003 起 103→102）              |
| ⚠️ 可配置可生成、落地为空（建议"仅配置不生成"） | 7    | appswc、arti、ble、compswc、fr、mcl、sbc                                 |
| ❌ 有代码无 schema（P0 补）                     | 6    | ethtsyn、ldcom、lntm、tm、dds、microdds                                  |
| ⚠️ 部分映射（P1 登记）                          | 2 组 | canm↔cannm（已映射待文档化）、cdd 家族（cddfvm 已映射 + 5 子模块未映射） |
| ✅ 命名差异（无需动作）                         | 2    | os.c/cdd.c 平铺（脚本误报）                                              |
| 初版审计重大修正                                | 2 处 | A 缺口 14→4 真实缺失；codegen 覆盖 25→117 全量可生成                     |

---

## 6. 遗留问题 / 需老板裁决

1. **fr**：S32K312 无 FlexRay 外设，frif/frtp 协议层代码保留原因？（a. 兼容未来芯片 b. 冗余）→ 决定 fr
   schema 去留
2. **dds/microdds**：补最小 schema（打通闭环）还是声明中间件直连？（32554 行规模，完整 schema 不经济）
3. **lntm vs
   ecual/lintp**：双实现活跃性确认（需 yuleASR 侧查 CMake 引用，本核实未动 yuleASR 只读约束）
4. **arti/ble/mcl/sbc**：标记"未实现"
   vs 移除 schema（sbc 有 crossReference，建议保留标记）
5. **cdd
   5 子模块**（Hsm/Lockstep/RamEcc/Safety/Boot）：是否属功能安全交付范围需补 schema？

---

## 附：核实方法说明

- A 缺口：`find src -iname "*<模块>*"` 全仓扫描（含大小写/缩写变体）+
  `extracted-cfgh/`
  存在性双保险（extracted 必然对应 yuleASR 实际 Cfg.h，因 F1 脚本
  `scripts/extract-schemas-from-cfgh.ts` 从 yuleASR `src` 下 `*_Cfg.h`
  纯宏提取）
- B 缺口：yuleASR 目录+代表文件清单 vs `schema/generated/` + `extracted-cfgh/`
  grep 双否定
- 工具链：codegen.ts 三条生成路径逐行阅读 + replace-cfgh.ts 调用实锤 + builtins
  4 插件逐一 grep
- yuleASR 全程只读，未修改任何文件、未运行写测试
