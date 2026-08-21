# 命名映射表：yuleASR 文件/目录 ↔ Configurator schema id

> 建立日期：2026-08-21 | 执行：YAC-MAP-002（老板 2026-08-21 01:40 裁决）
> 上游：`2026-08-21-module-mapping-audit.md`（初版审计）+ `2026-08-21-module-mapping-findings.md`（文件级核实）
> 配套实现：`apps/yuleasr-web/src/services/codegen.ts` `getModuleShortName` known 表（显式条目 + 单测）

## 1. 命名差异模块（yuleASR 目录/文件名 ≠ Configurator schema id）

| yuleASR 位置（目录/文件） | Configurator schema id | 说明 | 状态 |
|--------------------------|------------------------|------|------|
| `src/bsw/services/canm/CanNm.c` + `include/CanNm_Cfg.h` | `cannm` | AUTOSAR 标准名 CanNm；Configurator id=cannm 正确，仅命名差异 | ✅ 已映射（无需新增 schema） |
| `src/bsw/ecual/canNm/CanNm.c` + `include/CanNm_Cfg.h` | `cannm_ecual` | ECUAL 双版（DoIP 双版先例，x-source-file 精确区分） | ✅ 已映射 |
| `src/bsw/cdd/src/Cdd_Fvm_*.c` + `include/Cdd_Fvm_Cfg.h` | `cddfvm` | cdd 平铺结构，Cdd_Fvm 子模块 | ✅ 已映射 |
| `src/bsw/services/lntm/include/LinTp_Cfg.h`（目录 lntm，头名 LinTp） | `lintp` | **lntm↔lintp 命名假象**：schema id 由头文件名（LinTp_Cfg.h）推导，x-source-file 已精确指向 services/lntm | ✅ 已映射（F1 提取产物，见 §3） |
| `src/bsw/ecual/linTp/include/LinTp_Cfg.h` | `lintp_ecual` | ECUAL 双版 | ✅ 已映射 |
| `src/bsw/os/src/Os.c` / `src/bsw/cdd/src/Cdd.c` | `os` / `cddfvm` | 平铺文件名脚本误报，非独立模块 | ✅ 无需动作 |
| `src/bsw/services/dem/legacy/` | `dem_legacy` | dem 变体（legacy 目录） | ✅ 已映射（F1 副版） |

## 2. cdd 家族子模块登记（cddfvm 已映射 + 5 子模块待补）

yuleASR `src/bsw/cdd/` 8 个实现文件，Configurator 仅 `cddfvm` schema：

| yuleASR 文件 | Configurator schema | 状态 |
|-------------|--------------------|------|
| Cdd_Fvm_1.0.0.c / Cdd_Fvm_Cfg.h | `cddfvm` | ✅ 已映射（generated + extracted-cfgh） |
| Cdd_Hsm_1.0.0.c | 无 | ⚠️ 未映射-低优先（无独立 Cfg.h，配置宏内嵌 Cdd_Hsm_*.c；功能安全交付需评估补 schema） |
| Cdd_Lockstep_1.0.0.c | 无 | ⚠️ 未映射-低优先（同上） |
| Cdd_RamEcc_1.0.0.c | 无 | ⚠️ 未映射-低优先（同上） |
| Cdd_Safety_1.0.0.c | 无 | ⚠️ 未映射-低优先（同上） |
| Cdd_Boot_1.0.0.c | 无 | ⚠️ 未映射-低优先（同上） |

## 3. lntm vs ecual/lintp 双实现甄别（YAC-MAP-002 执行证据）

| 项 | services/lntm | ecual/lintp |
|----|--------------|-------------|
| 位置 | `src/bsw/services/lntm/`（LinTp.c 1058 行 + LinTp_Cfg.h） | `src/bsw/ecual/lintp/`（LinTp.c + LinTp_Lcfg.c + LinTp_Cfg.h） |
| 构建引用 | `src/bsw/services/CMakeLists.txt` file(GLOB) → `service_lntm` 静态库 | `src/bsw/ecual/CMakeLists.txt` file(GLOB) → ecual 库 |
| 活跃性 | ✅ 活跃（GLOB 全量编译） | ✅ 活跃（GLOB 全量编译） |
| Configurator schema | `lintp.json`（x-source-file: `src/bsw/services/lntm/include/LinTp_Cfg.h`，层 Service） | `lintp_ecual.json`（x-source-file: `src/bsw/ecual/linTp/include/LinTp_Cfg.h`，层 ECUAL） |

**结论：双实现并存且都活跃 → 仿 DoIP 双版先例，用 x-source-file 区分（已存在，F1 提取产物）。
"lntm 缺 schema"是命名假象（目录名 lntm vs 头文件名 LinTp_Cfg.h），不新建 lntm.json 避免重复 schema。
2026-08-21 复跑 `extract-schemas-from-cfgh.ts --yuleasr ~/.openclaw/workspace/yuleASR` 验证：lintp/lintp_ecual 与基线一致（无 diff）。**

## 4. getModuleShortName known 表显式条目（2026-08-21 新增）

```ts
cannm: 'CanNm',
cannm_ecual: 'CanNm',
cddfvm: 'Cdd_Fvm',
lintp: 'LinTp',
lintp_ecual: 'LinTp',
ethtsyn: 'EthTSyn',
ldcom: 'LdCom',
tm: 'Tm',
dds: 'Dds',
microdds: 'MicroDds',
```

单测：`apps/yuleasr-web/src/services/__tests__/codegen-naming.test.ts`（新增，YAC-MAP-002）。

## 5. 防漂移

- known 表注释引用本文档（`docs/planning/2026-08-21-module-mapping-naming.md`），schema 增删时同步更新本文档与 known 表。
- 新增模块注册路径：schema JSON 写入 `generated/` → 复跑 F1 或手改 `generated/index.ts` → `all-modules.ts` 补 UI 块 → 本表登记。
