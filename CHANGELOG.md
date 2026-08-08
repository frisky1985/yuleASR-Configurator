# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html) with the caveats
described in the [Versioning Policy](#versioning-policy) below.

---

## [Unreleased]

### Added

- **模块 ↔ AUTOSAR SWS 章节映射文档**（`docs/bsw-sws-mapping.md`，A4-2）：
  - 54 个 Configurator 模块 ↔
    SWS 文档全量对照表（MCAL/ECUAL/Service/RTE/OS/ASW 分层），借鉴 cogu
    CHANGELOG “类名 | XSD 复杂类型” 对照表风格
  - A1 导入映射扩展：SWC/端口/接口/数据类型/CompuMethod ↔ AUTOSAR 概念
  - 版本差异速查（48–51 + VERSION_GATES）+ 非标准模块诚实标注 + 维护约定
  - 技术债记录：schema `x-layer`
    字段与标准 AUTOSAR 分层不一致（can/dio/port/mcu 等标记为 Service）

### Added

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

### Added

- **ARXML SWC 层导入后端**（`@yuletech/core/arxml-import`）：
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

### Added

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

- **i18n navigation fixes**: Translation keys in sidebar and top-nav now
  correctly resolve under all configured locales; previously hardcoded text in
  some menu items would not update on language switch
- **Community link external browser**: "Community" link in the footer now opens
  in the user's default browser instead of navigating inside the Electron
  webview
- **Blog page theme fix**: Blog listing and article pages now respect the active
  theme (light/dark) — previously some elements remained locked to light mode

### Changed

- **Desktop version sync**: Desktop build version bumped from `0.1.0` → `0.2.3`
  to align with the monorepo tag, ensuring `app.getVersion()` reports the
  correct release

---

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
