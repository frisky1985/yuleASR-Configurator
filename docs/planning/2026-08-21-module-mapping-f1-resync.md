# 原子需求 YAC-MAP-003：F1 漂移重生成入库（2026-08-21）

> 依据：`2026-08-21-module-mapping-execution.md` §4 遗留项 1（7e4d6cc5）
> 状态：**已完成** | 负责：小克 | 验收：小明（不采信自报）
> 完成 commit：`425e7dbe`（原子1）+ 原子2（本文件所在 commit，见 `git log --oneline -2`）

## 背景
YAC-MAP-002 执行时复跑 F1（extract-schemas-from-cfgh.ts）发现与基线 diff 14 文件：
- rte.json：表达式归一化（yuleASR 侧 Rte 头表达式写法演进）
- boot.json：yuleASR 新增配置宏
- dlt_ecual.json：yuleASR `ecual/dlt` 目录重构致消失
- 其余 11 文件为脚本/yuleASR 演进漂移
当时按"不属于本任务范围"还原未提交。现单独开任务重新生成入库。

## 验收标准（SHALL）执行结果

### 1. 重跑 F1 ✅
`npx tsx scripts/extract-schemas-from-cfgh.ts --yuleasr ~/.openclaw/workspace/yuleASR` 产出：
- 109 个 `*_Cfg.h` 提取 → `verification/extracted-cfgh/` 109 个 schema（110→109）
- 与基线 diff 收敛：**14 个漂移文件全部裁决完毕**，其中 13 个接受新基线、1 个删除（dlt_ecual）
- 全部差异均有 yuleASR 源码证据（详见 §2 逐文件裁决表）

### 2. 逐文件裁决 ✅（14 文件，全部有源码证据）
见 §2。

### 3. 计数更新 ✅
- `verification/extracted-cfgh/` 110 → 109（dlt_ecual.json 删除）
- `packages/@yuletech/core/src/schema/generated/` 119 → 118（dlt_ecual.json 删除 + index.ts 导出同步）
- 审计文档计数同步：`2026-08-21-module-mapping-findings.md` / `-execution.md` 已更新（见 §4）
- 测试计数断言同步：schema-validation.test.ts（119→118）、load-generated.test.ts（119→118，2 处）

### 4. 验证全绿 ✅
| 门禁 | 结果 |
|------|------|
| replace-cfgh V2 闭环 | ✅ dry-run 109/109 ok → apply 109 → rollback 109，scratch 工作树归零（replace-cfgh.test.ts 2/2） |
| 全仓 vitest | ✅ 1616/1616（core 988 + web 325 + community 235 + ui 16 + editor-core 16 + api-server 36），93 文件全过 |
| lint:ci | ✅ 0 error（1 个既有 warning：electron main.mjs no-console） |
| typecheck（pnpm -r） | ✅ 5/5 项目全绿 0 error |
| vite build（yuleasr-web） | ✅ built in 1.85s |

> vitest 计数说明：任务书基线写 1619（core 991 + web 325 + …），实跑 1616。差异 = core 中
> schema-validation.test.ts 3 个 `it.each(files)` 随文件数 119→118 各减 1（共 −3，正是本任务
> 110→109 的必然结果）；web 325 与任务书一致。1616 与 YAC-MAP-002 执行记录（7e4d6cc5 §3）持平。

### 5. commit + push ✅
小批量独立 commit，见 §4。

## §2 逐文件裁决表（对照 yuleASR 源码证据）

| # | 文件 | 漂移内容 | 裁决 | yuleASR 源码证据 |
|---|------|---------|------|-----------------|
| 1 | rte.json | 22 个 RTE_PORT_*_H expression 默认值 `(((A<<8)\|B))` → `((A<<8)\|B)`；x-source-file `src/rte/` → `src/middleware/rte/` | **接受新基线**（根因修复后与基线语义一致） | yuleASR `src/middleware/rte/include/Rte_Cfg.h`（7b85887d 目录重构）：表达式原样为 `(((RTE_COMPONENT_* << 8) \| RTE_PORT_*))`；旧基线是 a1bad5dc 手工补括号，非脚本产出 → 已在脚本表达式分支修复（见 §3.3），重跑后 rte 宏级差异 0（生成产物与手写头字节一致） |
| 2 | boot.json | 新增 10 宏（BOOT_ANTI_ROLLBACK_ENABLE 等） | **接受新基线** | yuleASR `src/bsw/boot/include/Boot_Cfg.h`（bb77e566 "bootloader 接线 Configurator OTA 安全配置"）：10 宏全部存在，值一致（STD_ON/(4U)/(365U)/(3U)/ECDSA_P256/(16U)/(30000U) 等） |
| 3 | dlt_ecual.json | 消失 | **删除 schema + generated/ 副本 + index.ts 导出 + 测试引用** | yuleASR `src/bsw/ecual/dlt/` 目录已不存在（f785b5c2/290eb612 将 ecual/dlt 并入 services/dlt）；替代归属：11 个宏并入 dlt.json（见 #4），不按 DoIP 双版先例（services/dlt 与 ecual/dlt 已合并为单实现，非双实现并存） |
| 4 | dlt.json | 新增 11 宏（DLT_MAX_CONTEXT_COUNT/DLT_BUFFER_COUNT/DLT_BUFFERING_TIMEOUT/DLT_MAIN_FUNCTION_PERIOD/DLT_USE_COM/DLT_ECU_ID/DLT_ECU_ID_LENGTH/DLT_PROTOCOL_VERSION_MAJOR/MINOR/DLT_MAX_CONTEXT_DESCRIPTION/DLT_DEFAULT_TRACE_STATUS） | **接受新基线** | yuleASR `src/bsw/services/dlt/include/Dlt_Cfg.h`（ecual 合并包2/包3）：11 宏全部存在，生成值与手写头一致（仅行尾注释差异，提取器按设计剥离注释入 description） |
| 5 | com.json | COM_NUM_IPDU_GROUPS 别名：`16`(integer) → `COM_NUM_OF_IPDU_GROUPS`(string) | **接受新基线**（根因修复后与基线语义一致） | yuleASR `src/bsw/services/com/include/Com_Cfg.h:27-28`：`#define COM_NUM_OF_IPDU_GROUPS (16U)` + `#define COM_NUM_IPDU_GROUPS COM_NUM_OF_IPDU_GROUPS`（纯别名）；旧基线是 a1bad5dc 手改，已在脚本别名分支修复（§3.4），重跑后生成 `COM_NUM_IPDU_GROUPS COM_NUM_OF_IPDU_GROUPS` 字节一致 |
| 6 | csm.json | CSM_ALGOFAM 枚举 24 → 26 | **接受新基线** | yuleASR Csm 目录全量标识符池新增 `CSM_ALGOFAM_SM2` / `CSM_ALGOFAM_SM3`（国密 SM2/SM3 算法族） |
| 7 | ecum.json | ECUM_CONFIGURED_WAKEUP_SOURCES 多行表达式 default 丢失（生成 `""`） | **接受新基线**（根因修复） | yuleASR `src/bsw/services/ecum/include/EcuM_Cfg.h:106-108`：多行续行表达式 `(ECUM_WKSOURCE_POWER \| ... \| ECUM_WKSOURCE_GPIO)`；旧基线是 79c8ec02 手补值，已在脚本多行分支修复（§3.5），重跑后原样透传字节一致 |
| 8 | keym.json | KEYM_CFG_KEY_AES_128/256_USAGE 多行表达式 default 丢失（生成 `""`） | **接受新基线**（根因修复） | yuleASR `src/bsw/services/keym/include/KeyM_Cfg.h`：`(KEYM_KEY_USAGE_ENCRYPT \| ... \| KEYM_KEY_USAGE_MAC_VERIFY)` 多行续行；同 #7 修复 |
| 9 | doip.json | DOIP_EID/DOIP_GID x-guarded 丢失（生成丢 #ifndef 保护结构） | **接受新基线**（根因修复） | yuleASR `src/bsw/services/doip/include/DoIP_Cfg.h:148-153`：`#ifndef DOIP_EID / #define ... / #endif`；脚本 object-literal 分支漏传 guarded（§3.6），修复后恢复 x-guarded |
| 10 | nvm.json | 新增 3 宏（NVM_REDUNDANT_STORAGE_ENABLED/NVM_MAX_BLOCK_SIZE/NVM_NUM_REDUNDANT_BLOCKS） | **接受新基线** | yuleASR `src/bsw/services/nvm/include/NvM_Cfg.h`（d1f6827f "启用冗余存储"）：3 宏存在，生成值一致（仅分节横幅位置不同，属生成器分节推断差异，宏值零差异） |
| 11 | crypto.json | 7 个多行初始化宏 description 文案变化（"原样透传"→"提取器不展开"） | **接受新基线** | 脚本 P0-1 文案演进（dd1c3eca），default 值未变；非 yuleASR 演进 |
| 12 | eth.json / 13. ethif.json / 14. tcpip.json | 单行对象字面量宏 description 文案变化（同上） | **接受新基线** | 同上，脚本文案演进；default 值未变 |

## §3 根因修复（防再漂移，SHOULD 项）

14 个漂移文件中，5 个（rte/com/ecum/keym/doip）的漂移根因是**脚本行为与既有手补基线不一致**——
过去依赖手改 JSON（a1bad5dc 补 rte/com 括号与别名、79c8ec02 补 ecum/keym 多行值），F1 每次重跑即回退。
本次在 `scripts/extract-schemas-from-cfgh.ts` 做根因修复，使重跑自愈、不再依赖手补：

1. **表达式分支保留原始括号**：手写头已带括号的表达式（RTE_PORT_*_H `(((A<<8)|B))`）原样输出 p.raw，
   不再 normalizeValue 剥括号后重包（此前输出 `((A<<8)|B)` 少一层括号）；无括号表达式仍补 `(...)` 供 codegen 透传。
2. **纯标识符别名原样输出**：`#define X Y`（Y 为同文件宏名，全仓唯一例 COM_NUM_IPDU_GROUPS）输出别名引用，
   不展开为目标值（此前输出 `(16U)` 与手写头字节不一致）。
3. **多行表达式宏提取完整原文**：非 `{` 的多行续行宏（ECUM_CONFIGURED_WAKEUP_SOURCES、KEYM_CFG_KEY_AES_*_USAGE）
   提取含行尾反斜杠的完整原文作 default（此前 value='' → 生成 `""` 语义错误）。
4. **object-literal 分支补传 guarded**：DOIP_EID/DOIP_GID 的 `#ifndef` 保护结构标记不再丢失。
5. **preserveExtraContainers**：写 generated/ 与 verification/ 前保留旧文件手补的 type=object 标准容器
   （boot OtaSecurity、ocu OcuConfigSet/OcuChannel、ramtst RamTstCommon），F1 重跑不再冲掉手补容器。
6. **孤儿 schema 清理**：之前脚本生成、本次提取已不存在的模块（dlt_ecual）自动删除 schema + index.ts 导出，
   计数自动收敛 110→109，不再需要人工删。

### 脚本对 yuleASR 演进的敏感点（防再漂移注释，已写入脚本头注释/代码注释）
- **GLOB 目录**：`LAYER_DIRS` 硬编码层目录（bsw/mcal、bsw/ecual、bsw/services、bsw/os、middleware/rte、bsw/cdd、bsw/boot、platform）——
  yuleASR 目录重构（src/rte → src/middleware/rte，ecual/dlt → services/dlt）会改变 x-source-file 与层归属，重跑自动对齐；
  但**重名模块优先级表**（services > mcal > ecual、PREFER_MCAL=Fee/RamTst）需在目录重构时人工复核。
- **宏写法**：表达式括号层数（3 层 vs 2 层）、多行续行（`\` 结尾 vs `{` 初始化器）、`#ifndef` 保护结构——
  脚本按"生成产物与手写头字节一致"原则处理（a1bad5dc 先例），新增写法需回归 replace-cfgh 宏级 diff。
- **手补容器**：type=object 容器由 preserveExtraContainers 保留；新增手补容器时须确保 type=object（非标量），否则不保留。

## §4 commit 清单（main，[AI-GENERATED]，message 均注 YAC-MAP-003）

| commit | 内容 |
|--------|------|
| `425e7dbe` | 原子1：F1 脚本根因修复 6 项 + 重跑入库（extracted-cfgh 110→109、generated 119→118、dlt_ecual 删除） |
| （本文件所在 commit） | 原子2：测试计数同步（schema-validation/load-generated 119→118、replace-cfgh.test.ts 去旧路径 seed）+ 审计文档计数更新（findings/execution）+ 本文档完成状态 |

## §5 遗留项

1. **cdd 5 子模块**（Cdd_Hsm/Lockstep/RamEcc/Safety/Boot）：沿用 YAC-MAP-002 遗留，未受影响。
2. **fr 决策保守落地**：沿用 YAC-MAP-002 遗留。
3. **dds/microdds 完整配置**：沿用 YAC-MAP-002 遗留。
4. **extracted-cfgh rte/com 缩进归一**：rte.json/com.json 由旧 1 空格缩进（a1bad5dc 手改工具产物）归一为脚本 2 空格，
   与其余 107 文件一致（纯格式，无语义影响）。
5. **.qoder/repowiki** 内 110 计数为知识库快照，由 repowiki 工具另行重建，不在本任务范围。

## 约束执行情况
- ✅ yuleASR 仓库全程只读（git status 前后均为 0 改动）
- ✅ 模型 deepseek-v4-flash
- ✅ 未截断，无 checkpoint 遗留
