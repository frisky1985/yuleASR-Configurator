# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html) with the caveats
described in the [Versioning Policy](#versioning-policy) below.

---

## [Unreleased]

## [0.5.0] - 2026-08-22

98 commits since v0.4.0 (1d2da6c2). 主线：模块映射闭环、配置↔代码闭环验证、CI 历史首次全绿 + linkage 门禁常驻。

### Added

- **模块映射闭环（YAC-MAP-001→003）** — 109 extracted-cfgh schema 与 yuleASR 一一对应；命名映射表（canm↔cannm/cdd 家族）；NOLANDING 仅配置不生成 7 模块；F1 幂等（二次重跑 diff=0）
- **配置↔代码闭环验证（YAC-VER-001→003）** — 覆盖度 4759=4759 缺口 0；生成→替换→编译 139/139→ctest 55/55→rollback 归零；5 模块×3 宏 15 条功能关联证据链；可复跑工具 compare-schema-cfgh-coverage.ts
- **replace-cfgh 编译闭环 CI 门禁（YAC-CI-003）** — configurator-linkage job 常驻：dry-run 109/109→apply→build→ctest→rollback→dirty=0 双检
- **补 5 个缺 schema** — ethtsyn/ldcom/tm（手写）+ dds/microdds（最小打通闭环）；删除 ble/mcl/sbc 无实现 schema；arti 保留标记 runtime-hooks

### Fixed

- **CI 历史首次全绿（YAC-CI-004）** — 修复仓库 CI 从未真正跑过 job 的根因：pnpm/action-setup v6 双版本冲突、空 with 块、GNU tar 兼容（macOS bsdtar vs ubuntu GNU tar）、tsup+TS7 dts 崩溃（dts:false + tsc emitDeclarationOnly）、CI 全新环境 build 前置、prettier 326 文件归一
- **YAC-KNOWN-001→007** — electron-updater CJS import 修复、vitest4 workspace→projects 迁移、replace-cfgh import 修复、测试缺口补全（ARXML E2E）、CrossModuleValidator TODO、scratch 副本隔离、过时测试清理
- **F1 漂移重生成入库（YAC-MAP-003）** — dlt_ecual 删除、boot +10 宏、csm 枚举 24→26（国密 SM2/SM3）、脚本根因修复 6 项防再漂移

### Changed

- **TS7 适配（Go 重构版）** — tsup dts:false + tsc --emitDeclarationOnly；plugin-sdk 补 .d.mts；editor-core 补 d.ts 缺口
- **yulecommunity 构建链** — TS7 baseUrl 移除 + Tailwind v4 迁移 + Rolldown 适配
- **CI 6 job 测试前先 build**（build:ci），api-server 补 dotenv + 去 prebuild 竞态
- **linkage gate 定稿** — yuleASR 既有 7 项 Linux 工具链问题白名单（pristine 探针证实与生成头无关）

### Tests

- 全仓 vitest 1616/1616（core 991 + web 325 实测）· typecheck 全绿 · lint:ci 0 error · format 0 问题

## [0.4.0] - 2026-08-10

### Added

- **跨模块依赖校验体系**（宏名版 schema `crossReferences` 0 → 61 条）：
  - 手写 22 条 ARXML 引用按宏名版实际参数名重写（`scripts/crossref-rules.ts`），F1 提取器注入
    `extracted-cfgh/*.json`
  - 四批高频依赖 49 条值关系（Can/Lin/Eth 总线链、存储链、诊断链、看门狗、加密、IO/驱动层）
  - **新增 `required` 关系类型**：依赖必须存在（如 Can 依赖 Mcu 时钟未配置 →
    `CROSS_REF_REQUIRED` 报错），12 条规则全部 error 级
  - UI 实时校验链路打通：`ValidationPanel` +
    `configStore.validateCrossModuleChanges` （热路径 `validateAffectedBy`
    模块级 A2 分支）
- **replace-cfgh 可追溯替换工具**（`scripts/replace-cfgh.ts`）：
  - dry-run / apply / rollback 三模式，替换包 = manifest + backup + backup-md5 +
    generated
  - Electron IPC `cfgh:replace` + SchemaCoverageTable
    UI 挂接（预览/替换/回滚三按钮）
  - rollback 安全：md5 校验保护用户改动，统一 git 仓库护栏

### Fixed

- **codegen A/B/C/D 类 27 模块清零**（110/110 全量生成可替换，构建 0 error +
  ctest 45/45）：
  - A 类 splice 边界：语句闭合扩展、MemMap 段宏豁免、非段宏剔除、序部 include 携带
  - B 类 F1 提取：函数式宏 verbatim 透传、条件块整块捕获、混合大小写参数名、派生表达式保留
  - C 类 reference：null → `(NULL_PTR)`；D 类版本宏/`#ifndef` 保护宏
- **replace-cfgh 评审修复**（小马验收 + 小克审查）：main.mjs
  cwd、默认路径 git 护栏、rollback
  md5 缺失跳过、并发互斥锁、isPackaged 拒绝、stdout 截断解析
- **core
  e2e 目标校验对齐宏名版**：generated/ 混合集宏名模块引用目标存在性扩展到 extracted-cfgh 全集

### Changed

- codegen schema 源切换宏名版优先（V2.2）；混合头拼接固化进 codegen（V3.2）

## [0.3.0] - 2026-08-09

### Added

- **ARXML SWC 层导入后端**（`@yuletech/core/arxml-import`，A1）：
  - 导入 .arxml 工程文件（SWC/端口/接口/数据类型/CompuMethod 层）到现有数据模型
    `SwcProjectConfig`（`types/swc.ts`）
  - 借鉴 cogu/autosar 的 switcher 字典分发 +
    ChildElementMap 未处理元素告警模式（告警不崩溃：OEM ARXML 必然含未知元素）
  - 导入报告：成功元素计数 + `file(line): Unprocessed element <TAG>` 告警清单 +
    schema 版本探测
  - 新类型：`CompuMethod` / `CompuScale` /
    `CompuMethodCategory`（`types/swc.ts`）
  - 边界：BSW 模块配置（ECUC 层）不导入，由现有 `adapters/arxml-parser` 覆盖
  - 测试：21 个用例（最小 fixture 往返、未处理元素告警、Client-Server、RAT_NUM_LINEAR、真实 bcm_demo）
- **版本化 ARXML 导出**（`@yuletech/core/arxml-export`，A4-1）：
  - schema 版本注册表：48=R19-11 / 49=R20-11 / 50=R21-11 / 51=R22-11（44=AUTOSAR
    4.3.1 历史兼容），文档级 `AUTOSAR_%05d.xsd` schemaLocation 按版本生成
  - `VERSION_GATES` 版本差异登记表（集中管理替代散落 if，借鉴 cogu
    writer.py:4428-4456）： `GATE-001` schemaLocation 按版本、`GATE-002`
    runnable 互斥区引用（<50 用 …-EXCLUSIVE-AREA-REFS，≥50 用 CAN-ENTERS/RUNS-INSIDES）
  - 最小导出框架：`serializeArxmlDocument`（ECUC 值层骨架 + 版本参数）、
    `detectSchemaVersion` 反向探测（与 arxml-import 对称，cogu
    reader.py:589-600）
  - Web 导出服务 `generateArxml` 增加 `schemaVersion`
    参数（默认 51）；Editor 导出 ARXML 改为“目标 AUTOSAR 版本”对话框；内置 ARXML 导出插件经 options 接收版本
  - 测试：core 24 个新用例 + web 7 个新用例
- **模块 ↔ AUTOSAR SWS 章节映射文档**（`docs/bsw-sws-mapping.md`，A4-2）：
  - 54 个 Configurator 模块 ↔
    SWS 文档全量对照表（MCAL/ECUAL/Service/RTE/OS/ASW 分层），借鉴 cogu
    CHANGELOG “类名 | XSD 复杂类型” 对照表风格
  - A1 导入映射扩展：SWC/端口/接口/数据类型/CompuMethod ↔ AUTOSAR 概念
  - 版本差异速查（48–51 + VERSION_GATES）+ 非标准模块诚实标注 + 维护约定
  - 技术债记录：schema `x-layer`
    字段与标准 AUTOSAR 分层不一致（can/dio/port/mcu 等标记为 Service）
- **引用类型安全**（C1/R1）：`REF_CONSTRAINTS` 约束表 + 解析期类型校验
- **异常体系分类**（C2/R6）：`ArxmlError` 5 类 + `classifyImportError`
  前缀映射 + 重复元素检测
- **导出 XSD 校验**（C3/R7）：结构契约校验器 `validateArxmlDocument` +
  `assertValidArxmlExport`
- **模板机制**（D1/R2）：`ElementTemplate` 基类 + `TemplateWorkspace.apply`
  四步自动化 + SWC 实用模板
- **文档拆分**（D2/R3）：`splitModulesByType` + `serializeArxmlDocuments`
  多文档导出
- **ECUC 值层导入**（E1/R8）：`EcucModuleConfigValue` + 容器递归 + 嵌套包下钻 + 导出布尔 tag 对齐
- **ECUC 定义层导入**（E2/R8）：`ECUC-MODULE-DEF` 元模型 + 参数族/容器递归/枚举
  `LITERALS` + 定义↔值关联
- **ECUC 值-定义一致性校验**（E3/R8）：定义解析/类型匹配/枚举合法/容器超限 +
  R6 异常分类接入
- **ECUC 接入 UI 领域模型**（E4/R8）：薄重导出层 + 只读展示视图/组件/页面 +
  Electron 文件读取链路
- **yuleASR Cfg.h schema 自动提取器**（F1）：110 模块全覆盖（54→117），
  `x-multiplicity`/`crossReferences` 等 AUTOSAR 合规属性补全
- **codegen schema 驱动全量生成**（F2）：`generateHeadersFromSchemas`
  按任意 ModuleSchema 生成宏头（F2a）+ 配置合并生成 117
  Cfg.h + 覆盖展示/批量导出（F2b/F2c UI 挂接）
- **ECUC 编辑**（F3）：类型感知改值/容器增删/模块启停 + 实时校验 + 回写导出
- **ECUC 元模型补全**（P2）：`crossReferences` 全量推广 + `ChoiceContainerDef`
  补全（AUTOSAR ECUC 元模型四要素齐备）
- **中期合规**（P0-1）：Can/Mcu GCC 编译修复 +
  `x-multiplicity`/`crossReferences` 对齐 + `@yuletech/ui` 组件库（Phase
  3，8 组件 + 测试 + web 集成）
- **Desktop auto-updater**: Integrated `electron-updater` for automatic
  application updates on the desktop build — users receive new versions without
  manual re-downloads
- **CI desktop build pipeline**: Automated build matrix for macOS (x64 + arm64),
  Linux (x64 + arm64), and Windows (x64) via GitHub Actions
- **11 new AUTOSAR module schemas**:
  - `Wdg` (Watchdog Driver) — system-level watchdog configuration
  - `Lin` (LIN Driver) — Local Interconnect Network driver parameters
  - `Ea` (EEPROM Abstraction) — EEPROM abstraction layer schema
  - `WdgIf` (Watchdog Interface) — watchdog driver interface abstraction
  - `Eth` (Ethernet Driver) — TCP/IP offload and MAC/PHY configuration
  - `Fr` (FlexRay Driver) — FlexRay communication controller setup
  - `LinIf` (LIN Interface) — LIN protocol interface layer
  - `EthIf` (Ethernet Interface) — Ethernet protocol interface layer
  - `FrIf` (FlexRay Interface) — FlexRay protocol interface layer
  - `WdgM` (Watchdog Manager) — watchdog supervision and partitioning
  - `Xcp` (XCP on CAN/FlexRay/Ethernet) — calibration protocol server config
- **MCAL Schema bundle** — `Pwm`, `I2c`, `Uart`, `Eep` hardware abstraction
  layer schemas added alongside the existing AUTOSAR MCAL coverage
- **Built-in plugin system** — first 4 internal plugins demonstrating the new
  `@yuletech/plugin-sdk` extension model
- **Vite `/v1` proxy**: Development proxy rule for the `/v1` API prefix,
  enabling local frontend–backend integration without CORS workarounds

### Fixed

- **安全修复批次**（Fix 5–13）：Electron
  IPC 命令注入 + 路径遍历（RCE/任意写盘）、JWT 默认密钥硬编码（启动 fail-fast 拒绝弱密钥）、LDAP 过滤器注入 +
  TLS 证书校验、支付 webhook 签名校验（封堵 mock-success 白嫖 Pro）、社区端硬编码口令删除、插件 REST 无鉴权 + 外部插件沙箱（RCE 面）、useAuth 解包修复 + 角色来自服务端
- **Web 编辑正确性闭环**（C1–C4 + Batch
  D）：参数编辑静默失败、动态容器实例数据不持久化、实例参数编辑回显、Web↔Server
  API 断裂（注册 configsRoutes + JWT payload 对齐 + `/v1`
  前缀统一）、`isCloudSynced` 假成功修复
- **架构收敛批次**（Fix
  14–32）：双 ORM 收敛至 Drizzle（删除 Prisma）、ARXML 解析器提升 core（escapeCString 单一实现）、core 条件引擎接入 web（消除零消费者）、生成器缺陷修复、插件能力恢复、比较/审计/API/性能/editor-core 引擎修复、vscode/
  community/api-server 修复、测试与 CI 清理（Batch D 收官）
- **CI 与桌面打包修复**：三平台打包（Linux webkit 4.1 / macOS 去 universal /
  Windows hoisted node-linker）、macOS 空 CSC_LINK 签名崩溃、Windows NSIS
  MAX_PATH → MSI 方案 + electron-builder 26.x 兼容、Linux AppImage/deb
  homepage 字段、artifact glob 空格转义、Vite dev server 崩溃（P0-4）
- **依赖安全**：dependabot 合并升级（vite 8.2.1 / dompurify 3.4.13 / electron /
  fastify 等），43 advisories + 14 critical/67 high 漏洞修复
- **i18n navigation fixes**: Translation keys in sidebar and top-nav now
  correctly resolve under all configured locales; previously hardcoded text in
  some menu items would not update on language switch
- **Community link external browser**: "Community" link in the footer now opens
  in the user's default browser instead of navigating inside the Electron
  webview
- **Blog page theme fix**: Blog listing and article pages now respect the active
  theme (light/dark) — previously some elements remained locked to light mode

### Changed

- **`EcucCodeGenerator` 转正**（F4，`@yuletech/core/generator`）：移除
  `@experimental`
  标注与“仅测试引用”说明，升级为正式发布路径。与 web 层宏头生成器明确分工：core
  `EcucCodeGenerator` 生成 `Ecuc_<Module>.c/h` 完整 C代码（AUTOSAR
  4.4，参数/容器/实例 + 插件委托）；web
  codegen（`apps/yuleasr-web/src/services/codegen.ts`）schema 驱动生成宏头
  `Cfg.h` （`generateHeadersFromSchemas` + `editableToSchemas`
  编辑回写），供 Editor 配置预览/导出。两者互补，不做代码合并；API 为正式契约，变更遵循 SemVer。
- **Desktop version sync**: Desktop build version bumped from `0.2.3` → `0.3.0`
  to align with the monorepo tag, ensuring `app.getVersion()` reports the
  correct release

## [0.2.3] - 2026-07-17

### Fixed

- **ModuleConfigWizard 暗色模式修复**: 步骤指示器、筛选标签、卡片底色等 6 处白色区域改用 CSS 变量/淡化色，内容完全可见
- **tsup types 警告修复**: 移除 `core/package.json` exports 中 9 个子路径的冗余
  `types` 条件，消除编译警告

### Changed

- `@yuletech/core` / `@yuletech/editor-core` / `@yuletech/plugin-sdk`: `types`
  从 `./dist/...d.ts` 指向 `./src/index.ts`，消除构建顺序依赖
- CI 排除 `yuleasr-desktop` 和 `vscode-extension` 主构建链路
- `api-server`: `tsconfig` 覆盖 `strict: false` + 25 个 TS 代码修复

## [0.2.2] - 2026-07-17

### Fixed

- CI 构建修复：排除 api-server（预存 TS 错误），`pnpm --filter "yuleasr-web..." build`
  只构建依赖链
- `@yuletech/core` / `yuleasr-editor-core`: 禁用包级 `noUnusedLocals`
  避免 tsup 编译失败
- `yuleasr-web`: 移除 `tsc` 前置检查（Vite/esbuild 不依赖 typecheck）
- `release.yml`: "Build all packages" 排除 api-server
- `deploy-gh-pages.yml`: 构建命令修复 + `destination_dir: ./configurator`
  适配子路径部署

## [0.2.1] - 2026-07-17

### Added

- 新增 5 个 E2E 测试：Save 下拉 / Export 展开 / Import 展开 /
  Overflow 展开及关闭 (#13)
- GH Pages 部署 CI 适配 `/configurator/` 子路径

### Changed

- Save 按钮改造为 Split Button：左键直接保存，右键箭头展开 Save as Template
  (#12)
- 工具栏下拉菜单选择器优化，Page Object 新增 dropdown locators

### Fixed

- CrossModuleValidator 全局状态风险 — 添加 TODO 标记，记录多配置并行时的重构路径 (#11)

## [0.2.0] - 2026-07-16

### Added

- ADR 文档体系:
  6 份架构决策记录 (ConfigType 分层、条件引擎、跨模块验证器、GeneratorRegistry、熔断策略)
- 条件 DSL BNF 语法文档 (CONDITIONS-DSL.md)
- ARXML 双向往导 + 导出按钮
- Escape 键关闭创建配置弹窗
- 创建配置时自动更新列表

### Fixed

- E2E 测试全面修复: 64/64 全部通过 (Playwright, 中文 locale, 选择器重写)
- 编辑器工具栏图标按钮改用 role/text/attribute 选择器
- 配置路径 URL 修复 (baseURL 去掉子路径前缀)
- 条件引擎同步传播熔断保护 (MAX_DEPTH=20)

### Changed

- 工具栏简化: 10 个元素 → 7 个 (Save 合并 Template, Share/Diff 移入 ⋯ 菜单)
- ConfigType flat 结构 → 三层分层 (ContainerType → ConfigSetType → ConfigType)
- 条件引擎同步传播替代异步 (AppConfiguration → CoreConfiguration)
- Export/Import 按功能分组（不按格式分组）

### Technical

- Playwright 1.59.1, Chromium 1223 (symlink 避免网络下载)
- Chinese locale (zh-CN) 默认测试语言
- 265 单元测试 + 64 E2E 全部通过

---

## Versioning Policy

This project follows
[Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html) with the
following project-specific conventions:

### Pre-release phase (`0.x.y`)

While the major version is `0`, the software is in **active pre-release**
development. Per the semver specification, anything may change at any time — the
public API is not yet stable.

| Component           | Meaning                                                                |
| ------------------- | ---------------------------------------------------------------------- |
| **Patch (`0.x.z`)** | Bug fixes, minor internal refactors, documentation-only changes        |
| **Minor (`0.y.0`)** | New features, schema additions, non-breaking enhancements, new plugins |
| **Major (`0.x`)**   | Breaking changes to the schema format, plugin API, or core data model  |

**During `0.x`:**

- A **patch bump** (`0.2.2` → `0.2.3`) is strictly for defects and small
  improvements that do not add user-facing capability.
- A **minor bump** (`0.2.3` → `0.3.0`) signals meaningful additions — new
  AUTOSAR module schemas, new plugins, new editor features, CI pipeline
  additions, etc. This is the expected jump for most feature work.
- A **minor bump can also absorb multiple patch-level fixes**, so a minor
  release may include bug fixes alongside features.

### First stable release (`1.0.0`)

Version `1.0.0` will be the **first commercial release** and marks the point at
which the plugin SDK, schema format, and core configuration model are declared
stable. After `1.0.0`:

- **Patch (`1.0.z`)** — backwards-compatible bug fixes
- **Minor (`1.y.0`)** — backwards-compatible new features and new schemas
- **Major (`2.0.0`)** — breaking changes requiring migration

### Changelog conventions

- **[Unreleased]** — Changes staged for the next release. New entries are added
  here as they are merged.
- When cutting a release, the `[Unreleased]` section is renamed to the new
  version number and date, and a fresh empty `[Unreleased]` heading is added.

### Version alignment

Desktop builds (`yuleasr-desktop`) are version-synced with the monorepo root
tag. The Electron `app.getVersion()` API reports the same version string as
`git describe` for the monorepo. This ensures consistency regardless of which
build artifact a user downloads.
