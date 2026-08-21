# 需求总体架构：yuleASR ↔ Configurator 工程关联闭环验证（2026-08-21）

> 提出：老板 18:02
> | 编排：小明 | 依据：YAC-MAP-001/002/003 已完成的模块映射与 schema 补全目标：**证明 yuleASR-Configurator 能配置 yuleASR 的全部配置项，且配置产物在 yuleASR 工程编译通过、功能真实关联**

## 背景与已有资产

- YAC-MAP-001：模块映射审计（103 模块/109 extracted-cfgh schema）
- YAC-MAP-002：裁决执行（删 ble/mcl/sbc、补 5 schema、NOLANDING、命名映射）
- YAC-MAP-003：F1 漂移重生成入库（109 个宏名版 schema，F1 幂等）
- 既有验证工具：`scripts/replace-cfgh.ts`（V2：dry-run→apply→rollback +
  verify.json 编译/ctest 验证，历史 139/139 编译 + ctest 45/45）
- codegen.ts 三条生成路径（schema 驱动全量生成，无白名单）

## 验证链条（三段式）

```
① 配置覆盖度：Configurator schema 配置项全集 ↔ yuleASR *_Cfg.h 宏全集 一一对比
② 编译闭环：Configurator 生成头 → 替换 yuleASR Cfg.h → 工程编译 + ctest 全绿
③ 功能关联：配置宏 → yuleASR 代码引用路径 抽样验证（配置真的驱动功能）
```

## 原子需求

- **YAC-VER-001（P0）配置覆盖度对比**：机器对比 schema 参数全集 vs yuleASR
  `*_Cfg.h`
  宏全集（109 模块逐一），产出缺口报告（缺失配置项/多余配置项/默认值不一致），任何缺口需有解释或修复
- **YAC-VER-002（P0）生成→编译→测试闭环**：replace-cfgh V2 全量流程（109 schema
  → 生成 → apply 到 yuleASR scratch 副本 → 编译 139/139 + ctest 45/45 →
  rollback 还原 dirty=0）
- **YAC-VER-003（P1）功能关联抽样验证**：抽样 ≥5 个关键模块（建议 NvM/Can/Os/Dcm/Com），配置宏→代码引用点路径追踪，产出关联矩阵证明"配置项→宏→代码分支→功能"链条成立

## 验收总览（老板视角）

1. 覆盖度报告：109 模块配置项缺口=0 或全部有解释
2. 编译闭环：真实编译 + ctest 全绿（不采信自报，小明复现）
3. 关联矩阵：抽样模块配置→功能链条证据
4. 排期表逐原子落账（Commit/验收结果）

---

## ✅ 状态：已完成（2026-08-21，小克执行）

### 三段验证链结论

```
① 配置覆盖度（YAC-VER-001）✅  109/109 模块对比；缺口 = 0
   缺失 7（MemMap 段标记，splice 保留，生成头实证存在）/ 多余 1（boot.OtaSecurity
   配置容器，叶参数即真实宏）/ 默认值不一致 0；宏级 4759 = 4759 零差异
② 编译闭环（YAC-VER-002）✅    dry-run 109/109 → apply 109 → 编译 exit 0（139/139
   静态库）→ ctest 55/55 全绿 → rollback 109 恢复，scratch dirty=0，yuleASR 全程 dirty=0
③ 功能关联（YAC-VER-003）✅    5 模块 × 3 配置宏 = 15 条真实证据链（NvM/Can/Os/Dcm/Com）
```

### 证据文档（三份独立落盘）

| 原子        | 文档                                                                     | 关键数字                                                 |
| ----------- | ------------------------------------------------------------------------ | -------------------------------------------------------- |
| YAC-VER-001 | `2026-08-21-ver001-coverage.md`（含 109 模块表格 + 缺口清单 + 复跑命令） | 缺口=0；4759=4759 宏；默认值不一致 0                     |
| YAC-VER-002 | `2026-08-21-ver002-build.md`（含复跑命令，可入 CI）                      | build exit 0；139/139 静态库；ctest 55/55；rollback 归零 |
| YAC-VER-003 | `2026-08-21-ver003-linkage.md`（关联矩阵 + 抽样观察）                    | 5 模块 × 3 宏 = 15 条链全真实引用                        |

### 新增工具

- `scripts/compare-schema-cfgh-coverage.ts`：双向机器对比（缺失/多余/默认值不一致），与既有 F1 验证互补，可复跑

### Commit 清单（main）

| commit                                        | 内容                                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------- |
| （见原子独立 commit，message 带 YAC-VER-00x） | 原子1：ver001 覆盖度报告 + 对比脚本；原子2：ver002 编译闭环报告；原子3：ver003 关联矩阵报告 |

### 遗留项

- replace-cfgh
  build+ctest 步骤入 CI 门禁（建议，待小明排期；复跑命令已在 ver002 文档 §2/§4）
- yuleASR 侧 2 个既有编译警告（CanIf.h 宏重复、CanNm.c 空语句）+
  NvM/Os 部分配置宏"已定义未消费"观察（ver003 §3）
