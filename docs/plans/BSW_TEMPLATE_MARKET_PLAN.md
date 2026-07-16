# BSW 配置模板市场 — 集成实现计划

## 1. 代码结构分析总结

### 1.1 项目架构

```
yuleASR-Configurator/                  # pnpm monorepo
├── apps/
│   ├── yulecommunity/                 # 社区门户 (base: /community/, HashRouter, Vite)
│   │   └── src/
│   │       ├── pages/                 # 页面组件 (含 YuleASRPage, YuleASREditorPage)
│   │       ├── components/            # 共享组件 (含 BSWConfigurator)
│   │       ├── services/              # API 客户端 (apiClient.ts → localhost:3002)
│   │       ├── admin/                 # 管理后台 (dashboard, users, builds, settings)
│   │       └── hooks/                 # 自定义 hooks (useAuth, useAdminAuth)
│   ├── yuleasr-web/                   # 配置器主应用 (base: /configurator/)
│   │   └── src/
│   │       ├── pages/                 # Dashboard, Editor, Templates, LicenseActivation
│   │       ├── stores/                # configStore, authStore, licenseStore, settingsStore
│   │       └── services/              # api.ts → backend, arxml-parser/exporter
│   └── yuleasr-desktop/               # 桌面端
├── packages/
│   └── @yuletech/
│       ├── api-server/                # Fastify + Prisma + SQLite (PORT 3000)
│       │   ├── src/routes/            # auth, blog, posts, license, payment, configs, tags, share
│       │   └── prisma/schema.prisma   # User, ForumPost, BlogPost, LicenseKey, PaymentEvent
│       ├── api-client/                # API 客户端库
│       ├── core/                      # 核心类型/工具
│       └── ui/                        # UI 组件库
```

### 1.2 路由结构（涉及模板功能）

| 路径 | 所属 App | 页面组件 | 说明 |
|------|----------|----------|------|
| `/templates` | yuleasr-web | `Templates.tsx` | 现有模板浏览页（硬编码数据） |
| `/yuleasr` | yulecommunity | `YuleASRPage.tsx` | 配置列表/管理 |
| `/yuleasr/editor/:configId` | yulecommunity | `YuleASREditorPage.tsx` | 配置编辑器 |
| `/admin` | yulecommunity | 后台管理 | users, builds, content, settings |
| `/dashboard` | yuleasr-web | `Dashboard.tsx` | 配置器仪表盘 |

### 1.3 已存在的相关基础设施

1. **许可证系统** — 完整实现：
   - 前端: `yuleasr-web/src/stores/licenseStore.ts`，FEATURES 含 `templateMarketUpload: { free: false, pro: true }`
   - 后端: `api-server/src/routes/license.ts`，完整 validate/activate/status API
   - 数据库: Prisma 表 `LicenseKey`（key, tier, maxModules, maxProjects, userId）

2. **配置存储** — 已有 CRUD：
   - Backend Drizzle schema: `configs` 和 `config_versions` 表
   - 后端路由 `configs.ts`: list, get, create, update, remove, getVersions, getByShareToken

3. **模板预览** — 已有但硬编码：
   - `yuleasr-web/src/pages/Templates.tsx` 中定义本地模板数组
   - 模板数据包含 module 列表和分类（mcal, ecual, service, full）

4. **BSW 配置器组件** — 已有：
   - `yulecommunity/src/components/BSWConfigurator.tsx`（507 行）
   - 包含完整 MCAL/ECUAL/Service/RTE 模块定义（Mcu, Port, Can, Dcm 等）

5. **用户认证** — 两套系统：
   - yulecommunity: `useAuth` hook（本地 localStorage，role: user/vip/admin）
   - yuleasr-web: `authStore`（Zustand + localStorage）
   - 后端: JWT 认证（Fastify jwt plugin）

### 1.4 yulecommunity 和 yuleasr-web 的关系

- **独立部署**：两个独立的 Vite 应用，`/community/` 和 `/configurator/` 不同 base path
- **共享后端**：都指向 `@yuletech/api-server`（Fastify + Prisma，Port 3000）
- **用户系统独立**：各自管理 localStorage 中的 token，但共享后端 JWT
- **许可证共享**：yuleasr-web 有完整的 licenseStore，yulecommunity 暂无许可证判断
- **模板市场定位**：yulecommunity 作为"社区市场"展示模板，yuleasr-web 作为"编辑器"使用模板

---

## 2. BSW 配置模板市场功能规划

### 2.1 功能定义

| 功能 | 描述 | 免费用户 | Pro 用户 | Admin |
|------|------|----------|----------|-------|
| 浏览模板市场 | 查看所有公开模板 | ✅ | ✅ | ✅ |
| 搜索/过滤模板 | 按名称、分类、标签搜索 | ✅ | ✅ | ✅ |
| 模板详情预览 | 查看模板模块和参数详情 | ✅ | ✅ | ✅ |
| 下载/导入模板 | 将模板导入到编辑器 | ✅ | ✅ | ✅ |
| 上传模板 | 将当前配置另存为模板 | ❌ | ✅ | ✅ |
| 更新模板版本 | 发布新版本 | ❌ | ✅ | ✅ |
| 管理自己模板 | 编辑/删除自己的模板 | ❌ | ✅ | ✅ |
| 审核模板（Admin） | 审核、下架、删除模板 | — | — | ✅ |
| 统计查看（Admin） | 下载量、评分、趋势 | — | — | ✅ |

### 2.2 数据模型

#### 新增 Prisma Schema

```prisma
// BSW 模板市场 — 模板主表
model BSWTemplate {
  id          Int       @id @default(autoincrement())
  name        String                    // 模板名称
  description String                    // 描述
  category    String                    // mcal | ecual | service | full | bsw
  tags        String    @default("[]")  // JSON 数组字符串
  icon        String?                   // 图标的 Emoji 或 URL
  modules     String    @default("[]")  // JSON array of { id, name, layer, parameters }
  data        Json?                     // 完整的 ConfigFile JSON

  // 版本管理
  version           Int       @default(1)
  latestVersionId   Int?                  // 指向最新版本的 ID

  // 统计
  downloadCount   Int       @default(0)
  viewCount       Int       @default(0)
  favoriteCount   Int       @default(0)

  // 状态 & 权限
  status          String    @default("draft")   // draft | published | rejected | archived
  visibility      String    @default("public")   // public | private | team
  isOfficial      Boolean   @default(false)      // 官方模板标记
  minTier         String    @default("free")      // 使用所需最低 tier: free | pro

  // 关联
  authorId        Int
  author          User      @relation(fields: [authorId], references: [id])
  reviewedById    Int?
  reviewedBy      User?     @relation("BSWTemplateReviewer", fields: [reviewedById], references: [id])

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // 版本历史（自关联）
  versions        BSWTemplateVersion[]
}

// 模板版本历史
model BSWTemplateVersion {
  id          Int      @id @default(autoincrement())
  templateId  Int
  template    BSWTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  version     Int
  name        String
  description String
  modules     String   @default("[]")
  data        Json?
  changelog   String?
  createdAt   DateTime @default(now())
}
```

#### 前端 TypeScript 类型（新增 `types/bswTemplate.ts`）

```typescript
// 在 yulecommunity 或共享包中定义

export type TemplateCategory = 'mcal' | 'ecual' | 'service' | 'full' | 'bsw'
export type TemplateStatus = 'draft' | 'published' | 'rejected' | 'archived'
export type TemplateVisibility = 'public' | 'private' | 'team'

export interface TemplateModule {
  id: string
  name: string
  layer: 'MCAL' | 'ECUAL' | 'Service' | 'RTE'
  parameters?: Record<string, any>
}

export interface BSWTemplate {
  id: number
  name: string
  description: string
  category: TemplateCategory
  tags: string[]
  icon?: string
  modules: TemplateModule[]
  version: number
  downloadCount: number
  viewCount: number
  favoriteCount: number
  status: TemplateStatus
  visibility: TemplateVisibility
  isOfficial: boolean
  minTier: 'free' | 'pro'
  author: {
    id: number
    username: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
}

export interface BSWTemplateVersion {
  id: number
  templateId: number
  version: number
  name: string
  description: string
  modules: TemplateModule[]
  changelog?: string
  createdAt: string
}

export interface BSWTemplateUpload {
  name: string
  description: string
  category: TemplateCategory
  tags: string[]
  icon?: string
  modules: TemplateModule[]
  data?: any
  visibility?: TemplateVisibility
}

export interface BSWTemplateListParams {
  category?: TemplateCategory
  search?: string
  tag?: string
  sortBy?: 'downloads' | 'date' | 'name'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
  authorId?: number
  status?: TemplateStatus
}
```

### 2.3 API 端点设计

| 方法 | 端点 | 权限 | 说明 |
|------|------|------|------|
| GET | `/api/bsw-templates` | 公开 | 列出公开模板，支持分页/搜索/过滤 |
| GET | `/api/bsw-templates/:id` | 公开 | 获取模板详情 |
| GET | `/api/bsw-templates/:id/versions` | 公开 | 获取版本历史 |
| GET | `/api/bsw-templates/:id/versions/:versionId` | 公开 | 获取特定版本详情 |
| POST | `/api/bsw-templates` | Pro/Admin | 创建模板（上传） |
| PUT | `/api/bsw-templates/:id` | 作者/Admin | 更新模板元数据 |
| DELETE | `/api/bsw-templates/:id` | 作者/Admin | 删除模板 |
| POST | `/api/bsw-templates/:id/versions` | 作者/Admin | 发布新版本 |
| POST | `/api/bsw-templates/:id/download` | 登录用户 | 下载模板（计数+1） |
| PUT | `/api/bsw-templates/:id/status` | Admin | 审核模板（发布/驳回/归档） |
| GET | `/api/bsw-templates/admin/list` | Admin | 管理员查看所有模板（含审核队列） |
| GET | `/api/bsw-templates/my` | 登录用户 | 查看我的模板 |

### 2.4 前端页面/组件清单

#### A. yulecommunity — 模板市场（社区端）

| 文件 | 类型 | 说明 |
|------|------|------|
| `src/pages/BSWTemplateMarketPage.tsx` | **新页面** | 模板市场主页：搜索/过滤/分类浏览 |
| `src/pages/BSWTemplateDetailPage.tsx` | **新页面** | 模板详情：模块预览、版本历史、下载 |
| `src/components/BSWTemplateCard.tsx` | **新组件** | 模板卡片（在市场中展示） |
| `src/components/BSWTemplateUploadModal.tsx` | **新组件** | 上传/发布模板弹窗 |
| `src/components/BSWTemplateVersionHistory.tsx` | **新组件** | 版本历史列表 |
| `src/components/BSWTemplatePreview.tsx` | **新组件** | 模板模块/参数预览面板 |
| `src/services/bswTemplateApi.ts` | **新服务** | BSW 模板 API 服务类 |
| `src/types/bswTemplate.ts` | **新类型** | BSW 模板类型定义 |
| `src/hooks/useLicenseCheck.ts` | **新 Hook** | 检查用户是否有权限（免费/Pro） |

**集成到路由**（`CommunityRoutes.tsx` 修改）：
```
/templates-market                → BSWTemplateMarketPage
/templates-market/:id            → BSWTemplateDetailPage
/templates-market/:id/versions   → BSWTemplateDetailPage (versions tab)
/yuleasr                         → YuleASRPage (已有)
```

**Navbar 添加菜单项**："模板市场" 链接到 `/templates-market`

#### B. yulecommunity — Admin 后台管理

| 文件 | 类型 | 说明 |
|------|------|------|
| `src/admin/pages/TemplateManagement.tsx` | **新页面** | 模板管理：列表/搜索/审核操作 |
| `src/admin/pages/TemplateReview.tsx` | **新页面** | 模板审核详情：查看/发布/驳回 |

**Admin 侧边栏添加**：新菜单项 "模板管理" → `/admin/templates`
Admin 路由（`CommunityRoutes.tsx`）：
```
/admin/templates             → TemplateManagement (模板列表)
/admin/templates/:id         → TemplateReview (模板审核详情)
```

#### C. yuleasr-web — 集成点

| 文件 | 修改 | 说明 |
|------|------|------|
| `src/pages/Templates.tsx` | **修改** | 添加"浏览社区模板市场"入口、从社区导入模板 |
| `src/stores/configStore.ts` | **修改** | 添加 `importTemplate` action |
| `src/services/api.ts` | **修改** | 添加 bsw-templates 端点 |

**Templates 页面修改**：
- 现有硬编码模板保留为"本地推荐模板"
- 底部或侧边栏添加"浏览社区模板市场"入口
- "从模板导入"按钮将调用 API 获取模板数据并创建新配置

**编辑器中添加**：
- YuleASREditorPage / Editor 中添加"发布到模板市场"按钮（仅 Pro 用户）
- 调用 `POST /api/bsw-templates` 将当前配置保存为模板

### 2.5 文件修改清单（按文件）

#### yulecommunity 修改

```
# 新增文件
src/types/bswTemplate.ts
src/services/bswTemplateApi.ts
src/pages/BSWTemplateMarketPage.tsx
src/pages/BSWTemplateDetailPage.tsx
src/components/BSWTemplateCard.tsx
src/components/BSWTemplateUploadModal.tsx
src/components/BSWTemplateVersionHistory.tsx
src/components/BSWTemplatePreview.tsx
src/admin/pages/TemplateManagement.tsx
src/admin/pages/TemplateReview.tsx
src/hooks/useLicenseCheck.ts

# 修改文件
src/CommunityRoutes.tsx          # 添加模板市场路由
src/App.tsx                      # 同步路由修改
src/components/Navbar.tsx        # 添加"模板市场"导航项
src/admin/components/Sidebar.tsx # 添加"模板管理"菜单项
src/services/apiClient.ts        # 添加导出 bswTemplate 的类型与端点
```

#### yuleasr-web 修改

```
# 修改文件
src/pages/Templates.tsx          # 添加社区市场入口/导入功能
src/stores/configStore.ts        # 添加 importTemplate action
src/services/api.ts              # 添加 bsw-templates API 端点
src/pages/Editor.tsx             # 添加"发布到模板市场"按钮（Pro only）
```

#### api-server 修改

```
# 新增文件
src/routes/bswTemplates.ts       # 模板市场全部路由

# 修改文件
prisma/schema.prisma             # 添加 BSWTemplate + BSWTemplateVersion 模型
src/index.ts                     # 注册 bswTemplates 路由
prisma/seed.ts                   # 添加示例模板数据
```

---

## 3. 实施步骤

### Phase 1: 后端基础设施（2-3 天）

1. **Prisma schema 扩展** — 添加 `BSWTemplate` 和 `BSWTemplateVersion` 模型
2. **运行迁移** — `npx prisma migrate dev --name add_bsw_templates`
3. **实现路由** — 创建 `src/routes/bswTemplates.ts`（CRUD + 列表 + 版本 + 审核）
4. **注册路由** — 在 `src/index.ts` 注册 `bswTemplates`
5. **种子数据** — 添加初始示例模板（基于现有 Templates.tsx 的硬编码数据）
6. **权限检查** — 路由层拦截 Pro-only 上传操作

### Phase 2: 前端 — 类型 & 服务层（1 天）

1. 在 yulecommunity 创建 `src/types/bswTemplate.ts`
2. 在 yulecommunity 创建 `src/services/bswTemplateApi.ts`
3. 更新 `apiClient.ts` 导出新类型
4. 创建 `useLicenseCheck` hook（检查当前用户是否为 Pro）
5. 在 yuleasr-web 的 `api.ts` 添加模板市场端点

### Phase 3: 前端 — 模板市场页面（3-4 天）

1. `BSWTemplateCard` 组件 — 卡片样式展示模板
2. `BSWTemplatePreview` 组件 — 模块和参数预览面板
3. `BSWTemplateMarketPage` 页面 — 搜索/过滤/分类/分页
4. `BSWTemplateDetailPage` 页面 — 详情 + 版本历史 + 下载
5. `BSWTemplateVersionHistory` 组件 — 版本时间线
6. 路由注册 + Navbar 菜单项

### Phase 4: 上传 & 导入功能（2-3 天）

1. `BSWTemplateUploadModal` 组件 — 表单：名称/描述/分类/标签/权限
2. 编辑器"发布到模板市场"按钮（yuleasr-web Editor.tsx）
3. "浏览社区模板"按钮（yuleasr-web Templates.tsx）
4. 导入流程：点击下载 → 匹配 API → 创建新配置
5. Pro 权限检查：仅 Pro 用户可见上传按钮

### Phase 5: 管理后台（1-2 天）

1. `TemplateManagement` 页面 — 列表/搜索/筛选审核状态
2. `TemplateReview` 页面 — 查看/审核/下架操作
3. 侧边栏添加菜单项
4. 统计信息（下载量趋势、分类分布）

---

## 4. 关键集成点一览

### 4.1 yulecommunity ↔ yuleasr-web 集成

```
yulecommunity (社区市场)                    yuleasr-web (配置器编辑器)
                         ┌──────────────┐
                         │  @yuletech/  │
                         │  api-server  │
                         │  (Fastify)   │
                         └──────┬───────┘
                                │ API
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                  ▼
   ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐
   │ 模板市场浏览       │ │ 上传/发布/管理    │ │ 导入到编辑器   │
   │ BSWTemplateMarket │ │ BSWTemplateUpload│ │ importTemplate│
   │ — 搜索/过滤/预览   │ │ — 仅 Pro 用户    │ │ → createConfig│
   │ — 下载/导入       │ │ — 版本管理       │ │              │
   └──────────────────┘ └──────────────────┘ └──────────────┘
```

### 4.2 许可证/权限检查流程

```
用户点击"上传模板"按钮
        │
        ▼
useLicenseCheck() / hasFeature('templateMarketUpload')
        │
  ┌─────┴─────┐
  │           │
  Yes         No
  │           │
  ▼           ▼
打开上传     显示 Pro 升级弹窗
弹窗        ("升级到 Pro 以发布模板")
```

### 4.3 模板导入编辑器流程

```
用户点击"使用模板" / "导入到编辑器"
        │
        ▼
BSWTemplateApi.getTemplate(id)  →  获取模板数据
        │
        ▼
configStore.createConfig(...)    →  创建新配置
        │
        ▼
configStore.addModule(...)       →  导入模板模块和参数
        │
        ▼
navigate('/yuleasr/editor/:newConfigId')
```

---

## 5. 注意事项

1. **数据库中存储 `modules` 为 JSON 字符串**：SQLite 不支持原生 JSON 字段，故使用 `@default("[]")` 字符串 + 代码中 `JSON.parse/stringify`
2. **两套前端 app 共享 token**：理想情况下应共享同一 localStorage key，目前各自独立。建议在集成时统一 token key 名
3. **Fastify 的 `authenticate` decorator**：认证路由需统一使用 `{ onRequest: [(app as any).authenticate] }`
4. **模板数据格式兼容**：现有 `Templates.tsx` 中模块格式为 `{ id, name, layer }`，需扩展支持 `parameters`
5. **PWA 离线缓存**：`vite-plugin-pwa` 配置了 API 路由 `/^https:\/\/api\./i` 的 NetworkFirst 策略，新模板 API 需确保 URL 匹配
6. **桌面端 (yuleasr-desktop) 和 VS Code 扩展 (yuleasr-vscode)**：暂不修改，但未来可集成模板市场 API

---

## 6. 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Prisma 和 Drizzle 两套 ORM 共存 | 架构复杂度高 | 逐步统一到 Prisma；新功能全部使用 Prisma |
| yulecommunity 和 yuleasr-web token 不共享 | 用户需分别登录 | 统一 localStorage key（如 `yuleasr_token`） |
| 模板数据量增长可能导致性能问题 | 页面加载慢 | 后端分页 + 前端虚拟列表 |
| 用户上传恶意模板内容 | 安全风险 | 后端审核机制 + 内容长度验证 + XSS 防护 |

---

## 7. 总结

BSW 配置模板市场将充分利用现有资源：
- **已有**：许可证系统（Pro/Free）、配置 CRUD、BSW 模块定义、模板 UI 组件
- **新增**：BSWTemplate 数据模型、模板市场 API、社区前端页面、管理后台审核
- **集成**：yulecommunity 作为市场前端 ↔ yuleasr-web 编辑器通过导入/上传连接

总预计工期：**10-13 人天**（后端 3-4 天 + 前端 7-9 天）
