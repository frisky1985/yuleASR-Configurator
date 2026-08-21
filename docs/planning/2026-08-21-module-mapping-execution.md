# YAC-MAP-002 裁决执行记录（2026-08-21）

> 执行人：小克 | 依据：`2026-08-21-module-mapping-audit.md`（老板 2026-08-21 01:40 裁决）+ `2026-08-21-module-mapping-findings.md`（可执行补全清单）
> 仓库：yuleASR-Configurator main 分支 | yuleASR 全程只读（未修改任何源码）

## 裁决落地一览

| # | 裁决/清单项 | 执行结果 | 证据 |
|---|------------|---------|------|
| 1 | ble/mcl/sbc 删除 | ✅ schema JSON + index.ts 导出 + all-modules.ts 模块块全部移除；`icuchannel_sbcint`/`sbc-clk` 等仅为 UI 引脚容器（非 schema crossReference，不破坏校验） | commit 21afc6c3 |
| 2 | arti 保留 + 标记 | ✅ schema 保留，x-impl-status=runtime-hooks + 描述改为"运行时钩子函数声明（非独立模块）"；UI 走 NOLANDING 徽标"仅配置不生成" | commit 21afc6c3 / 5de4e0cf |
| 3a | ethtsyn/ldcom/tm 手写 schema | ✅ 3 个 schema（参数按源码提取：ETHTSYN_DEV_ERROR_DETECT 等；CPI ModuleId default 承载模块 ID 0x0A/0x0B/0x0C 避免宏名冲突） | commit 8feb6dc5 |
| 3b | lntm 甄别 + F1 提取 | ✅ services/lntm 与 ecual/lintp 双实现 GLOB 编译均活跃；F1 复跑验证 `lintp.json`（x-source-file: services/lntm/include/LinTp_Cfg.h）+ `lintp_ecual.json`（ecual/linTp）与基线一致——**"lntm 缺 schema"为命名假象，不新建重复 schema**（DoIP 双版先例已满足） | commit 8feb6dc5 + 本记录 §2 |
| 3c | dds/microdds 最小 schema | ✅ findings 推荐 a+c：使能/域/传输类型/IP 端口/资源上限（dds 10 参数、microdds 10 参数），配置→生成闭环打通；完整配置走代码直连 | commit 8feb6dc5 |
| 3d | 注册 generated/index.ts + all-modules.ts | ✅ index.ts 119 导出（117−3+5）；all-modules.ts 39 模块块（34+5） | commit 8feb6dc5 |
| 4 | 命名映射表落文档 | ✅ `2026-08-21-module-mapping-naming.md`：canm↔cannm（含 ecual 双版）、cdd 家族（cddfvm 已映射 + Hsm/Lockstep/RamEcc/Safety/Boot 5 子模块登记待补）、lntm↔lintp 双版；getModuleShortName known 表显式条目 + 单测（codegen-naming.test.ts 6 条） | commit 8feb6dc5 |
| 5 | codegen 仅配置不生成 | ✅ NOLANDING_MODULES（appswc/arti/ble/compswc/fr/mcl/sbc）+ getNoLandingReason 原因表 + 生成跳过 + UI 徽标/提示；fr 标注"硬件不支持-仅配置"；appswc/compswc 标注"ASW 组件配置-仅配置不生成" | commit 5de4e0cf |

## §2 lntm vs ecual/lintp 甄别（CMake/构建引用证据）

- `src/bsw/services/CMakeLists.txt`：`file(GLOB ...)` 全量编译 → `service_lntm` 静态库（src/bsw/services/lntm/src/LinTp.c 1058 行）
- `src/bsw/ecual/CMakeLists.txt`：`file(GLOB ...)` 全量编译 → ecual lintp 库（src/bsw/ecual/lintp/src/LinTp.c + LinTp_Lcfg.c）
- F1 提取（`npx tsx scripts/extract-schemas-from-cfgh.ts --yuleasr ~/.openclaw/workspace/yuleASR`，2026-08-21 复跑）：发现 109 个 `*_Cfg.h`；`LinTp_Cfg.h` 双版 → `lintp.json`（Service）+ `lintp_ecual.json`（ECUAL），x-source-file 精确区分，与 DoIP 双版先例一致
- 复跑 diff：lintp/lintp_ecual 无变化（与基线一致）；其余 14 文件 diff 为 F1 脚本/yuleASR 演进漂移（rte 表达式归一化、boot 新增宏、ecual/dlt 目录重构致 dlt_ecual 消失），**不属于本任务范围，已还原未提交**（遗留项，见 §4）

## §3 验证证据（最终全量）

| 门禁 | 结果 |
|------|------|
| lint:ci | ✅ 0 error（1 个既有 warning） |
| typecheck（pnpm -r） | ✅ 全绿 0 error |
| 全仓 vitest | ✅ 1616/1616（core 991 + web 322 + community 235 + ui 16 + editor-core 16 + api-server 36）≥ 基线 1598 |
| core 单测 | ✅ 991 ≥ 985 |
| replace-cfgh 相关 | ✅ replace-cfgh.test.ts dry-run→apply→rollback 110/110 全闭环（extracted-cfgh 不受 NOLANDING 影响） |
| vite build（yuleasr-web） | ✅ built in 2.27s |

## §4 遗留项

1. **F1 脚本/yuleASR 漂移未提交**：复跑 extract-schemas-from-cfgh.ts 与基线 diff（rte.json 表达式归一化、boot.json 新宏、dlt_ecual.json 因 yuleASR ecual/dlt 目录重构消失等 14 文件）——建议单独开任务按 replace-cfgh V2 验证流程重新生成入库（110→109 涉及审计文档计数更新）
2. **cdd 5 子模块**（Cdd_Hsm/Lockstep/RamEcc/Safety/Boot）：已登记映射表"未映射-低优先"；功能安全交付需要则按需补 schema（无独立 Cfg.h，需先拆 Cfg.h 或手写）
3. **fr 决策保守落地**：schema 保留 + 标注"硬件不支持-仅配置"（frif/frtp 协议层代码保留）；后续芯片支持 FlexRay 时再评估
4. **dds/microdds 完整配置**：走代码直连（middleware 32554 行非 AUTOSAR 标准 BSW），最小 schema 仅打通闭环
5. **docs/planning/2026-08-21-ci-lint-gate.md**（YAC-CI 工作流文档，非本任务）未纳入本任务 commit

## §5 commit 清单（main）

| commit | 内容 |
|--------|------|
| 21afc6c3 | 原子1：删除 ble/mcl/sbc schema + arti 标注运行时钩子函数声明 |
| 8feb6dc5 | 原子2：补 5 个 schema（ethtsyn/ldcom/tm/dds/microdds）+ 命名映射显式化 + 映射表文档 |
| 5de4e0cf | 原子3：NOLANDING 仅配置不生成 + fr/appswc/compswc 标注 + UI 徽标 |
