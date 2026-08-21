# 原子需求 YAC-CI-003：replace-cfgh 编译闭环入 CI 门禁（2026-08-21）

> 依据：YAC-VER-002 遗留建议（ver002-build
> §4）+ 老板 18:21 确认排期状态：✅ 已完成（2026-08-21）| 负责：小克 | 验收：小明（不采信自报，本地模拟复现）落地：`.github/workflows/ci.yml`
> 新增 `configurator-linkage` job（commit message 含 YAC-CI-003）

## 背景

YAC-VER-002 已实测证明 Configurator 生成头 → yuleASR 编译 →
ctest 全绿闭环（109/109、build exit 0、ctest
55/55）。该验证目前只靠手动复跑（`docs/planning/2026-08-21-ver002-build.md`
§2 命令），无 CI 防回归。现将其纳入 GitHub Actions 门禁。

## 现状

- `.github/workflows/ci.yml` 现有 5 job：lint-and-format / typecheck / test /
  integration-test / build
- yuleASR 为独立仓库（frisky1985/yuleASR，私有），CI 需跨仓库 checkout
- 本地复跑命令已验证（ver002 §2）：scratch 副本 + replace-cfgh dry-run/apply +
  cmake build + ctest + rollback

## 验收标准（SHALL）

1. **CI 新增 job**（如 `configurator-linkage`
   或并入 integration-test）：push/PR 到 main/develop 时自动执行
2. **闭环步骤完整**：checkout 两仓库 → pnpm install → replace-cfgh
   dry-run（109/109）→ apply（scratch 副本）→ cmake build（exit 0）→
   ctest 全绿 → rollback → 校验 dirty=0
3. **私有仓库访问**：yuleASR checkout 使用同 org
   GITHUB_TOKEN（或等效机制），fork PR 场景需有明确降级/跳过策略（注释说明）
4. **本地模拟验证**：小明在本地按 CI 等效命令复现全流程通过（不采信"workflow 写了就算"）
5. **commit + push**：message 注 YAC-CI-003；ver002-build.md
   §4 遗留项标记为已落地

## SHOULD

- runner 用 ubuntu-latest（自带 cmake/gcc）；yuleASR 编译耗时可控（本地 ~30s+）
- 若 CI 全量编译超时风险大，可只跑 dry-run + 关键模块编译，但需说明取舍理由

## 约束

- yuleASR 仓库只读（CI 中 apply 只在 scratch 副本）
- 模型只用 deepseek-v4-flash，禁止 pro
- 被截断时写 checkpoint 标注"需接力"

---

## ✅ 完成说明（2026-08-21 小克）

### 交付物

1. **ci.yml 新增 `configurator-linkage`
   job**（push/PR 到 main/develop 自动执行），闭环步骤完整：checkout 两仓库 →
   pnpm install → dry-run（断言 109/109）→ apply（断言 applied=109）→ cmake
   build（exit 0）→ ctest（断言 0 failed）→ rollback（断言 rolledBack=109
   skipped=0）→ porcelain 校验 dirty=0（scratch + yuleASR checkout 双检）。
2. **私有仓库访问**：yuleASR checkout 用同主 GITHUB_TOKEN； **fork
   PR 降级**：fork 的 token 无 yuleASR 权限 →
   checkout 步骤直接跳过（if 条件）+ 说明步骤 `::notice` 后 exit 0 →
   job 绿但不跑门禁，避免 fork
   PR 全红；push/同仓库 PR 的 checkout 失败则照常红。注释已写入 ci.yml
   job 头部。
3. **文档落地**：ver002-build.md §4 遗留项标记为已落地（见下）。

### 本地模拟实测（2026-08-21 18:24，Mac mini arm64，与 CI 步骤一一对应）

| 步骤                                    | 实测结果                              | 断言    |
| --------------------------------------- | ------------------------------------- | ------- |
| dry-run                                 | **109/109 ok，0 failed**（total=109） | ✅ 通过 |
| apply（scratch 副本）                   | applied=**109**，scratch dirty=109    | ✅ 通过 |
| cmake build（Debug + BUILD_TESTING=ON） | **exit 0**，静态库 **139**            | ✅ 通过 |
| ctest                                   | **55/55 passed，0 failed**（100%）    | ✅ 通过 |
| rollback                                | rolledBack=**109**，skipped=**0**     | ✅ 通过 |
| dirty 校验                              | scratch=**0**，真实仓库=**0**         | ✅ 通过 |

- 测试对象：yuleASR HEAD `3df8415c`（scratch 基线
  `7e34d333`）；复跑脚本等价 CI 命令（含 tar 坑修复：`git ls-files -z | tar --null`——路径含空格/中文时默认 C-quote 会导致 tar 失配）。
- workflow 校验：`actionlint` exit 0 + PyYAML 解析通过 + prettier 格式通过。
- 时间参考：本地 dry-run 2.3s / ctest 30.1s；CI ubuntu
  4-core 全量编译预估 <5min（timeout 30min）。

### 遗留项

- 无（本原子完成）；2 个既有编译警告（CanIf.h 宏重复 /
  CanNm.c 空语句）属 yuleASR 侧，已上报观察，不阻断。
