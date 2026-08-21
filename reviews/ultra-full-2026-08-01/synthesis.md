# Code Review Synthesis — ultra-full — 2026-08-01

> 本报告综合三份独立审查报告（correctness / security-perf /
> architecture），对 402 个文件（约 11.3 万行）的审查结果做去重合并。条目保留原始编号便于追溯：`[正确性 C1]`、`[安全 S1]`、`[架构 A2.1]`
> 等。多审查员一致的问题已合并并注明人数。

---

## Overall Assessment

**当前状态：不建议发布。**
三份报告合计发现 critical 级问题约 19 项（去重后），其中数据通路类问题（参数编辑静默失败、动态实例不持久化、Web↔Server
API 全链路断裂）直接导致核心编辑功能不可用或用户数据静默丢失，安全类问题（Electron
IPC 命令注入、JWT 默认密钥、LDAP 过滤器注入、支付 mock 端点、社区客户端认证）构成可被利用的严重攻击面。整体质量呈"两极分化"：领域核心代码（`@yuletech/core`
生成器、条件引擎、插件系统、schema 链路）写得相当扎实，但 monorepo 分层承诺只兑现了一半——空包、零消费者包、双 ORM、双实现分叉大量并存。**最大担忧：静默失败模式**——多处代码在功能失效时不报错而是假装成功（保存不落库、云同步假成功、验证空转、Git
stub 假提交），用户对数据的信任随时可能落空。发布前必须修复全部 critical（数据丢失类优先、安全类次之），并制定"单一真相源"收敛计划。

---

## Critical Issues（发布前必须修复，按风险排序）

### A. 数据丢失与核心功能失效（最高优先）

**1. 参数编辑静默失败，改动永不落库** `[正确性 C1]` — 1 位审查员
`configStore.updateParameter`
用路径最后一段（`container:xxx`/`instance:xxx`）去匹配参数 id（来自 all-modules.ts），任何路径下均匹配失败且无报错；`targetParam`
声明后从未赋值。用户修改的参数只停留在编辑器局部 state，保存/导出/生成代码时全部丢失且无提示。**这是整个编辑器最核心的数据通路，P0。**

**2. 动态容器实例数据不持久化，保存即丢** `[正确性 C2]` —
1 位审查员 ConfigTree 的 `dynamicInstances`
只存在于组件本地 state，增/删/改/复制实例从不回写
`currentConfig`。multiple 容器（如 CanController）的实例及其参数保存后全部消失，配置树与保存数据是两个世界。**P0。**

**3. Web↔Server API 全链路断裂：认证/云同步在任何部署下不可用**
`[正确性 C3+A1]` + `[安全·路由前缀]` — **2 位审查员一致** 三处叠加：(1) dev
proxy rewrite 掉 `/api` 前缀而 server 路由挂在 `/v1/*`；(2) `configs.ts`
路由从未在 index.ts 注册（404）；(3) 字符串 id vs
`parseInt(id)`、`request.user.userId` vs JWT 的 `id`
双重错配。登录/注册/云同步/配置锁全部静默失败，configStore
catch 回退 localStorage，用户无感知地以为已云端同步。

**4. isCloudSynced 语义错误：保存失败仍标记"已同步"** `[正确性 C4]` —
1 位审查员（原标 warning，与 C3 叠加后为用户可见的 critical）404 分支 post 后无异常即置
`isCloudSynced: true`；叠加 C3 使所有请求 404，UI 显示"已云同步"，换设备后数据丢失。与安全侧"静默降级掩盖故障"模式同源。

### B. 安全类（可被利用，按可利用性排序）

**5. Electron IPC 输入未净化：命令注入 + 路径遍历（RCE/任意写盘）**
`[安全·critical×2 合并]` — 1 位审查员（2 个 critical 同根因） `gcc:verify`
把渲染进程传入的 filename 直接拼入 `execSync`
shell 命令串（`x.h; touch /tmp/pwned` 即 RCE）；`saveFilesToDir`/`verifyFiles`
对含 `../`/绝对路径的 filename 不做 `basename`
规范化，可越界写入用户磁盘任意路径（覆盖 `~/.bashrc`、`~/.ssh/authorized_keys`
实现持久化 RCE）。渲染进程加载的是不可信配置数据（ARXML/共享配置），一旦存在 XSS 或恶意导入即触发。

**6. JWT 默认密钥硬编码，可伪造任意用户/管理员令牌** `[安全·critical]` +
`[正确性 A3]` + `[架构 4.5]` — **3 位审查员一致**
`JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'`，部署时忘配 env 即用公开已知密钥签发/验证 token，任何人可伪造
`{ id, email, role: 'admin' }` 调用全部受保护 API。**置信度最高的安全问题。**

**7. LDAP 过滤器注入：用户名未转义可绕过任意账户认证** `[安全·critical]` —
1 位审查员 `searchFilter.replace(/{{username}}/g, input)` 未做 RFC
4515 转义，`username=*` 或 `*)(uid=*`
载荷可匹配任意用户条目，配合"以该用户 DN 重新 bind"逻辑实现身份认证绕过。

**8. LDAP 认证关闭 TLS 证书校验（rejectUnauthorized: false）** `[安全·critical]`
— 1 位审查员两处
`tls.connect(..., { rejectUnauthorized: false })`，中间人可截获 LDAP 服务账号凭据与用户明文密码。建议改用成熟 ldapjs 库。

**9. 支付 webhook 在未配置 LemonSqueezy 时完全跳过签名校验** `[安全·critical]` —
1 位审查员 `if (LEMON_ENABLED && LEMONSQUEEZY_WEBHOOK_SECRET)` 才校验
`x-signature`，默认未配置时任何人 POST 伪造 `order_created`
事件即可触发 Pro 许可证发放（eventId 由请求方控制，去重可绕过）。

**10. mock-success 端点允许任意登录用户白嫖 Pro 许可证** `[安全·critical]` —
1 位审查员 `POST /api/payment/mock-success`
仅要求登录即为当前用户生成 30/365 天 Pro
LicenseKey，无任何支付校验；未显式下线即等于免费送 Pro。

**11. 社区端认证形同虚设：硬编码管理员口令 + 客户端 mock 登录 + 客户端管理端**
`[安全·critical，原报告 3 项合并]` —
1 位审查员管理后台口令硬编码在客户端源码（`admin / yuletech2026`、`admin@example.com / admin123`）；`useAuth`
在后端不可达时降级为"接受任意密码"的本地 mock 登录；adminStore 权限判断全在客户端（sessionStorage 改 role 即提权），AdminUsers 直接读写 localStorage 完成"用户管理"。

**12. 插件 REST 端点无鉴权 + 外部插件无沙箱动态加载（远程代码执行面）**
`[安全·warning]` + `[架构 2.9·critical]` — **2 位审查员一致**
plugins 路由（GET/PUT/toggle）未挂 authenticate，任何人可枚举/修改插件配置；plugin-manager 支持从外部目录
`import()` 任意 JS 执行
`activate()`，无 vm 沙箱、无签名校验，且与 API 服务同进程。叠加 JWT 默认密钥问题后，攻击面进一步放大。

**13. community API 类型全部为空 interface，类型检查形同虚设** `[架构 2.10]` —
1 位审查员 apiClient.ts 导出十几个空 interface，组件取字段（如
`post.title`）编译不报错但运行时全 undefined——TS 中最危险的假安全；一旦填充真实类型，所有消费点一次性炸裂。需从 api-server
zod schema 补齐类型并加"禁止空 interface"的 ESLint 护栏。

### C. 架构腐化（发布前必须做出收敛决策）

**14. api-server 双 ORM 并存（Prisma sqlite + Drizzle
postgres），同一批表两套定义** `[架构 2.1]` —
1 位审查员 12 个路由用 Prisma、4 个用 Drizzle，branding.ts 一个文件同时用两者；字段已漂移（`password`
vs `password_hash`、User 有无 `ssoProvider`
等），三套迁移/种子入口。单包内最严重的架构腐化，建议统一到 Drizzle 并删除 prisma/。

**15. 多端"假实现"：web GitService 100% stub + vscode sync/generate 纯占位**
`[架构 2.2·critical]` + `[正确性 V1]` — **2 位审查员一致**
web 的 GitService 返回伪造 OID/空数组（GitSync/版本历史/分支管理/Diff 全部消费假接口），而 693 行真实现（isomorphic-git）在零消费者的 editor-core 里闲置；vscode 的
`syncWithYuleASR`/`generateCodeForConfig`
只 sleep 便提示"同步完成/生成成功"。对用户谎报成功，是数据完整性级别的静默失败。

**16.
yuleasr-editor-core 零消费者 + 三个空包（@yuletech/api-client、@yuletech/utils）**
`[架构 2.3/2.4]` + `[安全·空壳提示]` —
2 位审查员（架构标 critical，安全侧确认无安全面但提示未完成模块）三个 app 都在 package.json 声明依赖 editor-core 但源码零 import；web 的 1138 行 configStore 自己实现了一套等价状态管理。空包带全套 tsup/vitest/publishConfig，会经 workspace 解析装进每个依赖方；`utils`
命名本身违反"禁止泛化命名"约定。

**17. 条件引擎（core/conditions，约 1300 行 + 测试）零消费者，web 另写一套 visibleWhen**
`[架构 2.5]` — 1 位审查员全仓库无任何
`import '@yuletech/core/conditions'`；ParameterEditor 的 visibleWhen/enabledWhen 是包内私有的另一套解析求值实现，两套解析器对同一表达式可能给出不同结果。

**18. 双 ARXML 解析器/导出器 + 双代码生成器，格式分叉无统一出口**
`[架构 2.6/2.7]` —
1 位审查员 core 版 arxml-parser 依赖 DOMParser（Node/桌面端不可运行，从设计上不可移植），web 版（fast-xml-parser）功能更强却困在 app 层；ARXML 导出有 web
exporter 与 core builtin 插件两个互不知晓的实现；代码生成有 web
`codegen.ts`（实际使用）与 core
`ecuc-generator`（仅测试引用）两套。同一配置的导出/生成产物取决于从哪个入口调用。

**19. 验证体系双轨：web DependencyValidator 与 core CrossModuleValidator 并存**
`[架构 2.8]` — 1 位审查员（与正确性侧"验证名不副实"系列一致，见 Points of
Agreement #7）同一个 configStore 同时使用两套交叉模块校验（core
schema 的 crossReferences +
web 手写模块依赖/OS/RTE 规则），结论可互相矛盾；ValidationPanel 与 store 里存的 issues 是两个真相源，改一处校验要改两个地方。

---

## Warnings（should fix）

### core 包 `[正确性 K1–K12]` + `[安全·core]`

- **[K1] schema-validator-plugin 永远空转**：`schemaCache` 全仓库无人
  `set`，required/enum/range 校验从未执行；cross-module 插件靠 fallback 偶然工作。
- **[K2] ConditionEvaluator 对 `config.parameters` 缺失无防御**（与安全侧
  `__proto__`/`constructor` 命中合并为一条，2 位审查员一致，见 Points of
  Agreement #5）：`in`
  直接作用于可能 undefined 的对象会抛 TypeError，且沿原型链命中 `__proto__`
  等键返回 truthy。
- **[K3] YuleasrValidator range 规则空壳**：只做 isNaN 检查、忽略 min/max；Mcu
  custom 规则消息错位（缺 clock_frequency 却报"Mcu 未启用"）。
- **[K4] 条件表达式 lexer 允许畸形数字
  `1.2.3`**：静默解析为 1.0，条件以错误值参与求值。
- **[K5] ConstraintPropagator 用 `new Function` 动态执行 fallback**：字符集含
  `!`/`<`/`>` 可组合出合法 JS；失败路径返回原始字符串而非报错。应移除动态执行。
- **[K6] OS 生成器对不存在的 Task/Counter 引用输出未定义宏**（`OS_TASK_ID_XXX`
  编译期才爆炸）。
- **[K7]
  RTE 生成器接口/任务名未做 C 标识符合法性校验**（连字符/点/空格 → 非法 C）。
- **[K8] ChoiceContainerValidator 对 `instance.parameters`
  缺失无防御**（抛 TypeError 中断 pipeline）。
- **[K9]
  CrossModuleValidator 容器引用只查第一个实例**（第 2+ 实例违反约束漏报）。
- **[K10] validateAffectedBy 对容器内参数永远跳过**：增量验证只查顶层
  `parameters`，UI 中最常见的容器参数编辑触发的跨模块增量验证全部空转（与架构 3.12 合并，见 Points
  of Agreement #12）。
- **[K11] ecuc-generator 负整数生成 `((uint32)-5U)`**：值 = 2^32-5 语义错误。
- **[K12] 插件 disable→enable 后已注册的 generator/validator 不恢复**：UI"重新启用"无效。
- **[安全] 条件解析器递归深度无上限**：`'!'.repeat(1e6)`/十万层括号可栈溢出（浏览器标签页或 Node 服务 DoS）；求值器有 MAX_DEPTH 但解析阶段没有。

### apps/yuleasr-web `[正确性 W1–W11]` + `[安全·web]`

- **[W1]
  Editor.selectedModule 用 substring 匹配模块 id**：`module:cantp`.includes('can') 为 true
  → 面板显示错误模块。
- **[W2]
  ParameterEditor 非法输入时 UI 与 store 值分叉**：校验失败不调 onChange，UI 显示新值、store 保留旧值，保存时悄悄还原。
- **[W3] api.ts 401 强制 `window.location.href = '/login'`**：部署 base 是
  `/configurator/`，GitHub Pages 下跳到站点根；且整页跳转丢失未保存编辑。
- **[W4]
  compareEngine 子容器参数 diffs 在树视图丢失**：containerPath 拼接不一致，filter 永不相等，比较视图漏报参数差异。
- **[W5]
  codegen.ts 字符串参数生成无引号宏**（`#define CAN_CHANNEL channel0`），与安全侧"C 代码注入"合并（2 位审查员一致，见 Points
  of Agreement #4）。
- **[W6]
  DependencyValidator.validateRTEConsistency 为空实现**（只注释不做事，RTE 引用错误无处报错）。
- **[W8] ConfigTree 实例重命名无重名检测**：`instance:`
  路径冲突后 find/remove 全部命中第一个。
- **[W9] Editor.handleImport 不校验 JSON 结构**：无 `.modules`
  的 JSON 导入后渲染抛错白屏。
- **[安全] 配置校验在热路径上全量执行且每次重建 schema 集合**（updateParameter 每次击键 O(模块×参数) + 重新装配 schema，与正确性 G1 合并，2 位审查员一致，见 Points
  of Agreement #6）。
- **[安全] loadFromCloud 顺序 N+1 拉取每个配置详情**：50 个配置 =
  50 次串行请求。
- **[安全]
  JWT 存 localStorage 且角色客户端可信**：任意 XSS 可窃取 token；改 localStorage 的 role 即得 UI 级管理员入口（服务端若不复核则越权）。
- **[安全] 审计报告 HTML 生成未转义**：`config.name`/参数值直拼 HTML，下载本地打开可触发脚本（存储型 XSS 本地变体）。
- **[安全] yuleOSH 本地服务调用无认证、默认 localhost:8080**：DNS
  rebinding/localhost CSRF 风险 + 敏感配置明文 HTTP 传输。
- **[安全] license 特性开关纯客户端实现**：改 localStorage 的 `yuleasr_license`
  即可离线获得 Pro 能力。

### packages/@yuletech/api-server `[正确性 A2–A4]` + `[安全·server]`

- **[A2] configs.ts 读 `request.user.userId` 而 JWT payload 只有
  `id`**：用户数据隔离失效风险（与 C3 同链，建议一并修）。
- **[A3] JWT_SECRET 默认值**：已并入 Critical #6（3 位一致）。
- **[安全] 登录/注册/license 激活等端点完全无限流**：登录爆破、注册垃圾账号、license 枚举、LDAP 登录风暴均可无成本执行。
- **[安全] CORS 配置 `origin: true` 反射任意来源**：需白名单固定前端域名。
- **[安全] 插件管理 API 全部无认证**：已并入 Critical #12。
- **[安全] like/view/download 计数无幂等与限流**：脚本刷赞污染榜单。
- **[安全] bsw-templates 列表可用 `?status=draft`
  绕过公开过滤 + 详情接口 IDOR**：未认证枚举他人草稿/private 模板完整 configData。
- **[安全]
  posts/qa/blog/community 列表全表查询无分页**：数据量增长后天然 DoS 放大点。
- **[安全] OIDC：state
  Map 无过期清理（OOM 风险）、token 放 URL 查询串（进历史/日志/Referer）、nonce 生成但从未校验（重放攻击）**。
- **[安全] LDAP 二次验证 bind socket 无超时**：慢速 DoS（连接/内存泄漏）。
- **[安全] branding
  /preview 存储型 CSS 注入**：logoUrl/companyName 未转义直拼 CSS 变量。
- **[安全] SSO 用户创建邮箱未验证**：account
  pre-hijacking（用自有 IdP 邮箱抢占社区账号）。
- **[正确性 A4]
  license 激活无幂等/试用期保护，shareToken 不可吊销**（suggestion 级，见 Suggestions）。

### apps/yulecommunity `[安全]`

- **Markdown 渲染器 DOMPurify 先于解析执行**：`[x](javascript:alert(1))`
  绕过净化 → 存储型 XSS。
- **GitHub
  Token 明文存 localStorage + 代码内 console.warn 引导用户手工写入**（开发残留）：XSS 即窃取 PAT。
- **积分经济体系客户端可自行发奖**：`earnPoints(action)`
  action 任意传可反复刷分。

### apps/yuleasr-vscode `[安全]` + `[正确性 V1–V2]`

- **Webview CSP 形同虚设**：`script-src` 同时含 nonce +
  `'unsafe-inline' 'unsafe-eval'`，nonce 失去意义。
- **postMessage 中继 targetOrigin
  '\*' 且不校验来源/结构**：webview 内任意脚本可伪造消息触发扩展写盘。
- **renameModule 新名称未净化**：`../` 可把模块文件移动到工作区外。
- **[V1] sync/generate 假实现**：已并入 Critical #15。
- **[V2] validateConfiguration 只查 `data.moduleName` 一个字段**：并入 Points of
  Agreement #7。

### packages/yuleasr-editor-core `[正确性 E1–E5]` + `[安全]`

- **[E1]
  setValues 对不存在的参数标记成功并写历史**：调用方收到 success=true 但值没设置，undo 反解从未应用的变更。
- **[E2] 批量 undo 就地 reverse
  entries**：redo 遍历已反转数组，撤销/重做不对称。
- **[E3] redo delete 用 `set(undefined)`
  冒充删除**（与架构 3.11 合并，2 位审查员一致，见 Points of Agreement
  #8）：参数仍在 Map 中，遍历可见、与"不存在"状态不一致。
- **[E4]
  ValidationService.validate 验证的配置与规则评估的配置不一致**：规则结果张冠李戴。
- **[E5]
  engine.validate() 实质是空验证**：只转译外部塞入的 errors 数组，无 schema 类型/必填/范围校验（并入 Points
  of Agreement #7）。
- **[安全] gitService 默认经第三方 CORS 代理 `cors.isomorphic-git.org`
  克隆**：仓库内容（可能含凭据）外发第三方。

### 跨包 / 全局 `[正确性 G1–G2]` + `[架构 3.x]`

- **[架构 3.1/3.2]
  web 死代码**：`core/ConfigComparer.ts`（350 行零引用）、`core/ParameterValidator.ts`（285 行零引用），与在用实现同名并存，极易改错文件。
- **[架构 3.3]
  @yuletech/ui 基本无人使用**：仅 Dashboard 用一个 Button（注释还写着"Phase
  3 示例"）；web/community 各有一套 shadcn 基件。
- **[架构 3.4]
  vscode 声明依赖 core/editor-core 但零引用**：校验/生成全部自实现，同一配置三套分叉结果。
- **[架构 3.5] core package.json
  exports 指向 src（未编译源码）**：发布即损坏；`validator/` 与 `validators/`
  双导出目录并存。**（架构 3.6 同款：plugin-sdk types 指 src、实现指 dist）**
- **[架构 3.7]
  community 三个 GitHub 服务文件职责重叠**（github/githubApi/gitHubClient），限流/token 只对一半代码生效。
- **[架构 3.8] 双 useBookmarks hook 并存**（云端版 vs
  localStorage 版同名），调用方以为行为一致实际数据源不同。
- **[架构 3.9]
  web 与 community 各写一份 fetch 封装，共享空包 api-client 闲置**：token
  key 不一致成跨 app 诡雷。
- **[架构 3.10]
  desktop 声明 core/editor-core 依赖但零引用**：菜单功能仅 send 事件；构建靠
  `cp -r ../yuleasr-web/dist` 脆链。
- **[架构 3.12]
  configStore 跨模块验证失败被静默吞掉**（`catch { return []; }`）：schema 加载失败时用户看到"无错误"假绿灯（并入 Points
  of Agreement #12）。
- **[架构 3.13] api-server
  Fastify 类型安全被 any 绕过**（authenticate 装饰器与路由签名全 any）：安全边界失去编译检查。
- **[架构 3.14] ES 版本/Tailwind/工具链跨包碎片化**：vitest 1/3/4、typescript
  5.4/5.6/6.0、vite 6/7 并存；`lint:ci` 只覆盖 desktop +
  plugin-sdk 两个目录，10 万+ 行不跑 lint。
- **[正确性 G2] 测试覆盖严重不足**：全仓仅少量 schema 测试，evaluator/propagator/generators/validators/configStore 均无单测；C1/C3/K1 这类致命问题若有测试必然在 CI 暴露。

---

## Suggestions（nice to have）

- **[正确性 W7]** DependencyValidator.required 检查漏
  `null`（`value === undefined || value === ''` 未含 null）。
- **[正确性 W10]** loadConfigList 空列表 seed 前未检查旧 key
  `yuleasr_config`，用户自建数据可能被覆盖。
- **[正确性 W11]**
  PipelineStatusPanel 完成回调 10s 延迟清 jobId 的 setTimeout 未清理，卸载后 setState、新任务被误清。
- **[正确性 E6]**
  engine.import 在 configId 与返回 id 不一致时设置悬空 currentConfigId。
- **[正确性 E7]**
  gitService 状态判定不识别 renamed（statusMatrix 三元组只处理 added/deleted/modified）。
- **[正确性 A4]** license 激活无幂等/分享 token 无吊销机制。
- **[安全]** tag 计数循环串行 upsert（N+1 写，单帖 10 tag = 20+ 次 DB 往返）。
- **[安全]** gitService 分支/差异计算 N+1 与潜在 O(n²) diff（并行 resolveRef +
  Myers diff）。
- **[安全]**
  未注册"死代码"路由（community/configs/share）——删除或明确注册并统一鉴权。
- **[安全]** license
  key 仅 48 位熵且无签名，建议 HMAC-SHA256 签名 + 激活加事务防并发竞态。
- **[安全]** 默认监听 0.0.0.0 + 无安全响应头（Helmet）+ swagger
  /docs 公开——默认绑 127.0.0.1，生产关 /docs。
- **[安全]** 依赖安全：未发现
  `pnpm audit`/Dependabot 配置，锁文件 491KB 依赖面较大；electron 更新包应配置签名公钥校验。
- **[安全]**
  GlobalSearch 每次击键全配置线性扫描——建模块级倒排索引（useMemo）或移入 Web
  Worker。
- **[安全]** vscode webview
  'save' 消息无大小与 schema 限制（建议 ≤10MB + 最小结构校验）。
- **[安全]** qaApi 读取的 token
  key 与 useAuth 写入的 key 不一致（登录后 QA 写操作 401）。
- **[安全]** arxml-parser 参数名写入普通对象，`__proto__` 键可触发原型污染（用
  `Object.create(null)` 或 Map）。
- **[架构 4.1]**
  web 复刻 plugin-sdk 的 PluginType/PluginMeta——改为从 SDK 导入，单一类型定义源。
- **[架构 4.2]**
  web 与 community 各一份 GlobalSearch——抽取共享高亮/键盘导航纯函数或进 @yuletech/ui。
- **[架构 4.3]**
  web/community 的 bswTemplate/config 类型三处重复且已字段漂移——收敛到 api-server
  zod schema。
- **[架构 4.6]** desktop 更新弹窗阻塞式重复打扰——状态改走 IPC 推给渲染层。
- **[架构 4.7]** core 与 web 的 ArxmlParseResult 结构不一致（errors vs
  errors+warnings）——合并时统一契约。
- **[架构 4.8]** vscode
  webview 构建产物提交入库 + 两套 vite 配置——产物入 .gitignore，流水线顺序构建。

---

## Points of Agreement（多审查员一致，置信度最高）

| #   | 问题                                                                                                                                                                       | 审查员                                                                  | 一致数                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------- |
| 1   | **JWT 默认密钥硬编码可伪造任意令牌**                                                                                                                                       | 安全（critical）+ 正确性 A3（warning）+ 架构 4.5（suggestion）          | **3 位**                     |
| 2   | **Web↔Server API 前缀/路由断裂（configs 未注册、/api vs /v1、id 错配）**                                                                                                   | 正确性 C3/A1（critical）+ 安全·全局路由前缀                             | **2 位**                     |
| 3   | **插件 REST 暴露 + 无沙箱加载（远程代码执行面）**                                                                                                                          | 安全（warning）+ 架构 2.9（critical）                                   | **2 位**                     |
| 4   | **生成代码字符串值未转义/无引号（C 代码注入面）**                                                                                                                          | 正确性 W5（warning）+ 安全·core autosar-format & web codegen（warning） | **2 位**                     |
| 5   | **条件求值器对 parameters 访问不严谨（缺失崩溃 + `__proto__` 原型链命中）**                                                                                                | 正确性 K2（warning）+ 安全·evaluator（suggestion）                      | **2 位**                     |
| 6   | **updateParameter 热路径全量校验 + schema 每次重建（编辑卡顿）**                                                                                                           | 正确性 G1（suggestion）+ 安全·热路径（warning）                         | **2 位**                     |
| 7   | **验证体系名不副实/双轨并存**（schema 插件空转 K1、engine.validate 空验证 E5、validateRTEConsistency 空实现 W6、vscode 只查一个字段 V2、web/core 双轨 2.8、吞错降级 3.12） | 正确性 + 架构                                                           | **2 位（多个文件交叉印证）** |
| 8   | **undo/redo delete 用 `undefined as unknown as ParameterValue` 强转冒充删除**                                                                                              | 正确性 E3（warning）+ 架构 3.11（warning）                              | **2 位**                     |
| 9   | **多端假实现：web GitService stub / vscode sync·generate 占位**                                                                                                            | 架构 2.2（critical）+ 正确性 V1（warning）                              | **2 位**                     |
| 10  | **空包/零消费者包（api-client、utils、editor-core）**                                                                                                                      | 架构 2.3/2.4（critical）+ 安全·空壳提示                                 | **2 位**                     |
| 11  | **静默降级掩盖故障**（isCloudSynced 假成功 C4、useAuth mock 登录、licenseStore 本地绕过、validateCrossModuleChanges 吞错 3.12）                                            | 正确性 + 安全 + 架构                                                    | **3 位（模式一致）**         |
| 12  | **跨模块验证链路不可靠**（K10 增量验证对容器参数空转 + 3.12 失败静默返回空）                                                                                               | 正确性 K10 + 架构 3.12                                                  | **2 位**                     |

> 说明：#1（JWT 密钥）与 #11（静默降级）是全部一致项中置信度最高、影响面最大的两条——前者是可直接利用的认证漏洞，后者是贯穿三份报告的"假装成功"模式。

---

## What Looks Good（审查员未发现问题 / 明确认可的区域）

- **`@yuletech/core`
  生成器分层设计**（ecuc/os/rte/swc/autosar-format，约 5800 行）：架构审查员明确评价"仓库内质量最高的领域代码"，format/generator 分离、模块职责清晰。（正确性侧发现的 K6/K7/K11 标识符/负数细节缺陷已列 Warnings，属局部问题，不影响整体分层评价）
- **生成式 schema 链路**（`core/src/schema/generated/` 54 个 JSON schema +
  load-generated 转换器）：架构审查员确认设计自洽、注释记录完整。
- **插件系统生命周期设计**（plugin-manager/registry/builtins +
  plugin-sdk）：注册/激活/上下文工厂可注入，core 依赖 plugin-sdk 的依赖方向正确（问题仅在服务端暴露方式，见 Critical
  #12）。
- **`@yuletech/ui`
  组件实现质量**：安全与架构两位审查员一致——纯受控组件、无 innerHTML/eval、无状态泄漏、单一职责（问题在"包被闲置"而非实现本身）。
- **静态数据/schema 文件**（web/community 的 data/*.ts、autosar-headers、spec 等）：正确性与安全两位审查员均快速扫过未发现逻辑错误或注入点（建议后续做参数 id 唯一性/容器引用完整性的一致性检查）。
- **数据访问层无 SQL 注入**：api-server 的 drizzle/Prisma 全部参数化；seed.ts 无默认管理员凭据。
- **api-server auth.ts 基础认证实现**：zod 校验 +
  bcrypt(10) + 邮箱/用户名唯一性，基本正确。
- **ARXML 导入方向无 XXE**：浏览器 DOMParser 不解析外部实体，导出方向有 xmlEncode。
- **Electron 的部分正确实践**：`openExternal`
  校验 http/https 前缀；preload.mjs 仅暴露白名单 API、无 ipcRenderer 直通；contextIsolation:true +
  nodeIntegration:false（缺口见 Warnings：sandbox/will-navigate）。
- **editor-core HistoryManager 有界设计**（maxSize
  100 截断）：安全审查员确认设计正确（具体 undo/redo 缺陷见 Warnings E2/E3）。
- **web 文件下载安全实践**：导入/导出/Compare 均用 Blob + revokeObjectURL。
- **community 内容渲染**：ForumPage/QAPage/BlogPage 内容均为 React 文本节点或 whitespace-pre-wrap，无 innerHTML 注入；CodeBlock 用 Prism 分词渲染；StructuredData 用 textContent 赋值。

---

### 修复路线建议（综合三份报告）

1. **P0-立即**：数据丢失类（C1 参数定位、C2 实例持久化、C3/A1 API 链路、C4
   isCloudSynced）→ 安全 critical（Electron
   IPC 净化、JWT 密钥 fail-fast、LDAP 转义/证书、支付 webhook/mock 下线、社区认证去 mock、插件端点鉴权/隔离）。
2. **P1-发布前**：架构收敛决策（双 ORM 二选一、editor-core/空包去留、ARXML/代码生成单一出口、验证双轨合并、空类型补齐），同时补最小测试集（G2）防止 C1/C3/K1 复发。
3. **P2-发布后迭代**：Warnings 全部、工具链 catalog 统一 +
   lint 全量覆盖、依赖审计接入 CI。
