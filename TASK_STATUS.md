# yuleASR-Configurator 开发任务状态

> 最后更新: 2026-08-01 当前阶段: Phase 4-5 收尾 — 测试基线与代码生成质量

---

## 项目概览

| 属性     | 值                                 |
| -------- | ---------------------------------- |
| 代码总量 | ~26,890 行                         |
| 架构     | Monorepo (pnpm workspace)          |
| 技术栈   | React 19 + TypeScript 5.4 + Vite 6 |
| 状态管理 | Zustand                            |
| 图表引擎 | React Flow (@xyflow/react)         |

---

## 当前阶段总览

| Phase | 内容 | 状态 | 说明 |
| ----- | ---- | ---- | ---- |
| Phase 1 | Service 层配置数据 | 🟡 大部分完成 | 54 模块 schema 已就绪，Dashboard 统计仍为 mock |
| Phase 2 | VS Code 扩展 | ✅ 完成 | 9 命令 + ConfigEditorPanel + ConfigTreeProvider |
| Phase 3 | UI 组件库 | ❌ 空壳 | `@yuletech/ui` 仅 `export {}`，未开始 |
| Phase 4 | 单元测试 | 🟡 进行中 | core 570 测试：568 过 / 2 失败 (Can/Mcu GCC) |
| Phase 5 | C 代码生成 | 🟡 基本完成 | 4 生成器齐备，但 Can/Mcu 生成代码 GCC 编译失败 |

---

## 已完成功能清单

### Core 层 (@yuletech/core)

- [x] 类型系统 (ModuleSchema, ModuleConfig, Validation)
- [x] Schema 管理 (JSON Schema 转换，54 个模块 schema)
- [x] 配置验证器
- [x] 代码生成器接口 (ecuc/swc/os/rte 4 个生成器)
- [x] ARXML 解析器
- [x] yuleASR 适配器
- [x] 跨模块验证 (CrossModuleValidator)

### Editor Core 层 (yuleasr-editor-core)

- [x] 配置引擎 (undo/redo)
- [x] 历史管理器
- [x] 事件系统
- [x] Git 服务集成

### Web 应用 (yuleasr-web)

- [x] Dashboard / Editor / Templates / GitSync / Settings / Migrate 页面
- [x] ModuleTree / ModuleGraph (React Flow) / ModuleConfigWizard / ValidationPanel
- [x] DiffViewer / GlobalSearch / MigrationTool / VersionHistory 组件

### VS Code 扩展 (apps/yuleasr-vscode)

- [x] 扩展包 + 清单
- [x] 侧边栏 ModuleTree Provider
- [x] 配置编辑器 Webview Panel
- [x] ARXML 右键导入命令
- [x] 代码生成 / 配置验证命令
- [x] 热重载和调试支持

### 数据层

- [x] MCAL 配置数据 (11 模块)
- [x] ECUAL 配置数据 (15 模块)
- [x] Service 层配置数据 (25 模块)
- [x] OS 配置数据
- [x] RTE / ASW 数据模型 (appswc, compswc, rte)

### 代码生成器对齐 (2026-07-23)

| 维度 | ecuc | swc | os | rte |
|------|------|-----|-----|-----|
| 模板层统一 | ✅ | ✅ | ✅ | ✅ |
| MemMap.h 集成 | ✅ | ✅ | ✅ | ✅ |
| DET 错误处理 | ✅ | ✅ | — | ✅ |
| 插件化委托 | ✅ | ✅ | ✅ | ✅ |
| AUTOSAR Doxygen | ✅ | ✅ | ✅ | ✅ |
| 多编译器支持 | ✅ | ✅ | ✅ | ✅ |

---

## 开发阶段规划

### Phase 1: 完善 Service 层配置数据

**状态**: 🟡 大部分完成
**目标**: 补充 Service 层模块定义，完善 AUTOSAR 层级支持

**任务清单**:

- [x] 1.1 定义 Service 层模块分类 (MemStack, ComStack, IoHwAb, etc.)
- [x] 1.2 创建 MemStack 模块 (Fee, Ea, MemIf, Nvm)
- [x] 1.3 创建 ComStack 模块 (Can, CanIf, CanTp, Com, PduR)
- [x] 1.4 创建 IoHwAb 模块 (✅ 2026-08-01 补齐: General/Channel/Signal/Dio/Adc)
- [x] 1.5 创建 CryptoServices 模块 (Crypto, Csm, CryIf)
- [x] 1.6 创建 WdgServices 模块 (Wdg, WdgIf, WdgM)
- [x] 1.7 更新 ModuleTree 支持 Service 层显示
- [ ] 1.8 更新 Dashboard 统计 Service 层模块 (仍为 mock)

**验收标准**:
- Service 层模块可在 UI 中正常显示和配置 — ✅ 通过
- 所有 Service 层模块有完整的参数定义 — 🟡 IoHwAb 空壳
- 模块间依赖关系正确定义 — ⚠️ schema 层无 crossReferences

### Phase 2: 开发 VS Code 扩展

**状态**: ✅ 完成

### Phase 3: 构建 UI 组件库

**状态**: ❌ 未开始 — `@yuletech/ui/src/index.ts` 仅 `export {}` 空壳，全部 3.1-3.10 任务待启动

### Phase 4: 补充单元测试

**状态**: 🟡 进行中 — core 包 570 测试，568 过 / 2 失败

**任务清单**:

- [x] 4.1 为核心包配置测试环境 (vitest.config.ts)
- [x] 4.2 编写 Schema 转换测试 (schema-validation: 110 个断言全过)
- [x] 4.3 编写验证器测试
- [x] 4.4 编写代码生成器测试
- [x] 4.5 编写 ARXML 解析器测试
- [x] 4.6 编写配置引擎测试
- [ ] 4.7 编写组件单元测试 (依赖 Phase 3)
- [x] 4.8 配置 CI 测试流程

**已知失败**: 集成套件 C1 — Can/Mcu 生成代码 GCC 语法检查失败（见 P0 事项）

### Phase 5: 完善 C 代码生成

**状态**: 🟡 基本完成 — 4 生成器 + Doxygen/MISRA 支持，Can/Mcu 有编译 bug

**任务清单**:

- [x] 5.1-5.4 C 头文件/源文件/宏/类型生成
- [x] 5.5 ECUC 描述文件生成
- [x] 5.6 ARXML 导出功能
- [x] 5.7 多模块批量生成
- [x] 5.8 代码格式化选项
- [x] Doxygen 头 + AUTOSAR 版本宏 + Det 错误上报 (autosar-44-code-compliance)

---

## 🔴 阻塞生产上线的关键事项

### P0 — 必须修复

| # | 事项 | 状态 | 根因 / 方案 |
|---|------|------|------------|
| P0-1 | **Can/Mcu 生成代码 GCC 编译失败** (2 个集成测试失败) | 🔴 未修复 | ① 嵌套 struct 用 `const` 变量引用 → "initializer element is not a compile-time constant"，需改 compound literal 内联；② `CAN_DEV_ERROR_DETECT` 宏未定义 — Cfg.h 生成的宏名是 `CAN_CANDEVERRORDETECT`，bridge 引用标准别名，需生成时补标准别名宏。修复脚本已验证思路，待正确落地（勿用嵌套反引号模板转义） |
| P0-2 | **macOS 桌面端无法签名发布** | 🔴 阻塞 | 需 Apple Developer 证书: GitHub Secrets `MAC_CSC_LINK` + `MAC_CSC_KEY_PASSWORD` (build-desktop.yml 已支持)；由老板提供证书 |

### P1 — 应尽快处理

| # | 事项 | 状态 | 说明 |
|---|------|------|------|
| P1-1 | Windows NSIS 安装包构建 | 🟡 待验证 | 已启用 Windows 长路径支持 (commit 52f59b1)，CI 验证 NSIS 是否通过 |
| P1-2 | IoHwAb schema 空壳 | ✅ 已修复 | 2026-08-01 补齐 IoHwAbGeneral/Channel/Signal/Dio/Adc 5 容器，含通道方向/信号类型枚举 |
| P1-3 | Dashboard Service 层统计仍为 mock | 🟡 | 1.8 未完成 |
| P1-4 | 28/54 schema 缺 CommonPublishedInformation | ✅ 已修复 | 2026-08-01 全量补齐：54/54 schema 含标准 8 字段 CPI (ArRelease×3 + ModuleId + Sw×3 + VendorId)，新增测试断言 (schema-validation 110→165) |
| P1-5 | 枚举参数规范 | ✅ 已修复 | PortPinDirection 14 处 + GptChannelMode 4 处 enum 化 (AUTOSAR 规范名)，IoHwAb 空壳补齐 (General/Channel/Signal/Dio/Adc 5 容器) |

### P2 — 后续迭代

| # | 事项 | 状态 | 说明 |
|---|------|------|------|
| P2-1 | Phase 3 UI 组件库 | ❌ | @yuletech/ui 空壳，未启动 |
| P2-2 | schema 层跨模块依赖 (crossReferences) | ❌ | 依赖关系仅在 validator 层，schema 层无表达 |
| P2-3 | AUTOSAR ECUC 元模型补全 | ❌ | 见下方合规性评估 |

---

## Schema AUTOSAR 合规性评估 (2026-08-01)

**结论: 载体合理、覆盖度高，但未完整表达 AUTOSAR ECUC 元模型语义 — "接近但不完全符合"。**

### ✅ 已满足

- JSON Schema draft 2020-12 载体，54 模块覆盖 5 层 (MCAL 11 / ECUAL 15 / Service 25 / RTE 1 / ASW 2)
- 容器 + 参数两级结构，AUTOSAR 命名约定 (PascalCase, 模块前缀)
- x-layer / x-version / x-source 元数据 (50 个标注 ARXML-Extracted)
- 50 个 schema 从 ARXML 提取，参数含类型/范围约束 (min/max)

### ❌ 与 AUTOSAR ECUC 元模型的差距

| 差距 | 说明 | 影响 |
|------|------|------|
| **无 ReferenceDef** | ECUC 核心是 ModuleDef → ContainerDef → ParameterDef/**ReferenceDef** 三层，跨模块/跨容器引用 (如 Can 引用 CanTrcv) 在 schema 中无表达 | 依赖关系无法在配置层校验 |
| **无 Multiplicity** | AUTOSAR 每个参数/容器有 lower/upperMultiplicity (0..1, 1..*) | 无法表达"至少 1 个"等出现次数约束 |
| **无 ConfigurationClass** | AUTOSAR 参数分 PREPROCESSOR/POSTBUILD/VARIANT 配置类 | 无法区分编译期/后构建参数 |
| **枚举覆盖极少** | 仅 3 个 schema 使用 enum (appswc/compswc/os) | AUTOSAR 参数大量是枚举 (如 CanTrcv 唤醒方式)，现多退化为裸 integer |
| **无 ChoiceContainerDef** | 多选一容器语义缺失 | 无法表达"二选一"配置 |
| **CPI 覆盖不全** | ~~仅 26/54 含 CommonPublishedInformation~~ ✅ 2026-08-01 已补齐 54/54 | 标准发布信息完整 |

### 建议路线

1. **短期 (P1)**: 补齐 CommonPublishedInformation + IoHwAb 参数 + enum 化已知枚举参数
2. **中期 (P2)**: schema 增加 `x-multiplicity` / `x-config-class` 扩展字段，引入 `crossReferences` 数组表达 ReferenceDef
3. **长期**: 若需严格 AUTOSAR 工具链互操作，考虑直接生成/消费标准 ECUC ARXML (`EcucModuleDef`)，JSON Schema 作为 UI 编辑中间层

---

## 快速导航

```bash
# 启动开发环境
cd /Users/stefan/.openclaw/workspace/yuleASR-Configurator
pnpm install
pnpm dev

# 运行测试
pnpm test

# 构建
pnpm build

# 代码检查
pnpm lint
pnpm typecheck
```

---

## 相关文档

- [项目架构文档](./docs/architecture/README.md) (待创建)
- [开发规范](./docs/development/README.md) (待创建)
- [API 文档](./docs/api/README.md) (待创建)

---

_本文档遵循 OSH (OpenSpec + Superpowers + Harness Engineering) 方法论_
