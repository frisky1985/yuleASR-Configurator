# Implementation Plan — ultra-full — 2026-08-01

> 依据
> `synthesis.md`（综合三份审查报告）制定的具体实施计划。编号与 synthesis 的 Critical
> #1–#19 一一对应，warnings 为 Fix
> 20+。所有代码均为基于当前源码（已逐行核对）的真实改动，非伪代码。执行原则：**先止血（数据丢失）→ 再堵洞（安全）→ 后收敛（架构决策）→ 最后清理（warnings/suggestions）**。

---

## Summary

### 要修什么

| 类别                                  | 内容                                                                                                                                               | 数量                         |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| 数据丢失 / 核心功能失效（Critical A） | 参数编辑静默失败（C1）、动态实例不持久化（C2）、Web↔Server API 全链路断裂（C3）、isCloudSynced 假成功（C4）                                        | 4                            |
| 安全 critical（Critical B）           | Electron IPC 命令注入/路径遍历、JWT 默认密钥、LDAP 注入/关证书校验、支付 webhook/mock、社区端认证形同虚设、插件端点无鉴权+无沙箱、community 空类型 | 9                            |
| 架构腐化（Critical C）                | 双 ORM、Git stub/假实现、editor-core 零消费者、空包、条件引擎零消费者、双 ARXML/双 codegen、验证双轨                                               | 7（均为"收敛决策+最小落地"） |
| Warnings                              | core K1–K12、web W1–W11、api-server、editor-core E1–E7、vscode、community、跨包                                                                    | 40+（Fix 20–32 分组覆盖）    |
| Suggestions                           | 见文末简表                                                                                                                                         | 20+（简表）                  |

### 工作量估计（人日，1 人日 = 1 名工程师 8h）

| 批次     | 内容                               | 估计              | 说明                                                  |
| -------- | ---------------------------------- | ----------------- | ----------------------------------------------------- |
| Batch A  | Fix 1–4（数据丢失）                | 2.5–3.5 人日      | 含 configStore 单测；C2 涉及 ConfigTree 较大重构      |
| Batch B  | Fix 5–12（安全 critical）          | 3.5–4.5 人日      | 含 LDAP/支付/社区认证；依赖 Batch A 的 C3 前缀契约    |
| Batch C  | Fix 13–19（架构决策+最小落地）     | 3–5 人日          | 双 ORM 迁移最重（3–5 人日单列时 Batch C 总 6–8 人日） |
| Batch D  | Fix 20–32（warnings）+ suggestions | 6–10 人日         | 可并行拆分给多人                                      |
| **合计** |                                    | **约 15–25 人日** | 不含上线后迭代项（HttpOnly cookie、沙箱 Phase 2 等）  |

### 必须同步做的非代码动作

1. 更新 `.env.example` /
   README：JWT_SECRET（≥32 字符必填）、LEMONSQUEEZY_WEBHOOK_SECRET、ENABLE_MOCK_PAYMENT、VITE_API_URL、CORS 白名单。
2. CI 接入：`pnpm vitest run` 全仓（Fix 32）+ `pnpm audit` 门槛 +
   lint 全量覆盖（Fix 31）。
3. 发布检查单：`git grep -n "dev-secret-change-in-production\|yuletech2026\|admin123"`
   必须零命中。

---

## Fix Plan

## Batch A — 数据丢失（P0，先修）

### Fix 1: 参数编辑静默失败 — updateParameter 永远匹配不到参数（C1）

**File(s):**
`apps/yuleasr-web/src/stores/configStore.ts:318-375`；`apps/yuleasr-web/src/pages/Editor.tsx:314-318`；`apps/yuleasr-web/src/components/ContainerParameterList.tsx:35,88`
**Priority:** critical（P0，编辑器最核心数据通路）

**Approach:** 根因是双重的：(1) `updateParameter` 用
`pathParts[last]`（`container:xxx`/`instance:xxx`）匹配
`p.id`（来自 all-modules.ts 的小写 id），任何路径都匹配失败；(2) 只处理模块级
`parameters`，容器参数/实例参数根本没有数据通路。修复方案：

- 统一路径规范为
  `layer:/module:/container:/instance:/param:`——**GlobalSearch 已经生成带
  `param:`
  段的路径**（`apps/yuleasr-web/src/components/GlobalSearch.tsx:85,101`），说明该契约是既定设计，只是 updateParameter 没实现。
- `updateParameter` 解析 `param:` 段，支持
  **id 或 name 匹配**（ContainerParameterList 传的是
  `param.name`，all-modules 里 id 是小写短名，两者都要认）。
- 递归处理静态容器参数与动态实例参数（实例分支依赖 Fix 2 的 `instances`
  数据模型）。
- 匹配失败不再静默：`console.error` + store 暴露
  `lastEditError`，Editor 顶部提示。
- Editor 的 `handleParameterChange`
  目前**丢弃 paramName 只用 selectedPath**，必须补拼 `param:` 段。

**Code change:**

```ts
// ── configStore.ts：模块级辅助函数（放在 validateCrossModuleChanges 之后）──

function matchesParamKey(
  p: { id: string; name?: string },
  key: string
): boolean {
  return p.id === key || p.name === key;
}

/** 递归更新容器参数；instanceName 为 null 时更新静态容器参数 */
function updateContainerParam(
  containers: ConfigContainer[],
  containerId: string,
  instanceName: string | null,
  paramKey: string,
  value: unknown
): ConfigContainer[] {
  return containers.map(container => {
    if (container.id !== containerId) {
      if (container.subContainers?.length) {
        return {
          ...container,
          subContainers: updateContainerParam(
            container.subContainers,
            containerId,
            instanceName,
            paramKey,
            value
          ),
        };
      }
      return container;
    }
    if (instanceName) {
      // 动态实例：只更新目标实例（Fix 2 引入 instances 字段）
      return {
        ...container,
        instances: container.instances?.map(inst =>
          inst.name === instanceName
            ? {
                ...inst,
                paramValues: { ...inst.paramValues, [paramKey]: value },
              }
            : inst
        ),
      };
    }
    if (!container.parameters.some(p => matchesParamKey(p, paramKey))) {
      console.error(
        `[configStore] 未找到容器参数 ${paramKey} in ${containerId}`
      );
      return container;
    }
    return {
      ...container,
      parameters: container.parameters.map(p =>
        matchesParamKey(p, paramKey) ? { ...p, value } : p
      ),
    };
  });
}

/** 按 module: 段定位模块，再分模块级/容器级/实例级三条路径更新 */
function updateParameterInModule(
  module: ConfigModule,
  pathParts: string[],
  paramKey: string,
  value: unknown
): ConfigModule {
  const containerPart = pathParts.find(p => p.startsWith('container:'));
  if (!containerPart) {
    if (!module.parameters.some(p => matchesParamKey(p, paramKey))) {
      console.error(
        `[configStore] 未找到模块级参数 ${paramKey} in ${module.id}`
      );
      return module;
    }
    return {
      ...module,
      parameters: module.parameters.map(p =>
        matchesParamKey(p, paramKey) ? { ...p, value } : p
      ),
    };
  }
  const containerId = containerPart.slice('container:'.length);
  const instancePart = pathParts.find(p => p.startsWith('instance:'));
  const instanceName = instancePart
    ? instancePart.slice('instance:'.length)
    : null;
  return {
    ...module,
    containers: updateContainerParam(
      module.containers,
      containerId,
      instanceName,
      paramKey,
      value
    ),
  };
}
```

```ts
// ── configStore.ts：updateParameter 重写（替换 318-375）──

updateParameter: (path, value) => {
  const { currentConfig } = get();
  if (!currentConfig) return;

  const pathParts = path.split('/').filter(Boolean);
  const modulePart = pathParts.find(p => p.startsWith('module:'));
  const paramPart = pathParts.find(p => p.startsWith('param:'));
  if (!modulePart || !paramPart) {
    console.error('[configStore] updateParameter: 路径缺少 module:/param: 段', path);
    set({ lastEditError: `参数路径无效: ${path}` });
    return;
  }
  const moduleId = modulePart.slice('module:'.length);
  const paramKey = paramPart.slice('param:'.length);

  const updatedModules = currentConfig.modules.map(module =>
    module.id === moduleId ? updateParameterInModule(module, pathParts, paramKey, value) : module
  );

  const targetModule = currentConfig.modules.find(m => m.id === moduleId);
  const updatedConfig = {
    ...currentConfig,
    modules: updatedModules,
    updatedAt: new Date().toISOString(),
  };

  const crossIssues = validateCrossModuleChanges(updatedConfig, targetModule?.name ?? moduleId, paramKey);
  const validator = new DependencyValidator(updatedConfig);
  const result = validator.validate();

  set({
    currentConfig: updatedConfig,
    validationResult: {
      ...result,
      errors: [...result.errors, ...crossIssues.filter(i => i.severity === 'error')],
      warnings: [...result.warnings, ...crossIssues.filter(i => i.severity === 'warning')],
    },
    validationIssues: [...result.errors, ...result.warnings, ...crossIssues],
    isDirty: true,
    lastEditError: null,
  });
},
```

```ts
// ── Editor.tsx：handleParameterChange 补拼 param: 段（替换 314-318）──

const handleParameterChange = (paramName: string, value: unknown) => {
  if (selectedPath) {
    const paramSegment = selectedPath.includes('/param:')
      ? ''
      : `/param:${paramName}`;
    updateParameter(`${selectedPath}${paramSegment}`, value);
  }
};
```

（`lastEditError` 加入 `ConfigState` interface，Editor 顶部渲染红色提示条。）

**Test:**

- 新增 `apps/yuleasr-web/src/stores/configStore.test.ts`（vitest，store 用
  `useConfigStore.setState` 注入 fixture config）：
  - 模块级参数：`layer:MCAL/module:adc/param:adcdozemode` →
    `currentConfig.modules[0].parameters` 更新；
  - 静态容器参数：`layer:MCAL/module:adc/container:adcconfigset/param:xxx`
    → 容器 parameters 更新（按 name 匹配也要通过）；
  - 未知参数：不崩溃、`lastEditError` 被置位；
  - 路径缺 `module:` 段：同上。
- 手动：编辑器改参数 → 保存 → 导出 JSON 值正确；刷新页面值仍在。

---

### Fix 2: 动态容器实例数据不持久化（C2）

**File(s):**
`apps/yuleasr-web/src/components/ConfigTree.tsx:145-155, 263-487`；`apps/yuleasr-web/src/pages/Editor.tsx:349-358, 904-910`；`apps/yuleasr-web/src/types/config.ts`（`ConfigContainer`
类型） **Priority:** critical（P0，保存即丢）

**Approach:** `dynamicInstances`
只存在于 ConfigTree 本地 state（`path → {name, paramValues}[]`），增/删/改/复制/拖拽排序全部不回写
`currentConfig`。方案：**把实例数据提升进配置数据模型**——`ConfigContainer`
增加可选
`instances?: ConfigInstance[]`（`{ name, paramValues }`），随 ConfigFile 一起序列化；ConfigTree 改为从
`currentConfig` 读取实例、通过 configStore 新增的实例 action 修改；Editor 的
`instanceContainer` 虚容器改为从 `selectedContainer.instances`
读取真实 paramValues（而不是模板默认值）。

**Code change:**

```ts
// ── types/config.ts：新增 ──
export interface ConfigInstance {
  name: string;
  paramValues: Record<string, unknown>;
}

// ConfigContainer interface 内新增：
// instances?: ConfigInstance[];
```

```ts
// ── configStore.ts：新增实例 action（递归定位 multiple 容器后操作）──

/** 在容器树中按 id 定位并应用 fn，返回新树 */
function mapContainerByPath(
  containers: ConfigContainer[],
  containerId: string,
  fn: (c: ConfigContainer) => ConfigContainer
): ConfigContainer[] {
  return containers.map(container => {
    if (container.id === containerId) return fn(container);
    if (container.subContainers?.length) {
      return { ...container, subContainers: mapContainerByPath(container.subContainers, containerId, fn) };
    }
    return container;
  });
}

/** 根据路径段定位容器 id（pathParts 里最后一个 container: 段） */
function findContainerIdInPath(pathParts: string[]): string | null {
  const parts = pathParts.filter(p => p.startsWith('container:'));
  return parts.length > 0 ? parts[parts.length - 1].slice('container:'.length) : null;
}

// ConfigState 新增（interface 同步）：
// addInstance: (containerPath: string, baseName: string) => string | null;
// removeInstance: (containerPath: string, instanceName: string) => void;
// renameInstance: (containerPath: string, oldName: string, newName: string) => boolean;
// copyInstance: (containerPath: string, sourceName: string) => string | null;
// reorderInstance: (containerPath: string, fromName: string, toName: string) => void;

addInstance: (containerPath, baseName) => {
  const { currentConfig } = get();
  if (!currentConfig) return null;
  const containerId = findContainerIdInPath(containerPath.split('/'));
  if (!containerId) return null;

  let newName = '';
  const modules = currentConfig.modules.map(module => ({
    ...module,
    containers: mapContainerByPath(module.containers, containerId, container => {
      const existing = container.instances ?? [];
      let maxIdx = -1;
      for (const inst of existing) {
        const m = inst.name.match(/_(\d+)$/);
        if (m) maxIdx = Math.max(maxIdx, parseInt(m[1], 10));
      }
      newName = `${baseName}_${maxIdx + 1}`;
      const template = container.subContainers?.[0] ?? container;
      const paramValues: Record<string, unknown> = {};
      for (const p of template.parameters ?? []) paramValues[p.id] = p.value ?? p.defaultValue;
      return { ...container, instances: [...existing, { name: newName, paramValues }] };
    }),
  }));

  set({ currentConfig: { ...currentConfig, modules }, isDirty: true });
  return newName;
},

removeInstance: (containerPath, instanceName) => {
  const { currentConfig } = get();
  if (!currentConfig) return;
  const containerId = findContainerIdInPath(containerPath.split('/'));
  if (!containerId) return;
  set({
    currentConfig: {
      ...currentConfig,
      modules: currentConfig.modules.map(module => ({
        ...module,
        containers: mapContainerByPath(module.containers, containerId, container => ({
          ...container,
          instances: (container.instances ?? []).filter(i => i.name !== instanceName),
        })),
      })),
    },
    isDirty: true,
  });
},

// renameInstance：返回 false 表示重名冲突（W8 一并修）
renameInstance: (containerPath, oldName, newName) => {
  const { currentConfig } = get();
  if (!currentConfig) return false;
  const containerId = findContainerIdInPath(containerPath.split('/'));
  if (!containerId) return false;
  let ok = true;
  set({
    currentConfig: {
      ...currentConfig,
      modules: currentConfig.modules.map(module => ({
        ...module,
        containers: mapContainerByPath(module.containers, containerId, container => {
          const instances = container.instances ?? [];
          if (instances.some(i => i.name === newName && i.name !== oldName)) { ok = false; return container; }
          return {
            ...container,
            instances: instances.map(i => (i.name === oldName ? { ...i, name: newName } : i)),
          };
        }),
      })),
    },
    isDirty: ok,
  });
  return ok;
},

copyInstance: (containerPath, sourceName) => {
  const { currentConfig } = get();
  if (!currentConfig) return null;
  const containerId = findContainerIdInPath(containerPath.split('/'));
  if (!containerId) return null;
  let newName = '';
  set({
    currentConfig: {
      ...currentConfig,
      modules: currentConfig.modules.map(module => ({
        ...module,
        containers: mapContainerByPath(module.containers, containerId, container => {
          const instances = container.instances ?? [];
          const source = instances.find(i => i.name === sourceName);
          if (!source) return container;
          let maxIdx = -1;
          for (const i of instances) { const m = i.name.match(/_(\d+)$/); if (m) maxIdx = Math.max(maxIdx, parseInt(m[1], 10)); }
          const base = sourceName.replace(/_\d+$/, '') || sourceName;
          newName = `${base}_${maxIdx + 1}`;
          return { ...container, instances: [...instances, { name: newName, paramValues: { ...source.paramValues } }] };
        }),
      })),
    },
    isDirty: true,
  });
  return newName;
},

reorderInstance: (containerPath, fromName, toName) => {
  const { currentConfig } = get();
  if (!currentConfig) return;
  const containerId = findContainerIdInPath(containerPath.split('/'));
  if (!containerId) return;
  set({
    currentConfig: {
      ...currentConfig,
      modules: currentConfig.modules.map(module => ({
        ...module,
        containers: mapContainerByPath(module.containers, containerId, container => {
          const instances = [...(container.instances ?? [])];
          const fromIdx = instances.findIndex(i => i.name === fromName);
          const toIdx = instances.findIndex(i => i.name === toName);
          if (fromIdx === -1 || toIdx === -1) return container;
          const [moved] = instances.splice(fromIdx, 1);
          instances.splice(toIdx, 0, moved);
          return { ...container, instances };
        }),
      })),
    },
    isDirty: true,
  });
},
```

```ts
// ── ConfigTree.tsx：删除本地 dynamicInstances state（148-155），改为从 store 读取 ──
// const dynamicInstances = useConfigStore(s => s.currentConfig) 派生（用 useMemo 递归收集，
// 收集逻辑复用现有 collectDynamicContainers 但数据源改为 currentConfig 的 instances 字段）；
// addInstance/removeInstance/renameInstance/copyInstance/onDrop 全部改为调用 store action；
// useImperativeHandle 的 addInstance 同步委托 store（名字计算与 store 内一致）。
```

```ts
// ── Editor.tsx：instanceContainer 从真实实例数据构建（替换 349-358）──

const instanceContainer = (() => {
  if (!selectedInstanceName || !selectedContainer?.multiple) return null;
  const template = selectedContainer.subContainers?.[0];
  if (!template) return null;
  const instance = selectedContainer.instances?.find(
    i => i.name === selectedInstanceName
  );
  const paramValues = instance?.paramValues ?? {};
  return {
    ...template,
    id: `${selectedContainer.id}_${selectedInstanceName}`,
    name: selectedInstanceName,
    displayName: selectedInstanceName,
    description: `Instance of ${selectedContainer.displayName || selectedContainer.name}`,
    parameters: (template.parameters ?? []).map(p => ({
      ...p,
      value:
        paramValues[p.id] ??
        paramValues[p.name ?? ''] ??
        p.value ??
        p.defaultValue,
    })),
  } as ConfigContainer;
})();
```

**Test:**

- 手动：CanController 添加 2 个实例并改参数 → 保存 → 导出 JSON 含 `instances`
  → 刷新页面实例与参数值仍在；复制/重命名/拖拽排序后保存再重载。
- 单测：store action 对 fixture 配置增/删/改/复制/重命名（含重名拒绝）后断言
  `currentConfig.modules` 与 `isDirty`。

---

### Fix 3: Web↔Server API 全链路断裂：前缀/路由/id 三重错配（C3 + A1 + A2）

**File(s):**
`packages/@yuletech/api-server/src/index.ts:60-76`；`packages/@yuletech/api-server/src/routes/configs.ts:23,35,41,55,71,118,134,172,226`（`request.user.userId`→`id`）；`apps/yuleasr-web/vite.config.ts:22-32`；`apps/yuleasr-web/src/services/api.ts:39`；`apps/yuleasr-web/src/stores/authStore.ts:34,50`；`apps/yulecommunity/src/services/apiClient.ts:8-11,251-255`
**Priority:** critical（P0，登录/云同步/配置锁全部失效）

**Approach:** 统一前缀契约为 `/v1/`（服务端现状），web/community 调用方全部改用
`/v1/...`：

1. **index.ts 注册 configsRoutes**（当前从未 import/register）：`await app.register(configsRoutes, { prefix: '/v1/api/configs' })`，且内部 9 个 handler 全部挂
   `onRequest: [(app as any).authenticate]`。
2. **configs.ts 统一用户字段**：JWT payload 只有 `id`（auth.ts:31 签名
   `{ id, email, role }`），全部 `userId` 改 `id`。
3. **web 端路径**：`/api/xxx` → `/v1/xxx`（authStore 2 处、configStore 全部
   `/api/configs` 调用、api.ts 的 lock/unlock
   3 处、其他 services）。`vite.config.ts` 删除 `/api` rewrite 代理（保留 `/v1`
   直通），避免双前缀歧义；生产用 `VITE_API_URL` 指向服务端。
4. **id 契约**：服务端 configs.id 为自增数字。web `syncToCloud`
   已有"服务端返回新 id 则回写"逻辑（configStore.ts:605-619），保留；`loadFromCloud`
   合并时按 id 去重即可（数字与字符串 id 天然不冲突，本地未同步配置仍为字符串 id，同步后回写）。
5. **community**：apiClient `BASE_URL` 默认改 `http://localhost:3002`（与 vite
   proxy target 一致），路径 `/auth/login`→`/v1/auth/login`（与 Fix
   11 联动——否则社区登录永远走 mock 降级）。

**Code change:**

```ts
// ── api-server/src/index.ts：注册 configs 路由（插到 qaRoutes 之后）──
import { configsRoutes } from './routes/configs.js';
// ...
await app.register(configsRoutes, { prefix: '/v1/api/configs' });
```

```ts
// ── api-server/src/routes/configs.ts：全局替换 request.user 取值 ──
// 所有 `const { userId } = request.user as { userId: number };`
// 改为：`const { id: userId } = request.user as { id: number };`
// （list/get/create/update/remove/getVersions/lock/unlock 共 9 处）
```

```ts
// ── vite.config.ts：删除 /api rewrite，仅保留 /v1 直通 ──
proxy: {
  '/v1': {
    target: 'http://localhost:3002',
    changeOrigin: true,
  },
},
```

```ts
// ── apps/yuleasr-web/src/stores/authStore.ts ──
// '/api/auth/login'  →  '/v1/auth/login'
// '/api/auth/register' → '/v1/auth/register'
```

```ts
// ── apps/yuleasr-web/src/stores/configStore.ts：全部路径替换 ──
// '/api/configs'       → '/v1/api/configs'
// '/api/configs/${id}' → '/v1/api/configs/${id}'
// （syncToCloud / loadConfig / loadFromCloud / loadConfigList / updateConfigData 等）
```

**Test:**

- 新增契约测试
  `packages/@yuletech/api-server/test/routes.test.ts`：启动 Fastify（注入模式
  `app.inject`），断言 `GET /v1/api/configs`
  未认证返回 401、认证后返回 200；`POST /v1/auth/login` 正常。
- web 端 vitest：断言 configStore 发出的路径前缀为 `/v1/`（mock
  fetch 捕获 URL）。
- 手动 e2e：dev 起 server(3002) +
  web(3000)，注册→登录→新建配置→保存（观察 Network 面板 2xx 且无 404）→刷新后配置在云端列表。

---

### Fix 4: isCloudSynced 语义错误：保存失败仍标记"已同步"（C4）

**File(s):** `apps/yuleasr-web/src/stores/configStore.ts:519-526, 584-625`
**Priority:** critical（与 C3 叠加后为用户可见的数据丢失）

**Approach:** 只有确实收到 2xx 才置
`isCloudSynced: true`；任何分支失败置 false 并暴露 `syncError`
给 UI。当前 bug 点：`saveConfig` 的 catch 只 `console.warn`
不置 false；`syncToCloud` 404 分支 post 后无条件
`set({ isCloudSynced: true })`（620 行）——post 也失败时仍标记成功。

**Code change:**

```ts
// ── ConfigState interface 新增：syncError: string | null ──
// 初始值 syncError: null

// saveConfig 内（替换 519-526）：
if (isAuthenticated()) {
  try {
    await get().syncToCloud();
    set({ isCloudSynced: true, syncError: null });
  } catch (err) {
    set({
      isCloudSynced: false,
      syncError: err instanceof Error ? err.message : '云同步失败',
    });
    console.warn(
      'Cloud sync failed (offline or auth error), local save preserved:',
      err
    );
  }
}
```

```ts
// syncToCloud 404 分支（替换 598-621）：post 失败必须抛出，不得置 true
if (err?.status === 404) {
  const created = await api.post<ConfigFile>('/v1/api/configs', {
    name: currentConfig.name,
    description: currentConfig.description,
    data: currentConfig,
  });
  if (!created || !created.id) {
    throw new Error('Server did not return a config id after create');
  }
  // 服务端返回不同 id 时回写本地（保留现有 605-619 逻辑）
  if (created.id !== currentConfig.id) {
    const updatedConfig = { ...currentConfig, id: created.id };
    saveToLocalStorage(updatedConfig);
    set({ currentConfig: updatedConfig });
    try {
      const configList = loadConfigListFromLocalStorage();
      const idx = configList.findIndex((c: any) => c.id === currentConfig.id);
      if (idx >= 0) {
        configList[idx].id = created.id;
        saveConfigListToLocalStorage(configList);
      }
    } catch {}
  }
  set({ isCloudSynced: true, syncError: null });
  return;
}
throw err;
```

**Test:**
手动——停掉 server 后保存：UI 显示"未同步"+ 错误条（不再是绿色"已云同步"）；恢复 server 后再保存恢复绿色。单测：mock
api.put 抛 404、mock api.post 抛 500 → 断言 `isCloudSynced === false` 且
`syncError` 非空。

---

## Batch B — 安全 critical

### Fix 5: Electron IPC 命令注入 + 路径遍历（RCE/任意写盘）

**File(s):**
`apps/yuleasr-desktop/electron/desktop-utils.mjs:67-69, 81-87, 113-123`；`apps/yuleasr-desktop/electron/main.mjs:93-106, 120-132`
**Priority:** critical

**Approach:** ① 文件名白名单 `^[A-Za-z0-9_-]+\.(c|h)$`（杜绝
`;`、`$()`、`../`、绝对路径）；② `execSync` 改 `execFileSync`
参数数组（不经过 shell，从根上消除注入）；③ IPC
handler 入口校验数量/大小并 try/catch；④ 补 `sandbox: true` + `will-navigate`
拦截 + `setWindowOpenHandler` deny。

**Code change:**

```js
// ── desktop-utils.mjs：顶部新增 ──
import { execFileSync } from 'child_process';

const SAFE_FILENAME_RE = /^[A-Za-z0-9_-]+\.(c|h)$/;
const MAX_FILES = 100;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** 校验并规范化渲染进程传入的文件；非法返回 null */
function sanitizeFile(f) {
  if (!f || typeof f !== 'object') return null;
  const filename = typeof f.filename === 'string' ? f.filename : '';
  if (!SAFE_FILENAME_RE.test(filename)) return null;
  const content = typeof f.content === 'string' ? f.content : '';
  if (Buffer.byteLength(content, 'utf8') > MAX_FILE_BYTES) return null;
  return { filename, content, language: f.language === 'h' ? 'h' : 'c' };
}

function sanitizeFiles(files) {
  if (!Array.isArray(files) || files.length === 0 || files.length > MAX_FILES)
    return null;
  const out = [];
  for (const f of files) {
    const safe = sanitizeFile(f);
    if (!safe) return null;
    out.push(safe);
  }
  return out;
}
```

```js
// ── verifyFiles：写入与编译改为 sanitize + execFileSync（替换 67-69 / 81-87）──
for (const f of files) {
  const safe = sanitizeFile(f);
  if (!safe) {
    results.push({
      filename: f.filename,
      status: 'skipped',
      errors: ['Invalid filename or content'],
    });
    continue;
  }
  writeFileSync(join(tmpDir, safe.filename), safe.content);
}
// ...
if (f.language === 'h') {
  execFileSync(
    'gcc',
    ['-fsyntax-only', '-x', 'c', '-I', tmpDir, join(tmpDir, f.filename)],
    { stdio: 'pipe', timeout: 15000 }
  );
} else {
  execFileSync(
    'gcc',
    [
      '-fsyntax-only',
      '-I',
      tmpDir,
      '-include',
      join(tmpDir, 'Std_Types.h'),
      join(tmpDir, f.filename),
    ],
    { stdio: 'pipe', timeout: 15000 }
  );
}
```

```js
// ── saveFilesToDir（替换 113-123）：非法文件跳过，杜绝越界写盘 ──
export function saveFilesToDir(outputDir, files) {
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
  let count = 0;
  const safeFiles = sanitizeFiles(files);
  if (!safeFiles)
    return {
      success: false,
      count: 0,
      path: outputDir,
      error: 'Invalid file payload',
    };
  for (const f of safeFiles) {
    writeFileSync(join(outputDir, f.filename), f.content);
    count++;
  }
  return { success: true, count, path: outputDir };
}
```

```js
// ── main.mjs：IPC 入口校验 + 窗口加固 ──
ipcMain.handle('gcc:verify', (_event, files) => {
  const safeFiles = sanitizeFiles(files);
  if (!safeFiles) return { error: 'Invalid payload' };
  try {
    return verifyFiles(safeFiles);
  } catch (e) {
    return { error: String(e) };
  }
});

ipcMain.handle('files:save', async (_event, files) => {
  const safeFiles = sanitizeFiles(files);
  if (!safeFiles) return { success: false, error: 'Invalid payload' };
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select output directory for generated code',
  });
  if (result.canceled || !result.filePaths[0])
    return { success: false, cancelled: true };
  return saveFilesToDir(result.filePaths[0], safeFiles);
});

// createWindow() webPreferences 增加：sandbox: true
// createWindow() 内追加：
mainWindow.webContents.on('will-navigate', event => event.preventDefault());
mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  if (
    typeof url === 'string' &&
    (url.startsWith('https://') || url.startsWith('http://'))
  )
    shell.openExternal(url);
  return { action: 'deny' };
});
```

**Test:** 单测
`desktop-utils.test.mjs`（node:test）：`x.h; touch /tmp/pwned`、`../evil.c`、`/etc/passwd`、超大 content 全部被 sanitize 拒绝；合法
`Can_Cfg.h` 通过。手动：渲染进程发 `gcc:verify`
带恶意 filename，返回 skipped 而非执行命令；`files:save` 带 `../`
文件名不产生目录外文件。

---

### Fix 6: JWT 默认密钥硬编码（可伪造任意管理员令牌）

**File(s):**
`packages/@yuletech/api-server/src/index.ts:24`；`packages/@yuletech/api-server/src/config.ts:7`
**Priority:** critical（三位审查员一致，置信度最高）

**Approach:** 启动即 fail-fast：`JWT_SECRET`
缺失或 <32 字符直接拒绝启动（默认值从两个文件移除）。同时提供 `.env.example`
与 README 说明生成方式（`openssl rand -hex 32`）。

**Code change:**

```ts
// ── index.ts（替换 24 行）──
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error(
    'FATAL: JWT_SECRET 环境变量未配置或长度不足 32 字符。\n' +
      '生成方式: openssl rand -hex 32\n' +
      '示例: JWT_SECRET=<生成的密钥> pnpm dev'
  );
  process.exit(1);
}
```

```ts
// ── config.ts（替换 7 行）──
jwtSecret: process.env.JWT_SECRET ?? '',
// （index.ts 已做 fail-fast；config.jwtSecret 仅作透传，不再有默认值）
```

**Test:**
无 JWT_SECRET 启动 → 进程以非零码退出并打印引导信息；配置 ≥32 字符密钥后正常启动。CI 增加
`git grep -n "dev-secret-change-in-production"` 零命中检查。

---

### Fix 7: LDAP 过滤器注入（认证绕过）

**File(s):** `packages/@yuletech/api-server/src/routes/auth-sso.ts:215, 373-394`
**Priority:** critical

**Approach:** 用户名在拼入 searchFilter 前做 RFC
4515 转义（`\ * ( ) \ NUL`）。注意 `ldapBuildFilter` 的正则
`^\(([^=]+)=([^)]+)\)$` 只认单层
`(attr=value)`——注入载荷会破坏该正则使过滤退化为 objectClass
present 过滤（匹配所有条目），这正是绕过路径；转义后注入载荷无法破坏结构。

**Code change:**

```ts
// ── auth-sso.ts：新增工具函数（放在 ldapBuildFilter 之前）──
/** RFC 4515 过滤器值转义 */
function ldapEscapeFilterValue(input: string): string {
  return input.replace(/([\\*\\(\\)\x00])/g, '\\$1');
}

// ── 替换 215 行 ──
const filter = searchFilter.replace(
  /\{\{username\}\}/g,
  ldapEscapeFilterValue(inputUsername)
);
```

**Test:** 单测：`ldapEscapeFilterValue('*') === '\\*'`；`'*)(uid=*'` →
`'\*\)\(uid=\*'`（正则仍能解析为单一 equalityMatch）。集成：LDAP 登录用
`username=*` 载荷 → 搜索不到任意用户（401）。

---

### Fix 8: LDAP 关闭 TLS 证书校验 + 验证 socket 无超时

**File(s):** `packages/@yuletech/api-server/src/routes/auth-sso.ts:500, 565-589`
**Priority:** critical（TLS 部分）+ warning（超时部分，同文件一并修）

**Approach:** 移除两处 `rejectUnauthorized: false`（改为默认校验），支持
`LDAP_CA_CERT` 环境变量注入自定义 CA；verifier
socket 增加与主 socket 相同的 10s 超时与 error 处理。长期（Batch
D）：迁移成熟 ldapjs 库替换裸 socket 协议实现。

**Code change:**

```ts
// ── 替换 500 行 ──
const ca = process.env.LDAP_CA_CERT
  ? [Buffer.from(process.env.LDAP_CA_CERT)]
  : undefined;
const socket = isTls
  ? tls.connect(port, hostname, {
      rejectUnauthorized: true,
      ...(ca ? { ca } : {}),
    })
  : net.connect(port, hostname);

// ── 替换 565-589 行（verifier）：加超时 + 错误处理 ──
const verifier = isTls
  ? tls.connect(port, hostname, {
      rejectUnauthorized: true,
      ...(ca ? { ca } : {}),
    })
  : net.connect(port, hostname);
let verBuf = Buffer.alloc(0);
const verifierTimeout = setTimeout(() => {
  verifier.destroy();
  reject(new Error('LDAP user-verification timeout'));
}, 10000);
verifier.on('connect', () => {
  const userBindReq = ldapBuildBindRequest(userDn, userPassword);
  verifier.write(userBindReq);
});
verifier.on('data', (d: Buffer) => {
  verBuf = Buffer.concat([verBuf, d]);
  if (verBuf.length >= 20) {
    clearTimeout(verifierTimeout);
    const resultCode = verBuf[12];
    verifier.end();
    if (resultCode === 0) resolve(entry);
    else reject(new Error('LDAP user authentication failed'));
  }
});
verifier.on('error', (err: Error) => {
  clearTimeout(verifierTimeout);
  reject(err);
});
```

**Test:** 单测（mock tls）：`rejectUnauthorized`
不再为 false；verifier 挂起 10s 后超时 reject（fake
timers）。手动：连接自签证书 LDAP 服务器 → 未配置 CA 时报证书错误（符合预期）。

---

### Fix 9: 支付 webhook 未配置时跳过签名校验 + 签名格式错误 + eventId 可控

**File(s):**
`packages/@yuletech/api-server/src/routes/payment.ts:121-132, 261-275, 280`
**Priority:** critical

**Approach:** ① 未配置 `LEMONSQUEEZY_WEBHOOK_SECRET`
时 webhook 一律 503 拒绝（不再"跳过校验处理"）；② 按官方格式解析 `v1=`
前缀再 timingSafeEqual；③ eventId 改用 LemonSqueezy 订单号
`body.data.id`（服务端可控数据），拒绝无真实订单号的"激活类"事件。

**Code change:**

```ts
// ── verifyLemonSignature 重写（替换 121-132）──
function verifyLemonSignature(rawBody: string, signature: string): boolean {
  if (!LEMONSQUEEZY_WEBHOOK_SECRET) return false;
  const expected = crypto.createHmac('sha256', LEMONSQUEEZY_WEBHOOK_SECRET).update(rawBody).digest('hex');
  const provided = signature.startsWith('v1=') ? signature.slice(3) : signature;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  } catch {
    return false;
  }
}

// ── webhook handler（替换 269-275）──
if (!LEMONSQUEEZY_WEBHOOK_SECRET) {
  return reply.status(503).send({ message: 'Webhook not configured' });
}
const signature = (request.headers['x-signature'] as string) || '';
if (!signature || !verifyLemonSignature(rawBody, signature)) {
  return reply.status(401).send({ message: 'Invalid webhook signature' });
}

// ── eventId 改为绑定订单号（替换 280）──
const lemonOrderIdRaw = String(body?.data?.id || '');
const eventId = lemonOrderIdRaw ? `evt_${lemonOrderIdRaw}` : '';
// 激活类事件必须携带真实订单号：
const shouldActivate = ...; // 原有逻辑
if (shouldActivate && !lemonOrderIdRaw) {
  return reply.status(422).send({ received: true, ignored: 'missing order id' });
}
```

**Test:** 无 secret 时 POST webhook → 503；带 `v1=` 前缀的正确 HMAC →
200；错误签名 → 401；伪造 `order_created`（无 data.id）→
422 且不发 license。单测覆盖 verifyLemonSignature 的 `v1=`
前缀与裸 hex 两种输入。

---

### Fix 10: mock-success 端点白嫖 Pro 许可证

**File(s):** `packages/@yuletech/api-server/src/routes/payment.ts:202-250`
**Priority:** critical

**Approach:** 路由改为环境变量显式开关（`ENABLE_MOCK_PAYMENT === 'true'`
才注册），生产默认不注册。README 注明仅本地开发使用。

**Code change:**

```ts
// ── payment.ts 顶部新增 ──
const ENABLE_MOCK_PAYMENT = process.env.ENABLE_MOCK_PAYMENT === 'true';

// ── 注册处（替换 202 行整段路由声明）──
if (ENABLE_MOCK_PAYMENT) {
  app.post(
    '/mock-success',
    { onRequest: [(app as any).authenticate] },
    async (request, reply) => {
      // ...原实现不变
    }
  );
}
```

**Test:** `ENABLE_MOCK_PAYMENT` 未设置 → `POST /v1/api/payment/mock-success`
返回 404；设置后仅登录用户可调用。

---

### Fix 11: 社区端认证形同虚设（硬编码口令 + 客户端 mock 登录 + 客户端管理端）

**File(s):**
`apps/yulecommunity/src/hooks/useAdminAuth.ts:4-5`；`apps/yulecommunity/src/hooks/useAuth.ts:91-104, 134-148`；`apps/yulecommunity/src/admin/stores/adminStore.ts:73-83`；`apps/yulecommunity/src/admin/utils/permissions.ts:62-65`；`apps/yulecommunity/src/admin/pages/Login.tsx:41-50`；`apps/yulecommunity/src/services/apiClient.ts`（配合 Fix
3 前缀） **Priority:** critical

**Approach:** ① 删除 useAdminAuth 硬编码口令，admin 登录改走服务端（新增
`POST /v1/auth/admin/login`：校验邮箱/用户名 + 密码 + `role`
属于 admin/super_admin，签发 JWT）；②
useAuth 删除网络失败时的 mock 降级（这是"静默降级掩盖故障"模式在认证侧的具体体现），失败直接返回错误；③
adminStore/permissions 的角色判断只用于 UI 呈现，所有管理写操作必须由服务端中间件复核角色（配合 Fix
6 JWT）；④
AdminUsers 页面禁止直接读写 localStorage 充当"用户管理"，改调服务端用户管理 API（服务端实现列入 Batch
C，未实现前该页面显示"功能未开放"）；⑤ Login.tsx 的 `admin@example.com/admin123`
删除。

**Code change:**

```ts
// ── useAuth.ts：login 删除 catch 降级（替换 90-104）──
} catch (err) {
  console.warn('[useAuth] 后端不可达:', err);
  return { success: false, message: '服务暂时不可用，请稍后重试' };
}
// register 的 catch（134-148）同样删除 mock 降级，返回失败。

// ── useAdminAuth.ts：整体重写为服务端校验 ──
// 删除 ADMIN_USERNAME / ADMIN_PASSWORD 常量；
// login 改为调用 userApi/adminApi 的 /v1/auth/admin/login；
// 仅当服务端返回 role 为 admin/super_admin 才写入会话。
```

```ts
// ── api-server：新增 admin 登录路由（auth.ts 内追加）──
app.post('/admin/login', async (request, reply) => {
  const parsed = z
    .object({ email: z.string().email(), password: z.string().min(6) })
    .safeParse(request.body);
  if (!parsed.success)
    return reply.status(400).send({ message: 'Invalid input' });
  const { email, password } = parsed.data;
  const { prisma } = await import('../lib/prisma.js');
  const user = await prisma.user.findUnique({ where: { email } });
  if (
    !user ||
    !(await bcrypt.compare(password, user.password)) ||
    !['admin', 'super_admin'].includes(user.role)
  ) {
    return reply
      .status(401)
      .send({ message: 'Invalid credentials or not an admin' });
  }
  const token = app.jwt.sign({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  };
});
```

**Test:** 停掉后端 → 社区登录返回失败提示（不再进入"登录成功"）；用
`admin / yuletech2026`
无法登录；服务端创建 admin 用户后可登录且角色来自服务端。grep 校验：`git grep -n "yuletech2026\|admin123" apps/yulecommunity`
零命中。

---

### Fix 12: 插件 REST 端点无鉴权 + 外部插件无沙箱动态加载（RCE 面）

**File(s):**
`packages/@yuletech/api-server/src/routes/plugins.ts:30-81`；`packages/@yuletech/core/src/plugins/plugin-manager.ts:225-278`
**Priority:** critical（安全 warning + 架构 critical 合并；依赖 Fix
6 使鉴权有意义）

**Approach:** ① plugins 路由全部挂
`authenticate`，config 修改与 toggle 要求 admin 角色；② api-server 不再调用
`loadExternalPlugins`（仅注册 builtin 插件），并给 `loadExternalPlugins`
加显式环境变量开关 + 注释标明沙箱未落地前禁止在生产使用；③ 文档标注 vm 沙箱/worker 隔离为 Phase
2。

**Code change:**

```ts
// ── api-server/src/index.ts：新增 requireAdmin 装饰器（authenticate 之后）──
app.decorate('requireAdmin', async function (request: any, reply: any) {
  const user = (request as any).user as { role?: string } | undefined;
  if (!user || !['admin', 'super_admin'].includes(user.role ?? '')) {
    reply.status(403).send({ message: 'Forbidden: admin role required' });
  }
});

// ── plugins.ts：四个路由全部加 onRequest ──
app.get('/', { onRequest: [(app as any).authenticate] }, async (_request, reply) => { ... });
app.get('/:id', { onRequest: [(app as any).authenticate] }, async (request, reply) => { ... });
app.put('/:id/config', { onRequest: [(app as any).authenticate, (app as any).requireAdmin] }, async (request, reply) => { ... });
app.post('/:id/toggle', { onRequest: [(app as any).authenticate, (app as any).requireAdmin] }, async (request, reply) => { ... });
```

```ts
// ── plugin-manager.ts：外部加载加开关（225 行入口）──
async loadExternalPlugins(): Promise<PluginMeta[]> {
  if (!this.externalPluginDir || process.env.PLUGIN_EXTERNAL_ENABLED !== 'true') {
    console.warn('[plugin-manager] External plugin loading disabled (set PLUGIN_EXTERNAL_ENABLED=true only with sandboxing in place)');
    return [];
  }
  // ...原有实现
}
```

**Test:** 未带 token 调 `GET /v1/api/plugins` → 401；普通用户 PUT config →
403；admin → 200。`PLUGIN_EXTERNAL_ENABLED` 未设置时 `loadExternalPlugins()`
返回空数组。

---

### Fix 13: community API 类型为空壳（类型检查形同虚设）

**File(s):**
`apps/yulecommunity/src/services/apiClient.ts`（全文件）；ESLint 配置（`eslint.config.*`）
**Priority:** critical（架构）

**Approach:** **先验证再补漏**：本次逐行核对发现 `apiClient.ts` 的
`UserProfile/ForumPostSummary/ForumComment/BlogPost`
等已填充字段（与审查报告描述的空 interface 不一致，疑为审查时点差异）。因此本 Fix 改为：

1. 以 api-server 实际响应/zod schema 为准，交叉核对 `apiClient.ts`
   全部接口字段（重点：`UserProfile` 缺 `username` 外字段、`AuthResponse`
   与 useAuth 的 `result.data` 解包假设是否一致）；
2. 若仍存在空 interface 一律补齐；
3. 加 ESLint 护栏：开启
   `@typescript-eslint/no-empty-interface`（error），纳入 CI 全量 lint（与 Fix
   31 工具链统一一起落地）。

**Code change:**

```jsonc
// eslint 配置（apps/yulecommunity/eslint.config.js 或共享配置）：
{
  "rules": {
    "@typescript-eslint/no-empty-interface": [
      "error",
      { "allowSingleExtends": false },
    ],
  },
}
```

**Test:** `pnpm lint` 在 community 包通过且无空 interface 告警；`tsc --noEmit`
通过。手动：登录后从服务端 `/v1/auth/me` 拉取用户，页面字段与类型一致。

---

## Batch C — 架构腐化（发布前收敛决策 + 最小落地）

### Fix 14: api-server 双 ORM 并存（Prisma sqlite + Drizzle postgres）

**File(s):**
`packages/@yuletech/api-server/prisma/schema.prisma`；`packages/@yuletech/api-server/src/db/schema.ts`；`src/db/index.ts`；12 个 Prisma 路由（auth/license/payment/bswTemplates/sharedConfigs/posts/qa/blog/community/templateReviews/tags/branding）；`src/lib/prisma.ts`；`prisma/seed.ts`、`db/migrate.ts`、`drizzle.config.ts`
**Priority:** critical（架构，单包内最严重腐化）

**Approach（决策：统一到 Drizzle，删除 Prisma）**：

1. `db/schema.ts`
   补齐全部业务表定义（users/posts/comments/tags/licenseKey/paymentEvent/templateReviews/sharedConfigs/bswTemplates/templateVersions 等），字段与 Prisma 侧对齐：`users.password`（Prisma 名）映射为
   `password_hash`、补 `role/avatar/ssoProvider/ssoMetadata` 等漂移字段。
2. 路由逐个迁移（每个路由一个 commit）：查询改写为 drizzle `eq/and/desc`
   风格（参照现有 `configs.ts`/`community.ts` 写法）。
3. 数据迁移脚本 `scripts/migrate-prisma-to-drizzle.ts`：读 sqlite（prisma
   dev.db）→ 写 postgres，bcrypt hash 原样拷贝。
4. 删除 `prisma/`、`src/lib/prisma.ts`、prisma 依赖与
   `db:generate/db:push/db:migrate/db:seed` 中 prisma 脚本；统一 drizzle 入口。
5. index.ts 的 `/health` 与启动/关闭逻辑改 drizzle。

**Code change（示例——auth.ts login 迁移）：**

```ts
// ── auth.ts：Prisma → Drizzle ──
import { eq, or } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';

// login:
const [user] = await db
  .select()
  .from(users)
  .where(eq(users.email, email))
  .limit(1);
if (!user || !(await bcrypt.compare(password, user.password_hash))) {
  return reply.status(401).send({ message: 'Invalid email or password' });
}
// register:
const existing = await db
  .select({ id: users.id })
  .from(users)
  .where(or(eq(users.email, email), eq(users.username, username)))
  .limit(1);
if (existing.length > 0) {
  /* 409 */
}
const hashed = await bcrypt.hash(password, 10);
const [created] = await db
  .insert(users)
  .values({ email, username, password_hash: hashed })
  .returning();
```

**Test:**
迁移后跑通全量 API 冒烟（注册→登录→/me→发帖→评论→模板→license）；`git grep -n "from '../lib/prisma"`
零命中（仅迁移脚本允许）；`pnpm db:push` + `pnpm db:seed`（drizzle）可重复执行。

---

### Fix 15: 多端"假实现"：web GitService stub + vscode sync/generate 占位（对用户谎报成功）

**File(s):** `apps/yuleasr-web/src/services/gitService.ts:71-105`；消费者
`GitSync.tsx:22 / BranchManager.tsx:15 / VersionHistory.tsx:17 / DiffViewer.tsx:17`；`apps/yuleasr-vscode/src/commands/index.ts:188-215, 298-314`
**Priority:** critical（数据完整性级别的静默失败）

**Approach（决策：发布前"不谎报"，真实接入排期到 Batch D）**：

- web：GitService 方法改为抛
  `GitError('NOT_IMPLEMENTED', ...)`；GitSync/BranchManager/VersionHistory/DiffViewer 捕获后渲染"Git 功能尚未接入（计划中）"禁用态，**不再显示假提交成功**。
- 真实接入（Batch D）：用 `yuleasr-editor-core` 的 693 行 isomorphic-git 实现 +
  `lightning-fs`（浏览器 fs shim），同时移除其默认第三方 CORS 代理
  `cors.isomorphic-git.org`（editor-core gitService.ts:81,117-127，安全项）。
- vscode：`syncWithYuleASR`/`generateCodeForConfig`
  移除"同步完成/生成成功"提示，改为
  `showWarningMessage('该功能尚未实现')`（或接入 core 生成器后真实现——Batch
  C 的 vscode 接入项）。

**Code change:**

```ts
// ── web gitService.ts：stub 改显式失败 ──
export class GitService {
  constructor(_config: GitServiceConfig = {}) {}
  async init(): Promise<void> {
    throw new GitError('Git 功能尚未接入', 'NOT_IMPLEMENTED');
  }
  async getCommits(_ref?: string): Promise<CommitInfo[]> {
    throw new GitError('Git 功能尚未接入', 'NOT_IMPLEMENTED');
  }
  async getBranches(): Promise<BranchInfo[]> {
    throw new GitError('Git 功能尚未接入', 'NOT_IMPLEMENTED');
  }
  async getDiff(_oldOid: string, _newOid: string): Promise<DiffInfo[]> {
    throw new GitError('Git 功能尚未接入', 'NOT_IMPLEMENTED');
  }
  async commit(_message: string, _files: string[]): Promise<string> {
    throw new GitError('Git 功能尚未接入', 'NOT_IMPLEMENTED');
  }
  async createBranch(name: string): Promise<void> {
    throw new GitError('Git 功能尚未接入', 'NOT_IMPLEMENTED');
  }
  async checkoutBranch(name: string): Promise<void> {
    throw new GitError('Git 功能尚未接入', 'NOT_IMPLEMENTED');
  }
  async deleteBranch(name: string): Promise<void> {
    throw new GitError('Git 功能尚未接入', 'NOT_IMPLEMENTED');
  }
}
```

```ts
// ── vscode commands/index.ts syncWithYuleASR（替换 215 行）──
vscode.window.showWarningMessage(
  '同步 yuleASR 功能尚未实现，请使用 Web 端云同步'
);

// generateCodeForConfig（替换 298-314 的 sleep+成功提示）同样改为 warning。
```

**Test:**
web 打开 GitSync 页面 → 显示"未接入"占位且无任何成功提示；vscode 执行 sync/generate 命令 →
warning 提示而非假成功。grep 校验：`git grep -n "stub-commit-oid"` 零命中。

---

### Fix 16: editor-core 零消费者 + 三个空包（@yuletech/api-client、@yuletech/utils）

**File(s):**
`packages/yuleasr-editor-core/package.json`；`packages/@yuletech/api-client/src/index.ts`；`packages/@yuletech/utils/src/index.ts`；`apps/yuleasr-web/package.json`、`apps/yuleasr-vscode/package.json`、`apps/yuleasr-desktop/package.json`
**Priority:** critical（架构）

**Approach（决策）**：

- `@yuletech/utils`：**删除**。`cn()` 移入
  `@yuletech/ui`（ui 已有 cn 合并逻辑）；community 的 localStorage 封装移为
  `apps/yulecommunity/src/lib/storage.ts`（按场景命名，符合禁止泛化命名约定）。
- `@yuletech/api-client`：**先删除依赖引用并标记 deprecated，Batch
  D 实现**（把 web `api.ts` 的 request 与 community `apiClient.request`
  收敛为唯一 fetch 封装，token key 统一）。
- `yuleasr-editor-core`：**保留**（含 693 行 git 实现与 ConfigEngine，是 Fix
  15 真实接入与 Fix 27 修复对象）。本次修复其 E1–E7 缺陷（见 Fix
  27），并让 vscode 验证接入 core（见 Fix 28）；web
  configStore 委托重构列入 roadmap 并在 README 声明，不在本次发布范围。

**Code change:**

```jsonc
// apps/yuleasr-web/package.json / apps/yuleasr-vscode/package.json / apps/yuleasr-desktop/package.json：
// dependencies 删除 "@yuletech/utils": "workspace:*"（若声明）与 "@yuletech/api-client": "workspace:*"（若声明）
// packages/yuleasr-editor-core/package.json：dependencies 删除 "@yuletech/utils": "workspace:*"
// pnpm-workspace 层面：packages/@yuletech/utils、packages/@yuletech/api-client 移出 workspace 或标记 "private": true + 删除 publishConfig
```

**Test:** `pnpm install` 后 `pnpm -r build` 全部通过且无
`@yuletech/utils`/`api-client`
解析；`git grep -rn "from '@yuletech/utils'\|from '@yuletech/api-client'"`
零命中。

---

### Fix 17: 条件引擎（core/conditions）零消费者，web 另写一套 visibleWhen

**File(s):**
`apps/yuleasr-web/src/components/ParameterEditor.tsx`（visibleWhen/enabledWhen 私有实现）；`packages/@yuletech/core/src/conditions/{parser,evaluator,propagator,depends}.ts`
**Priority:** critical（架构）

**Approach（决策：接入 core 引擎，删除 web 私有实现）**：ParameterEditor 的 visibleWhen/enabledWhen 改调
`@yuletech/core/conditions` 的 `parseCondition` +
`ConditionEvaluator.evaluate`；配置数据用 configStore 的
`toModuleConfig`（已是现成转换函数）转成 `ModuleConfig[]` 传入。依赖 Fix
1（编辑链路修好后 visibleWhen 才有意义）与 Fix
20（core 条件引擎健壮性，先修 K2/K4/深度限制再接入）。若某表达式解析失败：按"不可见"处理并在 console 警告（fails
closed）。

**Code change:**

```ts
// ── ParameterEditor.tsx：visibleWhen 求值替换为 core 引擎 ──
import { parseCondition } from '@yuletech/core/conditions';
import { ConditionEvaluator } from '@yuletech/core/conditions';

// 组件内（configs 由 props 传入：ModuleConfig[]，Editor 负责用 toModuleConfig 组装）：
const evaluator = useMemo(() => new ConditionEvaluator(), []);
const visible = useMemo(() => {
  if (!visibleWhen) return true;
  try {
    const ast = parseCondition(visibleWhen);
    return evaluator.evaluate(ast, configs);
  } catch (err) {
    console.warn(
      `[ParameterEditor] 条件表达式解析失败，按不可见处理: ${visibleWhen}`,
      err
    );
    return false;
  }
}, [visibleWhen, configs, evaluator]);
// enabledWhen 同理；渲染处 if (!visible) return null;
```

**Test:**
单测（core 已有 parser/evaluator 测试，补一条 web 集成）：构造两个模块 config，`Can.enabled == true`
的 visibleWhen 在 enabled=false 时隐藏参数。手动：编辑 Can 模块使能开关，观察依赖参数的显隐随 core 引擎结果变化。

---

### Fix 18: 双 ARXML 解析器/导出器 + 双代码生成器（格式分叉）

**File(s):**
`apps/yuleasr-web/src/services/arxml-parser.ts`（fast-xml-parser 版，516 行）；`packages/@yuletech/core/src/adapters/arxml-parser.ts`（DOMParser 版，92 行）；`apps/yuleasr-web/src/services/arxml-exporter.ts`（207 行）；`packages/@yuletech/core/src/plugins/builtins/arxml-export-plugin.ts`；`apps/yuleasr-web/src/services/codegen.ts`（宏头生成，实际使用）；`packages/@yuletech/core/src/generator/ecuc-generator.ts`（1461 行，仅测试引用）
**Priority:** critical（架构）

**Approach（决策：core 为唯一领域出口，web 只留平台适配）**：

1. **ARXML 解析**：把 web 的 fast-xml-parser 版整体提升为
   `core/src/adapters/arxml-parser.ts`（先统一
   `ArxmlParseResult = { modules, errors, warnings }`
   契约，warnings 可为空数组，对应架构 4.7），删除 DOMParser 版；web
   `services/arxml-parser.ts` 改为
   `export { parseArxmlContent } from '@yuletech/core/adapters'`
   薄重导出（避免大改 import 面）。
2. **ARXML 导出**：统一到 core builtin 插件 `arxml-export-plugin`（web 调
   `configToArxml`），删除 web
   `arxml-exporter.ts`；若产物差异影响用户，先跑一次"web 版 vs
   core 版"导出对比测试再切换。
3. **代码生成**：**决策——发布路径保留 web
   codegen.ts**（Editor 实际使用，改动面最小），但必须修复其字符串转义（Fix
   W5/22 的 escapeCString 共用同一工具，提到 core 导出）；`ecuc-generator`
   标注 experimental；宏头生成迁入 core 作为第二个 generator 插件排 Batch D。

**Code change:**

```ts
// ── core/src/adapters/arxml-parser.ts：替换为 fast-xml-parser 实现 ──
// 文件整体从 apps/yuleasr-web/src/services/arxml-parser.ts 迁移；
// 出口契约统一为：
export interface ArxmlParseResult {
  modules: ArxmlModule[];
  errors: string[];
  warnings: string[];
}
// （web 版原 errors 字段保留，warnings 新增，web 调用处不受破坏）

// ── apps/yuleasr-web/src/services/arxml-parser.ts：薄重导出 ──
export {
  parseArxmlContent,
  type ArxmlParseResult,
} from '@yuletech/core/adapters/arxml-parser';
```

**Test:** 用 `reviews`
目录外的样例 .arxml 文件跑解析对比（旧 web 版 vs 新 core 版输出 JSON 一致）；导出对比测试（web
exporter vs core 插件）通过后才删 web exporter；`pnpm build` +
web 导入/导出 ARXML 手动验证。

---

### Fix 19: 验证体系双轨：web DependencyValidator 与 core CrossModuleValidator 并存

**File(s):**
`apps/yuleasr-web/src/core/DependencyValidator.ts`；`apps/yuleasr-web/src/stores/configStore.ts:52-84, 80-83`（catch 静默吞错）；`packages/@yuletech/core/src/validators/cross-module-validator.ts`
**Priority:** critical（架构）+ warning（3.12 静默降级，合并）

**Approach（本次落地两个最小修复，完整合并 Batch D）**：

1. **3.12 静默吞错**：`validateCrossModuleChanges` 的 `catch { return []; }`
   改为返回
   `{ issues, failed }`；failed 时 UI 显示"跨模块验证未执行"警告条（ValidationPanel 加 degraded 状态），杜绝假绿灯。
2. **K10 增量验证空转**（容器参数）：见 Fix
   21（cross-module-validator.ts:249-250 同时查 containers）。
3. 完整合并（Batch D）：把 DependencyValidator 的模块依赖/OS/RTE 规则表达为 core
   validation pipeline 的规则源，删除 `apps/yuleasr-web/src/core/`
   平行实现（含死代码 ConfigComparer/ParameterValidator，见 Fix 31）。

**Code change:**

```ts
// ── configStore.ts：validateCrossModuleChanges 改签名与降级语义 ──
function validateCrossModuleChanges(
  config: ConfigFile,
  changedModuleName: string,
  changedParamName: string
): { issues: ValidationIssue[]; failed: boolean } {
  try {
    // ...原有逻辑不变
    return { issues: errors.map(...), failed: false };
  } catch (err) {
    console.error('[configStore] 跨模块验证未执行（schema 加载失败）:', err);
    return { issues: [], failed: true };
  }
}

// updateParameter / validateConfig 等调用点改为：
// const cross = validateCrossModuleChanges(...);
// set({ validationDegraded: cross.failed, ... });   // ConfigState 新增 validationDegraded: boolean
// ValidationPanel：validationDegraded 时顶部渲染 warning 条「跨模块验证未执行（schema 加载失败），当前结论可能不完整」
```

**Test:** 手动：临时破坏 schema 加载（如删一个 generated
JSON 或 mock 抛错）→ 面板显示降级警告而非"无错误"；修复后警告消失。单测：mock
`loadModuleSchemas` 抛错 → `failed === true`。

---

## Batch D — Warnings（should fix）

### Fix 20: core 条件引擎健壮性（K2 原型链/缺失防御 + K4 畸形数字 + K5 new Function + 解析深度无上限）

**File(s):**
`packages/@yuletech/core/src/conditions/evaluator.ts:71,84,94`；`parser.ts:125-128, 271-279, 355-361`；`propagator.ts:316-333`
**Priority:** warning

**Approach:** ① evaluator 所有 `in` 改 `hasOwnProperty` +
`parameters ?? {}`；② 数字 lexer 限最多一个小数点；③ 删除 propagator 的
`new Function` fallback，解析失败直接抛错；④
parser 加深度计数（>200 抛 SyntaxError）与表达式长度上限（4096）。

**Code change:**

```ts
// ── evaluator.ts：三处访问点统一改为（以 71 行为例）──
const params = config.parameters ?? {};
if (Object.prototype.hasOwnProperty.call(params, paramName)) return params[paramName];
return undefined;
// 84、94 行同样处理（instance.parameters 与 config.parameters 均需 ?? {}）

// ── parser.ts：数字 lexer（替换 125-128）──
if (/[0-9]/.test(input[i])) {
  let dots = 0;
  while (i < input.length && /[0-9.]/.test(input[i])) {
    if (input[i] === '.') {
      if (++dots > 1) throw new SyntaxError(`Invalid number literal at position ${start}`);
    }
    i++;
  }
  tokens.push({ type: 'NUMBER', value: input.slice(start, i), pos: start });
  continue;
}

// ── parser.ts：类字段 + parse 入口限制 ──
// 类内新增：private depth = 0;
// parse()（或 parseExpr 入口）：
parse(input: string): ConditionExpr {
  if (input.length > 4096) throw new SyntaxError('Condition expression too long (max 4096 chars)');
  // ...
}
// parseNot 入口（271）与 parsePrimary 的 LPAREN 分支（355）递归前：
// if (++this.depth > 200) { this.depth = 0; throw new SyntaxError('Condition expression too deeply nested'); }
// （在 parseExpr 统一入口做一次即可覆盖两处递归路径）

// ── propagator.ts：删除 new Function fallback（替换 320-332）──
} catch (err) {
  throw new Error(`Failed to evaluate constraint expression "${input}": ${err instanceof Error ? err.message : String(err)}`);
}
```

**Test:** 单测：`!`.repeat(1e6) 与 10 万层括号 →
SyntaxError（不再栈溢出）；`1.2.3` → SyntaxError；`Mod.__proto__`
求值为 false/undefined 而非原型对象；propagator 表达式非法时抛错而非返回原字符串。

---

### Fix 21: core 验证器缺陷（K1 schemaCache 空转 + K3 range 空壳/Mcu 消息错位 + K8 无防御 + K9 只看首实例 + K10 容器参数增量空转）

**File(s):**
`packages/@yuletech/core/src/plugins/builtins/schema-validator-plugin.ts:31,48`；`cross-module-validator-plugin.ts:49-55`；`validators/yuleasr-validator.ts:82-92, 308-315`；`validators/choice-container-validator.ts:71-81`；`validators/cross-module-validator.ts:132-136, 249-250`
**Priority:** warning

**Code change:**

```ts
// ── schema-validator-plugin.ts：activate 时填充 schemaCache ──
async activate(context: PluginContext): Promise<void> {
  const { loadModuleSchemas } = await import('../../schema/load-generated');
  for (const schema of loadModuleSchemas()) {
    schemaCache.set(schema.name, schema);
  }
  context.registerValidator({ /* 原逻辑不变 */ });
}
// cross-module-validator-plugin.ts 的 activate 同样填充（其 fallback 可保留作兜底）

// ── yuleasr-validator.ts：range 规则实现 min/max（替换 82-91）──
if (rule.type === 'range' && paramValue !== undefined) {
  const numValue = Number(paramValue);
  if (isNaN(numValue)) {
    errors.push({ path: `${config.module}.${paramName}`, message: `${paramName} must be a number`, severity: 'error' });
  } else {
    if (rule.min !== undefined && numValue < rule.min) {
      errors.push({ path: `${config.module}.${paramName}`, message: `${paramName} must be >= ${rule.min}`, severity: 'error' });
    }
    if (rule.max !== undefined && numValue > rule.max) {
      errors.push({ path: `${config.module}.${paramName}`, message: `${paramName} must be <= ${rule.max}`, severity: 'error' });
    }
  }
}
// Mcu custom rule（308-315）：拆成两条——「Mcu 必须启用」与「Mcu 启用时必须提供 clock_frequency」，
// 消息分别修正为 "Mcu must be enabled" 与 "Mcu is enabled but clock_frequency is missing"

// ── choice-container-validator.ts（71-81）：──
// instance.parameters[paramName] → (instance.parameters ?? {})[paramName]

// ── cross-module-validator.ts checkReference（132-136）：遍历全部实例 ──
if (ref.container) {
  const instances = targetConfig.containers?.[ref.container];
  if (Array.isArray(instances) && instances.length > 0) {
    for (const inst of instances) {
      const v = inst?.parameters?.[ref.param];
      if (v === undefined) continue;
      const r = this.evaluateRelation(actualValue, v, ref.relation, targetSchema, ref);
      if (r) {
        return { path: `${targetConfig.module}.${ref.container}[${instances.indexOf(inst)}].${ref.param}`, message: r, severity: ref.severity, code: `CROSS_REF_${ref.relation.toUpperCase()}` };
      }
    }
    return null;
  }
}

// ── cross-module-validator.ts validateAffectedBy（249-250）：容器参数定位 ──
let actualValue = changedConfig.parameters[changedParam];
if (actualValue === undefined && changedConfig.containers) {
  outer: for (const instances of Object.values(changedConfig.containers)) {
    if (!Array.isArray(instances)) continue;
    for (const inst of instances) {
      if (inst && inst.parameters && Object.prototype.hasOwnProperty.call(inst.parameters, changedParam)) {
        actualValue = inst.parameters[changedParam];
        break outer;
      }
    }
  }
}
if (actualValue === undefined || actualValue === null) continue;
```

**Test:**
单测——schema-validator：required/enum/range 真实触发（此前永远 info）；yuleasr
range：min/max 越界报错；cross-module：第 2 个实例违反约束被报出；validateAffectedBy：修改容器参数能触发增量验证；choice-container：缺 parameters 不崩溃。

---

### Fix 22: core 生成器缺陷（K6 OS 引用校验 + K7 RTE 标识符校验 + K11 负整数 + C 字符串转义/W5 代码注入）

**File(s):**
`packages/@yuletech/core/src/generator/os-generator.ts:852,893,1166,1168,1269`；`rte-generator.ts:741-743,753-757,771`；`autosar-format.ts:29-35,40-41,58-62`；`apps/yuleasr-web/src/services/codegen.ts:103-115`
**Priority:** warning（K6/K7/K11/转义；W5 与安全侧"C 代码注入"一致，2 位审查员）

**Code change:**

```ts
// ── core/src/generator/ 新增共享工具（autosar-format.ts 导出）──
export const C_IDENTIFIER_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
export function assertCIdentifier(name: string, what: string): void {
  if (!C_IDENTIFIER_RE.test(name)) {
    throw new Error(`Invalid C identifier for ${what}: "${name}"`);
  }
}
export function escapeCString(value: unknown): string {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

// ── autosar-format.ts formatCValue：整数负数（替换 28-35）──
case 'integer':
  if (typeof value === 'number') {
    if (value < 0) return `((sint32)${value})`;
    if (value <= 0xffff) return `((uint16)${value}U)`;
    return `((uint32)${value}U)`;
  }
  return String(value);

// ── autosar-format.ts：字符串转义（替换 40-41 与 58-62）──
case 'string':
  return `"${escapeCString(value)}"`;
// formatPrimitiveValue 的 string 分支同样：return `"${escapeCString(value)}"`;

// ── os-generator.ts：生成前引用完整性校验（以 Alarm counterRef 852 行为例，taskRef/eventRef 同理）──
// 在收集阶段之后、生成阶段之前：
const knownCounters = new Set(collectedCounters.map(c => c.name.toUpperCase()));
const knownTasks = new Set(collectedTasks.map(t => t.name.toUpperCase()));
// 每个引用处：if (!knownCounters.has(name.toUpperCase())) {
//   errors.push(`OS Alarm "${alarm.name}" 引用了不存在的 Counter "${name}"`); continue/skip;
// }
// 并 assertCIdentifier(name, 'OsAlarmCounterRef')

// ── rte-generator.ts（741-743 等）：拼接宏名前 assertCIdentifier(task.name, 'task') / (iface.name, 'interface')

// ── web codegen.ts formatMacroValue（替换 113 行）：枚举标识符原样、自由文本加引号转义 ──
if (typeof value === 'string') {
  return C_IDENTIFIER_RE.test(value) ? value : `"${escapeCString(value)}"`;
}
// （escapeCString 从 @yuletech/core 导出后 import 使用，单一实现）
```

**Test:**
单测——`formatCValue(-5, 'integer') === '((sint32)-5)'`；`escapeCString('x"\n#include "evil.h"')`
输出无裸引号/换行；os-generator 引用不存在 Counter 时返回 error 而非输出
`OS_COUNTER_ID_XXX`；rte-generator 对 `my-task` 抛错。web
codegen：自由文本参数生成 `#define XXX  "text with spaces"`（带引号）。

---

### Fix 23: 插件 disable→enable 后能力不恢复（K12）

**File(s):**
`packages/@yuletech/core/src/plugins/plugin-manager.ts:163-169, 176-204`
**Priority:** warning

**Code change:**

```ts
// ── plugin-manager.ts：enable 时若实例已失活则重新 activate（替换 163-170）──
async enable(id: string): Promise<boolean> {
  const existing = pluginRegistry.get(id);
  if (!existing) return false;
  existing.meta.enabled = true;
  if (!existing.instance.active) {
    const context = this.createContext(existing.instance, existing.meta);
    await existing.instance.activate(context);
    existing.instance.active = true;
  }
  return true;
}

// disable（176-204）：在 deactivate 后加 existing.instance.active = false;
```

**Test:** 单测：注册 mock 插件（注册一个 validator）→ disable → enable →
registry 中 validator 恢复存在；`getPluginMeta(id).enabled === true`。

---

### Fix 24: web 编辑正确性（W1 substring 匹配 + W2 输入校验分叉 + W8 实例重名 + W9 导入无校验 + W11 timer 泄漏）

**File(s):**
`apps/yuleasr-web/src/pages/Editor.tsx:321-323, 254-259, 787-790`；`components/ParameterEditor.tsx:142-159`；`components/ConfigTree.tsx:496-511`
**Priority:** warning

**Code change:**

```ts
// ── Editor.tsx：selectedModule 精确匹配（替换 321-323）──
const selectedModule = selectedPath
  ? currentConfig?.modules.find(m =>
      new RegExp(`module:${m.id}(/|$)`).test(selectedPath)
    )
  : null;

// ── ParameterEditor.tsx：handleChange 先校验后 setValue（替换 142-159）──
const handleChange = useCallback(
  (newValue: unknown) => {
    const validationError = validateValue(newValue);
    setLocalError(validationError);
    if (!validationError || newValue === '') {
      setValue(newValue);
      setIsDirty(true);
      onChange(newValue);
    }
    // 校验失败：UI 保持旧值并标红（不再出现 UI 与 store 分叉）
  },
  [onChange, validateValue]
);

// ── ConfigTree.tsx confirmRename（496-511）：重名检测（配合 Fix 2 的 store.renameInstance 返回 false）──
if (entry) {
  const exists = dynamicInstances[containerPath]?.some(
    e => e.name === renameValue.trim() && e.name !== entry.name
  );
  if (exists) {
    alert('同一容器下已存在同名实例');
    return;
  }
  renameInstance(containerPath, entry.name, renameValue.trim());
}

// ── Editor.tsx handleImport（254-259）：结构校验 ──
const config = JSON.parse(reader.result as string);
if (!config || typeof config !== 'object' || !Array.isArray(config.modules)) {
  throw new Error('配置文件缺少 modules 字段');
}
setSelectedPath('');
useConfigStore.setState({
  currentConfig: config as ConfigFile,
  isDirty: false,
});
localStorage.setItem('yuleasr_config', JSON.stringify(config));

// ── Editor.tsx（787-790）：pipeline jobId timer 清理 ──
// 用 useRef 保存 timer id；useEffect cleanup 中 clearTimeout；
// 触发新 pipeline 前先 clearTimeout 旧 timer。
```

**Test:**
手动——选中 Cantp 模块面板不再显示 Can 的容器；参数输入超范围值 UI 回显旧值并标红；实例重名被拒绝；导入无 modules 的 JSON 显示明确错误而非白屏；快速连续触发 pipeline 不互相误清 jobId。

---

### Fix 25: web 比较/验证/审计（W4 子容器 diff 丢失 + W6/W7 DependencyValidator + 审计报告 XSS + GlobalSearch 性能）

**File(s):**
`apps/yuleasr-web/src/services/compareEngine.ts:471-493`；`core/DependencyValidator.ts:197, 345-351`；`services/configReportGenerator.ts:396-430`；`components/GlobalSearch.tsx`
**Priority:** warning（W4/W6/审计 XSS）+ suggestion（W7/搜索）

**Code change:**

```ts
// ── compareEngine.ts：容器节点 path 与参数 diff 关联统一（替换 486-488）──
// 根因：容器节点 path=`${md.moduleName}.${cd.containerName}`，而 paramDiffs 的 containerPath
// 用 buildContainerPath 拼接（模块.父容器.子容器）。统一规则：容器节点也使用
// buildContainerPath 的拼接结果作为 path 键：
// 修改 buildDiffTree 中容器节点的 path 生成，与 buildContainerPath(module, container 链) 输出一致；
// moduleParams filter 改为用该统一键匹配。

// ── DependencyValidator.ts required 检查（197 行）──
// value === undefined || value === ''  →  value === undefined || value === null || value === ''

// ── DependencyValidator.ts validateRTEConsistency（345-351）：二选一（决策：实现最小版）──
// 遍历 config 模块的 rte 相关容器（interfaces/ports），校验引用的 interface 存在；
// 至少返回结构性错误；若暂不实现，则在调用处移除并把该能力标记为未启用。
// （完整版接入 core validation pipeline 见 Fix 19 Batch D。）

// ── configReportGenerator.ts：全部插值过 escapeHtml ──
function escapeHtml(s: unknown): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
// 模板插值处：${config.name} → ${escapeHtml(config.name)}，参数值/模块名/校验信息同理。

// ── GlobalSearch.tsx：useMemo 建立模块级倒排索引（suggestion）──
// 用 useMemo(() => buildIndex(config), [config]) 缓存 module→params/containers 索引；
// onQueryChange 时只对索引做过滤，避免每次击键全量扫描。
```

**Test:**
手动——构造两配置仅子容器参数不同的 case，比较视图树中显示参数级 diff；审计报告导出含
`<`/`&` 的配置名，本地打开无脚本执行（源码级检查无未转义插值）。

---

### Fix 26: web API/性能/安全（W3 401 跳转 + 热路径全量校验 + loadFromCloud N+1 + license/yuleosh/审计）

**File(s):**
`apps/yuleasr-web/src/services/api.ts:46-51`；`stores/configStore.ts:52-84`（schema 每次重建）；`stores/licenseStore.ts`；`services/yuleoshPipeline.ts:8,74-89`
**Priority:** warning

**Code change:**

```ts
// ── api.ts：401 不再整页跳转（替换 46-51）──
if (response.status === 401) {
  localStorage.removeItem('yuleasr_token');
  localStorage.removeItem('yuleasr_user');
  // 抛带标记的错误，由调用方/路由层决定跳转（保留 returnUrl）
  const err = new ApiError(401, { message: 'Unauthorized' });
  (err as any).unauthorized = true;
  throw err;
}
// 路由层（如 Layout/App）：捕获 unauthorized 后 `window.location.assign(\`${import.meta.env.BASE_URL}login\`)`，
// 不再用裸 '/login'（适配 /configurator/ base）。

// ── configStore.ts：schema 集合模块级缓存（G1 + 热路径）──
let cachedModuleSchemas: ModuleSchema[] | null = null;
function getModuleSchemas(): ModuleSchema[] {
  if (!cachedModuleSchemas) {
    cachedModuleSchemas = [
      defaultMcuSchema,
      defaultCanSchema,
      defaultGptSchema,
      ...schemaExtractor.getAllSchemas(),
      ...loadModuleSchemas(),
    ];
  }
  return cachedModuleSchemas;
}
// validateCrossModuleChanges 改用 getModuleSchemas()；删除 defaultMcuSchema 等重复导入副作用。

// ── configStore.ts loadFromCloud（640-651）：并发拉取 + 上限 ──
const uncached = serverList.filter(
  item => !localStorage.getItem(`yuleasr_config_${item.id}`)
);
const BATCH = 5;
for (let i = 0; i < uncached.length; i += BATCH) {
  await Promise.all(
    uncached.slice(i, i + BATCH).map(async item => {
      try {
        const detail = await api.get<ConfigFile>(`/v1/api/configs/${item.id}`);
        saveToLocalStorage(detail);
      } catch {
        /* 单个失败跳过 */
      }
    })
  );
}

// ── licenseStore：导出/生成前走服务端验证（Fix 3 之后可用）──
// hasFeature/getFeatureLimit 增加 serverTier 优先：调用 /v1/api/license/validate；
// 离线时仅降级为「离线试用」并在 UI 标注，不再静默视为 Pro。

// ── yuleoshPipeline.ts：默认地址仅 dev ──
const DEFAULT_YULEOSH_URL = import.meta.env.DEV ? 'http://127.0.0.1:8080' : '';
// 生产未配置 VITE_YULEOSH_API_URL 时直接提示「yuleOSH 服务未配置」而非裸调 localhost。
```

**Test:**
手动——token 过期触发操作：不再跳站点根（跳应用内 /configurator/login）；大配置编辑不再逐键重建 schema（Performance 面板确认无重复装配）；50 个云端配置加载并发 5 批完成；license 无网络时显示"离线试用"。

---

### Fix 27: editor-core 引擎缺陷（E1 setValues 假成功 + E2 undo 就地 reverse + E3 redo delete 强转 + E5 空验证 + E6 悬空 id + E7 renamed）

**File(s):**
`packages/yuleasr-editor-core/src/engine/index.ts:296-344, 403-408, 487-500, 532-589, 614-626`；`src/services/gitService.ts:280-296`
**Priority:** warning

**Code change:**

```ts
// ── E1：setValues 先应用成功再记录（重排 282-343 逻辑）──
const results: boolean[] = [];
const entries: HistoryEntry[] = [];
for (const { path, value } of changes) {
  const parts = path.split('.');
  if (parts.length < 2) { results.push(false); continue; }
  const [moduleName, ...paramParts] = parts;
  const paramName = paramParts.join('.');
  const module = config.modules.get(moduleName);
  if (!module) { results.push(false); continue; }
  const oldParam = module.parameters.get(paramName);
  if (!oldParam) { results.push(false); continue; }   // 不存在即失败，不再假成功
  if (this.project.setParameterValue(config.id, moduleName, paramName, value)) {
    entries.push({ type: 'set', path, oldValue: oldParam.value, newValue: value, module: moduleName, parameter: paramName, timestamp: Date.now() });
    results.push(true);
    this.emit('change', { type: 'update', path, newValue: value, module: moduleName, parameter: paramName, timestamp: new Date() });
  } else {
    results.push(false);
  }
}
if (entries.length > 0) this.history.pushBatch(entries, `Batch update of ${entries.length} values`);
return results;

// ── E2：undo 批量用副本（替换 406）──
for (const subEntry of [...batchEntry.entries].reverse()) {

// ── E3：redo delete 真正删除（替换 489-496）──
if (entry.type === 'delete') {
  const module = config.modules.get(entry.module);
  if (module?.parameters.has(entry.parameter)) {
    module.parameters.delete(entry.parameter);
    module.modified = true;
    config.modified = true;
  }
}

// ── E5：engine.validate 不谎报（532-589 出口处）──
// 增加 degraded 语义：仅当有外部 errors 或 schema 校验运行时才返回 valid=true；
// 无 schema 校验能力时返回 { valid: false, degraded: true, errors: [...] }，
// 调用方（ValidationService）将其展示为「校验未执行」。
// （完整接入 core validateAll 见 Fix 19 Batch D。）

// ── E6：engine.import 校验 configId（614-626）──
// const imported = this.project.import(...);
// const targetId = this.project.getConfig(configId) ? configId : imported.id;
// setCurrentConfig(targetId);   // 避免悬空 currentConfigId

// ── E7：gitService renamed 检测（280-296）──
// statusMatrix 三元组 [filepath, headStatus, workdirStatus]：
// 若 head=1 且 workdir=1 且该文件不在 HEAD 树的原始路径集合中 → renamed；
// 或对比两次 statusMatrix 的路径差集判定 rename 对。
```

**Test:**
单测——setValues 对不存在参数返回 false 且不写历史；undo→redo 批次后状态与操作前一致（对称性）；delete→undo→redo 后参数不在 Map 中（遍历不可见）；import 传错误 configId 不产生悬空 currentConfigId。

---

### Fix 28: vscode 扩展（V2 假校验 + CSP + postMessage 中继 + renameModule 路径穿越 + save 无限制）

**File(s):**
`apps/yuleasr-vscode/src/commands/index.ts:221-260, 461-482`；`src/panels/ConfigEditorPanel.ts:124-127, 220-241, 352-360, 426-438, 463-470`
**Priority:** warning（CSP/postMessage/renameModule 为安全项）

**Code change:**

```ts
// ── commands/index.ts validateConfiguration（221-260）：接入 core 校验 ──
import { validateAll } from '@yuletech/core/validators';
// data 结构校验后：
// const result = validateAll(configData);
// diagnostics 由 result.errors/warnings 生成（path/message/severity 映射），
// 不再只查 data.moduleName。

// ── commands/index.ts renameModule（461-482）：名称白名单 ──
validateInput: (value => {
  if (!value || value.trim().length === 0) return 'Module name is required';
  if (!/^[A-Za-z0-9_-]+$/.test(value))
    return '仅允许字母、数字、下划线、连字符';
  return null;
},
  // ── ConfigEditorPanel.ts：CSP 移除 unsafe-inline/unsafe-eval（352-360, 463-470）──
  // script-src 'nonce-...' 保留，删除 'unsafe-inline' 'unsafe-eval'；
  // Vite build.target 与内联策略配合纯 nonce（若仍有动态执行需求，先收紧 connect-src 并标注）。

  // ── ConfigEditorPanel.ts：postMessage 中继校验 origin 与结构（426-438）──
  window.addEventListener('message', event => {
    const allowedOrigins = ['http://localhost:5173', window.origin]; // dev server / webview 自身
    if (!allowedOrigins.includes(event.origin)) return;
    const msg = event.data;
    if (!msg || typeof msg !== 'object' || typeof msg.type !== 'string') return;
    iframe.contentWindow.postMessage(msg, '*');
    // iframe → 扩展方向同样校验结构后再 vscodeApi.postMessage
  }));

// ── ConfigEditorPanel.ts：save 消息大小与结构限制（124-127, 220-241）──
// if (typeof message.data !== 'object' || message.data === null || !Array.isArray(message.data.modules)) return;
// if (JSON.stringify(message.data).length > 10 * 1024 * 1024) return;
```

**Test:**
手动——错误配置（缺必填字段）在 vscode 中打开显示真实 diagnostics；`../evil`
模块名被拒绝；webview 内注入任意消息无法触发写盘（origin/结构校验拦截）；超大 save 消息被丢弃。CSP 验证：webview 加载后
`unsafe-inline` 不在 script-src。

---

### Fix 29: community 安全（Markdown XSS + GitHub token 引导 + 积分刷分 + qaApi token key 不一致）

**File(s):**
`apps/yulecommunity/src/components/blog/MarkdownRenderer.tsx:210-219, 270-307`；`src/services/gitHubClient.ts:8,35-39,62-64`；`src/hooks/usePoints.ts:145-184`；`src/services/qaApi.ts:11`；`src/hooks/useAuth.ts:29`
**Priority:** warning

**Code change:**

```ts
// ── MarkdownRenderer.tsx：解析后净化 + URL 协议白名单 ──
// ① 顺序改为：ReactMarkdown 解析 → DOMPurify.sanitize(html, { ALLOWED_URI_REGEXP: /^(https?:|mailto:|tel:)/i })；
// ② 自定义 a/img 组件内校验：
const SAFE_URL_RE = /^(https?:|mailto:|tel:)/i;
// <a href={SAFE_URL_RE.test(href) ? href : undefined}>
// <img src={SAFE_URL_RE.test(src) ? src : undefined}>

// ── gitHubClient.ts：移除 console.warn 引导（35-39）与 token 明文存储说明；──
// token 改由服务端代理存储/使用（Batch C），前端仅保留内存态。

// ── usePoints.ts / useUserSystem.ts：earnPoints 的 action 白名单 + 频率限制 ──
const ALLOWED_ACTIONS: Record<string, number> = {
  'article.publish': 50,
  'qa.answer': 10 /* ... */,
};
// 客户端只展示服务端返回值；服务端必须自行按 action 白名单 + 每日上限校验（服务端路由实现排 Batch C）。

// ── qaApi.ts：token key 统一 ──
// 删除读 'yulecommunity_token'/'token' 的逻辑，统一走 userApi.setToken 单例（与 useAuth 写入一致）。
```

**Test:** 手动——发一篇含 `[x](javascript:alert(1))`
的博客，点击链接无脚本执行；`git grep -n "yuletech_github_token"`
不再出现 console.warn 引导；QA 登录后写操作不再 401。

---

### Fix 30: api-server 安全/性能 warnings（限流、CORS、模板 IDOR、分页、计数幂等、OIDC、CSS 注入、SSO 邮箱、死路由、监听/安全头）

**File(s):**
`packages/@yuletech/api-server/src/index.ts:23,30`；`routes/auth.ts`、`license.ts`、`auth-sso.ts`、`bswTemplates.ts:109-117,230-284`、`posts.ts:25-32`、`qa.ts:64-78`、`blog.ts:25-30`、`community.ts:32-48`、`sharedConfigs.ts:181-197`、`branding.ts:157-176`
**Priority:** warning

**Code change:**

```ts
// ── index.ts：CORS 白名单（替换 30）──
const CORS_ORIGINS = (
  process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173'
)
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
await app.register(cors, { origin: CORS_ORIGINS });

// ── index.ts：@fastify/rate-limit（新增）──
await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
// 敏感端点单独配额（注册时 per-route 配置）：
// auth/login、auth/register、license/validate、auth-sso/*：max 10 / 分钟（IP+账号双维度）

// ── bswTemplates.ts 列表（109-117）：──
// const status = query.status && userIsAdmin ? query.status : 'published';
// 非 published 查询必须 admin 认证，否则强制 'published' + isPublic 过滤。
// 详情（230-284 / 448-461）：非公开模板仅作者/admin 可读，其余 404。

// ── 列表分页（posts/qa/blog/community）：──
// .limit(parseInt(query.pageSize || '20')).offset((page-1)*pageSize) 下沉到 SQL；
// 返回 { data, total }（count 查询）。

// ── sharedConfigs like（181-197）：唯一约束 + toggle ──
// like 表加 (userId, configId) 唯一约束；存在则删除（取消赞），不存在则插入；事务包裹。

// ── auth-sso.ts OIDC：──
// ① oidcStateStore 定期清理：setInterval 每 10 分钟删除 createdAt 超过 10 分钟的条目；
// ② 回调重定向 token 改 fragment：reply.redirect(`/#token=${token}`) + 前端从 location.hash 读取（配合 Referrer-Policy: no-referrer）；
// ③ jwtVerify 增加 nonce 校验：payload.nonce === state.nonce 且一次性消费（verify 后 delete）。

// ── branding.ts /preview（157-176）：CSS 输出转义 ──
function cssEscape(s: unknown): string {
  return String(s).replace(/[\\()"';\n]/g, '');
}
// `--brand-logo-url: url(${cssEscape(settings.logoUrl)})`
// `--brand-company-name: "${cssEscape(settings.companyName || settings.name)}"`

// ── SSO 用户创建：兜底邮箱（*@oidc.local / *@ldap.local）标记 emailVerified: false ──
// 关键操作（密码重置/绑定）禁止未验证邮箱用户。

// ── 死代码路由（community.ts/configs.ts/share.ts）：删除或注册 ──
// 决策：configs.ts 注册（Fix 3）；community.ts 与 share.ts 删除（无消费者，避免未来绕过统一鉴权）。

// ── index.ts：默认监听与安全头（suggestion 一并做）──
// const HOST = process.env.HOST || '127.0.0.1';
// await app.register(helmet);
// swagger /docs 仅在 NODE_ENV !== 'production' 注册。
```

**Test:** 手动/脚本——未认证 `GET /v1/api/bsw-templates?status=draft`
只返回 published；遍历他人 private 模板 id →
404；连续 like 同一配置只 +1（toggle）；OIDC 回调 URL 无 token 查询串；branding 注入
`");background:red` 被转义。`pnpm audit` 无 critical。

---

### Fix 31: 架构清理（死代码、包出口、工具链、lint 覆盖、Fastify 类型）

**File(s):**
`apps/yuleasr-web/src/core/ConfigComparer.ts`（3.1，350 行零引用）、`core/ParameterValidator.ts`（3.2，285 行零引用）；`packages/@yuletech/core/package.json`（3.5
exports 指 src）；`packages/@yuletech/plugin-sdk/package.json`（3.6）；`apps/yulecommunity/src/services/{github,githubApi,gitHubClient}.ts`（3.7）；`apps/yulecommunity/src/hooks/useBookmarks.ts` +
`hooks/autosar/useBookmarks.ts`（3.8）；`apps/yuleasr-desktop/package.json` +
`electron/main.mjs`（3.10）；`packages/@yuletech/api-server/src/index.ts:41-47`（3.13）；`package.json`
root（3.14） **Priority:** warning

**Code change:**

```ts
// 3.1/3.2：删除 apps/yuleasr-web/src/core/ConfigComparer.ts 与 ParameterValidator.ts
// （对比逻辑在 compareEngine.ts 已存在；领域规则应表达在 schema 由 core validator 执行）

// 3.5/3.6：core 与 plugin-sdk 的 package.json exports/main/module/types 统一指向 dist：
// "main": "./dist/index.js", "module": "./dist/index.mjs", "types": "./dist/index.d.ts"
// 子路径 exports 同样指向 dist/*（先 build 再发布；workspace 解析不受影响）。
// 同时合并 validator/ 与 validators/ 双导出目录：保留一个入口，另一个 re-export 并标注 deprecated。

// 3.7：github 服务合并 —— gitHubClient 作为唯一传输层（含 token/限流/缓存），
// github.ts 提供仓库/贡献数据 API，删除 githubApi.ts 的重叠实现。

// 3.8：双 useBookmarks 改名 —— hooks/useBookmarks.ts → useCloudBookmarks.ts；
// hooks/autosar/useBookmarks.ts → useLocalBookmarks.ts；更新调用方 import。

// 3.10：desktop 依赖声明与实际 import 对齐（删除 @yuletech/core / yuleasr-editor-core 声明，
// 或建立宿主适配层后在 desktop 侧真实使用）；构建链去掉 cd ../yuleasr-web + cp -r 的脆链，
// 改为 pnpm 过滤构建（pnpm --filter yuleasr-web build && pnpm --filter yuleasr-desktop build 引用产物目录）。

// 3.13：Fastify 类型增强，删除 authenticate/requireAdmin 的 any：
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
    requireAdmin: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
  interface FastifyRequest {
    user?: { id: number; email: string; role: string };
  }
}
// 路由内 (app as any).authenticate → app.authenticate；(app as any).jwt → app.jwt。

// 3.14：pnpm catalog 统一版本（vitest/ts/vite），root overrides 移除；
// lint 脚本覆盖全部 apps+packages；ESLint 规则新增：
//   @typescript-eslint/no-empty-interface: error
//   @typescript-eslint/no-explicit-any: warn（新代码禁止，存量按文件白名单清理）
```

**Test:** `pnpm -r build` 全绿；`pnpm lint`
全仓通过且覆盖文件数大幅提升（CI 报告）；`pnpm dlx publint`
校验 core/plugin-sdk 出口指向 dist；desktop 打包流程（dev 与 release 两条命令）均成功。

---

### Fix 32: 测试覆盖（G2）与 CI 回归防护

**File(s):** 全仓（新增测试目录）；CI workflow（`.github/workflows/*.yml`）
**Priority:** warning（C1/C3/K1 这类致命问题若有测试必然在 CI 暴露）

**Approach:**
为本次修复涉及的核心路径补最小测试集，并把 vitest 纳入 CI 门槛（Batch
D 工具链统一后全仓跑）。测试清单与对应 Fix：

1. `configStore.updateParameter` 路径解析（模块级/容器级/实例级/非法路径）→ Fix
   1/2；
2. api-server 路由表契约（`/v1/api/configs` 已注册 + 401/403 行为）→ Fix 3/12；
3. `syncToCloud` 2xx/404/500 三分支的 `isCloudSynced` 语义 → Fix 4；
4. `sanitizeFile/sanitizeFiles`（白名单/大小/数量）→ Fix 5；
5. `ldapEscapeFilterValue` + verifier 超时 → Fix 7/8；
6. `verifyLemonSignature`（v1= 前缀/裸 hex/错误签名）→ Fix 9；
7. core
   conditions：evaluator 缺失/原型键、parser 畸形数字/深度、propagator 无 new
   Function → Fix 20；
8. core validators：schema-validator 真实触发、yuleasr
   range、cross-module 多实例/容器参数增量 → Fix 21；
9. generators：formatCValue 负数/字符串转义、os/rte 引用与标识符校验 → Fix 22；
10. editor-core：setValues 假成功、undo/redo 对称性、redo delete 真删除 → Fix
    27。

**Test:**
CI 新增 job：`pnpm vitest run --changed`（PR 增量）+ 每周全量；`pnpm audit --audit-level=critical`
阻止合并；`git grep` 敏感串检查（JWT 默认值/口令）作为发布 gate。

---

## Suggestions（nice to have，简表）

| #        | 文件                                      | 修复动作                                                             |
| -------- | ----------------------------------------- | -------------------------------------------------------------------- |
| W10      | configStore.ts:695-758                    | seed 前检查旧 key `yuleasr_config`，存在则迁移而非覆盖               |
| A4       | api-server license.ts:87-127              | 激活加幂等/事务防竞态；share 提供显式 share/revoke 接口              |
| 安全     | api-server posts.ts:97-103 等             | tag 计数批量 upsert（createMany + WHERE IN）                         |
| 安全     | editor-core gitService.ts:204-216,358-421 | 分支 resolveRef 并行、diff 惰性读取、Myers diff                      |
| 安全     | api-server license.ts:40-43               | license key 改 HMAC-SHA256 签名（48 位熵不足）                       |
| 安全     | api-server auth-sso.ts:124-162            | OIDC 邮箱冲突要求绑定验证                                            |
| 安全     | core arxml-parser.ts:46-71                | 参数名用 `Object.create(null)`/Map，防 `__proto__` 原型污染          |
| 安全     | vscode ConfigEditorPanel save             | 已并入 Fix 28                                                        |
| 安全     | community qaApi token key                 | 已并入 Fix 29                                                        |
| 架构 4.1 | web types/plugin.ts:8                     | PluginType/PluginMeta 改从 `@yuletech/plugin-sdk` 导入，删除本地复刻 |
| 架构 4.2 | web/community GlobalSearch                | 抽取共享高亮/键盘导航纯函数进 @yuletech/ui                           |
| 架构 4.3 | web/community bswTemplate/config 类型     | 收敛到 api-server zod schema（与 Fix 13 联动）                       |
| 架构 4.6 | desktop main.mjs:21-85                    | 更新状态改 IPC 推渲染层，移除阻塞式弹窗                              |
| 架构 4.7 | core/web ArxmlParseResult                 | 已并入 Fix 18（统一 { modules, errors, warnings }）                  |
| 架构 4.8 | vscode media/webview 产物                 | 产物入 .gitignore，发布流水线顺序构建                                |

---

## Order of Operations

### 依赖关系

```
Fix 1 (updateParameter) ──► Fix 2 (实例持久化，复用 param: 通路)
Fix 3 (API 链路) ──► Fix 4 (isCloudSynced，依赖 API 可用才有意义)
Fix 3 ──► Fix 11 (社区登录去 mock，依赖前缀契约)
Fix 6 (JWT fail-fast) ──► Fix 12 (插件鉴权，无有效 JWT 则鉴权无意义)
Fix 14 (双 ORM 收敛) ──► Fix 30 中涉及 Prisma 路由的项（迁移时顺带修）
Fix 16 (editor-core 定位决策) ──► Fix 15 (Git 接入目标) / Fix 27 / Fix 28 (vscode 接入 core)
Fix 1 ──► Fix 17 (visibleWhen 接入 core 引擎)
Fix 20 (条件引擎健壮性) ──► Fix 17（先修 core 再接入）
Fix 18 (ARXML/生成收敛) 与 Fix 22 (转义) 可并行，但共用 escapeCString 工具，先提公共函数
```

### 执行批次

**Batch A（P0 数据丢失，建议 1 人 3 天）**

1. Fix 1（C1）→ 2（C2）→ 3（C3，含 A1/A2）→ 4（C4），每步跑对应单测；
2. 合并交付验证：编辑→保存→导出→刷新全链路。

**Batch B（P0 安全，建议 2 人并行 2 天）**

- 人 1：Fix 5（Electron）、Fix 6（JWT）、Fix 7/8（LDAP）、Fix 9/10（支付）；
- 人 2：Fix 11（社区认证，先等 Fix 3 合入）、Fix 12（插件）、Fix 13（类型核对 +
  ESLint 护栏）；
- 合并后跑安全回归：认证矩阵（匿名/普通/admin）打全部受保护端点。

**Batch C（架构收敛决策，建议 1-2 人 3-5 天）**

1. 先做决策记录（ADR）：Fix 14 双 ORM、Fix 16 空包/editor-core、Fix
   18 生成出口、Fix 19 验证出口——决策先行，代码跟随；
2. Fix 14 双 ORM 迁移最重，独占一个并行轨道；
3. Fix 15/17/18/19 的最小落地与 Fix 13 收尾。

**Batch D（warnings + suggestions，可 2-3 人并行 3-5 天）**

- 轨道 1（core）：Fix 20 → 21 → 22 → 23 → 32（core 测试）；
- 轨道 2（web）：Fix 24 → 25 → 26 → 32（web 测试）；
- 轨道 3（server/vscode/community）：Fix 27 → 28 → 29 → 30 → 31 → 32；
- 全部合入后：工具链统一（Fix 31）→ lint 全量 → CI 全量 vitest → 发布检查单。

---

## Risk

| 风险                                          | 涉及 Fix  | 说明与缓解                                                                                                                                                                                                                                                                         |
| --------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **C1/C2 路径契约变更破坏其他调用方**          | 1, 2      | GlobalSearch 已生成 `param:` 路径（兼容）；但 ConfigCompareDialog 的 `syncParameter` 使用 `ParamDiff` 的 `containerPath`（`模块.容器.参数` 点分格式）直接调 store——需核对并统一为 `/` 路径格式，否则"同步到 B 侧"仍失效。缓解：修完后全量 grep `updateParameter(` 调用点逐一验证。 |
| **C2 提升实例到 store 的大重构**              | 2         | ConfigTree 1433 行，动态实例初始化/嵌套实例 seeding 逻辑复杂；迁移时容易破坏"嵌套 multiple 容器"场景。缓解：保留现有 collect/seed 算法只换数据源；加嵌套容器 fixture 单测；分两步合入（先 store 化，再 Editor 虚容器改造）。                                                       |
| **C3 前缀统一影响存量部署**                   | 3, 11, 26 | 生产已部署环境若依赖网关重写 `/api`，改 `/v1` 需同步改网关/反代配置；本地 localStorage 旧配置 id 为字符串，同步后回写数字 id 的迁移逻辑要覆盖"列表已存在但 currentConfig.id 未更新"的边角。缓解：README 部署章节同步更新；`loadFromCloud` 合并逻辑补测试。                         |
| **JWT fail-fast 打断开发环境**                | 6         | 所有本地启动（含 CI、docker-compose、示例 .env）必须配 ≥32 字符密钥；漏配即启动失败。缓解：`.env.example` + `pnpm dev` 脚本引导；CI 注入测试密钥；把报错信息写成可直接复制执行的命令。                                                                                             |
| **LDAP 转义后过滤器语义变化**                 | 7         | 若现有 LDAP_SEARCH_FILTER 模板已含转义字符或依赖通配符匹配（如 `(uid={{username}}*)`），转义会改变行为。缓解：单测覆盖带 `*` 的模板；部署说明要求用精确匹配模板；上线前用测试 LDAP 验证。                                                                                          |
| **支付加固导致合法 webhook 被拒**             | 9         | LemonSqueezy 官方 `X-Signature` 带 `v1=` 前缀，旧实现把整个头当裸 hex 比对（恒失败或巧合通过）；新实现按 `v1=` 解析后，之前"侥幸通过"的部署会突然 401。缓解：上线前用官方测试事件验证；eventId 迁移（旧记录无 `evt_` 前缀）需兼容查询。                                            |
| **社区去 mock 后后端故障窗口无法登录**        | 11        | 移除降级后，服务端宕机时用户看到"服务不可用"——功能可用性下降，但这是有意的安全取舍（review 结论）。缓解：UI 文案明确"稍后重试"；监控告警补齐。                                                                                                                                     |
| **双 ORM 迁移的数据一致性**                   | 14        | sqlite(prisma) → postgres(drizzle) 字段漂移（`password` vs `password_hash`、缺 `ssoProvider` 等）；bcrypt hash 可直接拷贝，但 enum/关系映射（like 表、tag 关联）需逐一核对。缓解：迁移脚本先跑 dry-run 统计；迁移后全量 API 冒烟 + 抽样数据比对；旧库保留只读备份一周。            |
| **生成/导出收敛改变用户可见产物**             | 18, 22    | web 版与 core 版 ARXML 导出 XML 结构不同；codegen 字符串加引号/转义后 `#define` 输出变化，依赖"裸标识符宏"的下游代码可能编译差异。缓解：先跑产物 diff 测试（同一配置两版输出对比）再切换；codegen 变更在 release notes 标注 breaking。                                             |
| **验证降级状态误报**                          | 19, 21    | `validationDegraded` 若在 schema 加载慢时短暂置位，UI 可能闪"验证未执行"。缓解：降级状态只在异常路径设置（catch），正常路径恒 false；加防抖避免闪烁。                                                                                                                              |
| **热路径缓存引入 stale schema**               | 26        | `getModuleSchemas()` 模块级缓存后，schema 更新（如 hot reload）不会反映。缓解：dev 模式禁用缓存或暴露 `invalidateSchemasCache()`；缓存键含版本号。                                                                                                                                 |
| **undo/redo 重构破坏既有历史语义**            | 27        | E1 重构后批量历史只记录成功项——旧版本写入的历史（含假成功项）在升级后 undo 可能跳过。缓解：历史条目加版本字段；发布说明提示升级后旧历史不可回放（可接受，editor-core 当前无消费者）。                                                                                              |
| **工具链统一（catalog/lint 全量）的连锁报错** | 31        | 全仓开 lint 会暴露存量 any/未用变量海量告警；`no-explicit-any` 若直接 error 会阻塞合并。缓解：先 `warn` + 文件白名单，逐步清零后再升 error；工具链版本统一放 Batch D 最后做。                                                                                                      |
| **测试补强节奏**                              | 32        | 测试与被测修复同 PR 合入，避免"修复合了、测试拖着"；CI `--changed` 增量跑保证 PR 级反馈，全量跑放 nightly，防止仓库变大后 CI 过慢。                                                                                                                                                |

---

## 验收口径（Done 定义）

1. **Batch
   A**：编辑器改参数→保存→导出→刷新，值全程一致；动态实例随配置持久化；登录/云同步/锁在 dev 全链路 2xx；UI 不再出现假"已云同步"。
2. **Batch B**：`git grep`
   敏感串零命中；匿名/普通用户对全部受保护端点 401/403；Electron 恶意 payload 全部被拒；LDAP/支付/社区认证按本计划测试通过。
3. **Batch
   C**：双 ORM 收敛到 Drizzle（prisma 目录删除）；Git/ARXML/生成/验证出口决策落 ADR 且无"假成功"路径；空包处置完毕。
4. **Batch D**：全仓 lint + vitest + `pnpm audit` 绿；Fix 20-32 各自测试通过。
