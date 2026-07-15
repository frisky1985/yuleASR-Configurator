# 🧠 yuleASR × yuleCommunity 专家评审邀请

> 日期：2026-07-15
> 范围：架构评审 + 产品方向 Brainstorming
> 参与方式：飞书评论 / 线下会议

---

## 项目一：yuleASR-Configurator (AUTOSAR BSW 配置工具)

### 当前状态

| 维度 | 状态 | 说明 |
|------|------|------|
| Schema 系统 | ✅ | 37 个 BSW 模块 JSON Schema（MCAL/ECUAL/Service） |
| 代码生成器 | ✅ | Can/Mcu/Port/Adc/Dio/Gpt/Spi 7 模块通过 gcc -fsyntax-only |
| 验证器 | ✅ | 单模块 + 跨模块验证（CrossModuleValidator，5 种关系类型） |
| 条件引擎 | ✅ | visibleWhen/enabledWhen 表达式解析 + 求值（Phase 3 新增） |
| 约束传播 | ✅ | ConstraintPropagator + 依赖图 + 环检测（Phase 3 新增） |
| Web UI | ✅ | 配置编辑器、导出生成代码、验证面板 |
| Desktop | ✅ | Electron 打包（.app / .dmg / .zip，268MB 未签名） |
| 测试 | ✅ | 265 测试全通过（200 原有 + 65 Phase 3 新增） |
| 远程 | ✅ | 已推送到 GitHub（frisky1985/yuleASR-Configurator） |

### 架构图

```
┌─ yuleASR-Configurator Monorepo ─────────────────────────────┐
│                                                              │
│  apps/                                                       │
│  ├── yuleasr-web/          ← React + Vite 前端               │
│  │   ├── pages/Editor.tsx  ← 配置编辑器                      │
│  │   ├── stores/           ← Zustand 状态管理                │
│  │   └── services/         ← codegen / ui-adapter / API      │
│  │                                                           │
│  ├── yuleasr-desktop/      ← Electron 桌面版 (macOS arm64)   │
│  │   ├── electron/         ← main.mjs / preload.mjs          │
│  │   └── release/          ← .app / .dmg (450MB)             │
│  │                                                           │
│  └── yulecommunity/        ← 社区网站 (见项目二)              │
│                                                              │
│  packages/@yuletech/                                          │
│  ├── core/                ← 核心引擎                          │
│  │   ├── generator/       ← EcucCodeGenerator (7 模块)       │
│  │   ├── validators/      ← YuleasrValidator + CrossModule   │
│  │   ├── conditions/      ← Phase 3: 条件引擎 + 约束传播     │
│  │   └── schema/          ← 37 个 BSW 模块 JSON Schema       │
│  │                                                           │
│  ├── api-server/          ← Fastify + PostgreSQL 后端         │
│  └── api-client/          ← API 客户端                        │
│                                                              │
│  docs/                                                       │
│  ├── review/              ← 专家评审请求                      │
│  └── handoff/             ← Sprint 交付物                    │
└──────────────────────────────────────────────────────────────┘
```

### 🔴 自审状态（2026-07-15 已完成）

| # | 问题 | 状态 | 说明 |
|:-:|------|:----:|------|
| 1 | ConfigType 分层设计 | ✅ | 实用分层已实现 |
| 2 | PB/LT 数据分离 | ✅ | PBcfg/Lcfg 复用 ConfigSetType |
| 3 | 容器实例引用 | ✅ | `const Type* 指针` 方案 |
| 4 | static const vs extern const | ✅ | 实例 static，Config extern |
| 5 | formatCValue 类型安全 | ✅ | float 整数有小数点，已修复 |
| 6 | 文件命名 Ecuc_ 前缀 | ✅ | 符合 AUTOSAR 惯例 |
| 7 | **MemMap.h 集成** | ✅ | **已实现** |
| 8 | **分层验证管线** | ✅ | **ValidationPipeline 已实现** |
| 9 | Desktop 分发策略 | ⏳ | 需 Apple Developer 证书 |

#### P0 — 架构级

1. **ConfigType 结构体设计**
   当前 `Can_ConfigType` 包含 moduleId、versionInfo、instanceCount 及所有容器字段。
   → 是否符合 AUTOSAR MCAL 的典型配置模式？还是应拆分为独立 struct？

2. **Post-Build vs Link-Time 支持**
   PBcfg 筛选 readonly=false，Lcfg 零初始化。
   → AUTOSAR 规范中 PB/LT 的配置结构层级应该如何设计？

3. **容器实例引用方案**
   主 Config 结构体通过直接值引用容器实例。
   → 如需动态实例数组支持，AUTOSAR 推荐模式是什么？

#### P1 — 实现级

4. **static const vs extern const 区隔** — 当前内存布局是否符合 AUTOSAR 惯例？
5. **formatCValue 类型安全** — 是否应使用 discriminated union？
6. **文件命名** — `Ecuc_` 前缀是否符合标准？

#### P2 — 增强

7. **MemMap.h 集成** — 是否需要在生成器中加入内存映射支持？
8. **分层验证管线** — 条件引擎 + CrossModuleValidator + YuleasrValidator 是否应整合为统一验证管道？
9. **Desktop 分发策略** — 无 Apple Developer 证书，能否走 ad-hoc 分发？

---

## 项目二：yuleCommunity (开源社区平台)

### 当前状态

| 维度 | 状态 | 说明 |
|------|------|------|
| 页面数 | ✅ | 20+ 页面，含首页、博客、论坛、Q&A、活动、硬件、下载 |
| 后台管理 | ✅ | Dashboard、用户管理、构建管理、设置 |
| 技术栈 | ✅ | React 19 + Vite 7 + TypeScript 6 + Tailwind + Framer Motion |
| 代码分割 | ✅ | 全页面 lazy loading + Suspense |
| 管理面板 | ✅ | 独立 admin 模块，JWT 鉴权 |
| 适配性 | ⚠️ | 当前仅适配 yuleASR Configurator 品牌 |

### 页面结构

```
yulecommunity/
├── 公共页面
│   ├── Home            ← 首页（Hero + 精选内容）
│   ├── OpenSource      ← 开源项目展示
│   ├── Toolchain       ← 工具链介绍
│   ├── Learning        ← 学习路径
│   ├── LearningPaths   ← 自定义学习路线
│   ├── Community       ← 社区动态
│   ├── Forum           ← 论坛（帖子、分类）
│   ├── QA              ← 问答板块
│   ├── Blog / BlogDetail
│   ├── Docs            ← 文档中心
│   ├── Events          ← 活动/研讨会
│   ├── Hardware        ← 硬件资源
│   ├── Download        ← 下载中心
│   ├── CodeSandbox     ← 在线沙箱
│   ├── Quality         ← 质量指标
│   └── Organization    ← 组织/团队介绍
│
├── 用户中心
│   ├── Profile         ← 个人主页
│   ├── Bookmarks       ← 收藏夹
│   ├── Workspace       ← 工作区
│   └── SSO / Analytics ← 分析面板
│
├── yuleASR 集成
│   ├── YuleASRPage     ← 配置器入口
│   └── YuleASREditorPage ← 嵌入式编辑器
│
└── 管理后台
    ├── /admin/login     ← 独立登录
    ├── /admin/dashboard ← 数据概览
    ├── /admin/users     ← 用户管理
    ├── /admin/builds    ← 构建状态
    └── /admin/settings  ← 系统设置
```

### 🟡 待评审的问题

1. **品牌通用化** — 当前 yuleCommunity 的 UI 和品牌紧密耦合于 yuleASR。
   → 是否需要抽象成通用社区平台框架，支持多项目/多品牌？

2. **内容管理系统** — 博客、论坛、文档的内容目前是前端硬编码还是走 API？
   → 是否需要对接 api-server 的社区接口（`/api/posts`、`/api/tags`）？

3. **搜索引擎优化** — React SPA 的 SEO 策略：SSR / SSG / 预渲染？

4. **yuleASR 编辑器集成** — 社区中嵌入的 YuleASREditorPage 与独立 Configurator 是两份代码。
   → 是否应该通过 iframe / 独立部署 URL / monorepo 共享组件三种方式中选一种标准化？

5. **互动功能** — 论坛、Q&A、活动报名：
   → 是否需要实时消息/通知系统？是否对接飞书？邮件通知？

---

## 📋 评审流程建议

### 方式一：飞书评论
本文档已发布为飞书文档，可直接在对应段落评论。

### 方式二：线下 Brainstorming
建议议题：
1. AUTOSAR 生成器的架构审查（40min）
2. 社区平台的产品定位（20min）
3. 桌面端分发与签名的现实方案（20min）
4. Web 部署策略（Vercel vs Docker vs 自托管）（20min）

### 方式三：PR Review
GitHub: github.com/frisky1985/yuleASR-Configurator
可直接在 PR 或 Issues 中提交评审意见。

---

*本评审文档由 AI 辅助生成，yuleASR 项目维护。请通过飞书评论或线下会议反馈。*

---

## 🧠 Brainstorming Session（2026-07-15）

### 议题一：ConfigType 结构体

**决策：实用分层方案**
- `Can_ControllerType`（容器级参数）→ `Can_ConfigSetType`（配置集，含 moduleId/version/instances/controllers 数组）→ `Can_ConfigType`（顶层）
- 不做完整 AUTOSAR 4.4 元模型，只加一层 ConfigSet
- 生成器改动：`generateConfigType()` 拆为 `generateContainerTypes()` + `generateConfigSetType()` + `generateConfigType()`
- PBcfg/Lcfg 复用同一 ConfigSetType

### 议题二：条件引擎与约束传播（Phase 3 Review）

**决策：**
- ✅ 同步传播保持不动（50 容器以内 < 1ms）
- 🔴 **立即加 MAX_DEPTH=20 熔断保护**防止循环依赖
- ✅ 条件语法保持 `@condition(...)` 不动，不改 YAML/JSON DSL

### 议题三：Web 与桌面 UI

**决策：**
- 布局保持 IDE 式左树右编辑，不加拖拽可视化图
- Electron 保留但不继续投入（当前"网页穿壳"够用，未来接入 gcc 验证管道时再加强）
- 🔴 **最高优先级**：前端加自动验证指示器，保存时跑 `validateAll()`，左侧配置树标红/绿

### 议题四：yuleCommunity 定位

**决策：**
- 全面商用+开源的社区平台和工具平台
- 作为 yuleASR-Configurator 的配置分享和协作社区
- 代码已存在 `apps/yulecommunity/`，20+ 页面 + 管理后台

### 议题五：后端搭建

**决策：**
- 后端先本地运行，验证通过后购买云服务器
- 技术栈：Fastify + Prisma + SQLite（本地）/ PostgreSQL（生产）
- 端口 3002（本地 dev），3000（生产）
- 本地启动：`cd packages/@yuletech/api-server && npm install && npx prisma db push && npx tsx src/index.ts`
- Seed 数据：Admin (admin@yule.dev) + Demo + 3 篇博客 + 2 个帖子 + 9 个标签

### 下一步行动计划

1. 🔴 **配置分享 MVP** — ASR-Configurator 导出 JSON → 分享链接 → yuleCommunity 展示
2. 🟡 **前端联调** — yulecommunity 前端接入后端 API（auth/forum/blog）
3. 🟢 **yuleASR 验证指示器** — 前端高优先级改动
4. 🟢 **生产部署** — 购买云服务器后 Docker Compose 一键部署
