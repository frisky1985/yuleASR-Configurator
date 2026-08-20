# 需求总体架构：yuleASR-Configurator 依赖清单加固（2026-08-20）

> 触发：老板询问「模块配置项依赖关系有无清单、是否固化检查」→ 确认存在双源 + 3 短板 → 老板确认派活加固。
> 排期表：https://jhepa4n0x5.feishu.cn/base/WdqXb5QzSa4XvosEvjScM7nYnLg

## 目标
1. 产出一份**依赖关系总清单**文档，合并「模块声明层」与「校验器隐式规则表」双源，消灭漂移盲区。
2. 为 14 条隐式规则 + 模块依赖启用检查补齐单测（当前 8 用例全为 Fix 25，规则表零覆盖）。

## 边界
- 仅限 yuleASR-Configurator 仓库（`~/.openclaw/workspace/yuleASR-Configurator`，main 分支）。
- 不改业务功能、不改依赖声明数据本身（只读梳理 + 测试补强）。
- paramCheck 数据层补全**不在本次范围**（机制已建、0 使用，作为已知项在文档中标注）。

## 模块划分 / 原子需求

### 原子 YAC-DEP-001：依赖关系总清单文档
- 交付物：`docs/dependency-matrix.md`
- 内容：
  1. 模块声明层全量依赖（mcal-config.ts 8 处 / ecual-config.ts 7 处 / all-modules.ts 37 处，去重合并，标注 required/autoEnable/severity）
  2. 校验器 14 条隐式规则表（含 severity 分级，注明硬编码位置 `DependencyValidator.ts#validateCrossModuleReferences`）
  3. 双源一致性说明（声明 vs 隐式规则的关系、漂移风险）
  4. paramCheck 机制现状标注（类型已建、消费端在 `yuleasr-validator.ts:187`、数据文件 0 使用 = 空转）
- 验收：文档与源码逐条可对照；无虚构模块/规则。

### 原子 YAC-DEP-002：14 条隐式规则 + 模块依赖启用检查单测
- 交付物：`apps/yuleasr-web/src/core/__tests__/dependency-validator.test.ts` 新增用例
- 覆盖：
  1. `validateCrossModuleReferences` 全部 14 条规则（error/warning/info 级别断言，含目标模块未启用 / 目标模块不在配置两种分支）
  2. `validateModuleDependencies`：required 未启用 → error、optional 未启用 → info、autoEnable 建议列表
- 验收：`pnpm test` 全绿（新增用例 + 既有 8 用例全过）；不破坏 typecheck/format。

## 验收总览
- 文档可对照源码、测试真实覆盖 14 条规则 → 小明亲自复现 `pnpm test` 验证，不采信自报。

## 状态
- [x] 需求拆解落盘（本文档）
- [ ] YAC-DEP-001 开发
- [ ] YAC-DEP-002 开发
- [ ] 小明终审验收
