# yuleASR-Configurator 全量代码审查报告（Security & Performance）

- **审查范围:** `reviews/ultra-full-2026-08-01/files.txt` 所列 402 个 TS/TSX/MJS 文件（约 11.3 万行）
- **审查视角:** 注入漏洞、未校验输入、认证/授权、敏感数据、N+1 查询、内存/资源、热路径性能、限流、依赖安全
- **审查日期:** 2026-08-01
- **严重级别:** critical（必须立即修复） / warning（应尽快修复） / suggestion（建议改进）

---

## 目录

1. [apps/yuleasr-desktop — Electron 桌面壳](#1-appsyuleasr-desktop--electron-桌面壳)
2. [apps/yuleasr-vscode — VSCode 扩展](#2-appsyuleasr-vscode--vscode-扩展)
3. [packages/@yuletech/api-server — 后端服务](#3-packagesyuletechapi-server--后端服务)
4. [packages/@yuletech/core — 核心库](#4-packagesyuletechcore--核心库)
5. [apps/yuleasr-web — Web 配置器](#5-appsyuleasr-web--web-配置器)
6. [apps/yulecommunity — 社区站](#6-appsyulecommunity--社区站)
7. [packages/yuleasr-editor-core 及其他](#7-packagesyuleasr-editor-core-及其他)
8. [全局性问题与依赖安全](#8-全局性问题与依赖安全)
9. [无问题区域说明](#9-无问题区域说明)

---

## 1. apps/yuleasr-desktop — Electron 桌面壳

## [命令注入：gcc 校验时文件名未净化直接拼入 shell 命令]
**File:** apps/yuleasr-desktop/electron/desktop-utils.mjs:67-69, 81-87
**Severity:** critical
**Type:** security
**What is wrong:** `verifyFiles(files)` 将渲染进程通过 IPC `gcc:verify` 传入的 `files[].filename` 直接 `join(tmpDir, f.filename)` 后拼进 `execSync(\`gcc -fsyntax-only -x c -I ${tmpDir} ${filePath}\`)` 的 shell 命令串。文件名未经任何字符白名单/转义校验。
**Attack vector / Impact:** 渲染进程（Web 内容）可构造 `filename: "x.h; touch /tmp/pwned"` 或 `$(rm -rf ~)` 触发任意命令执行。虽然 Electron 开启了 contextIsolation，但渲染进程本身就是本应用加载的不可信配置数据（ARXML/共享配置可含任意文件名），一旦应用内存在 XSS 或用户导入恶意配置，即可在本机执行任意命令（权限与用户相同）。
**What needs to change:** ① 文件名强制白名单 `^[A-Za-z0-9_-]+\.(c|h)$`；② 用 `execFileSync('gcc', ['-fsyntax-only', ...])` 传参数组而非 shell 字符串，杜绝注入；③ 在 IPC handler（main.mjs `gcc:verify`）入口统一校验。

## [路径遍历：saveFilesToDir / verifyFiles 可越界写文件]
**File:** apps/yuleasr-desktop/electron/desktop-utils.mjs:68, 113-123
**Severity:** critical
**Type:** security
**What is wrong:** `f.filename` 含 `../` 或绝对路径时，`join(outputDir, f.filename)` / `join(tmpDir, f.filename)` 会逃逸目标目录。`files:save` IPC 把渲染进程数据直接交给 `saveFilesToDir` 写盘。
**Attack vector / Impact:** 渲染进程被攻陷（XSS/恶意配置导入）后，可向用户磁盘任意路径写入任意内容（覆盖 ~/.bashrc、~/.ssh/authorized_keys 等），实现持久化 RCE。
**What needs to change:** 写盘前对 filename 做 `path.basename()` 规范化并校验无路径分隔符；限制文件数量与单文件大小。

## [导航控制缺失：渲染进程可导航到远程站点仍持有 preload 能力]
**File:** apps/yuleasr-desktop/electron/main.mjs:120-132
**Severity:** warning
**Type:** security
**What is wrong:** BrowserWindow 开启了 `contextIsolation: true`、`nodeIntegration: false`（正确），但未设置 `sandbox: true`，且没有 `webContents.on('will-navigate')` 阻止与 `setWindowOpenHandler` 白名单。preload.mjs 通过 contextBridge 暴露了 `saveFiles` / `gccVerify` / `openExternal` 等能力。
**Attack vector / Impact:** 若页面内链接/脚本触发导航到攻击者站点，远程页面仍会加载 preload，获得写文件/执行 gcc/打开外部链接等原生能力；`window.open` 也可被滥用。
**What needs to change:** 增加 `will-navigate` 拦截（仅允许应用自身 URL），`setWindowOpenHandler` 一律 `shell.openExternal` 或 deny；webPreferences 加 `sandbox: true`。

## [IPC 输入无形状/大小校验]
**File:** apps/yuleasr-desktop/electron/main.mjs:93-106
**Severity:** warning
**Type:** security
**What is wrong:** `gcc:verify`、`files:save` 对渲染进程传入的 `files` 数组无数量上限、无字段校验、无大小限制，直接透传。
**Attack vector / Impact:** 渲染进程可一次性提交海量文件（内存/磁盘耗尽），或提交畸形数据触发未捕获异常。
**What needs to change:** IPC 边界做 schema 校验（数量 ≤ 100、filename 白名单、content 大小上限），异常统一 try/catch 返回错误对象。

### 该区域其余部分
- `openExternal`（main.mjs:110-116）校验了 http/https 前缀，行为正确，无问题。
- preload.mjs 仅暴露白名单 API，无 `ipcRenderer` 直通，设计良好。
- autoUpdater 使用默认 HTTPS + electron-updater 校验机制，未发现明显问题。

---

## 2. apps/yuleasr-vscode — VSCode 扩展

## [Webview CSP 形同虚设：script-src 同时含 'unsafe-inline' 与 'unsafe-eval']
**File:** apps/yuleasr-vscode/src/panels/ConfigEditorPanel.ts:352-360, 463-470
**Severity:** warning
**Type:** security
**What is wrong:** 开发与生产两种 webview HTML 的 CSP 均为 `script-src 'nonce-...' 'unsafe-inline' 'unsafe-eval'`。nonce 与 unsafe-inline/unsafe-eval 并存时，nonce 失去意义，CSP 无法防御注入。
**Attack vector / Impact:** 若 webview 内应用渲染了不可信配置数据（如带 HTML 的字符串参数值）出现 XSS，攻击代码可直接执行并调用 `acquireVsCodeApi()` 向扩展发消息（save 消息可覆写打开的配置文件）。
**What needs to change:** 移除 `'unsafe-inline'`/`'unsafe-eval'`（Vite 构建产物可配置 `build.target` 与内联策略后做到纯 nonce）；若必须保留 eval，至少收紧 connect-src。

## [postMessage 中继使用 targetOrigin '*' 且不校验消息来源/结构]
**File:** apps/yuleasr-vscode/src/panels/ConfigEditorPanel.ts:426-438
**Severity:** warning
**Type:** security
**What is wrong:** dev 模式 iframe 桥接代码把 `window` 上收到的任意 `event.data` 原样转发给 iframe（`iframe.contentWindow.postMessage(event.data, '*')`），并把 iframe 消息原样转发给 `vscodeApi.postMessage`，未校验 origin 与消息 schema。
**Attack vector / Impact:** webview 内任何脚本（含被 XSS 注入的）可伪造任意消息；扩展端 `onDidReceiveMessage` 的 `save` 分支会直接写盘。纵深防御失效。
**What needs to change:** 校验 `event.origin` 为已知来源（dev server / webview 自身），并对消息做 `{ type, data }` 结构校验后再转发。

## [Webview 'save' 消息无大小与 schema 限制]
**File:** apps/yuleasr-vscode/src/panels/ConfigEditorPanel.ts:124-127, 220-241
**Severity:** suggestion
**Type:** security
**What is wrong:** 扩展无条件把 webview 发来的 `message.data` JSON.stringify 后写入 `this._configFilePath`，无体积上限、无结构校验。
**Attack vector / Impact:** 被攻陷的 webview 可写入超大文件或垃圾内容覆盖用户配置文件（仅限当前打开的文件，影响有限）。
**What needs to change:** 限制序列化后大小（如 ≤ 10MB），并对 data 做最小结构校验（object 且含 modules 字段）。

## [renameModule 新名称未净化，可路径穿越移动文件]
**File:** apps/yuleasr-vscode/src/commands/index.ts:461-482
**Severity:** warning
**Type:** security
**What is wrong:** `validateInput` 仅检查非空，`newName` 可含 `../` 或路径分隔符，随后 `path.join(parentDir, \`${newName}${ext}\`)` 会把模块文件移动到任意目录（含工作区外）。
**Attack vector / Impact:** 用户（或被诱导的自动操作）可将文件改名移出项目；配合后续写入可造成数据丢失/覆盖。属低危但易修复。
**What needs to change:** 与 createNewModule 一致，用 `^[A-Za-z0-9_-]+$` 白名单校验。

### 该区域其余部分
- `createNewModule`（commands/index.ts:349-361）对模块名做了正则白名单校验，正确。
- 大部分命令（sync/generate）为占位实现，无网络与执行外部进程，无安全问题。

---

## 3. packages/@yuletech/api-server — 后端服务

## [JWT 密钥硬编码默认值，可伪造任意用户令牌]
**File:** packages/@yuletech/api-server/src/index.ts:24；src/config.ts:7
**Severity:** critical
**Type:** security
**What is wrong:** `JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'`。部署时若忘记配置环境变量，即使用公开已知的默认密钥签发/验证 token。
**Attack vector / Impact:** 任何人可用默认密钥伪造 `{ id, email, role: 'admin' }` 的 JWT，直接以管理员身份调用全部受保护 API（license 激活、模板管理、branding 修改等）。
**What needs to change:** 启动时强制要求 JWT_SECRET（缺失则拒绝启动），或用随机生成 + 持久化；同时轮换密钥。

## [LDAP 认证关闭 TLS 证书校验（rejectUnauthorized: false）]
**File:** packages/@yuletech/api-server/src/routes/auth-sso.ts:500, 566
**Severity:** critical
**Type:** security
**What is wrong:** 两处 `tls.connect(port, hostname, { rejectUnauthorized: false })`，LDAP 通道不验证服务器证书。
**Attack vector / Impact:** 中间人可截获 LDAP 服务账号凭据（bindCredentials）与用户明文密码，实现凭据窃取和 LDAP 登录劫持。
**What needs to change:** 移除 `rejectUnauthorized: false`，改用受信 CA/证书指纹校验；推荐使用成熟的 ldapjs 库而不是自研裸 socket 协议实现。

## [LDAP 过滤器注入：用户名未转义直接拼入搜索过滤器]
**File:** packages/@yuletech/api-server/src/routes/auth-sso.ts:215, 373-394
**Severity:** critical
**Type:** security
**What is wrong:** `const filter = searchFilter.replace(/\{\{username\}\}/g, inputUsername)`，输入未转义 LDAP 特殊字符（`* ( ) \ NUL`），随后按 `(attr=value)` 语义编码。
**Attack vector / Impact:** 攻击者提交 `username=*` 或 `username=*)(uid=*` 等载荷可匹配任意用户条目；配合后续"以该用户 DN 重新 bind"逻辑，可实现任意账户身份认证绕过（LDAP 模式）。
**What needs to change:** 对用户名做 RFC 4515 转义（`\2a \28 \29 \5c \00` 等），或改用参数化/预编译过滤器（ldapjs 的 `escape` 函数）。

## [LDAP 验证 socket 无超时，可导致请求永久挂起]
**File:** packages/@yuletech/api-server/src/routes/auth-sso.ts:565-589
**Severity:** warning
**Type:** performance
**What is wrong:** 第二次"用户验证 bind"的 `verifier` socket 未设置超时；LDAP 服务器不响应时 Promise 永不 settle，连接与请求泄漏。
**Attack vector / Impact:** 攻击者可反复触发 LDAP 登录使服务连接数/内存持续增长（慢速 DoS）。
**What needs to change:** 为 verifier 增加与主 socket 相同的 10s 超时与 error 处理。

## [OIDC state 存储为无过期清理的内存 Map]
**File:** packages/@yuletech/api-server/src/routes/auth-sso.ts:41, 284
**Severity:** warning
**Type:** performance
**What is wrong:** `oidcStateStore` 只 set/delete，从不按 `createdAt` 清理；并发发起大量 `/oidc/login` 即可无限增长。
**Attack vector / Impact:** 内存无限增长导致服务 OOM；state 无过期时间也放宽了重放窗口。
**What needs to change:** 定期清理过期条目（如每 10 分钟扫描），并设置 state TTL（如 10 分钟）。

## [OIDC 回调把 JWT 放进 URL 查询串]
**File:** packages/@yuletech/api-server/src/routes/auth-sso.ts:166
**Severity:** warning
**Type:** security
**What is wrong:** `reply.redirect(\`/?token=${token}\`)`，token 出现在 URL 中。
**Attack vector / Impact:** token 会进入浏览器历史、服务器访问日志、Referer 头（若页面再跳转），增加令牌泄露面。
**What needs to change:** 用一次性授权码（短时、单次消费）经前端换取 token，或至少使用 fragment（`/#token=...`）并配合严格 Referrer-Policy。

## [OIDC nonce 生成但从未校验]
**File:** packages/@yuletech/api-server/src/routes/auth-sso.ts:38, 41, 115
**Severity:** warning
**Type:** security
**What is wrong:** 登录时生成 nonce 存入 state store，但回调验证 id_token 时只传了 `issuer` 与 `audience`，未校验 `payload.nonce`。
**Attack vector / Impact:** 无法抵御 OIDC 隐式流重放（replay）攻击；攻击者重放截获的授权码/令牌可冒充用户登录。
**What needs to change:** jwtVerify 时校验 `nonce` 与 store 中值一致并一次性消费。

## [插件管理 API 全部无认证]
**File:** packages/@yuletech/api-server/src/routes/plugins.ts:30-81
**Severity:** warning
**Type:** security
**What is wrong:** GET /、GET /:id、PUT /:id/config、POST /:id/toggle 均未挂 `authenticate` 前置钩子。
**Attack vector / Impact:** 任何人可枚举已安装插件、读取插件元数据/配置（可能含敏感参数），并修改插件配置、启停插件，影响服务端代码生成行为。
**What needs to change:** 至少要求登录；配置变更与启停应要求 admin 角色。

## [支付 webhook 在未配置 LemonSqueezy 时完全跳过签名校验]
**File:** packages/@yuletech/api-server/src/routes/payment.ts:261-275, 324-365
**Severity:** critical
**Type:** security
**What is wrong:** `if (LEMON_ENABLED && LEMONSQUEEZY_WEBHOOK_SECRET)` 才校验 `x-signature`；环境未配置时（默认即如此），任何人 POST 任意 `{ meta: { event_name: 'order_created' }, data: {...} }` 即可触发 Pro 许可证发放。
**Attack vector / Impact:** 免费获得 Pro 授权（可重复刷），破坏整个订阅/授权体系收入模型；`eventId` 由请求方控制，去重可被随机值绕过。
**What needs to change:** 生产环境强制要求配置并校验签名，未配置时 webhook 一律 503/拒绝；eventId 用服务端生成或绑定订单号做幂等。

## [mock-success 端点允许任意登录用户白嫖 Pro 许可证]
**File:** packages/@yuletech/api-server/src/routes/payment.ts:202-250
**Severity:** critical
**Type:** security
**What is wrong:** `POST /api/payment/mock-success`（仅要求登录）为当前用户生成 30/365 天 Pro LicenseKey，无任何支付校验。
**Attack vector / Impact:** 只要该端点未被显式下线，任何注册用户可反复调用获得永久 Pro。若部署时未移除 mock 路径即等于免费送 Pro。
**What needs to change:** 用环境变量（如 `ENABLE_MOCK_PAYMENT`，仅 dev=true）显式开关，生产构建默认关闭并从路由表中剔除。

## [webhook 签名比较格式与 LemonSqueezy 实际格式不一致]
**File:** packages/@yuletech/api-server/src/routes/payment.ts:121-132
**Severity:** warning
**Type:** security
**What is wrong:** LemonSqueezy 的 `X-Signature` 头格式为 `v1=<hmac-hex>`；此处将头部整体与 `hmac.digest('hex')` 直接 `timingSafeEqual`。若头带 `v1=` 前缀则恒失败（webhook 全挂），若服务端按裸 hex 生成则 OK——两种情况下均未按官方格式解析。
**Attack vector / Impact:** 校验可能恒失败（可用性）或存在实现与文档不一致的边界；配合上面的"未配置即跳过"，实际防护取决于部署巧合。
**What needs to change:** 按官方规范解析 `v1=` 前缀后比较；并将"未配置 secret"与"签名校验失败"同样拒绝。

## [like/view/download 计数无幂等与限流]
**File:** packages/@yuletech/api-server/src/routes/sharedConfigs.ts:181-197；bswTemplates.ts:481-491；blog.ts:93-97；qa.ts:121-125
**Severity:** warning
**Type:** security
**What is wrong:** `POST /:id/like` 对同一用户无唯一性约束，可无限次 +1；view/download 计数火发后不理且无频率限制。
**Attack vector / Impact:** 脚本刷赞/刷浏览量污染榜单与推荐，破坏社区数据可信度；高频请求构成轻量 DoS。
**What needs to change:** like 用唯一约束（userId+configId）做 toggle；计数类写入限流或合并为定时批量更新。

## [bsw-templates 列表可用 status 参数绕过公开过滤]
**File:** packages/@yuletech/api-server/src/routes/bswTemplates.ts:109-117
**Severity:** warning
**Type:** security
**What is wrong:** `where.status = query.status || 'published'`，且仅当 `!query.status` 时才加 `isPublic/visibility` 过滤。传 `?status=draft`（或 rejected/archived）即可列出所有用户非公开模板。
**Attack vector / Impact:** 未认证攻击者枚举他人草稿/被拒模板的元数据（名称、描述、作者）。
**What needs to change:** 非公开状态查询必须要求 admin 认证（与 /admin/list 相同检查），公开列表固定 status='published'。

## [bsw-templates 详情接口未校验可见性（IDOR）]
**File:** packages/@yuletech/api-server/src/routes/bswTemplates.ts:230-284（含 448-461 versions）
**Severity:** warning
**Type:** security
**What is wrong:** `GET /:id` 与 `GET /:id/versions` 直接按 id 返回，无 isPublic/visibility/status 检查，返回内容含完整 `configData`（用户完整配置）。
**Attack vector / Impact:** 未认证用户遍历 id 即可读取他人 private/draft 模板的完整配置数据（知识产权/敏感参数泄露）。
**What needs to change:** 非公开模板仅作者/admin 可读；公开列表外的 status 一律 404。

## [列表接口无分页/无上限的全表查询（多处）]
**File:** packages/@yuletech/api-server/src/routes/posts.ts:25-32；qa.ts:64-78；blog.ts:25-30；community.ts:32-48
**Severity:** warning
**Type:** performance
**What is wrong:** posts、questions、blog posts 列表均 `findMany` 全量拉取后再在 JS 侧过滤/排序/分页（SQLite 兼容写法），无 take 限制。
**Attack vector / Impact:** 数据量增长后单请求即拖垮 DB/内存，成为天然 DoS 放大点；每次列表请求 O(N) 传输。
**What needs to change:** 用数据库层分页 + 索引（tags 用关联表或 JSON 查询），把 filter/sort/page 下沉到 SQL。

## [tag 计数循环串行 upsert（N+1 写）]
**File:** packages/@yuletech/api-server/src/routes/posts.ts:97-103；community.ts:113-123, 144-181
**Severity:** suggestion
**Type:** performance
**What is wrong:** 创建/更新帖子时对每个 tag 依次 `await` 查询+写入。
**Attack vector / Impact:** 单帖 10 个 tag 即 20+ 次 DB 往返，高并发下放大 DB 压力。
**What needs to change:** 用 `createMany` + 单条 `UPDATE ... WHERE name IN (...)` 批量，或事务内批量处理。

## [branding /preview 接口存在存储型 CSS 注入]
**File:** packages/@yuletech/api-server/src/routes/branding.ts:157-176
**Severity:** warning
**Type:** security
**What is wrong:** `--brand-logo-url: url(${settings.logoUrl})`、`--brand-company-name: "${settings.companyName || settings.name}"` 直接拼入 CSS 变量，logoUrl/companyName 未做 CSS 转义；这些值由 admin 通过 PUT / 写入且 GET /preview 公开。
**Attack vector / Impact:** 若公司名/logoUrl 可被攻击者影响（如品牌设置被低权限者修改或来自外部源），访客页面样式被劫持，可构造钓鱼/点击劫持；`url(...)` 中可注入 `);` 闭合。
**What needs to change:** 服务端对输出做 CSS 转义（引号、括号、分号），或用 CSSOM 方式设置变量；companyName 移除引号拼接。

## [OIDC/LDAP 用户创建流程：邮箱未验证即创建账户]
**File:** packages/@yuletech/api-server/src/routes/auth-sso.ts:124-162, 233-268
**Severity:** warning
**Type:** security
**What is wrong:** 以 IdP 返回的 email 直接 find-or-create，`${ssoId}@oidc.local` / `${username}@ldap.local` 兜底邮箱也可能入库；未验证邮箱所有权。
**Attack vector / Impact:** 攻击者可通过自有 IdP 账号用目标邮箱注册，抢占邮箱对应的社区账号（account pre-hijacking）。
**What needs to change:** 邮箱冲突时要求绑定验证；兜底邮箱标记为未验证并禁止用于关键操作。

## [未注册的"死代码"路由（community/configs/share）]
**File:** packages/@yuletech/api-server/src/routes/community.ts、configs.ts、share.ts
**Severity:** suggestion
**Type:** security
**What is wrong:** 这三个 drizzle 版路由文件未在 index.ts 注册（已确认无引用），属死代码；其中 configs.ts 的 update 有锁检查、ownership 检查（本身写得不差），community.ts 的 `sql\`${query.tag} = ANY(...)\`` 参数化安全。
**Attack vector / Impact:** 死代码若被未来注册而缺少统一鉴权中间件（依赖 `request.user` 由 decorate 注入），存在遗漏风险；当前无运行时影响。
**What needs to change:** 删除或明确注册；若保留，统一走 `authenticate` 前置钩子。

### 该区域其余部分
- auth.ts 登录/注册：zod 校验 + bcrypt(10) + 邮箱/用户名唯一性，基本正确。**但登录/注册无任何限流**（并入下方全局问题）。
- license.ts：key 格式正则校验正确；`generateLicenseKey` 仅 48 位熵（`randomBytes(3)` 取 4 hex×3）且无签名，见全局问题。
- templateReviews.ts / qa.ts 的归属校验（作者/管理员）基本正确。
- db 层（drizzle 参数化、Prisma 参数化）未发现 SQL 注入点。
- seed.ts 仅插入示例模板，无默认管理员凭据，无问题。

---

## 4. packages/@yuletech/core — 核心库

## [条件表达式解析器递归深度无上限，恶意表达式可栈溢出]
**File:** packages/@yuletech/core/src/conditions/parser.ts:271-279, 355-361
**Severity:** warning
**Type:** security
**What is wrong:** `parseNot` 对每个 `!` 递归一层、`parsePrimary` 对每个 `(` 递归进 `parseExpr`；求值器（evaluator.ts:36-40）有 MAX_DEPTH=50 防护，但**解析阶段**没有任何深度限制。
**Attack vector / Impact:** 若条件表达式字符串可来自外部输入（导入的配置/模板/共享配置中的 `visibleWhen` 等字段），构造 `'!'.repeat(1e6)` 或 10 万层括号可让主线程栈溢出崩溃（浏览器标签页 DoS；若在 Node 侧解析则服务崩溃）。
**What needs to change:** 解析器增加显式深度计数（如 > 200 抛错）；对表达式长度设上限（如 4KB）。

## [路径求值对 `__proto__`/`constructor` 键的宽松处理]
**File:** packages/@yuletech/core/src/conditions/evaluator.ts:62-96
**Severity:** suggestion
**Type:** security
**What is wrong:** `paramName in config.parameters` 会沿原型链命中 `__proto__`、`constructor` 等键，返回原型对象（truthy）。
**Attack vector / Impact:** 表达式 `Mod.__proto__ == ...` 可能产生非预期真值，影响可见性/启用逻辑；非直接漏洞但属原型污染边缘问题。
**What needs to change:** 用 `Object.prototype.hasOwnProperty.call(config.parameters, paramName)` 替代 `in`。

## [外部插件无沙箱动态加载（明确注释"Phase 2 再做"）]
**File:** packages/@yuletech/core/src/plugins/plugin-manager.ts:11, 225-278
**Severity:** warning
**Type:** security
**What is wrong:** `loadExternalPlugins()` 从外部目录 `import()` 任意 .js/.mjs 并执行其 `activate()`，无 vm 沙箱、无来源校验、无签名。
**Attack vector / Impact:** 谁能在插件目录投放文件即可在服务/应用进程内执行任意代码；叠加 api-server 的插件管理 API 无认证（见上），攻击面进一步放大。
**What needs to change:** 插件加载加签名/哈希校验与来源白名单；落地 vm 沙箱或 worker 隔离；插件 API 加认证。

## [C 代码生成器字符串值未转义，可注入任意 C 代码]
**File:** packages/@yuletech/core/src/generator/autosar-format.ts:40-41, 58-62；packages/@yuletech/core/src/generator/ecuc-generator.ts:598-605
**Severity:** warning
**Type:** security
**What is wrong:** `formatCValue('string')` 返回 `"${value}"`，`formatPrimitiveValue` 同理，均未转义 `"` `\` 换行；值来自用户配置（可来自共享配置/市场模板——服务端对 `configData`/`modules` 是 `z.any()` 全放行）。
**Attack vector / Impact:** 恶意模板携带 `value = 'x"\n#include "evil.h"\n//'` 即可在生成的头文件/源文件中注入任意 C 代码。生成代码会被用户用 gcc 编译进固件，构成供应链式代码注入（开发者若不经审查直接编译即中招）。
**What needs to change:** 字符串字面量转义（`\"`、`\\`、`\n` 等），宏名/标识符用 `[A-Za-z0-9_]` 白名单过滤，并在生成器出口统一 sanitize。

## [arxml-parser 参数名写入普通对象，`__proto__` 键触发原型污染]
**File:** packages/@yuletech/core/src/adapters/arxml-parser.ts:46-71
**Severity:** suggestion
**Type:** security
**What is wrong:** `parameters[paramName] = value`，paramName 来自 ARXML 文件（用户可控），若为 `__proto__` 会触发对象原型 setter（赋值对象时污染原型）。
**Attack vector / Impact:** 恶意 ARXML 可造成原型污染，影响同进程其他对象的 `in`/继承查找（低危，浏览器 DOMParser 场景下影响有限）。
**What needs to change:** 使用 `Object.create(null)` 或 Map 存储参数；对键名做白名单。

### 该区域其余部分
- 条件求值器本身有 MAX_DEPTH 防护、短路求值，设计良好。
- 生成器（os/swc/rte）为字符串拼接，除上述注入点外未发现 eval/exec。
- schema-extractor 仅做正则解析静态数据，无执行风险。

---

## 5. apps/yuleasr-web — Web 配置器

## [JWT 存储于 localStorage，且角色信息客户端可伪造]
**File:** apps/yuleasr-web/src/stores/authStore.ts:39-40, 56-57, 77-91
**Severity:** warning
**Type:** security
**What is wrong:** token 与 `user`（含 role）持久化在 localStorage；`loadFromStorage` 直接信任本地 JSON 里的 `role` 字段。
**Attack vector / Impact:** 任意 XSS 可直接读取 token（无 HttpOnly 保护）；用户可手工改 localStorage 把 role 改成 admin 获得 UI 级管理员入口（服务端若未复核角色则升级为越权）。
**What needs to change:** token 改用 HttpOnly cookie（SameSite=Lax/Strict）或 sessionStorage + 短有效期；角色一律以服务端 `/me` 返回为准。

## [配置校验在热路径上全量执行且每次重建 schema 集合]
**File:** apps/yuleasr-web/src/stores/configStore.ts:318-375（updateParameter），52-84（validateCrossModuleChanges），448-463（validateConfig）
**Severity:** warning
**Type:** performance
**What is wrong:** 每次参数编辑（含打字过程）都：① `map` 重建全部模块数组并深拷贝参数对象；② 重建 `DependencyValidator` 全量校验；③ `validateCrossModuleChanges` 每次重新构造 `[...defaultMcuSchema, ...schemaExtractor.getAllSchemas(), ...loadModuleSchemas()]` 的 schema 数组并 new CrossModuleValidator。37 个模块规模下每次击键 O(模块×参数) 且含 schema 装配开销。
**Attack vector / Impact:** 大配置下编辑器明显卡顿（输入延迟、掉帧），影响核心编辑体验。
**What needs to change:** ① schema 集合模块级缓存（模块加载时构建一次）；② 校验防抖/节流（如 100-200ms）或迁移到 Web Worker；③ 仅对受影响模块做增量校验。

## [loadFromCloud 顺序 N+1 拉取每个配置详情]
**File:** apps/yuleasr-web/src/stores/configStore.ts:640-651
**Severity:** warning
**Type:** performance
**What is wrong:** 对列表里每个未缓存配置串行 `await api.get('/api/configs/:id')`。
**Attack vector / Impact:** 50 个配置 = 50 次串行请求，首屏加载时间线性增长。
**What needs to change:** 批量接口（`GET /api/configs?ids=...`）或 Promise.all 并发 + 上限；列表接口直接携带摘要数据。

## [配置审计报告 HTML 生成未转义，导出文件可含脚本]
**File:** apps/yuleasr-web/src/services/configReportGenerator.ts:396-430（模板插值）
**Severity:** warning
**Type:** security
**What is wrong:** `generateAuditReport` 用模板字符串把 `config.name`、模块名、参数值、校验信息等直接拼入 HTML，无任何 HTML 转义；这些值可来自导入的共享配置/模板（攻击者可控）。
**Attack vector / Impact:** 用户下载并本地打开审计报告时，嵌入的 `<script>`/事件属性在本地上下文执行（file:// 下可读取同目录文件），构成存储型 XSS 的本地触发变体。
**What needs to change:** 所有插值经 `escapeHtml()`；文件名（line 442）已做白名单处理，正确。

## [代码生成（web 层）字符串宏值原样输出，可注入 C 代码]
**File:** apps/yuleasr-web/src/services/codegen.ts:103-115（formatMacroValue）, 222
**Severity:** warning
**Type:** security
**What is wrong:** 字符串参数值不经引号/转义直接进 `#define ${macro} ${value}`；参数名/模块 id 同样未净化。
**Attack vector / Impact:** 同 core 生成器问题：恶意共享配置/模板导入后可向生成的头文件注入任意 C 代码（`\n#include ...`）。
**What needs to change:** 字符串值 C 转义 + 标识符白名单；与 core 生成器共用一套 sanitize 工具。

## [yuleOSH 本地服务调用无认证、默认指向 localhost:8080]
**File:** apps/yuleasr-web/src/services/yuleoshPipeline.ts:8, 74-89
**Severity:** warning
**Type:** security
**What is wrong:** `VITE_YULEOSH_API_URL` 默认 `http://127.0.0.1:8080`，前端直接 fetch 该服务，无认证头；请求体含完整配置 JSON。
**Attack vector / Impact:** ① 任意网页可通过 DNS rebinding/localhost CSRF 诱导浏览器向本地 8080 服务发请求（若该服务无 CORS/鉴权，可被第三方站点利用）；② 敏感配置经明文 HTTP 传输。
**What needs to change:** 经后端代理转发（服务端鉴权），或要求 yuleOSH 侧鉴权 + HTTPS；前端校验响应来源。

## [license 特性开关纯客户端实现，可被 localStorage 篡改绕过]
**File:** apps/yuleasr-web/src/stores/licenseStore.ts:73-100, 135-151, 186-205
**Severity:** warning
**Type:** security
**What is wrong:** 服务端不可达时回退到 localStorage 缓存的 tier/features；`hasFeature/getFeatureLimit` 只读本地状态。编辑 `yuleasr_license` 即可离线获得 Pro 能力（arxmlExport 等）。
**Attack vector / Impact:** 授权体系可被廉价绕过（对纯本地工具影响有限，但对"Pro 功能"销售模型构成实质破坏）。
**What needs to change:** 关键功能（导出/生成）由服务端校验 license 或对生成结果签名；本地缓存仅作弱降级并标注"离线试用"。

## [全局搜索每次击键全配置线性扫描]
**File:** apps/yuleasr-web/src/components/GlobalSearch.tsx:35-162, 205-212
**Severity:** suggestion
**Type:** performance
**What is wrong:** 每个防抖周期（150ms）对全部模块/容器/参数/OS 对象做 `toLowerCase().includes` 扫描，结果截断 50。
**Attack vector / Impact:** 配置规模增大后搜索输入延迟；功能正确但可优化。
**What needs to change:** 建立模块级倒排索引（useMemo 缓存），或移入 Web Worker。

### 该区域其余部分
- api.ts：`Authorization: Bearer` 拼接正确、401 统一清理跳转；`/api/*` 与后端 `/v1/*` 前缀不一致疑似代理层处理（未在本次范围确认，建议核对部署配置，见全局问题）。
- Editor.tsx 导入/导出、DiffViewer、Compare 等文件下载均用 Blob + revokeObjectURL，无问题。
- 未发现 eval/new Function/dangerouslySetInnerHTML 使用（源码层面）。

---

## 6. apps/yulecommunity — 社区站

## [管理后台硬编码管理员口令（客户端源码内）]
**File:** apps/yulecommunity/src/hooks/useAdminAuth.ts:4-5（admin / yuletech2026）；src/admin/pages/Login.tsx:41-50（admin@example.com / admin123）
**Severity:** critical
**Type:** security
**What is wrong:** 管理后台认证完全在客户端：一个硬编码口令常量、一个"API 失败即降级 mock 登录"。任何拿到站点 JS 的人都能直接读出口令。
**Attack vector / Impact:** 任何人可用公开口令登录管理后台；叠加 adminStore 的客户端 RBAC（permissions.ts:62-65）与 AdminUsers/AdminSettings 直接读写 localStorage 的"用户管理"，等于管理员权限完全公开。
**What needs to change:** 删除所有硬编码口令与 mock 降级；管理后台认证必须走服务端（admin 角色校验 + 服务端授权中间件）。

## [useAuth 登录失败自动降级为"接受任意密码"的本地 mock 登录]
**File:** apps/yulecommunity/src/hooks/useAuth.ts:91-104, 134-148
**Severity:** critical
**Type:** security
**What is wrong:** `fetch` 抛错（后端不可用/网络故障）时，任意 email+password 都被视为登录成功，并写入 sessionStorage 的 user/token；register 同理。
**Attack vector / Impact:** 后端故障窗口期等于认证完全失效；用户对象存于 sessionStorage 可被手工改成 `role: 'admin'`，配合 adminStore 客户端鉴权实现提权。
**What needs to change:** 移除 mock 降级（或仅限 `import.meta.env.DEV` 且打明显标识）；认证状态一律以服务端校验为准。

## [adminStore 令牌与角色持久化于 sessionStorage，权限判断全在客户端]
**File:** apps/yulecommunity/src/admin/stores/adminStore.ts:73-83；src/admin/utils/permissions.ts:62-65
**Severity:** critical
**Type:** security
**What is wrong:** token/refreshToken/user 持久化到 sessionStorage，`checkPermission/checkAdminAccess` 仅凭本地 user.role 判断；AdminUsers.tsx:101 等页面直接读写 localStorage 的 `yuletech-user-system` 完成"用户管理"。
**Attack vector / Impact:** 攻击者改一个 localStorage/sessionStorage 值即可获得 super_admin 界面与全部"管理"能力；若后端存在对应 API 且信任前端角色，即完整越权。
**What needs to change:** 管理端所有写操作由服务端做角色/所有权校验；前端角色仅用于 UI 呈现。

## [Markdown 渲染器 DOMPurify 在 markdown 解析之前执行，javascript: 链接可绕过]
**File:** apps/yulecommunity/src/components/blog/MarkdownRenderer.tsx:210-219, 270-307
**Severity:** warning
**Type:** security
**What is wrong:** 先对原文做 DOMPurify（HTML 层面），再交给 ReactMarkdown 解析；markdown 链接语法 `[x](javascript:alert(1))` 不是 HTML，DOMPurify 不处理，ReactMarkdown 又无 rehype-sanitize，最终渲染 `<a href="javascript:...">`（自定义 `a` 组件直接透传 href）。
**Attack vector / Impact:** 博客/评论内容若含此类链接，点击即执行脚本（BlogDetailPage:408 用此组件渲染内容）。当前博客作者多为管理员，但任何用户可投稿场景即存储型 XSS。
**What needs to change:** 在自定义 `a`/`img` 组件中校验 URL 协议白名单（http/https/mailto），或加 rehype-sanitize；DOMPurify 增加 `ALLOWED_URI_REGEXP` 亦需在解析后层再做一次。

## [GitHub Token 存 localStorage，且代码内提示用户手工写入]
**File:** apps/yulecommunity/src/services/gitHubClient.ts:8, 35-39, 62-64
**Severity:** warning
**Type:** security
**What is wrong:** `yuletech_github_token` 明文存 localStorage；console.warn 直接打印 `localStorage.setItem('yuletech_github_token', 'ghp_xxx')` 引导用户（开发残留）。
**Attack vector / Impact:** XSS 即可窃取用户 GitHub PAT（ghp_ 权限可含 repo 写权限）；开发提示不应出现在生产代码。
**What needs to change:** 移除提示；PAT 经服务端代理存储/使用，前端用短时授权。

## [积分经济体系客户端可自行发奖（localStorage + earnPoints 任意 action）]
**File:** apps/yulecommunity/src/hooks/usePoints.ts:145-184；src/hooks/useUserSystem.ts:36-47, 91-101
**Severity:** warning
**Type:** security
**What is wrong:** 本地积分直接存 localStorage（可改）；登录后 `userApi.earnPoints(action)` 的 action 由客户端任意传（'article.publish': 50 分可反复刷），服务端（若有对应路由）必须自行校验动作白名单与每日上限。
**Attack vector / Impact:** 排行榜/等级体系可被刷分污染；若积分与权益（兑换、解锁）挂钩则直接经济损失。
**What needs to change:** 积分变更全部服务端判定（动作+频率+上限），客户端只展示。

## [qaApi 读取的 token key 与 useAuth 写入的 key 不一致]
**File:** apps/yulecommunity/src/services/qaApi.ts:11（读 'yulecommunity_token'/'token'）；src/hooks/useAuth.ts:29（写 'yuletech:auth:token'）
**Severity:** suggestion
**Type:** security
**What is wrong:** token 存取键不一致，QA 接口实际拿不到有效 token（登录后 QA 写操作会 401）。
**Attack vector / Impact:** 功能性缺陷 + 隐性安全隐患（多套 token 管理容易在某处漏校验）。
**What needs to change:** 统一 token 存取（建议收敛到 userApi.setToken 单例）。

### 该区域其余部分
- ForumPage/QAPage/QAQuestion/BlogPage 等内容渲染均为 React 文本节点或 whitespace-pre-wrap，无 innerHTML，安全。
- StructuredData 用 `script.textContent` 赋值，无 JSON-LD 注入。
- NewsletterSignup 为纯 mock（无网络请求），无数据外发。
- CodeBlock 使用 react-syntax-highlighter（Prism 分词渲染），无 HTML 注入。
- 大量 localStorage 存储（博客点赞、搜索历史、主题）均为非敏感数据，无问题。

---

## 7. packages/yuleasr-editor-core 及其他

## [isomorphic-git 克隆经第三方 CORS 代理，仓库内容外发]
**File:** packages/yuleasr-editor-core/src/services/gitService.ts:81, 117-127
**Severity:** warning
**Type:** security
**What is wrong:** `corsProxy: 'https://cors.isomorphic-git.org'` 作为默认值，clone/fetch 的 HTTP 流量（含仓库内容与可能的凭据）经第三方代理转发。
**Attack vector / Impact:** 敏感代码仓库内容暴露给第三方代理服务商；若 URL 中带 token 则凭据泄露。
**What needs to change:** 自建代理或直连（服务端代理）；移除默认第三方代理。

## [gitService 分支/差异计算 N+1 与潜在 O(n²) diff]
**File:** packages/yuleasr-editor-core/src/services/gitService.ts:204-216（每分支串行 resolveRef）；358-421（每文件串行读内容 + computeDiffHunks）
**Severity:** suggestion
**Type:** performance
**What is wrong:** 分支列表逐分支 `await resolveRef`；diff 对每个文件逐个 readFileContent，hunk 计算若基于朴素 LCS 在大文件上为 O(n·m)。
**Attack vector / Impact:** 大仓库/多分支下操作延迟明显。
**What needs to change:** 并行 resolveRef（Promise.all）、diff 按需惰性读取、hunk 用 Myers diff。

## [HistoryManager 有界（100 条）设计正确]
**File:** packages/yuleasr-editor-core/src/engine/index.ts:44-140
**Severity:** 无问题
**Type:** performance
**What is wrong:** 无。历史记录有 maxSize 截断，undo/redo 正确。
**Attack vector / Impact:** —
**What needs to change:** —

## [@yuletech/api-client / @yuletech/utils 为空壳]
**File:** packages/@yuletech/api-client/src/index.ts:1-2；packages/@yuletech/utils/src/index.ts:1-2
**Severity:** 无问题（提示）
**Type:** security
**What is wrong:** 两个包仅 `export {}`，无实际代码，不存在安全面；但说明 monorepo 存在未完成模块。
**Attack vector / Impact:** —
**What needs to change:** 完成实现或从 workspace 移除。

---

## 8. 全局性问题与依赖安全

## [登录/注册/激活等端点完全无限流]
**File:** packages/@yuletech/api-server/src/routes/auth.ts:17-68；license.ts:52-81；auth-sso.ts:191-279
**Severity:** warning
**Type:** security
**What is wrong:** 全服务无任何速率限制（无 @fastify/rate-limit、无 IP/账号维度限流）。
**Attack vector / Impact:** 登录爆破（弱口令）、注册垃圾账号、license validate 枚举、OIDC/LDAP 登录风暴（叠加 LDAP 10s 超时易占满连接）均可无成本执行。
**What needs to change:** 引入 @fastify/rate-limit，登录/注册按 IP+账号双维度限流，敏感端点（webhook、license）单独配额。

## [CORS 配置为 origin: true（反射任意来源）]
**File:** packages/@yuletech/api-server/src/index.ts:30
**Severity:** warning
**Type:** security
**What is wrong:** `await app.register(cors, { origin: true })` 反射请求 Origin。
**Attack vector / Impact:** 任何第三方站点可跨域调用本 API；当前用 Bearer 头（非 cookie）使利用受限，但一旦某端点改用 cookie 或存在 CSRF 类缺陷即放大；同时允许了凭证模式跨域读取响应。
**What needs to change:** 白名单固定前端域名列表（含本地开发域），生产禁止通配。

## [默认监听 0.0.0.0 + 无安全响应头]
**File:** packages/@yuletech/api-server/src/index.ts:23；config.ts:5
**Severity:** suggestion
**Type:** security
**What is wrong:** 默认 HOST=0.0.0.0（公网可达）；未配置 Helmet 类安全头（X-Content-Type-Options、Referrer-Policy、CSP 等）；swagger-ui 暴露在 /docs。
**Attack vector / Impact:** 误部署即暴露服务与 API 文档；缺少安全头放宽浏览器侧防护。
**What needs to change:** 默认绑定 127.0.0.1 或显式要求 HOST；加 @fastify/helmet；/docs 生产环境关闭或加认证。

## [license key 仅 48 位熵且无签名，validate 未认证]
**File:** packages/@yuletech/api-server/src/routes/license.ts:40-43；payment.ts:39-42
**Severity:** suggestion
**Type:** security
**What is wrong:** `randomBytes(3)` 的 hex 截 4 位 ×3 段 ≈ 48 bit 熵，无 HMAC/签名；`POST /validate` 无需认证且按 key 查库。
**Attack vector / Impact:** 在线暴力枚举 2^48 不可行，但 key 可被共享/转卖；无签名意味着任何有 DB 写权限者均可造 key；激活存在双用户并发绑定竞态（license.ts:110-118）。
**What needs to change:** 用 HMAC-SHA256(key) 签名（密钥服务端持有）校验合法性；激活加事务/唯一约束防竞态。

## [依赖安全：未发现显式安全扫描配置]
**File:** package.json / pnpm-lock.yaml（仓库根）
**Severity:** suggestion
**Type:** security
**What is wrong:** 未发现 `pnpm audit`/`npm audit` 门槛、Dependabot/renovate 配置或 CI 依赖漏洞检查；锁文件 491KB 依赖面较大（fastify、prisma、electron、isomorphic-git、react-markdown、dompurify、bcryptjs 等）。本次审查未逐一核对各依赖 CVE。
**Attack vector / Impact:** 已知漏洞依赖（如历史版本的 electron、prisma、undici 等）可能被利用。
**What needs to change:** 接入 `pnpm audit` 到 CI（阻止 critical 级别合并）；为 electron/autoUpdater 配置签名公钥校验更新包；定期升级并核对 CHANGELOG。

## [前端与后端路由前缀不一致（/api/* vs /v1/*）]
**File:** apps/yuleasr-web/src/services/api.ts:39；packages/@yuletech/api-server/src/index.ts:60-76
**Severity:** suggestion
**Type:** security
**What is wrong:** 前端调用 `/api/auth/login`、`/api/configs` 等，后端注册前缀为 `/v1/auth`、`/v1/api/*`；configs（drizzle）路由甚至未注册。若部署无网关重写，云同步/登录实际走不通（前端静默降级 localStorage）。
**Attack vector / Impact:** 功能失效 + "静默降级"掩盖问题（降级逻辑本身是安全弱点，见 useAuth/licenseStore）。
**What needs to change:** 统一路由前缀契约，删除前端静默降级逻辑，用 e2e 测试锁住连通性。

---

## 9. 无问题区域说明

以下区域经审查未发现 security/performance 问题：

- **数据/静态 schema 文件**（apps/yuleasr-web/src/data/*.ts、apps/yulecommunity/src/data/**、autosar-headers、spec 等）：均为编译期静态数据，无用户输入路径，快速扫过未发现注入点。
- **@yuletech/ui**：纯受控组件（Button/Input/Modal/Select/Tree），无 innerHTML/eval，无状态泄漏。
- **i18n、BrandContext、ThemeProvider、useMediaQuery/useFeatureGate/useModuleLayout 等 hooks**：无网络、无存储敏感数据。
- **yuleasr-web 的 compareEngine/ConfigComparer/DependencyValidator/ParameterValidator**：纯计算逻辑，输入均为内部配置对象，未发现越界/原型污染（除已列 evaluator 的 `in` 用法）。
- **yuleasr-editor-core 的 sync/index.ts、generators/rte-external.ts、models**：未发现危险模式。
- **ARXML 导入/导出（DOMParser/XMLSerializer 方向）**：浏览器 DOMParser 不解析外部实体（无 XXE）；导出有 xmlEncode。
- **各类 Vitest/tsup/vite 配置文件**：无运行时风险。

---

## 汇总统计

| 严重级别 | 数量 | 关键项 |
|---|---|---|
| **critical** | 8 | Electron 命令注入；Electron 路径遍历；JWT 默认密钥；LDAP 关证书校验；LDAP 过滤器注入；支付 webhook 无签名校验；mock-success 白嫖 Pro；社区硬编码管理员口令/客户端 mock 登录/客户端管理端（合并 3 项） |
| **warning** | 24 | 导航控制缺失、插件 API 无认证、模板状态/详情 IDOR、列表全表查询、计数可刷、OIDC token 进 URL、CSP unsafe-eval、C 代码注入、审计报告 XSS、Markdown javascript: 链接、JWT localStorage、license 客户端绕过、yuleOSH localhost、GitHub PAT、积分刷分、无限流、CORS 反射等 |
| **suggestion** | 12 | 死代码路由、解析器深度限制、N+1 优化、key 熵/签名、依赖审计、路由前缀一致性等 |

**优先修复顺序建议：** ① 所有 critical（Electron IPC 输入净化、JWT 密钥强制、LDAP 安全、支付 mock/webhook 加固、社区认证去 mock 化）；② warning 中与"可被远程利用"相关的（插件 API 鉴权、模板 IDOR、webhook、限流、CSP）；③ 其余按发布节奏排期。
