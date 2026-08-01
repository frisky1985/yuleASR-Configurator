# yuleASR-Configurator 架构审查报告

**审查范围:** 402 个核心 TS/TSX 文件（约 11.3 万行），覆盖 apps/yulecommunity、apps/yuleasr-web、packages/@yuletech/{core,ui,api-client,api-server,plugin-sdk,utils}、packages/yuleasr-editor-core、apps/yuleasr-vscode、apps/yuleasr-desktop。
**审查日期:** 2026-08-01
**审查视角:** Architecture（包边界、分层、重复逻辑、耦合、死代码、错误边界、API 设计、monorepo 健康度）

---

## 1. 总览

monorepo 的核心矛盾：**"领域核心下沉到 packages" 只做了一半**。`@yuletech/core` 已有较完整的生成器/验证器/条件引擎/插件系统，但三个消费端应用（web/vscode/desktop）几乎都不复用它们，而是各自维护平行实现（Git、ARXML 解析/导出、代码生成、比较器、校验器）。同时存在 3 个完全空的包（`@yuletech/api-client`、`@yuletech/utils`）、1 个零消费者的包（`yuleasr-editor-core`）、以及一套有完整代码但无任何消费者引用的死子系统（`core/conditions/*`，约 1300 行 + 测试）。api-server 内部 Prisma/Drizzle 双 ORM 并存，同一批表两套 schema。结论：包分层**名义上清晰，实际上混乱**。

严重度统计：critical 10 项，warning 14 项，suggestion 8 项。

---

## 2. Critical 问题

### 2.1 api-server 双 ORM 并存（Prisma + Drizzle），同一批表两套定义
**File:** packages/@yuletech/api-server/src/routes/branding.ts:5-7（同时 import 两个）；packages/@yuletech/api-server/src/routes/auth.ts:24（Prisma）；packages/@yuletech/api-server/src/routes/configs.ts:7（Drizzle）；packages/@yuletech/api-server/prisma/schema.prisma（sqlite）；packages/@yuletech/api-server/src/db/schema.ts（postgres）
**Severity:** critical
**What is wrong:** 12 个路由文件用 Prisma，4 个用 Drizzle，branding.ts 一个文件里同时用两者。Prisma 的 provider 是 `sqlite`，Drizzle 是 `postgresql`（`drizzle.config.ts` 与 `db/index.ts` 均指向 postgres），两套 schema 描述同一批业务表（users/posts/comments/tags…）但字段不一致（如 Prisma User 有 `role/avatar/ssoProvider/ssoMetadata`，Drizzle `users` 表没有；Prisma 是 `password` 字段，Drizzle 是 `password_hash`）。还有 prisma/seed.ts、db/migrate.ts、drizzle.config.ts 三套迁移/种子入口。
**Why it matters:** 同一实体两套定义必然漂移——改了 Prisma schema（如加 SSO 字段）后 Drizzle 表没有，登录/SSO 在 Prisma 侧可用、在 Drizzle 侧（community.ts/posts 等）缺失；两套迁移会互相覆盖或产生不一致的表结构；新成员无法判断"该用哪个"；依赖体积和构建复杂度翻倍。这是单包内最严重的架构腐化。
**What needs to change:** 二选一。建议保留 Drizzle（schema.ts 全面、类型安全查询、无代码生成步骤），将 users/posts/comments/tags 等 Prisma 侧路由全部迁移到 Drizzle，删除 prisma/ 目录、lib/prisma.ts、prisma 依赖与相关脚本（db:generate/db:push/db:migrate/db:seed 统一到 drizzle）。

### 2.2 yuleasr-web 的 Git 功能是"假实现"（stub 返回假数据），UI 无感知
**File:** apps/yuleasr-web/src/services/gitService.ts:71-105（`return []`、`return 'stub-commit-oid'`、`console.log('... (stub)')`）；消费者：apps/yuleasr-web/src/pages/GitSync.tsx:22、components/BranchManager.tsx:15、VersionHistory.tsx:17、DiffViewer.tsx:17
**Severity:** critical
**What is wrong:** web 的 GitService 是 100% stub，commit 返回伪造 OID、历史/分支/diff 返回空数组。而真正的完整实现（isomorphic-git，693 行）写在 `yuleasr-editor-core/src/services/gitService.ts`，但 editor-core 没有任何消费者。GitSync 页面、版本历史、分支管理、Diff 全部消费这个假接口。
**Why it matters:** 用户看到"已提交/分支已创建"的成功提示，但数据从未落库——这是数据完整性级别的静默失败，比"功能未实现"更危险。同时 693 行真实现被完全浪费。
**What needs to change:** 删除 web 的 stub，让 GitSync/VersionHistory 等消费 `yuleasr-editor-core` 的 GitService（或把该实现提升到 `@yuletech/core`）。在真实接入前，UI 应显式展示"该功能尚未可用"，而不是假装成功。

### 2.3 yuleasr-editor-core 零消费者：完整引擎与 Git 实现被所有 app 无视
**File:** packages/yuleasr-editor-core/src/engine/index.ts（778 行 ConfigEngine + HistoryManager）；packages/yuleasr-editor-core/src/services/index.ts（914 行 ValidationService）；package.json 依赖；对照：apps/yuleasr-web/package.json、apps/yuleasr-vscode/package.json、apps/yuleasr-desktop/package.json 均声明 `yuleasr-editor-core: workspace:*`，但全仓库 grep 无任何 `import 'yuleasr-editor-core'`（除包自身）
**Severity:** critical
**What is wrong:** 三个 app 都在 package.json 里声明依赖 editor-core，但源码零引用。editor-core 内含完整配置引擎（undo/redo 历史、批量操作、事件系统）、验证服务、Git 服务（693 行）、RTE 生成器。web 的 configStore（1138 行）自己实现了一套等价状态管理，vscode 的 commands/index.ts（613 行）自己用 fs 手写配置读写与生成。
**Why it matters:** 这是平台层最大的投资浪费，也是最典型的"分层没落地"：业务逻辑没有下沉，`editor-core` 成了文档/示例工程。web 的 1138 行 store 与 editor-core 引擎是两份需要长期同步维护的并行实现；vscode/desktop 无法复用任何能力。
**What needs to change:** 确定 editor-core 的真实定位：要么 web 的 configStore 改为薄壳、把变更/撤销/验证委托给 ConfigEngine；要么明确删除该包并解散其代码到 @yuletech/core。此处的中立方案不可持续。其依赖的空包 `@yuletech/utils` 也需一并处理（见 2.4）。

### 2.4 三个空包作为正式产品包存在（@yuletech/api-client、@yuletech/utils）
**File:** packages/@yuletech/api-client/src/index.ts:1-2（`export {}` 仅两行注释）；packages/@yuletech/utils/src/index.ts:1-2（同上）；packages/@yuletech/utils/package.json（有 build/test/publishConfig 全套）；packages/yuleasr-editor-core/package.json（dependencies 含 `@yuletech/utils: workspace:*`）
**Severity:** critical
**What is wrong:** 两个包是空壳，却带完整 tsup 构建、vitest、publishConfig（公开发布配置）。editor-core 声明依赖 utils 但实际从未 import 它（tsup external 也把它列为 external）。api-client 完全无引用。
**Why it matters:** 空包会通过 workspace 解析被安装进每个依赖方，给所有消费者带来无意义的解析/构建；发布配置暗示它们会推送到 npm，届时 `npm i @yuletech/utils` 得到的是一无所有的包。此外"utils"这个包名本身就违反用户命名偏好（禁止泛化 utils/helpers/common 命名）。
**What needs to change:** api-client：要么实现（把 web services/api.ts 的 fetch 封装、community apiClient 的通用层收敛进来），要么删除。utils：解散，把实际需要的函数按领域归入 core 或各 app（web 的 `lib/utils.ts` 是 `cn()`，属 UI 关注点，应并入 @yuletech/ui；community 的 `lib/utils.ts` 是 localStorage 封装，按场景命名如 `storage.ts`）。

### 2.5 条件引擎（core/conditions，约 1300 行+测试）无任何消费者，且 web 另写了一套可见性逻辑
**File:** packages/@yuletech/core/src/conditions/{parser.ts,evaluator.ts,propagator.ts,depends.ts,types.ts}；全仓库 grep `@yuletech/core/conditions` 零命中；对照 apps/yuleasr-web/src/components/ParameterEditor.tsx 本地实现 visibleWhen（与 ADR-002"双条件引擎设计"文档不符）
**Severity:** critical
**What is wrong:** core 实现了完整的递归下降解析器、求值器、依赖传播器（带 8.7K+19.1K 测试），但没有任何 app 代码 `import '@yuletech/core/conditions'`。web 的 ParameterEditor 对 visibleWhen/enabledWhen 的解析和求值是包内私有的另一套实现。
**Why it matters:** 1300 行核心能力写了不用，UI 侧重复造轮子且语义可能不一致（两套解析器对同一表达式给出不同结果的隐患）。当需求从"单参数可见性"演进到"多参数传播/批量隐藏"时，web 私有实现无法承载，届时要么回头接 core（重构 UI 表达式模型），要么继续维护第二套——这是已发生且仍在扩大的技术债。
**What needs to change:** 由 web 的 ParameterEditor/Editor 消费 core/conditions 的 parseCondition + evaluator/propagator 完成可见性与依赖传播；删除 web 私有实现；若短期接不上，应显式标记 conditions 为未接入并由 road-map 明确接入迭代，而不是无限期悬置。

### 2.6 双 ARXML 解析器，且 core 版本用 DOMParser（Node 不可用）
**File:** apps/yuleasr-web/src/services/arxml-parser.ts:1-516（fast-xml-parser，AUTOSAR 4.0-4.4 全面支持，是被使用的主实现）；packages/@yuletech/core/src/adapters/arxml-parser.ts:16-92（`new DOMParser()`，仅 querySelector 级提取，无容器层级、无类型恢复）
**Severity:** critical
**What is wrong:** 两份独立 ARXML 解析器。core 版本依赖浏览器 DOM API（DOMParser），在 vscode/desktop/Node 服务端不可运行——它作为 "core" 包从设计上就不可移植，而 core 恰恰是给所有平台共享的。web 版本功能强得多但困在 app 层。
**Why it matters:** 任何新平台（vscode 扩展要读 .arxml、desktop 菜单已宣称支持打开 .arxml 但实际仅 send 事件给渲染进程）无法复用解析能力；core 里的弱实现若被误用会产出丢失容器结构和参数类型的配置。
**What needs to change:** 把 web 的 arxml-parser（fast-xml-parser 版）提升为 core 唯一实现（core/adapters/arxml-parser.ts），删除 DOMParser 版；arxml-exporter 同理（见 2.7）。apiserver 若需要解析也直接用 core。

### 2.7 双 ARXML 导出器 + 双代码生成器，格式分叉无统一出口
**File:** apps/yuleasr-web/src/services/arxml-exporter.ts（207 行）；packages/@yuletech/core/src/plugins/builtins/arxml-export-plugin.ts（configToArxml 生成简化 ARXML）；apps/yuleasr-web/src/services/codegen.ts:1-13（自述"ECUC full code generation is handled separately by EcucCodeGenerator in @yuletech/core"）；packages/@yuletech/core/src/generator/ecuc-generator.ts（1461 行）
**Severity:** critical
**What is wrong:** ARXML 导出存在两个互不知晓的实现（web exporter 与 core builtin plugin，XML 结构不同）。代码生成也存在两套：web `codegen.ts` 生成 yuleASR 风格宏头文件（Editor.tsx 实际使用），core `ecuc-generator` 生成 ECUC 风格（仅有测试引用 integration-verify.test.ts）。web ui-adapter.ts 存在的意义就是把 UI 数据转成 core 格式，但生成路径却绕过了 core。
**Why it matters:** 同一配置导出/生成出的产物取决于"从哪个入口调用"——这就是格式碎片的温床。插件系统（arxml-export-plugin 是 builtin 插件）与真实导出路径脱节，意味着"插件化导出"这个架构承诺从未兑现，外部插件覆盖不了导出行为。
**What needs to change:** 明确 ecuc-generator（core）为唯一代码生成引擎，web codegen.ts 的宏头生成逻辑迁入 core 作为第二个生成器内置插件（同 PluginSDK 的 CodeGeneratorPlugin 契约）；arxml 导出统一到 core 的 builtin 插件并由 web 调用，删除 web exporter（或反过来，但必须单一出口）。

### 2.8 web "core/" 目录与 @yuletech/core 重叠：DependencyValidator 与 CrossModuleValidator 双轨
**File:** apps/yuleasr-web/src/core/DependencyValidator.ts:29-53（模块依赖+OS+RTE+交叉引用校验，被 configStore 在 11 处调用）；apps/yuleasr-web/src/stores/configStore.ts:13；packages/@yuletech/core/src/validators/cross-module-validator.ts:20-50（同名跨模块验证）；app 同时从 `@yuletech/core/validators` 导入 CrossModuleValidator 使用（configStore.ts:9）
**Severity:** critical
**What is wrong:** 同一个 store 里同时使用两套交叉模块校验：`@yuletech/core` 的 CrossModuleValidator（走 54 个 generated JSON schema 的 crossReferences）和自研 DependencyValidator（走 web 自己定义的类型 + 手写模块依赖/OS/RTE 规则）。两套校验的结论可以互相矛盾。
**Why it matters:** 用户看到的验证面板（ValidationPanel 用 core 的 yuleasrValidator）与 configStore 里存的 issues（DependencyValidator 产出）是两个真相源，错误/警告可能出现不一致或重复；改一处校验规则时要改两个地方。
**What needs to change:** 把 DependencyValidator 的功能合并进 core 的 validation-pipeline（作为 web 规则源 + core schema 规则的组合），web 只保留一个验证入口；删除 apps/yuleasr-web/src/core/ 目录下的平行实现。

### 2.9 api-server 插件路由直接在服务端进程加载外部插件（无沙箱）
**File:** packages/@yuletech/api-server/src/routes/plugins.ts:27（`const { pluginManager } = await import('@yuletech/core')` 并把 manager 暴露成 REST）；packages/@yuletech/core/src/plugins/plugin-manager.ts:7-11（自述 "No vm sandbox is applied in Phase 1 (planned for Phase 2)"）
**Severity:** critical
**What is wrong:** 插件管理 API 允许通过 `PUT /v1/api/plugins/:id/config` 和 toggle 操作全局单例 pluginManager，而 pluginManager 的 loader 支持从外部目录 `import()` 任意 JS 文件。REST 端点没有鉴权（index.ts 只对部分路由挂 authenticate，plugins 路由未挂载），插件系统又无沙箱。
**Why it matters:** 任何能触达该端点的调用者可加载/触发任意本地 JS 执行——远程命令执行级别的攻击面；即使有鉴权，加载外部插件的进程与 API 服务同进程，插件崩溃或恶意代码直接威胁服务端。这是"共享核心被错误暴露"的典型架构事故。
**What needs to change:** 插件加载/执行与 API 服务进程隔离（子进程/worker 或插件仅在客户端桌面端执行）；plugins 路由补齐鉴权；在沙箱落地前禁用外部插件加载路径。

### 2.10 yulecommunity 的 API 类型全是空壳，类型检查形同虚设
**File:** apps/yulecommunity/src/services/apiClient.ts:37-153（`export interface UserProfile {}`、`ForumPostSummary {}`、`ForumComment {}`、`BlogPost {}`…整批空 interface 已导出给全 app 使用）
**Severity:** critical
**What is wrong:** apiClient.ts 导出十几个空 interface，字段为空。任何组件从这些类型取字段时（如 `post.title`）编译器都不会报错，但运行时全 undefined。这是 TypeScript 中最危险的一类假安全。
**Why it matters:** 整个 community 的博客/论坛/用户数据层是在"编译通过但全是 undefined"的承诺上构建的；一旦切换真实后端或填充类型，所有消费点一次性炸裂；调试成本极高（错误发生在很远的渲染层而非类型层）。
**What needs to change:** 立即从 api-server 的 zod schema / 真实响应补齐这些类型（ApiClient 服务端已有 zod 定义，类型可自动导出）；在补齐前禁止空 interface 通过 CI（加一条 ESLint 规则：禁止空 interface）。

---

## 3. Warning 问题

### 3.1 配置比较器双实现，其中 Core 版是死代码
**File:** apps/yuleasr-web/src/core/ConfigComparer.ts（350 行，全仓库除自身外无人引用）；apps/yuleasr-web/src/services/compareEngine.ts:217（另一个 ConfigComparer，被 ConfigDiff/Compare/ConfigCompareDialog 真实使用）
**Severity:** warning
**What is wrong:** 同一 app 内两个同名 ConfigComparer 类，一个 350 行无引用（死代码），一个 568 行在用。死代码还增加了"改错文件"的风险。
**Why it matters:** 违背单一实现原则；新成员 grep ConfigComparer 会得到两个结果，极易改错。
**What needs to change:** 删除 apps/yuleasr-web/src/core/ConfigComparer.ts；把比较逻辑按领域收敛（可留在 compareEngine，或下沉 core 供多端复用）。

### 3.2 web ParameterValidator 是死代码，且与 core 校验器功能重叠
**File:** apps/yuleasr-web/src/core/ParameterValidator.ts（285 行，零引用）
**Severity:** warning
**What is wrong:** 手写的参数校验规则引擎（MCU 时钟频率、CAN 波特率、PWM 频率等硬编码规则）没有任何组件引用；相同能力 core 的 ConfigValidator/YuleasrValidator 已提供。
**Why it matters:** 死代码消耗认知负载；硬编码领域规则（如 "CAN 波特率必须是 125000/250000/500000/1000000"）应该来自 schema 而非一个无人调用的类。
**What needs to change:** 删除；领域约束规则应表达在 module schema/JSON Schema 中，由 core validator 统一执行。

### 3.3 @yuletech/ui 基本无人使用，三套 UI 基件并存
**File:** packages/@yuletech/ui/src/components/（Button/Input/Modal/Select/Tree/PropertyPanel 共 8 个组件）；apps/yuleasr-web/src/pages/Dashboard.tsx:36-37（唯一使用点，注释还写着 "Phase 3 集成示例"）；apps/yulecommunity/src/components/ui/{button,card,input,progress}.tsx；apps/yuleasr-web 各自手写组件
**Severity:** warning
**What is wrong:** @yuletech/ui 被三个 app 声明为依赖的只有 web（一个 Button），community 完全不依赖它，vscode/desktop 不依赖。同时 web 与 community 各有一套同源的 shadcn 风格组件。
**Why it matters:** 共享 UI 包成为象征性包（同 2.4/2.3 的模式：建了包不用）；两套 shadcn 组件会造成视觉/行为漂移和 Tailwind 配置碎片。
**What needs to change:** 明确 @yuletech/ui 为唯一 UI 源，逐步把 web/community 的 components/ui 迁移进去（community 的 button/card/input/progress 几乎可直接搬）；在迁移完成前不再新建本地 ui 基件。

### 3.4 vscode 扩展声明依赖 core/editor-core 但零引用，功能全部自实现
**File:** apps/yuleasr-vscode/package.json（dependencies: @yuletech/core、yuleasr-editor-core）；apps/yuleasr-vscode/src/commands/index.ts:1-613（全部用 fs 手写读写/验证/生成）；apps/yuleasr-vscode/src/providers/ConfigTreeProvider.ts:1-358
**Severity:** warning
**What is wrong:** 依赖声明与源码 import 完全脱节（grep 确认 vscode/src 无任何 @yuletech/core 引用）。validateConfiguration/generateCodeForConfig 等命令自实现校验与生成。
**Why it matters:** 扩展的校验/生成逻辑与 web、core 三套分叉——同一配置在不同入口得到不同结果；依赖声明的"假依赖"让体积与安全审查失真。
**What needs to change:** 让 vscode 的验证/生成命令调用 @yuletech/core（或 editor-core 若保留），删除手写逻辑；不接就删掉依赖声明。

### 3.5 core package.json 的 exports 指向 src，且 "validator" 与 "validators" 双导出目录
**File:** packages/@yuletech/core/package.json:11-78（main/module/types 均为 `./src/index.ts`，且 exports 每个子路径也指向 src）；packages/@yuletech/core/src/validator/index.ts（ConfigValidator 单数）；packages/@yuletech/core/src/validators/index.ts（CrossModuleValidator/ValidationPipeline 复数）
**Severity:** warning
**What is wrong:** 发布配置指向 src（未编译源码），若 publish 出去消费者拿到 TS 源码而非 d.ts；build 脚本实际产出 dist 但 exports 不用。同时 validator/ 与 validators/ 两个目录并存，名称近乎一样。
**Why it matters:** 包一旦发布即损坏；双目录让 API 面混乱（`@yuletech/core/validator` vs `/validators` 是不同东西）。workspace:* 下能跑是因为工具链直接解析 TS，掩盖了包不可发布的事实。
**What needs to change:** exports 统一指向 dist（构建产物+d.ts）；合并 validator/validators 两个入口，从 index.ts 或一个命名导出暴露全部校验能力。

### 3.6 plugin-sdk exports 类型指向 src、构建指向 dist，类型面与产物面不一致
**File:** packages/@yuletech/plugin-sdk/package.json:6-19（`"types": "./src/index.ts"` 但 import/require 指向 dist）
**Severity:** warning
**What is wrong:** types 指 src、实现指 dist；`@yuletech/core` 同时依赖 plugin-sdk 并在自身 exports 指向 src，形成 src 解析链。
**Why it matters:** 发布后 d.ts 引用与产物不匹配（editor 会解析到 src 而运行时解析 dist），插件作者（外部用户）构建时可能拿到两套类型定义。
**What needs to change:** types 与 import/require 统一指向 dist（先 build 再发布，或 types 用 dist/index.d.ts）。

### 3.7 yulecommunity 三个 GitHub 服务文件职责重叠
**File:** apps/yulecommunity/src/services/github.ts（fetchGitHubRepos + findRepoByModuleName）；apps/yulecommunity/src/services/githubApi.ts（RepoStats/贡献数据/mock 生成/findRepoByModuleName 的近亲逻辑）；apps/yulecommunity/src/services/gitHubClient.ts（统一 fetch 封装+缓存+token，被 github.ts 消费，但 githubApi.ts 不走它）
**Severity:** warning
**What is wrong:** github.ts 与 githubApi.ts 各自实现 GitHub 数据获取与"按模块名找仓库"逻辑，一个走 gitHubClient 缓存封装，一个直接 fetch；文件名 github/githubApi/gitHubClient 三个相似名词。
**Why it matters:** 限流/token/缓存逻辑只对一半代码生效；改名（github vs githubApi）极易 import 错文件。
**What needs to change:** 并为一个 `github` 领域服务：gitHubClient 作为唯一传输层，github.ts 提供仓库/贡献数据 API，删除 githubApi.ts 的重叠部分。

### 3.8 双 useBookmarks hook 并存（云端版与 localStorage 版）
**File:** apps/yulecommunity/src/hooks/useBookmarks.ts（云端同步版，271+ 行）；apps/yulecommunity/src/hooks/autosar/useBookmarks.ts（localStorage 版，25 行）
**Severity:** warning
**What is wrong:** 两个同名 hook，实现完全不同（一个接 userApi 云同步，一个只读写 localStorage），调用方 grep hook 名得到两个结果。还有 `@/hooks/useBookmarks` 与 `@/hooks/autosar/useBookmarks` 的路径歧义。
**Why it matters:** 业务语义（本地 vs 云）没有体现在命名上，调用方以为"收藏"行为一致，实际数据源不同；新维护者极难分辨。
**What needs to change:** 按能力命名：useCloudBookmarks / useLocalBookmarks，或封装成一个 hook 内部按环境切换。

### 3.9 web 服务层基础 fetch 封装与 community 的 apiClient 各写一份，有空包不用
**File:** apps/yuleasr-web/src/services/api.ts:28-77（JWT + 401 跳转 + 解包）；apps/yulecommunity/src/services/apiClient.ts:191-247（setApiToken/getApiToken + apiClient 对象）
**Severity:** warning
**What is wrong:** 两个 app 各自实现 fetch 封装（token 管理、错误处理、响应解包），而共享层 `@yuletech/api-client` 是空包。
**Why it matters:** token key 不一致（web 用 `yuleasr_token`，community 用另一套）未来跨 app 会话/SSO 同步时会产生诡雷；认证逻辑的 bug（如 401 处理策略差异）要修两处。
**What needs to change:** 至少统一 base 封装下沉到 api-client（实现它），两个 app 的差异化（401 跳转策略）通过配置参数传入。

### 3.10 desktop 的 Electron 包未被使用，且有通用命名
**File:** apps/yuleasr-desktop/package.json（dependencies 声明 @yuletech/core、yuleasr-editor-core、electron-updater）；apps/yuleasr-desktop/electron/main.mjs:1-237（无任何 @yuletech 引用，只用 electron/electron-updater）
**Severity:** warning
**What is wrong:** 依赖声明与实际 import 全部脱节（与 vscode 同款问题）；desktop 菜单 "Open Configuration..."/"Export Generated Code..." 只是向渲染进程 send 事件，渲染进程（web app）是否有对应监听不可见；desktop 复用 yuleasr-web 的构建（vite root 指到 ../yuleasr-web，build 脚本 cp -r ../yuleasr-web/dist）——一个 app 的构建产物被另一个 app 的打包流程牵制。
**Why it matters:** desktop 与 web、vscode 三个外壳共享同一渲染层却无统一"宿主适配"抽象；渲染层如何感知自己在 Electron 里（electron.d.ts 里 window.electronAPI）是手写约定，两处易失同步。
**What needs to change:** 建立明确的宿主适配层（web/vscode-webview/electron 三套 bridge 接口同一契约），渲染层通过契约调用宿主能力；desktop 构建改为引用 web 构建产物的标准 pipeline，去掉互相 cd+cp 的脆链。

### 3.11 ConfigEngine 撤销/重做用 `undefined as unknown as ParameterValue` 强转表达删除
**File:** packages/yuleasr-editor-core/src/engine/index.ts:491-496（`this.project.setParameterValue(..., undefined as unknown as ParameterValue)`）；类型：models/index.ts 的 ParameterValueModel
**Severity:** warning
**What is wrong:** 类型模型不允许 undefined 作为值，删除语义用 as-any 链强转塞进 API，代价是类型检查对这条路径完全失效。
**Why it matters:** 类型系统给出虚假保证；未来 SetParameterValue 若对 undefined 做空值校验（如跳过或报错），删除/重做路径会静默改变行为；这是"难以正确使用的 API"的典型：API 签名与语义不符。
**What needs to change:** 为"删除参数"提供显式建模（如 deleteParameterValue 方法或 Result 类型携带 deleted 标志），删除类型强转。

### 3.12 configStore 的跨模块验证失败被静默吞掉
**File:** apps/yuleasr-web/src/stores/configStore.ts:80-83（`catch { return []; }` 并注释"静默降级"）
**Severity:** warning
**What is wrong:** validateCrossModuleChanges 在 schema 加载/验证抛错时返回空数组，调用方（updateParameter 等）照常把值设为"验证通过"。
**Why it matters:** 当 54 个 JSON schema 加载失败或某处抛错，用户会看到"无错误"的假绿灯，而跨模块冲突（CAN 波特率超出 CanTrcv 支持范围）被吞掉。
**What needs to change:** 至少要区分"验证未执行"与"验证通过"两种状态，把降级原因暴露到 UI（如 ValidationPanel 的警告条）。

### 3.13 api-server 的 Fastify 类型安全被 any 绕过
**File:** packages/@yuletech/api-server/src/index.ts:41-47（`app.decorate('authenticate', async function (request: any, reply: any)`）；packages/@yuletech/api-server/src/routes/auth.ts:70（`(app as any).authenticate`）
**Severity:** warning
**What is wrong:** 认证装饰器与路由签名全用 any；Fastify 5 有完整的 declaration merging 机制（module augmentation）可以给 FastifyInstance 加类型。
**Why it matters:** 认证逻辑是安全边界，any 让其两侧（请求对象、回复对象）都失去编译检查；新路由挂 onRequest 时拼错字段名不报错，直到 401/500 线上暴露。
**What needs to change:** 用 Fastify 类型增强声明 `authenticate` 的签名，删除 any；auth 路由内也用 request.server 而非 (app as any)。

### 3.14 ES 版本/Tailwind/工具链跨包碎片化
**File:** package.json:53-54（root overrides 强制 vitest ^3.2.6）；packages/@yuletech/core/package.json:30（vitest ^1.3.0、typescript ^5.4.0）；apps/yulecommunity/package.json（vitest ^4.1.5、vite ^7.3.6、typescript ~6.0.2）；apps/yuleasr-web（vite 6、typescript ~5.6）
**Severity:** warning
**What is wrong:** 同 monorepo 内 vitest 1/3/4、typescript 5.4/5.6/6.0、vite 6/7 并存；root overrides 硬压 vitest 3 与包内声明冲突。lint:ci 只覆盖 desktop + plugin-sdk 两个目录（其余 10 万+ 行不跑 lint）。
**Why it matters:** 每个包升级构建工具都要独立排雷；CI 的 lint 覆盖面意味着大量死代码/any 逃逸（本次审查发现的空 interface、死文件从未被规则捕获）；uniform toolchain 是 monorepo 的核心收益，目前没拿到。
**What needs to change:** pnpm catalog（pnpm 9 的 catalog 特性）或 workspace 根统一 devDependencies 版本；`lint` 覆盖全部 apps+packages 或至少 web/vscode/core；把"禁止空 interface"、"禁止 exports 指向 src"这类规则加进 eslint 作为架构护栏。

---

## 4. Suggestion 问题

### 4.1 plugin-sdk 的 PluginType 在 web 被重复定义
**File:** apps/yuleasr-web/src/types/plugin.ts:8（`export type PluginType = ...` 与 plugin-sdk 一字不差）；plugins.ts 服务层消费 api
**Severity:** suggestion
**What is wrong:** web 复刻了 plugin-sdk 的 PluginType/PluginMeta，而不是 `import type { PluginMeta } from '@yuletech/plugin-sdk'`。
**Why it matters:** 插件生态的类型契约应只有 SDK 一个定义源，否则 SDK 演进（加字段）后 web 端类型静默过时。
**What needs to change:** web 端从 @yuletech/plugin-sdk 导入 PluginMeta/PluginType，删除本地复刻。

### 4.2 web 的 GlobalSearch 与 community 的 GlobalSearch 各一份
**File:** apps/yuleasr-web/src/components/GlobalSearch.tsx（383 行）；apps/yulecommunity/src/components/GlobalSearch.tsx（223 行）
**Severity:** suggestion
**What is wrong:** 两个 app 各自实现搜索面板（快捷键、结果高亮、导航逻辑相似）。
**Why it matters:** 属于可进 @yuletech/ui 的复合组件；两份搜索体验差异会随时间扩大。
**What needs to change:** 若进入 @yuletech/ui，按数据源抽象（传入 search 回调），或至少抽取共享的高亮/键盘导航纯函数。

### 4.3 web 与 community 的类型文件重复（bswTemplate、config）
**File:** apps/yuleasr-web/src/types/bswTemplate.ts；apps/yulecommunity/src/types/bswTemplate.ts（字段差异：community 有 icon?，web 有 versions?）；apps/yuleasr-web/src/types/config.ts 与 editor-core models 的映射关系
**Severity:** suggestion
**What is wrong:** 两份 BSWTemplate 类型已发生字段漂移；api-server 的 zod schema 与三者之间的关系完全手工。
**Why it matters:** 类型同一实体在三处定义，增删字段要同步三处，漏一处即运行时 undefined（与 2.10 连锁）。
**What needs to change:** 模板/配置领域类型收敛到 api-server zod schema 或 core types，前端通过包导入。

### 4.4 web services 服务层命名与 core 冲突可读性差
**File:** apps/yuleasr-web/src/services/{arxml-parser,arxml-exporter,codegen,compareEngine,gitService}.ts vs packages/@yuletech/core/src/{adapters/arxml-parser,plugins/builtins/arxml-export-plugin,generator/ecuc-generator}
**Severity:** suggestion
**What is wrong:** 同名模块（arxml-parser）在 app 与 core 同时存在，codegen/compareEngine 与 core generator/比较能力语义重叠。
**Why it matters:** 查找"解析器在哪实现"需要横跨两层比对新旧；本审查大量篇幅就花在这类重复确认上，日常维护成本同理。
**What needs to change:** 按 2.6/2.7 收敛后，web services 只保留"平台适配"（fetch 封装、宿主 bridge），纯领域逻辑全部来自 core——这是本报告的核心整改主线。

### 4.5 api-server 生产默认密钥
**File:** packages/@yuletech/api-server/src/index.ts:24 与 src/config.ts:7（`JWT_SECRET || 'dev-secret-change-in-production'`）
**Severity:** suggestion
**What is wrong:** 缺 env 时使用公开默认 JWT 密钥。
**Why it matters:** 部署时忘记配 env 即所有 token 可伪造（配合 2.9 的插件端点尤为危险）。
**What needs to change:** 启动时校验 env，缺失则直接拒绝启动（fail-fast）并提示配置。

### 4.6 desktop/Electron 更新弹窗阻塞式重复打扰
**File:** apps/yuleasr-desktop/electron/main.mjs:21-85（update-available、update-not-available、更新进度均用 dialog.showMessageBox 反复弹窗；dev 模式 checkForUpdates 也弹窗）
**Severity:** suggestion
**What is wrong:** 启动即弹"已是最新版本"、每次检查都弹窗；UX 与架构（主进程直接操作 UI）耦合。
**Why it matters:** 属于把 UI 决策硬编码在 shell 层；后期要做安静后台更新/托盘提示需要重构。
**What needs to change:** 更新状态通过 IPC 推给渲染层展示（已有 update-download-progress 通道，可扩展），主进程只做策略。

### 4.7 core 的 ArxmlParseResult 与 web 的 ArxmlParseResult 结构不一致（errors vs errors+warnings）
**File:** packages/@yuletech/core/src/adapters/arxml-parser.ts:8-11；apps/yuleasr-web/src/services/arxml-parser.ts:44-48
**Severity:** suggestion
**What is wrong:** 同名类型一个只有 errors，一个有 errors+warnings；合并时（见 2.6）需先统一契约。
**What needs to change:** 统一为 { modules, errors, warnings }，warnings 可空数组，避免破坏性变更。

### 4.8 vscode ConfigEditorPanel 依赖预构建 webview 产物入库
**File:** apps/yuleasr-vscode/media/webview/assets/*.js（构建产物已提交）；apps/yuleasr-vscode/package.json:41（build:webview 需 cd ../yuleasr-web 另跑一次 vite 配置）
**Severity:** suggestion
**What is wrong:** 产物提交进 git（dist-vscode 同理），且 webview 构建与 web 主构建需要两套 vite 配置共存（vite.config.ts / vite.config.vscode.ts）。
**Why it matters:** 忘记重跑 build:webview 时扩展携带过期 UI；产物入库污染 diff。
**What needs to change:** 将 media/webview 与 dist-vscode 加入 .gitignore，发布流水线顺序执行 web 构建 → webview 构建 → vsce package。

---

## 5. 无问题的区域（明确说明）

- **packages/@yuletech/core/src/generator/**（ecuc-generator/os-generator/rte-generator/swc-generator/autosar-format，合计约 5800 行）：分层合理（format/generator 分离），模块职责清晰，是仓库内质量最高的领域代码。
- **packages/@yuletech/core/src/schema/generated/**（54 个 JSON schema + load-generated 转换器）：生成式 schema 链路（JSON → 扁平 ModuleSchema → CrossModuleValidator 消费）设计自洽，注释记录了打通历史（P2-2）。
- **packages/@yuletech/core/src/plugins/**（plugin-manager/plugin-registry/builtins）：插件生命周期设计（注册/激活/上下文工厂可注入测试）规范，SDK 接口（plugin-sdk）与实现（core plugins）的依赖方向正确（core 依赖 plugin-sdk，插件作者只依赖 plugin-sdk）。问题仅在 2.9 的服务端暴露方式。
- **packages/@yuletech/ui** 内部组件实现（cn 合并、PropertyPanel/Tree 等）：单一职责、无隐藏逻辑，质量本身没问题；问题在其"包被闲置"（3.3）。
- **community 的 SEO/i18n/主题等前端关注点**（seo/、ThemeContext、CSR 数据层）：seo 各组件拆分合理，没有观察到跨层泄漏。

---

## 6. 整改优先级建议

1. **P0（架构事故级）**：2.1 api-server 双 ORM 统一；2.9 插件端点沙箱/鉴权隔离；2.10 community 空类型补齐。
2. **P1（分层落地）**：2.2/2.3 editor-core 与 Git 服务要么全面接入 web/vscode，要么移除；2.6/2.7 ARXML/代码生成收敛到 core 单一出口；2.5 条件引擎接入 ParameterEditor。
3. **P2（清理）**：2.4 空包处置（实现或删除）；3.1-3.4 死代码/假依赖清理；4.3 类型收敛；3.14 工具链 catalog 统一 + lint 全量覆盖。
4. **P3（体验加固）**：3.12 验证降级可视化；4.5 fail-fast 密钥；4.6 桌面更新 UX。

**整体结论**：领域核心代码（core）写得相当扎实，但 monorepo 的分层承诺只兑现了一半——共享层与消费端双轨并存、空包与零消费者包混入产品线、api-server 双 ORM，导致"看起来分层、实际各干各的"。当务之急不是新功能，而是**收敛单一真相源**：每个领域能力（git、arxml、codegen、validation、condition、api-client、ui 基件）在仓库中有且只有一个实现，所有平台消费它。
