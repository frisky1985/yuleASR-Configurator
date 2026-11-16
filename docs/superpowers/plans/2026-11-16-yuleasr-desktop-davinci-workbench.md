# yuleASR Configurator 桌面工作台实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把桌面端配置器改造成 DaVinci 式工作台：左树 / 中参数 / 右检查器，底部问题面板，可执行修复，并补齐桌面专属能力。

**Architecture:** 在 `yuleasr-web` 内新增 `components/workbench/` 面板组件与两个 store（布局设置持久化到 `settingsStore`，会话选中态放 `workbenchStore`）；`Editor.tsx` 从 1200 行单体退化为编排层。桌面能力全部经 `window.electronAPI` 门控，Web 端行为不变。

**Tech Stack:** React 19 + TypeScript 7 + Zustand 5 + Tailwind 4 + Vitest 4 + @testing-library/react 16 + Electron 43。

**Spec:** [2026-11-16-yuleasr-desktop-davinci-workbench-design.md](../specs/2026-11-16-yuleasr-desktop-davinci-workbench-design.md)

---

## 文件结构

**新建**

| 文件 | 职责 |
| --- | --- |
| `apps/yuleasr-web/src/stores/workbenchStore.ts` | 会话态：选中问题、已确认问题、当前段标签 |
| `apps/yuleasr-web/src/stores/fix-executor.ts` | `applyFix(config, fix)` 纯函数 + 容器定位 |
| `apps/yuleasr-web/src/lib/issue-target.ts` | `issueToConfigPath`：问题 → 配置路径 |
| `apps/yuleasr-web/src/components/workbench/WorkbenchShell.tsx` | 三段布局、分隔条、底部折叠 |
| `apps/yuleasr-web/src/components/workbench/InspectorPane.tsx` | 检查器四段 + 应用修复 |
| `apps/yuleasr-web/src/components/workbench/ProblemsPanel.tsx` | 问题列表、过滤、确认、定位 |
| `apps/yuleasr-web/src/hooks/useWorkbenchShortcuts.ts` | 桌面快捷键（`isElectron` 门控） |
| `apps/yuleasr-web/src/components/workbench/ArxmlDropZone.tsx` | ARXML 拖拽导入（桌面） |
| `apps/yuleasr-web/src/hooks/useDraftAutosave.ts` | 草稿静默保存（桌面） |
| `apps/yuleasr-web/src/pages/StartPage.tsx` | 启动工作台（桌面） |

**修改**

| 文件 | 改动 |
| --- | --- |
| `apps/yuleasr-web/src/types/config.ts` | `FixDescriptor`；`ValidationIssue.fix` |
| `apps/yuleasr-web/src/core/DependencyValidator.ts` | 三类问题输出 `fix` |
| `apps/yuleasr-web/src/stores/settingsStore.ts` | `workbench` 布局设置 + persist |
| `apps/yuleasr-web/src/stores/configStore.ts` | `applyIssueFix` action |
| `apps/yuleasr-web/src/pages/Editor.tsx` | 接入工作台，替换 913–1086 行布局 |
| `apps/yuleasr-web/src/App.tsx` | 桌面端 `/` 指向启动工作台 |
| `apps/yuleasr-web/src/types/electron.d.ts` | 新增桌面 API 类型 |
| `apps/yuleasr-desktop/electron/main.mjs` | 多窗口、草稿 IPC |
| `apps/yuleasr-desktop/electron/preload.mjs` | 暴露新 API |
| `apps/yuleasr-desktop/electron/desktop-utils.mjs` | 草稿路径与内容校验 |

---

## Task 1: 扩展问题模型与校验器 fix 输出

**Files:**
- Modify: `apps/yuleasr-web/src/types/config.ts:250-262`
- Modify: `apps/yuleasr-web/src/core/DependencyValidator.ts:196-252`、`:69-80`
- Test: `apps/yuleasr-web/src/core/__tests__/fix-descriptor.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
// apps/yuleasr-web/src/core/__tests__/fix-descriptor.test.ts
import { describe, it, expect } from 'vitest';

import { DependencyValidator } from '@/core/DependencyValidator';
import type { ConfigFile } from '@/types';

function makeConfig(partial: Partial<ConfigFile>): ConfigFile {
  return {
    id: 'c1',
    name: 'test',
    targetChip: 'x',
    modules: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  } as ConfigFile;
}

describe('校验问题携带可执行修复描述', () => {
  it('参数超过 max 时输出 clamp-max', () => {
    const config = makeConfig({
      modules: [
        {
          id: 'can',
          name: 'Can',
          layer: 'ECUAL',
          enabled: true,
          description: '',
          parameters: [{ id: 'baud', name: 'BaudRate', type: 'integer', value: 5000000, max: 1000000 }],
          containers: [],
          dependencies: [],
        },
      ],
    } as Partial<ConfigFile>);

    const result = new DependencyValidator(config).validate();
    const issue = result.errors.find(i => i.parameter === 'BaudRate');
    expect(issue?.fix).toEqual({
      kind: 'clamp-max',
      module: 'Can',
      containerPath: undefined,
      parameter: 'BaudRate',
      value: 1000000,
    });
  });

  it('必填参数缺失且存在默认值时输出 set-default', () => {
    const config = makeConfig({
      modules: [
        {
          id: 'com',
          name: 'Com',
          layer: 'ECUAL',
          enabled: true,
          description: '',
          parameters: [
            { id: 'mode', name: 'ComMode', type: 'enum', value: null, defaultValue: 'NORMAL', validation: { required: true } },
          ],
          containers: [],
          dependencies: [],
        },
      ],
    } as Partial<ConfigFile>);

    const result = new DependencyValidator(config).validate();
    const issue = result.errors.find(i => i.parameter === 'ComMode');
    expect(issue?.fix).toEqual({
      kind: 'set-default',
      module: 'Com',
      containerPath: undefined,
      parameter: 'ComMode',
      value: 'NORMAL',
    });
  });

  it('必需依赖未启用时输出 enable-module', () => {
    const config = makeConfig({
      modules: [
        {
          id: 'dem',
          name: 'Dem',
          layer: 'ECUAL',
          enabled: true,
          description: '',
          parameters: [],
          containers: [],
          dependencies: [{ module: 'NvM', required: true, autoEnable: true }],
        },
        { id: 'nvm', name: 'NvM', layer: 'ECUAL', enabled: false, description: '', parameters: [], containers: [], dependencies: [] },
      ],
    } as Partial<ConfigFile>);

    const result = new DependencyValidator(config).validate();
    const issue = result.errors.find(i => i.dependencyTarget === 'NvM');
    expect(issue?.fix).toEqual({ kind: 'enable-module', module: 'NvM' });
  });
});
```

- [ ] **Step 2: 运行确认失败**

Run: `pnpm --filter yuleasr-web test -- src/core/__tests__/fix-descriptor.test.ts`
Expected: FAIL，`issue?.fix` 为 `undefined`。

- [ ] **Step 3: 加类型**

在 `apps/yuleasr-web/src/types/config.ts` 的 `ValidationIssue` 之前插入：

```ts
export type FixDescriptor =
  | { kind: 'clamp-min'; module: string; containerPath?: string; parameter: string; value: number }
  | { kind: 'clamp-max'; module: string; containerPath?: string; parameter: string; value: number }
  | { kind: 'set-default'; module: string; containerPath?: string; parameter: string; value: unknown }
  | { kind: 'enable-module'; module: string };
```

在 `ValidationIssue` 内追加两个可选字段：

```ts
  /** 可安全自动执行的修复；缺省表示只能人工处理 */
  fix?: FixDescriptor;
  /** 用户已确认/忽略（会话内有效，不落库） */
  acknowledged?: boolean;
```

- [ ] **Step 4: 校验器输出 fix**

`DependencyValidator.validateParameter` 中，min/max 分支改为（保留原有 `suggestion`）：

```ts
      if (param.min !== undefined && val < param.min) {
        this.addIssue({
          path,
          message: `Value ${val} is below minimum ${param.min}`,
          severity: 'error',
          module: moduleName,
          parameter: param.name,
          suggestion: `Set value to at least ${param.min}`,
          // 实例级参数不支持自动修复（避免误改同容器其他实例）
          fix: instanceName
            ? undefined
            : {
                kind: 'clamp-min',
                module: moduleName,
                containerPath,
                parameter: param.name,
                value: param.min,
              },
        });
      }
      if (param.max !== undefined && val > param.max) {
        this.addIssue({
          path,
          message: `Value ${val} exceeds maximum ${param.max}`,
          severity: 'error',
          module: moduleName,
          parameter: param.name,
          suggestion: `Set value to at most ${param.max}`,
          fix: instanceName
            ? undefined
            : {
                kind: 'clamp-max',
                module: moduleName,
                containerPath,
                parameter: param.name,
                value: param.max,
              },
        });
      }
```

必填分支：

```ts
    if (
      param.validation?.required &&
      (param.value === undefined || param.value === null || param.value === '')
    ) {
      this.addIssue({
        path,
        message: `Parameter "${param.name}" is required`,
        severity: 'error',
        module: moduleName,
        parameter: param.name,
        fix:
          !instanceName && param.defaultValue !== undefined
            ? {
                kind: 'set-default',
                module: moduleName,
                containerPath,
                parameter: param.name,
                value: param.defaultValue,
              }
            : undefined,
      });
    }
```

依赖分支（`:69-80`）追加 `fix`：

```ts
            suggestion: dep.autoEnable
              ? `Enable ${dep.module} automatically`
              : `Enable ${dep.module} module`,
            fix: { kind: 'enable-module', module: dep.module },
```

- [ ] **Step 5: 运行测试**

Run: `pnpm --filter yuleasr-web test -- src/core/__tests__/fix-descriptor.test.ts src/core/__tests__/dependency-validator.test.ts`
Expected: 全部 PASS。

- [ ] **Step 6: 提交**

```bash
git add apps/yuleasr-web/src/types/config.ts apps/yuleasr-web/src/core/DependencyValidator.ts apps/yuleasr-web/src/core/__tests__/fix-descriptor.test.ts
git commit -m "feat(validation): 三类可执行修复描述符"
```

---

## Task 2: applyFix 纯函数

**Files:**
- Create: `apps/yuleasr-web/src/stores/fix-executor.ts`
- Test: `apps/yuleasr-web/src/stores/__tests__/fix-executor.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
// apps/yuleasr-web/src/stores/__tests__/fix-executor.test.ts
import { describe, it, expect } from 'vitest';

import { applyFix } from '@/stores/fix-executor';
import type { ConfigFile } from '@/types';

const base = {
  id: 'c1',
  name: 'test',
  targetChip: 'x',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as ConfigFile;

describe('applyFix', () => {
  it('模块级参数夹值', () => {
    const config = {
      ...base,
      modules: [
        {
          id: 'can',
          name: 'Can',
          layer: 'ECUAL',
          enabled: true,
          description: '',
          parameters: [{ id: 'baud', name: 'BaudRate', type: 'integer', value: 5000000 }],
          containers: [],
          dependencies: [],
        },
      ],
    } as ConfigFile;

    const next = applyFix(config, {
      kind: 'clamp-max',
      module: 'Can',
      parameter: 'BaudRate',
      value: 1000000,
    });
    expect(next.modules[0].parameters[0].value).toBe(1000000);
    expect(config.modules[0].parameters[0].value).toBe(5000000); // 不可变
  });

  it('静态容器参数按 containerPath 末段定位', () => {
    const config = {
      ...base,
      modules: [
        {
          id: 'can',
          name: 'Can',
          layer: 'ECUAL',
          enabled: true,
          description: '',
          parameters: [],
          containers: [
            {
              id: 'CanConfigSet',
              name: 'CanConfigSet',
              parameters: [{ id: 'baud', name: 'BaudRate', type: 'integer', value: 9 }],
            },
          ],
          dependencies: [],
        },
      ],
    } as ConfigFile;

    const next = applyFix(config, {
      kind: 'clamp-max',
      module: 'Can',
      containerPath: 'CanConfigSet',
      parameter: 'BaudRate',
      value: 1000000,
    });
    expect(next.modules[0].containers[0].parameters[0].value).toBe(1000000);
  });

  it('启用模块', () => {
    const config = {
      ...base,
      modules: [
        { id: 'nvm', name: 'NvM', layer: 'ECUAL', enabled: false, description: '', parameters: [], containers: [], dependencies: [] },
      ],
    } as ConfigFile;

    const next = applyFix(config, { kind: 'enable-module', module: 'NvM' });
    expect(next.modules[0].enabled).toBe(true);
  });
});
```

- [ ] **Step 2: 运行确认失败**

Run: `pnpm --filter yuleasr-web test -- src/stores/__tests__/fix-executor.test.ts`
Expected: FAIL，`Cannot find module '@/stores/fix-executor'`。

- [ ] **Step 3: 实现**

```ts
// apps/yuleasr-web/src/stores/fix-executor.ts
import type { ConfigContainer, ConfigFile, ConfigParameter, FixDescriptor } from '@/types';

import { matchesParamKey } from './param-update';

/** 在容器树中按 id 或 name 定位容器，返回其 id；找不到返回 null */
function resolveContainerId(
  containers: ConfigContainer[],
  containerPath: string
): string | null {
  const target = containerPath.split('.').filter(Boolean).pop();
  if (!target) return null;

  for (const container of containers) {
    if (container.id === target || container.name === target) return container.id;
    if (container.subContainers?.length) {
      const nested = resolveContainerId(container.subContainers, containerPath);
      if (nested) return nested;
    }
  }
  return null;
}

/**
 * 应用一个修复描述符，返回新配置（不修改入参）。
 * 只处理模块级与静态容器参数；实例级参数不会产出 fix。
 */
export function applyFix(config: ConfigFile, fix: FixDescriptor): ConfigFile {
  const stamp = new Date().toISOString();

  if (fix.kind === 'enable-module') {
    return {
      ...config,
      modules: config.modules.map(m =>
        m.name === fix.module || m.id === fix.module ? { ...m, enabled: true } : m
      ),
      updatedAt: stamp,
    };
  }

  const nextValue = (param: ConfigParameter): ConfigParameter =>
    param.value === fix.value
      ? param
      : { ...param, value: fix.value as ConfigParameter['value'] };

  const modules = config.modules.map(module => {
    if (module.name !== fix.module && module.id !== fix.module) return module;

    if (!fix.containerPath) {
      return {
        ...module,
        parameters: module.parameters.map(p =>
          matchesParamKey(p, fix.parameter) ? nextValue(p) : p
        ),
      };
    }

    const containerId = resolveContainerId(module.containers, fix.containerPath);
    if (!containerId) return module;

    const patch = (containers: ConfigContainer[]): ConfigContainer[] =>
      containers.map(container => {
        if (container.id !== containerId) {
          return container.subContainers?.length
            ? { ...container, subContainers: patch(container.subContainers) }
            : container;
        }
        return {
          ...container,
          parameters: container.parameters.map(p =>
            matchesParamKey(p, fix.parameter) ? nextValue(p) : p
          ),
        };
      });

    return { ...module, containers: patch(module.containers) };
  });

  return { ...config, modules, updatedAt: stamp };
}
```

- [ ] **Step 4: 运行测试**

Run: `pnpm --filter yuleasr-web test -- src/stores/__tests__/fix-executor.test.ts`
Expected: 3 passed。

- [ ] **Step 5: 提交**

```bash
git add apps/yuleasr-web/src/stores/fix-executor.ts apps/yuleasr-web/src/stores/__tests__/fix-executor.test.ts
git commit -m "feat(workbench): applyFix 纯函数"
```

---

## Task 3: configStore 增加 applyIssueFix

**Files:**
- Modify: `apps/yuleasr-web/src/stores/configStore.ts:196-223`（接口）、store 实现内
- Test: `apps/yuleasr-web/src/stores/__tests__/apply-issue-fix.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
// apps/yuleasr-web/src/stores/__tests__/apply-issue-fix.test.ts
import { describe, it, expect, beforeEach } from 'vitest';

import { useConfigStore } from '@/stores/configStore';
import type { ConfigFile } from '@/types';

const config = {
  id: 'c1',
  name: 'test',
  targetChip: 'x',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  modules: [
    {
      id: 'can',
      name: 'Can',
      layer: 'ECUAL',
      enabled: true,
      description: '',
      parameters: [{ id: 'baud', name: 'BaudRate', type: 'integer', value: 5000000, max: 1000000 }],
      containers: [],
      dependencies: [],
    },
  ],
} as ConfigFile;

describe('applyIssueFix', () => {
  beforeEach(() => {
    useConfigStore.setState({ currentConfig: structuredClone(config), isDirty: false });
  });

  it('应用 clamp-max 后参数值被修正且标记脏', () => {
    useConfigStore.getState().applyIssueFix({
      id: 'e1',
      path: 'Can.BaudRate',
      message: 'too big',
      severity: 'error',
      module: 'Can',
      parameter: 'BaudRate',
      fix: { kind: 'clamp-max', module: 'Can', parameter: 'BaudRate', value: 1000000 },
    });

    const state = useConfigStore.getState();
    expect(state.currentConfig?.modules[0].parameters[0].value).toBe(1000000);
    expect(state.isDirty).toBe(true);
  });

  it('无 fix 的问题不产生修改', () => {
    const before = useConfigStore.getState().currentConfig;
    useConfigStore.getState().applyIssueFix({
      id: 'e2',
      path: 'Can.BaudRate',
      message: 'manual only',
      severity: 'error',
      module: 'Can',
      parameter: 'BaudRate',
    });
    expect(useConfigStore.getState().currentConfig).toBe(before);
  });
});
```

- [ ] **Step 2: 运行确认失败**

Run: `pnpm --filter yuleasr-web test -- src/stores/__tests__/apply-issue-fix.test.ts`
Expected: FAIL，`applyIssueFix is not a function`。

- [ ] **Step 3: 实现**

在 `ConfigState` 接口中 `updateParameter` 之后追加：

```ts
  /** 应用问题自带的可执行修复；无 fix 时不做任何事 */
  applyIssueFix: (issue: ValidationIssue) => void;
```

在 store 实现中 `updateParameter` 之后追加（引入 `applyFix` 与 `DependencyValidator`）：

```ts
      applyIssueFix: issue => {
        const { currentConfig } = get();
        if (!currentConfig || !issue.fix) return;

        const updatedConfig = applyFix(currentConfig, issue.fix);
        const result = new DependencyValidator(updatedConfig).validate();

        set({
          currentConfig: updatedConfig,
          validationResult: result,
          validationIssues: [...result.errors, ...result.warnings, ...result.info],
          isDirty: true,
        });
      },
```

顶部 import 增加：

```ts
import { applyFix } from './fix-executor';
```

- [ ] **Step 4: 运行测试**

Run: `pnpm --filter yuleasr-web test -- src/stores/__tests__/apply-issue-fix.test.ts`
Expected: 2 passed。

- [ ] **Step 5: 提交**

```bash
git add apps/yuleasr-web/src/stores/configStore.ts apps/yuleasr-web/src/stores/__tests__/apply-issue-fix.test.ts
git commit -m "feat(workbench): configStore.applyIssueFix"
```

---

## Task 4: 工作台布局设置持久化

**Files:**
- Modify: `apps/yuleasr-web/src/stores/settingsStore.ts:46-51`、`:53-71`、`:73-104`、`:138-142`、`:160-170`
- Test: `apps/yuleasr-web/src/stores/__tests__/workbench-settings.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
// apps/yuleasr-web/src/stores/__tests__/workbench-settings.test.ts
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';

import { useSettingsStore } from '@/stores/settingsStore';

describe('workbench 布局设置', () => {
  it('默认值可用', () => {
    expect(useSettingsStore.getState().workbench).toEqual({
      treeWidth: 280,
      inspectorWidth: 320,
      bottomHeight: 180,
      bottomCollapsed: false,
      activeSegment: 'basic',
      problemsFilter: 'all',
      bottomTab: 'problems',
    });
  });

  it('updateWorkbenchSettings 局部合并', () => {
    useSettingsStore.getState().updateWorkbenchSettings({ treeWidth: 340 });
    expect(useSettingsStore.getState().workbench.treeWidth).toBe(340);
    expect(useSettingsStore.getState().workbench.inspectorWidth).toBe(320);
  });
});
```

- [ ] **Step 2: 运行确认失败**

Run: `pnpm --filter yuleasr-web test -- src/stores/__tests__/workbench-settings.test.ts`
Expected: FAIL，`workbench` 为 undefined。

- [ ] **Step 3: 实现**

在 `UISettings` 之后新增类型：

```ts
export type WorkbenchSegment = 'basic' | 'bsw' | 'communication' | 'diagnostics' | 'generate';
export type ProblemFilter = 'all' | 'error' | 'warning' | 'info';
export type BottomTab = 'problems' | 'generate' | 'output' | 'console';

export interface WorkbenchSettings {
  treeWidth: number;
  inspectorWidth: number;
  bottomHeight: number;
  bottomCollapsed: boolean;
  activeSegment: WorkbenchSegment;
  problemsFilter: ProblemFilter;
  bottomTab: BottomTab;
}
```

`SettingsState` 中新增字段与 action：

```ts
  workbench: WorkbenchSettings;
  updateWorkbenchSettings: (settings: Partial<WorkbenchSettings>) => void;
```

`defaultSettings` 中新增：

```ts
  workbench: {
    treeWidth: 280,
    inspectorWidth: 320,
    bottomHeight: 180,
    bottomCollapsed: false,
    activeSegment: 'basic' as WorkbenchSegment,
    problemsFilter: 'all' as ProblemFilter,
    bottomTab: 'problems' as BottomTab,
  },
```

action 实现（紧跟 `updateUISettings`）：

```ts
        updateWorkbenchSettings: settings => {
          set(state => ({
            workbench: { ...state.workbench, ...settings },
          }));
        },
```

`partialize` 增加：

```ts
          workbench: state.workbench,
```

- [ ] **Step 4: 运行测试**

Run: `pnpm --filter yuleasr-web test -- src/stores/__tests__/workbench-settings.test.ts`
Expected: 2 passed。

- [ ] **Step 5: 提交**

```bash
git add apps/yuleasr-web/src/stores/settingsStore.ts apps/yuleasr-web/src/stores/__tests__/workbench-settings.test.ts
git commit -m "feat(workbench): 布局设置持久化"
```

---

## Task 5: workbenchStore 会话态

**Files:**
- Create: `apps/yuleasr-web/src/stores/workbenchStore.ts`
- Test: `apps/yuleasr-web/src/stores/__tests__/workbench-store.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
// apps/yuleasr-web/src/stores/__tests__/workbench-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';

import { useWorkbenchStore } from '@/stores/workbenchStore';

describe('workbenchStore 会话态', () => {
  beforeEach(() => {
    useWorkbenchStore.getState().resetForConfig('c1');
  });

  it('选中与确认', () => {
    const store = useWorkbenchStore.getState();
    store.selectIssue('e1');
    store.acknowledgeIssue('e1');
    expect(useWorkbenchStore.getState().selectedIssueId).toBe('e1');
    expect(useWorkbenchStore.getState().acknowledgedIssueIds).toEqual(['e1']);
  });

  it('切换配置时清空选中与确认', () => {
    useWorkbenchStore.getState().acknowledgeIssue('e1');
    useWorkbenchStore.getState().resetForConfig('c2');
    expect(useWorkbenchStore.getState().acknowledgedIssueIds).toEqual([]);
    expect(useWorkbenchStore.getState().selectedIssueId).toBeNull();
    expect(useWorkbenchStore.getState().configId).toBe('c2');
  });
});
```

- [ ] **Step 2: 运行确认失败**

Run: `pnpm --filter yuleasr-web test -- src/stores/__tests__/workbench-store.test.ts`
Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现**

```ts
// apps/yuleasr-web/src/stores/workbenchStore.ts
import { create } from 'zustand';

interface WorkbenchSessionState {
  configId: string | null;
  selectedIssueId: string | null;
  acknowledgedIssueIds: string[];
  selectIssue: (id: string | null) => void;
  acknowledgeIssue: (id: string) => void;
  resetForConfig: (configId: string) => void;
}

export const useWorkbenchStore = create<WorkbenchSessionState>(set => ({
  configId: null,
  selectedIssueId: null,
  acknowledgedIssueIds: [],

  selectIssue: id => set({ selectedIssueId: id }),

  acknowledgeIssue: id =>
    set(state => ({
      acknowledgedIssueIds: state.acknowledgedIssueIds.includes(id)
        ? state.acknowledgedIssueIds
        : [...state.acknowledgedIssueIds, id],
    })),

  resetForConfig: configId =>
    set({ configId, selectedIssueId: null, acknowledgedIssueIds: [] }),
}));
```

- [ ] **Step 4: 运行测试**

Run: `pnpm --filter yuleasr-web test -- src/stores/__tests__/workbench-store.test.ts`
Expected: 2 passed。

- [ ] **Step 5: 提交**

```bash
git add apps/yuleasr-web/src/stores/workbenchStore.ts apps/yuleasr-web/src/stores/__tests__/workbench-store.test.ts
git commit -m "feat(workbench): 会话选中态 store"
```

---

## Task 6: 问题 → 配置路径定位

**Files:**
- Create: `apps/yuleasr-web/src/lib/issue-target.ts`
- Test: `apps/yuleasr-web/src/lib/__tests__/issue-target.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
// apps/yuleasr-web/src/lib/__tests__/issue-target.test.ts
import { describe, it, expect } from 'vitest';

import { issueToConfigPath } from '@/lib/issue-target';
import type { ConfigFile } from '@/types';

const config = {
  id: 'c1',
  name: 't',
  targetChip: 'x',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  modules: [
    {
      id: 'can',
      name: 'Can',
      layer: 'ECUAL',
      enabled: true,
      description: '',
      parameters: [],
      containers: [
        { id: 'CanConfigSet', name: 'CanConfigSet', parameters: [], subContainers: [] },
      ],
      dependencies: [],
    },
  ],
} as ConfigFile;

describe('issueToConfigPath', () => {
  it('模块级问题定位到模块', () => {
    expect(
      issueToConfigPath(config, { id: '1', path: 'Can.BaudRate', message: '', severity: 'error', module: 'Can' })
    ).toBe('layer:ECUAL/module:can');
  });

  it('容器问题定位到容器', () => {
    expect(
      issueToConfigPath(config, {
        id: '2',
        path: 'Can.CanConfigSet.BaudRate',
        message: '',
        severity: 'error',
        module: 'Can',
        container: 'CanConfigSet',
      })
    ).toBe('layer:ECUAL/module:can/container:CanConfigSet');
  });

  it('模块不存在返回 null', () => {
    expect(
      issueToConfigPath(config, { id: '3', path: 'X.Y', message: '', severity: 'error', module: 'X' })
    ).toBeNull();
  });
});
```

- [ ] **Step 2: 运行确认失败**

Run: `pnpm --filter yuleasr-web test -- src/lib/__tests__/issue-target.test.ts`
Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现**

```ts
// apps/yuleasr-web/src/lib/issue-target.ts
import type { ConfigContainer, ConfigFile, ValidationIssue } from '@/types';

function findContainerId(containers: ConfigContainer[], target: string): string | null {
  for (const container of containers) {
    if (container.id === target || container.name === target) return container.id;
    if (container.subContainers?.length) {
      const nested = findContainerId(container.subContainers, target);
      if (nested) return nested;
    }
  }
  return null;
}

/** 把校验问题映射为 ConfigTree 可识别的选中路径 */
export function issueToConfigPath(config: ConfigFile, issue: ValidationIssue): string | null {
  const module = config.modules.find(m => m.name === issue.module || m.id === issue.module);
  if (!module) return null;

  const base = `layer:${module.layer}/module:${module.id}`;
  if (!issue.container) return base;

  const containerId = findContainerId(module.containers, issue.container);
  return containerId ? `${base}/container:${containerId}` : base;
}
```

- [ ] **Step 4: 运行测试**

Run: `pnpm --filter yuleasr-web test -- src/lib/__tests__/issue-target.test.ts`
Expected: 3 passed。

- [ ] **Step 5: 提交**

```bash
git add apps/yuleasr-web/src/lib/issue-target.ts apps/yuleasr-web/src/lib/__tests__/issue-target.test.ts
git commit -m "feat(workbench): 问题定位路径解析"
```

---

## Task 7: WorkbenchShell 布局组件

**Files:**
- Create: `apps/yuleasr-web/src/components/workbench/WorkbenchShell.tsx`
- Test: `apps/yuleasr-web/src/components/workbench/__tests__/workbench-shell.test.tsx`

- [ ] **Step 1: 写失败测试**

```tsx
// apps/yuleasr-web/src/components/workbench/__tests__/workbench-shell.test.tsx
// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect } from 'vitest';

import { WorkbenchShell } from '@/components/workbench/WorkbenchShell';

afterEach(cleanup);

function renderShell() {
  return render(
    <WorkbenchShell
      topBar={<div>TOPBAR</div>}
      breadcrumb={<span>BREADCRUMB</span>}
      toolbar={<button>校验</button>}
      tree={<div>TREE</div>}
      main={<div>MAIN</div>}
      inspector={<div>INSPECTOR</div>}
      problems={<div>PROBLEMS</div>}
      statusBar={<div>STATUS</div>}
    />
  );
}

describe('WorkbenchShell', () => {
  it('渲染六个区域', () => {
    renderShell();
    ['TOPBAR', 'BREADCRUMB', 'TREE', 'MAIN', 'INSPECTOR', 'PROBLEMS', 'STATUS'].forEach(text =>
      expect(screen.getByText(text)).toBeTruthy()
    );
  });

  it('点击折叠按钮隐藏问题面板', () => {
    renderShell();
    fireEvent.click(screen.getByRole('button', { name: '折叠问题面板' }));
    expect(screen.queryByText('PROBLEMS')).toBeNull();
  });
});
```

- [ ] **Step 2: 运行确认失败**

Run: `pnpm --filter yuleasr-web test -- src/components/workbench/__tests__/workbench-shell.test.tsx`
Expected: FAIL，组件不存在。

- [ ] **Step 3: 实现**

```tsx
// apps/yuleasr-web/src/components/workbench/WorkbenchShell.tsx
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCallback, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settingsStore';

interface WorkbenchShellProps {
  topBar?: ReactNode;
  segments?: ReactNode;
  breadcrumb: ReactNode;
  toolbar: ReactNode;
  tree: ReactNode;
  main: ReactNode;
  inspector: ReactNode;
  problems: ReactNode;
  statusBar: ReactNode;
}

const MIN_SIDE = 200;
const MAX_SIDE = 560;

export function WorkbenchShell({
  topBar,
  segments,
  breadcrumb,
  toolbar,
  tree,
  main,
  inspector,
  problems,
  statusBar,
}: WorkbenchShellProps) {
  const { workbench, updateWorkbenchSettings } = useSettingsStore();
  const dragging = useRef<'tree' | 'inspector' | 'bottom' | null>(null);

  const startDrag = useCallback(
    (kind: 'tree' | 'inspector' | 'bottom') => (event: ReactPointerEvent) => {
      event.preventDefault();
      dragging.current = kind;
      const startX = event.clientX;
      const startY = event.clientY;
      const startTree = workbench.treeWidth;
      const startInspector = workbench.inspectorWidth;
      const startBottom = workbench.bottomHeight;

      const onMove = (e: PointerEvent) => {
        if (dragging.current === 'tree') {
          const next = Math.min(MAX_SIDE, Math.max(MIN_SIDE, startTree + e.clientX - startX));
          updateWorkbenchSettings({ treeWidth: next });
        } else if (dragging.current === 'inspector') {
          const next = Math.min(
            MAX_SIDE,
            Math.max(MIN_SIDE, startInspector - (e.clientX - startX))
          );
          updateWorkbenchSettings({ inspectorWidth: next });
        } else if (dragging.current === 'bottom') {
          const next = Math.min(420, Math.max(120, startBottom - (e.clientY - startY)));
          updateWorkbenchSettings({ bottomHeight: next });
        }
      };

      const onUp = () => {
        dragging.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [workbench, updateWorkbenchSettings]
  );

  const collapsed = workbench.bottomCollapsed;

  return (
    <div className="flex h-full min-h-0 flex-col bg-app-bg-primary text-app-text-primary">
      {topBar && <div className="shrink-0">{topBar}</div>}

      <div className="flex shrink-0 items-center gap-3 border-y border-app-border-primary bg-app-bg-secondary px-3 py-1.5">
        {segments}
        <div className="ml-auto min-w-0 truncate text-xs text-app-text-secondary">{breadcrumb}</div>
        <div className="flex items-center gap-1">{toolbar}</div>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside
          style={{ width: workbench.treeWidth }}
          className="min-h-0 shrink-0 overflow-hidden border-r border-app-border-primary"
        >
          {tree}
        </aside>
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="调整模块树宽度"
          onPointerDown={startDrag('tree')}
          className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-purple-500/40"
        />

        <main className="min-w-0 flex-1 overflow-hidden">{main}</main>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="调整检查器宽度"
          onPointerDown={startDrag('inspector')}
          className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-purple-500/40"
        />
        <aside
          style={{ width: workbench.inspectorWidth }}
          className="min-h-0 shrink-0 overflow-hidden border-l border-app-border-primary"
        >
          {inspector}
        </aside>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-app-border-primary bg-app-bg-secondary px-3 py-1">
        <span className="text-[11px] font-medium text-app-text-secondary">问题</span>
        <button
          type="button"
          aria-label={collapsed ? '展开问题面板' : '折叠问题面板'}
          onClick={() => updateWorkbenchSettings({ bottomCollapsed: !collapsed })}
          className="rounded p-0.5 text-app-text-secondary hover:bg-app-bg-tertiary"
        >
          {collapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <>
          <div
            role="separator"
            aria-orientation="horizontal"
            aria-label="调整问题面板高度"
            onPointerDown={startDrag('bottom')}
            className="h-1 shrink-0 cursor-row-resize bg-transparent hover:bg-purple-500/40"
          />
          <section
            style={{ height: workbench.bottomHeight }}
            className={cn('shrink-0 overflow-hidden border-t border-app-border-primary bg-app-bg-primary')}
          >
            {problems}
          </section>
        </>
      )}

      <div className="shrink-0 border-t border-app-border-primary bg-app-bg-secondary">{statusBar}</div>
    </div>
  );
}
```

- [ ] **Step 4: 运行测试**

Run: `pnpm --filter yuleasr-web test -- src/components/workbench/__tests__/workbench-shell.test.tsx`
Expected: 2 passed。

- [ ] **Step 5: 提交**

```bash
git add apps/yuleasr-web/src/components/workbench/WorkbenchShell.tsx apps/yuleasr-web/src/components/workbench/__tests__/workbench-shell.test.tsx
git commit -m "feat(workbench): 三栏工作台骨架"
```

---

## Task 8: ProblemsPanel

**Files:**
- Create: `apps/yuleasr-web/src/components/workbench/ProblemsPanel.tsx`
- Test: `apps/yuleasr-web/src/components/workbench/__tests__/problems-panel.test.tsx`

- [ ] **Step 1: 写失败测试**

```tsx
// apps/yuleasr-web/src/components/workbench/__tests__/problems-panel.test.tsx
// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

import { ProblemsPanel } from '@/components/workbench/ProblemsPanel';
import type { ValidationIssue } from '@/types';

afterEach(cleanup);

const issues: ValidationIssue[] = [
  { id: 'e1', path: 'Can.BaudRate', message: '超出范围', severity: 'error', module: 'Can' },
  { id: 'w1', path: 'Com.ComIPdu', message: '缺少引用', severity: 'warning', module: 'Com' },
];

describe('ProblemsPanel', () => {
  it('只显示未确认的问题', () => {
    render(
      <ProblemsPanel
        issues={issues}
        filter="all"
        acknowledgedIds={['w1']}
        selectedId={null}
        onSelect={vi.fn()}
        onAcknowledge={vi.fn()}
      />
    );
    expect(screen.getByText('超出范围')).toBeTruthy();
    expect(screen.queryByText('缺少引用')).toBeNull();
  });

  it('按严重级过滤', () => {
    render(
      <ProblemsPanel
        issues={issues}
        filter="warning"
        acknowledgedIds={[]}
        selectedId={null}
        onSelect={vi.fn()}
        onAcknowledge={vi.fn()}
      />
    );
    expect(screen.queryByText('超出范围')).toBeNull();
    expect(screen.getByText('缺少引用')).toBeTruthy();
  });

  it('点击条目触发定位，点击确认触发确认', () => {
    const onSelect = vi.fn();
    const onAcknowledge = vi.fn();
    render(
      <ProblemsPanel
        issues={issues}
        filter="all"
        acknowledgedIds={[]}
        selectedId={null}
        onSelect={onSelect}
        onAcknowledge={onAcknowledge}
      />
    );
    fireEvent.click(screen.getByText('超出范围'));
    expect(onSelect).toHaveBeenCalledWith('e1');

    fireEvent.click(screen.getAllByLabelText('确认此问题')[0]);
    expect(onAcknowledge).toHaveBeenCalledWith('e1');
  });

  it('点击过滤标签触发 onFilterChange', () => {
    const onFilterChange = vi.fn();
    render(
      <ProblemsPanel
        issues={issues}
        filter="all"
        acknowledgedIds={[]}
        selectedId={null}
        onSelect={vi.fn()}
        onAcknowledge={vi.fn()}
        onFilterChange={onFilterChange}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: '错误' }));
    expect(onFilterChange).toHaveBeenCalledWith('error');
  });
});
```

- [ ] **Step 2: 运行确认失败**

Run: `pnpm --filter yuleasr-web test -- src/components/workbench/__tests__/problems-panel.test.tsx`
Expected: FAIL，组件不存在。

- [ ] **Step 3: 实现**

```tsx
// apps/yuleasr-web/src/components/workbench/ProblemsPanel.tsx
import { AlertCircle, AlertTriangle, Check, Info, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ProblemFilter } from '@/stores/settingsStore';
import type { ValidationIssue } from '@/types';

interface ProblemsPanelProps {
  issues: ValidationIssue[];
  filter: ProblemFilter;
  acknowledgedIds: string[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAcknowledge: (id: string) => void;
  onFilterChange?: (filter: ProblemFilter) => void;
}

const FILTERS: Array<{ id: ProblemFilter; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'error', label: '错误' },
  { id: 'warning', label: '警告' },
  { id: 'info', label: '提示' },
];

const severityIcon = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

export function ProblemsPanel({
  issues,
  filter,
  acknowledgedIds,
  selectedId,
  onSelect,
  onAcknowledge,
  onFilterChange,
}: ProblemsPanelProps) {
  const visible = issues.filter(
    issue =>
      !acknowledgedIds.includes(issue.id) && (filter === 'all' || issue.severity === filter)
  );

  const filterBar = (
    <div className="flex items-center gap-1 border-b border-app-border-primary px-2 py-1">
      {FILTERS.map(item => (
        <button
          key={item.id}
          type="button"
          onClick={() => onFilterChange?.(item.id)}
          className={cn(
            'rounded px-1.5 py-0.5 text-[11px]',
            filter === item.id
              ? 'bg-app-bg-tertiary font-medium text-app-text-primary'
              : 'text-app-text-secondary hover:bg-app-bg-secondary'
          )}
        >
          {item.label}
        </button>
      ))}
      <span className="ml-auto text-[11px] text-app-text-secondary">{visible.length} 条</span>
    </div>
  );

  if (visible.length === 0) {
    return (
      <div className="flex h-full flex-col">
        {filterBar}
        <div className="flex flex-1 items-center justify-center gap-2 text-xs text-app-text-secondary">
          <Check className="h-3.5 w-3.5 text-green-500" />
          当前没有待处理问题
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {filterBar}
      <div className="min-h-0 flex-1 overflow-y-auto">
      <table className="w-full text-left text-xs">
        <tbody>
          {visible.map(issue => {
            const Icon = severityIcon[issue.severity];
            return (
              <tr
                key={issue.id}
                onClick={() => onSelect(issue.id)}
                className={cn(
                  'cursor-pointer border-b border-app-border-primary/60 hover:bg-app-bg-secondary',
                  selectedId === issue.id && 'bg-purple-50 dark:bg-purple-500/10'
                )}
              >
                <td className="w-6 px-2 py-1">
                  <Icon
                    className={cn(
                      'h-3.5 w-3.5',
                      issue.severity === 'error' && 'text-red-500',
                      issue.severity === 'warning' && 'text-amber-500',
                      issue.severity === 'info' && 'text-blue-500'
                    )}
                  />
                </td>
                <td className="px-1 py-1 font-mono text-[11px] text-app-text-secondary">{issue.path}</td>
                <td className="px-2 py-1 text-app-text-primary">{issue.message}</td>
                <td className="w-8 px-1 py-1 text-right">
                  <button
                    type="button"
                    aria-label="确认此问题"
                    title="确认并隐藏"
                    onClick={event => {
                      event.stopPropagation();
                      onAcknowledge(issue.id);
                    }}
                    className="rounded p-0.5 text-app-text-secondary hover:bg-app-bg-tertiary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 运行测试**

Run: `pnpm --filter yuleasr-web test -- src/components/workbench/__tests__/problems-panel.test.tsx`
Expected: 4 passed。

- [ ] **Step 5: 提交**

```bash
git add apps/yuleasr-web/src/components/workbench/ProblemsPanel.tsx apps/yuleasr-web/src/components/workbench/__tests__/problems-panel.test.tsx
git commit -m "feat(workbench): 底部问题面板"
```

---

## Task 9: InspectorPane

**Files:**
- Create: `apps/yuleasr-web/src/components/workbench/InspectorPane.tsx`
- Test: `apps/yuleasr-web/src/components/workbench/__tests__/inspector-pane.test.tsx`

- [ ] **Step 1: 写失败测试**

```tsx
// apps/yuleasr-web/src/components/workbench/__tests__/inspector-pane.test.tsx
// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

import { InspectorPane } from '@/components/workbench/InspectorPane';

afterEach(cleanup);

describe('InspectorPane', () => {
  it('无问题时显示占位', () => {
    render(<InspectorPane issue={null} parameter={null} onApplyFix={vi.fn()} onLocate={vi.fn()} />);
    expect(screen.getByText('在左侧选择模块或参数')).toBeTruthy();
  });

  it('有 fix 时显示应用按钮并可点击', () => {
    const onApplyFix = vi.fn();
    render(
      <InspectorPane
        issue={{
          id: 'e1',
          path: 'Can.BaudRate',
          message: '超出最大值 1000000',
          severity: 'error',
          module: 'Can',
          parameter: 'BaudRate',
          suggestion: 'Set value to at most 1000000',
          fix: { kind: 'clamp-max', module: 'Can', parameter: 'BaudRate', value: 1000000 },
        }}
        parameter={{
          id: 'baud',
          name: 'BaudRate',
          type: 'integer',
          value: 5000000,
          min: 1000,
          max: 1000000,
          defaultValue: 500000,
        }}
        onApplyFix={onApplyFix}
        onLocate={vi.fn()}
      />
    );

    expect(screen.getByText('超出最大值 1000000')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '应用修复' }));
    expect(onApplyFix).toHaveBeenCalledTimes(1);
  });

  it('无 fix 时不显示应用按钮', () => {
    render(
      <InspectorPane
        issue={{
          id: 'e2',
          path: 'Com.ComIPdu',
          message: '缺少引用',
          severity: 'warning',
          module: 'Com',
        }}
        parameter={null}
        onApplyFix={vi.fn()}
        onLocate={vi.fn()}
      />
    );
    expect(screen.queryByRole('button', { name: '应用修复' })).toBeNull();
  });
});
```

- [ ] **Step 2: 运行确认失败**

Run: `pnpm --filter yuleasr-web test -- src/components/workbench/__tests__/inspector-pane.test.tsx`
Expected: FAIL，组件不存在。

- [ ] **Step 3: 实现**

```tsx
// apps/yuleasr-web/src/components/workbench/InspectorPane.tsx
import { Wand2 } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import type { ConfigParameter, ValidationIssue } from '@/types';

interface InspectorPaneProps {
  issue: ValidationIssue | null;
  parameter: ConfigParameter | null;
  onApplyFix: () => void;
  onLocate: () => void;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-app-border-primary px-3 py-2 last:border-b-0">
      <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-app-text-secondary">
        {title}
      </h4>
      <div className="space-y-1 text-xs text-app-text-primary">{children}</div>
    </section>
  );
}

export function InspectorPane({ issue, parameter, onApplyFix, onLocate }: InspectorPaneProps) {
  if (!issue && !parameter) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-xs text-app-text-secondary">
        在左侧选择模块或参数
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <Section title="当前项">
        <div className="font-mono text-[11px] break-all text-app-text-secondary">
          {issue?.path ?? parameter?.name}
        </div>
        {issue && (
          <span
            className={cn(
              'inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium',
              issue.severity === 'error' && 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
              issue.severity === 'warning' &&
                'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
              issue.severity === 'info' && 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
            )}
          >
            {issue.severity === 'error' ? '错误' : issue.severity === 'warning' ? '警告' : '提示'}
          </span>
        )}
        {issue && (
          <p className="mt-1 leading-relaxed">{issue.message}</p>
        )}
      </Section>

      {issue?.suggestion && (
        <Section title="修复建议">
          <p className="text-app-text-secondary">{issue.suggestion}</p>
          {issue.fix ? (
            <button
              type="button"
              onClick={onApplyFix}
              className="mt-1 inline-flex items-center gap-1 rounded bg-purple-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-purple-700"
            >
              <Wand2 className="h-3 w-3" />
              应用修复
            </button>
          ) : (
            <button
              type="button"
              onClick={onLocate}
              className="mt-1 rounded border border-app-border-primary px-2 py-1 text-[11px] hover:bg-app-bg-secondary"
            >
              定位到参数
            </button>
          )}
        </Section>
      )}

      {parameter && (
        <Section title="元信息">
          <dl className="grid grid-cols-[64px_1fr] gap-x-2 gap-y-0.5 text-[11px]">
            <dt className="text-app-text-secondary">类型</dt>
            <dd>{parameter.type}</dd>
            <dt className="text-app-text-secondary">当前值</dt>
            <dd className="font-mono">{String(parameter.value ?? '—')}</dd>
            <dt className="text-app-text-secondary">范围</dt>
            <dd className="font-mono">
              {parameter.min ?? '—'} – {parameter.max ?? '—'}
            </dd>
            <dt className="text-app-text-secondary">默认值</dt>
            <dd className="font-mono">{String(parameter.defaultValue ?? '—')}</dd>
          </dl>
          {parameter.description && (
            <p className="mt-1 text-[11px] leading-relaxed text-app-text-secondary">
              {parameter.description}
            </p>
          )}
        </Section>
      )}

      {issue && !parameter && (
        <Section title="引用">
          <p className="text-[11px] text-app-text-secondary">该问题未关联具体参数，可在左侧树中展开查看。</p>
        </Section>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 运行测试**

Run: `pnpm --filter yuleasr-web test -- src/components/workbench/__tests__/inspector-pane.test.tsx`
Expected: 3 passed。

- [ ] **Step 5: 提交**

```bash
git add apps/yuleasr-web/src/components/workbench/InspectorPane.tsx apps/yuleasr-web/src/components/workbench/__tests__/inspector-pane.test.tsx
git commit -m "feat(workbench): 右侧检查器"
```

---

## Task 10: 段标签过滤与 Editor 接入

**Files:**
- Create: `apps/yuleasr-web/src/lib/segment-modules.ts`
- Test: `apps/yuleasr-web/src/lib/__tests__/segment-modules.test.ts`
- Modify: `apps/yuleasr-web/src/pages/Editor.tsx`（import、派生状态、913–1086 主区）

> 页面顶部 Header（473–911 行：搜索、校验、Pipeline、保存、导入/导出、生成、溢出菜单）保持不动。本次只替换主区网格，避免重写高风险的操作区。

- [ ] **Step 1: 写段标签过滤的失败测试**

```ts
// apps/yuleasr-web/src/lib/__tests__/segment-modules.test.ts
import { describe, it, expect } from 'vitest';

import { modulesForSegment } from '@/lib/segment-modules';
import type { ConfigFile } from '@/types';

type Module = ConfigFile['modules'][number];

const mod = (name: string, layer: Module['layer']): Module =>
  ({
    id: name.toLowerCase(),
    name,
    layer,
    enabled: true,
    description: '',
    parameters: [],
    containers: [],
    dependencies: [],
  }) as Module;

const config = {
  id: 'c1',
  name: 't',
  targetChip: 'x',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  modules: [mod('Can', 'ECUAL'), mod('Com', 'ECUAL'), mod('Dem', 'ECUAL'), mod('Os', 'OS'), mod('Mcu', 'MCAL')],
} as ConfigFile;

const names = (list: Module[]) => list.map(m => m.name);

describe('modulesForSegment', () => {
  it('basic 与 generate 返回全部模块', () => {
    expect(names(modulesForSegment(config, 'basic'))).toHaveLength(5);
    expect(names(modulesForSegment(config, 'generate'))).toHaveLength(5);
  });

  it('communication 只保留通信模块', () => {
    expect(names(modulesForSegment(config, 'communication'))).toEqual(['Can', 'Com']);
  });

  it('diagnostics 只保留诊断模块', () => {
    expect(names(modulesForSegment(config, 'diagnostics'))).toEqual(['Dem']);
  });

  it('bsw 保留 ECUAL / Service / OS 层', () => {
    expect(names(modulesForSegment(config, 'bsw'))).toEqual(['Can', 'Com', 'Dem', 'Os']);
  });
});
```

- [ ] **Step 2: 运行确认失败**

Run: `pnpm --filter yuleasr-web test -- src/lib/__tests__/segment-modules.test.ts`
Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现**

```ts
// apps/yuleasr-web/src/lib/segment-modules.ts
import type { ConfigFile, ConfigModule } from '@/types';
import type { WorkbenchSegment } from '@/stores/settingsStore';

export const WORKBENCH_SEGMENTS: Array<{ id: WorkbenchSegment; label: string }> = [
  { id: 'basic', label: 'Basic Editor' },
  { id: 'bsw', label: 'BSW 管理' },
  { id: 'communication', label: '通信' },
  { id: 'diagnostics', label: '诊断' },
  { id: 'generate', label: '生成' },
];

const COMMUNICATION_MODULES = new Set([
  'Can', 'CanIf', 'CanTp', 'CanNm', 'Com', 'ComM', 'PduR',
  'Lin', 'LinIf', 'Fr', 'FrIf', 'Eth', 'EthIf', 'SoAd', 'DoIP', 'IpduM', 'Nm',
]);

const DIAGNOSTIC_MODULES = new Set(['Dem', 'Dcm', 'FiM', 'Det']);

/** 按顶栏段标签过滤树中的模块；generate 不过滤（只切换底部面板） */
export function modulesForSegment(config: ConfigFile, segment: WorkbenchSegment): ConfigModule[] {
  switch (segment) {
    case 'basic':
    case 'generate':
      return config.modules;
    case 'bsw':
      return config.modules.filter(m => m.layer === 'ECUAL' || m.layer === 'Service' || m.layer === 'OS');
    case 'communication':
      return config.modules.filter(m => COMMUNICATION_MODULES.has(m.name));
    case 'diagnostics':
      return config.modules.filter(m => DIAGNOSTIC_MODULES.has(m.name));
  }
}
```

若 `ConfigModule` 未从 `@/types` 导出，改用 `ConfigFile['modules'][number]`，不要新建类型。

- [ ] **Step 4: 运行测试**

Run: `pnpm --filter yuleasr-web test -- src/lib/__tests__/segment-modules.test.ts`
Expected: 4 passed。

- [ ] **Step 5: 记录测试基线**

Run: `pnpm --filter yuleasr-web test`
Expected: 全绿。记下用例总数，改造后必须一致。

- [ ] **Step 6: Editor 加 import 与派生状态**

顶部 import 增加：

```tsx
import { InspectorPane } from '@/components/workbench/InspectorPane';
import { ProblemsPanel } from '@/components/workbench/ProblemsPanel';
import { WorkbenchShell } from '@/components/workbench/WorkbenchShell';
import { issueToConfigPath } from '@/lib/issue-target';
import { modulesForSegment, WORKBENCH_SEGMENTS } from '@/lib/segment-modules';
import { useWorkbenchStore } from '@/stores/workbenchStore';
```

store 解构确认包含 `applyIssueFix`：`const { ..., applyIssueFix } = useConfigStore();`
`useSettingsStore` 解构增加：`const { workbench, updateWorkbenchSettings } = useSettingsStore();`

在 `handleParameterChange` 之后插入：

```tsx
  const { selectedIssueId, acknowledgedIssueIds, selectIssue, acknowledgeIssue, resetForConfig } =
    useWorkbenchStore();

  useEffect(() => {
    if (configId) resetForConfig(configId);
  }, [configId, resetForConfig]);

  const visibleIssues = useMemo(
    () => validationIssues.filter(issue => !acknowledgedIssueIds.includes(issue.id)),
    [validationIssues, acknowledgedIssueIds]
  );

  const selectedIssue = visibleIssues.find(issue => issue.id === selectedIssueId) ?? null;

  const treeConfig = useMemo(
    () => ({ ...currentConfig, modules: modulesForSegment(currentConfig, workbench.activeSegment) }),
    [currentConfig, workbench.activeSegment]
  );

  const selectedParameter = useMemo(() => {
    if (!selectedPath) return null;
    const paramKey = selectedPath.match(/param:([^/]+)$/)?.[1];
    if (!paramKey) return null;

    const inModule = selectedModule?.parameters.find(
      p => p.id === paramKey || p.name === paramKey
    );
    if (inModule) return inModule;

    const stack = [...(selectedModule?.containers ?? [])];
    while (stack.length) {
      const container = stack.shift()!;
      const hit = container.parameters.find(p => p.id === paramKey || p.name === paramKey);
      if (hit) return hit;
      if (container.subContainers?.length) stack.push(...container.subContainers);
    }
    return null;
  }, [selectedPath, selectedModule]);

  const handleIssueSelect = useCallback(
    (id: string) => {
      selectIssue(id);
      const issue = visibleIssues.find(i => i.id === id);
      if (!issue) return;
      const path = issueToConfigPath(currentConfig, issue);
      if (path) setSelectedPath(path);
    },
    [visibleIssues, currentConfig, selectIssue, setSelectedPath]
  );
```

- [ ] **Step 7: 替换主区 JSX**

把 `{/* Main Content */}` 所在网格整段（913–1086 行）替换为：

```tsx
      <div className="flex h-[calc(100vh-12rem)] min-h-0 flex-col">
        <WorkbenchShell
          segments={
            <div className="flex items-center gap-0.5" role="tablist" aria-label="工作区段">
              {WORKBENCH_SEGMENTS.map(item => (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={workbench.activeSegment === item.id}
                  onClick={() => updateWorkbenchSettings({ activeSegment: item.id })}
                  className={cn(
                    'rounded px-2 py-1 text-[11px] transition-colors',
                    workbench.activeSegment === item.id
                      ? 'bg-purple-100 font-medium text-purple-800 dark:bg-purple-500/20 dark:text-purple-200'
                      : 'text-app-text-secondary hover:bg-app-bg-tertiary'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          }
          breadcrumb={
            <span className="font-mono">
              {selectedPath
                ? selectedPath.replace(/(layer|module|container|instance|param):/g, '')
                : 'ECU Configuration'}
            </span>
          }
          toolbar={
            <label className="flex items-center gap-1 text-[11px] text-app-text-secondary">
              <input
                type="checkbox"
                checked={showDisabled}
                onChange={event => setShowDisabled(event.target.checked)}
              />
              显示禁用模块
            </label>
          }
          tree={
            <ConfigTree
              ref={configTreeRef}
              config={treeConfig}
              selectedPath={selectedPath}
              onSelectPath={setSelectedPath}
              validationIssues={validationIssues}
              showDisabled={showDisabled}
              onToggleModule={(id, enabled) => toggleModuleEnabled(id, enabled)}
              filterText={searchQuery}
            />
          }
          main={
            <div className="h-full overflow-y-auto p-3">
              {selectedContainer ? (
                <div className="overflow-hidden rounded-lg border border-app-border-primary bg-app-bg-primary">
                  <div className="flex items-center justify-between border-b border-app-border-primary bg-app-bg-secondary px-3 py-1.5">
                    <h3 className="text-xs font-semibold text-app-text-primary">
                      {(instanceContainer || selectedContainer).displayName ||
                        (instanceContainer || selectedContainer).name}
                    </h3>
                    <span className="text-[11px] text-app-text-secondary">
                      {(instanceContainer || selectedContainer).parameters.length} 参数
                    </span>
                  </div>
                  <div className="p-3">
                    {selectedContainer.multiple && !selectedInstanceName ? (
                      <div className="py-8 text-center">
                        <button
                          onClick={() => {
                            const containerPath = `layer:${selectedModule?.layer}/module:${selectedModule?.id}/container:${selectedContainer.id}`;
                            const instanceName = configTreeRef.current?.addInstance(containerPath);
                            if (instanceName) {
                              setSelectedPath(`${containerPath}/instance:${instanceName}`);
                            }
                          }}
                          className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-app-bg-tertiary transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/40"
                          title="添加实例"
                          aria-label="添加实例"
                        >
                          <span className="text-xl text-app-text-tertiary">+</span>
                        </button>
                        <p className="mb-1 text-sm font-medium text-app-text-primary">
                          {selectedContainer.displayName || selectedContainer.name}
                        </p>
                        <p className="text-xs text-app-text-secondary">
                          创建实例后，在树中选择实例查看和编辑参数
                        </p>
                      </div>
                    ) : (
                      <ContainerParameterList
                        container={instanceContainer || selectedContainer}
                        onParamChange={(name, value) => handleParameterChange(name, value)}
                        moduleConfigs={conditionModuleConfigs}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-app-text-secondary">
                  在左侧选择容器或参数
                </div>
              )}
            </div>
          }
          inspector={
            <InspectorPane
              issue={selectedIssue}
              parameter={selectedParameter}
              onApplyFix={() => {
                if (!selectedIssue) return;
                applyIssueFix(selectedIssue);
                selectIssue(null);
              }}
              onLocate={() => {
                if (!selectedIssue) return;
                const path = issueToConfigPath(currentConfig, selectedIssue);
                if (path) setSelectedPath(path);
              }}
            />
          }
          problems={
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex shrink-0 items-center gap-0.5 border-b border-app-border-primary px-2 py-1">
                {(
                  [
                    { id: 'problems', label: '问题' },
                    { id: 'generate', label: '生成' },
                    { id: 'output', label: '输出' },
                    { id: 'console', label: '控制台' },
                  ] as const
                ).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => updateWorkbenchSettings({ bottomTab: tab.id })}
                    className={cn(
                      'rounded px-2 py-0.5 text-[11px]',
                      workbench.bottomTab === tab.id
                        ? 'bg-app-bg-tertiary font-medium text-app-text-primary'
                        : 'text-app-text-secondary hover:bg-app-bg-secondary'
                    )}
                  >
                    {tab.label}
                    {tab.id === 'problems' && visibleIssues.length > 0 && (
                      <span className="ml-1 text-red-500">{visibleIssues.length}</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="min-h-0 flex-1">
                {workbench.bottomTab === 'problems' ? (
                  <ProblemsPanel
                    issues={validationIssues}
                    filter={workbench.problemsFilter}
                    acknowledgedIds={acknowledgedIssueIds}
                    selectedId={selectedIssueId}
                    onSelect={handleIssueSelect}
                    onAcknowledge={acknowledgeIssue}
                    onFilterChange={filter => updateWorkbenchSettings({ problemsFilter: filter })}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-app-text-secondary">
                    {workbench.bottomTab === 'generate' && '生成结果将显示在这里'}
                    {workbench.bottomTab === 'output' && '暂无输出'}
                    {workbench.bottomTab === 'console' && '暂无日志'}
                  </div>
                )}
              </div>
            </div>
          }
          statusBar={
            <div className="flex items-center gap-3 px-3 py-1 text-[11px] text-app-text-secondary">
              <span className={isDirty ? 'text-amber-600' : ''}>{isDirty ? '未保存' : '已保存'}</span>
              <span>{validationIssues.filter(i => i.severity === 'error').length} 错误</span>
              <span>{validationIssues.filter(i => i.severity === 'warning').length} 警告</span>
              {validationDegraded && <span className="text-amber-600">校验降级</span>}
              <span className="ml-auto">
                {currentConfig.modules.filter(m => m.enabled).length} 模块 · 参数{' '}
                {selectedModule?.parameters.length ?? 0}
              </span>
            </div>
          }
        />
      </div>
```

- [ ] **Step 8: 清理失效引用**

旧中间栏的 Validation 卡片、Issues 列表、`ConfigurationStatusPanel` 已移出主区。运行 `pnpm --filter yuleasr-web exec tsc --noEmit -p tsconfig.json`，按报错删除不再使用的 import 与变量（通常为 `ConfigurationStatusPanel`、`exportConfigReport` 的保留判断）。若 `exportConfigReport` 仍被 Header 菜单调用则保留。

- [ ] **Step 9: 跑测试与类型检查**

Run: `pnpm --filter yuleasr-web test`
Expected: 全绿，用例总数与 Step 5 一致（新增 4 个段标签用例）。

Run: `pnpm --filter yuleasr-web exec tsc --noEmit -p tsconfig.json`
Expected: 无输出。

- [ ] **Step 10: 提交**

```bash
git add apps/yuleasr-web/src/lib/segment-modules.ts apps/yuleasr-web/src/lib/__tests__/segment-modules.test.ts apps/yuleasr-web/src/pages/Editor.tsx
git commit -m "feat(workbench): Editor 接入三栏工作台与段标签"
```

---

## Task 11: 桌面快捷键

**Files:**
- Create: `apps/yuleasr-web/src/hooks/useWorkbenchShortcuts.ts`
- Test: `apps/yuleasr-web/src/hooks/__tests__/use-workbench-shortcuts.test.tsx`
- Modify: `apps/yuleasr-web/src/pages/Editor.tsx`

- [ ] **Step 1: 写失败测试**

```tsx
// apps/yuleasr-web/src/hooks/__tests__/use-workbench-shortcuts.test.tsx
// @vitest-environment jsdom
import { renderHook, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

import { useWorkbenchShortcuts } from '@/hooks/useWorkbenchShortcuts';

afterEach(cleanup);

function press(key: string, init: KeyboardEventInit = {}) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, ...init }));
}

describe('useWorkbenchShortcuts', () => {
  it('非桌面环境不启用', () => {
    const onSave = vi.fn();
    renderHook(() => useWorkbenchShortcuts({ onSave, onSearch: vi.fn() }));
    press('s', { ctrlKey: true });
    expect(onSave).not.toHaveBeenCalled();
  });

  it('桌面环境触发保存与搜索', () => {
    (window as any).electronAPI = { isElectron: true };
    const onSave = vi.fn();
    const onSearch = vi.fn();
    renderHook(() => useWorkbenchShortcuts({ onSave, onSearch }));

    press('s', { ctrlKey: true });
    press('f', { ctrlKey: true });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledTimes(1);
    delete (window as any).electronAPI;
  });
});
```

- [ ] **Step 2: 运行确认失败**

Run: `pnpm --filter yuleasr-web test -- src/hooks/__tests__/use-workbench-shortcuts.test.tsx`
Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现**

```ts
// apps/yuleasr-web/src/hooks/useWorkbenchShortcuts.ts
import { useEffect } from 'react';

interface Handlers {
  onSave: () => void;
  onSearch: () => void;
  onValidate?: () => void;
  onGenerate?: () => void;
}

export function useWorkbenchShortcuts({ onSave, onSearch, onValidate, onGenerate }: Handlers) {
  useEffect(() => {
    if (!window.electronAPI?.isElectron) return;

    const handler = (event: KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey;
      if (!mod) return;

      const key = event.key.toLowerCase();
      if (key === 's') {
        event.preventDefault();
        onSave();
      } else if (key === 'f') {
        event.preventDefault();
        onSearch();
      } else if (key === 'v' && event.shiftKey && onValidate) {
        event.preventDefault();
        onValidate();
      } else if (key === 'g' && event.shiftKey && onGenerate) {
        event.preventDefault();
        onGenerate();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSave, onSearch, onValidate, onGenerate]);
}
```

- [ ] **Step 4: 抽出 handleGenerate 并接入快捷键**

Header 里 Generate 按钮的 `onClick` 目前是内联函数（约 790–829 行）。原样迁移为：

```tsx
  const handleGenerate = useCallback(async () => {
    if (!currentConfig) return;
    const files = await generateHeadersFromConfig(currentConfig.modules);
    if (files.length === 0) {
      alert('未加载到任何模块 schema，无法生成。');
      return;
    }
    setCodeGenFiles(files);
    setCodeGenResult(files[0]);
    setGccResults(null);
    if (window.electronAPI) {
      const result = await window.electronAPI.gccCheck();
      setGccAvailable(result.available);
    }
    const { pipeline: pipelineSettings } = useSettingsStore.getState();
    if (pipelineSettings.autoTriggerOnCodegen) {
      try {
        const triggerResult = await triggerPipeline({
          config_json: JSON.stringify(currentConfig),
          project_dir: window.location.pathname,
          type: 'full',
        });
        if (triggerResult.ok && triggerResult.job_id) {
          if (pipelineHideTimerRef.current) {
            clearTimeout(pipelineHideTimerRef.current);
            pipelineHideTimerRef.current = null;
          }
          setActivePipelineJobId(triggerResult.job_id);
        }
      } catch (err) {
        console.warn('Auto-trigger pipeline failed:', err);
      }
    }
  }, [currentConfig]);
```

按钮改为 `onClick={handleGenerate}`，并在其下方接入快捷键：

```tsx
  useWorkbenchShortcuts({
    onSave: () => {
      void handleSave();
    },
    onSearch: () => setIsSearchOpen(true),
    onValidate: () => {
      void handleValidate();
    },
    onGenerate: handleGenerate,
  });
```

以 `pnpm --filter yuleasr-web exec tsc --noEmit -p tsconfig.json` 通过为准。

- [ ] **Step 5: 运行测试**

Run: `pnpm --filter yuleasr-web test -- src/hooks/__tests__/use-workbench-shortcuts.test.tsx`
Expected: 2 passed。

- [ ] **Step 6: 提交**

```bash
git add apps/yuleasr-web/src/hooks/useWorkbenchShortcuts.ts apps/yuleasr-web/src/hooks/__tests__/use-workbench-shortcuts.test.tsx apps/yuleasr-web/src/pages/Editor.tsx
git commit -m "feat(desktop): 工作台快捷键"
```

---

## Task 12: 多窗口、ARXML 拖拽、草稿恢复

**Files:**
- Modify: `apps/yuleasr-desktop/electron/main.mjs:234-352`
- Modify: `apps/yuleasr-desktop/electron/preload.mjs`
- Modify: `apps/yuleasr-desktop/electron/desktop-utils.mjs`
- Modify: `apps/yuleasr-web/src/types/electron.d.ts`
- Create: `apps/yuleasr-web/src/components/workbench/ArxmlDropZone.tsx`
- Test: `apps/yuleasr-desktop/electron/desktop-utils.test.mjs`

- [ ] **Step 1: 写失败测试（草稿校验）**

在 `desktop-utils.test.mjs` 追加：

```js
import { isSafeDraftName, DRAFT_MAX_BYTES } from './desktop-utils.mjs';

test('草稿名只允许安全字符', () => {
  assert.equal(isSafeDraftName('config-abc.json'), true);
  assert.equal(isSafeDraftName('../escape.json'), false);
  assert.equal(isSafeDraftName('a/b.json'), false);
  assert.equal(isSafeDraftName(''), false);
});

test('草稿大小上限为 5MB', () => {
  assert.equal(DRAFT_MAX_BYTES, 5 * 1024 * 1024);
});
```

Run: `node --test apps/yuleasr-desktop/electron/desktop-utils.test.mjs`
Expected: FAIL，`isSafeDraftName` 未导出。

- [ ] **Step 2: 实现桌面工具函数**

在 `desktop-utils.mjs` 末尾追加：

```js
export const DRAFT_MAX_BYTES = 5 * 1024 * 1024;

/** 草稿文件名只允许 [A-Za-z0-9._-]，且必须以 .json 结尾 */
export function isSafeDraftName(name) {
  return typeof name === 'string' && /^[A-Za-z0-9._-]+\.json$/.test(name) && !name.includes('..');
}
```

- [ ] **Step 3: 主进程支持多窗口与草稿**

把 `createWindow` 拆为可复用：

```js
const windows = new Set();

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'yuleASR Configurator',
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  windows.add(win);
  win.on('closed', () => windows.delete(win));
  // 其余逻辑（will-navigate / setWindowOpenHandler / 菜单 / loadURL / devtools）
  // 原样保留，只把函数体内的 `mainWindow` 全部改名为 `win`。
  return win;
}
```

改完后运行 `grep -n "mainWindow" apps/yuleasr-desktop/electron/main.mjs`，确认 `createWindow` 函数体内已无残留（模块级全局变量若仍被其他函数使用，则保留全局并在函数结束时赋值）。

新增 IPC（放在其他 `ipcMain.handle` 之后）：

```js
ipcMain.handle('window:new', () => {
  createWindow();
  return true;
});

ipcMain.handle('draft:write', async (_event, { name, content }) => {
  if (!isSafeDraftName(name)) throw new Error('invalid draft name');
  if (typeof content !== 'string' || Buffer.byteLength(content, 'utf8') > DRAFT_MAX_BYTES) {
    throw new Error('draft too large');
  }
  const dir = join(app.getPath('userData'), 'drafts');
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, name), content, 'utf8');
  return true;
});

ipcMain.handle('draft:read', async (_event, name) => {
  if (!isSafeDraftName(name)) throw new Error('invalid draft name');
  const file = join(app.getPath('userData'), 'drafts', name);
  try {
    return await readFile(file, 'utf8');
  } catch {
    return null;
  }
});

ipcMain.handle('draft:clear', async (_event, name) => {
  if (!isSafeDraftName(name)) throw new Error('invalid draft name');
  const file = join(app.getPath('userData'), 'drafts', name);
  await unlink(file).catch(() => {});
  return true;
});
```

补齐 `import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'` 与从 `desktop-utils.mjs` 导入 `DRAFT_MAX_BYTES, isSafeDraftName`。

菜单 File 下新增：

```js
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => createWindow(),
        },
```

- [ ] **Step 4: preload 暴露 API**

```js
  newWindow: () => ipcRenderer.invoke('window:new'),
  writeDraft: (name, content) => ipcRenderer.invoke('draft:write', { name, content }),
  readDraft: (name) => ipcRenderer.invoke('draft:read', name),
  clearDraft: (name) => ipcRenderer.invoke('draft:clear', name),
```

- [ ] **Step 5: 类型声明**

在 `ElectronAPI` 接口中追加：

```ts
  newWindow: () => Promise<boolean>;
  writeDraft: (name: string, content: string) => Promise<boolean>;
  readDraft: (name: string) => Promise<string | null>;
  clearDraft: (name: string) => Promise<boolean>;
```

- [ ] **Step 6: 拖拽导入组件**

```tsx
// apps/yuleasr-web/src/components/workbench/ArxmlDropZone.tsx
import { Upload } from 'lucide-react';
import { useState, type DragEvent as ReactDragEvent } from 'react';

import { cn } from '@/lib/utils';

interface ArxmlDropZoneProps {
  onFile: (content: string, fileName: string) => void;
}

export function ArxmlDropZone({ onFile }: ArxmlDropZoneProps) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!window.electronAPI?.isElectron) return null;

  const handleDrop = async (event: ReactDragEvent) => {
    event.preventDefault();
    setActive(false);
    setError(null);

    const file = event.dataTransfer.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.arxml')) {
      setError('仅支持 .arxml 文件');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('文件超过 20MB');
      return;
    }
    onFile(await file.text(), file.name);
  };

  return (
    <div
      onDragOver={event => {
        event.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={handleDrop}
      className={cn(
        'pointer-events-none fixed inset-0 z-[60] flex items-center justify-center border-2 border-dashed transition-opacity',
        active ? 'pointer-events-auto bg-purple-500/10 opacity-100' : 'opacity-0'
      )}
    >
      <div className="rounded-lg bg-app-bg-primary px-6 py-4 text-center shadow-xl">
        <Upload className="mx-auto mb-2 h-6 w-6 text-purple-500" />
        <p className="text-sm font-medium">松开以导入 ARXML</p>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
```

在 `Editor` 内渲染该组件，`onFile` 调用现有 ARXML 导入逻辑（`parseArxmlContent` + `arxmlToConfigModules`，复用 `importArxml` 分支）。

- [ ] **Step 7: 草稿静默保存 hook**

新增 `apps/yuleasr-web/src/hooks/useDraftAutosave.ts`：

```ts
import { useEffect, useRef } from 'react';

export function useDraftAutosave(configId: string | undefined, payload: unknown, dirty: boolean) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!configId || !dirty || !window.electronAPI?.isElectron) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void window.electronAPI!.writeDraft(`${configId}.json`, JSON.stringify(payload));
    }, 2000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [configId, payload, dirty]);
}
```

在 `Editor` 中调用：`useDraftAutosave(configId, currentConfig, isDirty)`；加载配置成功后若 `readDraft` 有内容且与当前不同，弹出恢复提示条（`确认恢复` / `丢弃`）。

- [ ] **Step 8: 运行桌面工具测试**

Run: `node --test apps/yuleasr-desktop/electron/desktop-utils.test.mjs`
Expected: 全部 PASS。

- [ ] **Step 9: 提交**

```bash
git add apps/yuleasr-desktop/electron apps/yuleasr-web/src/types/electron.d.ts apps/yuleasr-web/src/components/workbench/ArxmlDropZone.tsx apps/yuleasr-web/src/hooks/useDraftAutosave.ts apps/yuleasr-web/src/pages/Editor.tsx
git commit -m "feat(desktop): 多窗口、ARXML 拖拽与草稿恢复"
```

---

## Task 13: 启动工作台

**Files:**
- Create: `apps/yuleasr-web/src/pages/StartPage.tsx`
- Modify: `apps/yuleasr-web/src/App.tsx:34-58`
- Test: `apps/yuleasr-web/src/pages/__tests__/start-page.test.tsx`

- [ ] **Step 1: 写失败测试**

```tsx
// apps/yuleasr-web/src/pages/__tests__/start-page.test.tsx
// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, it, expect, vi } from 'vitest';

vi.mock('@/stores/configStore', () => ({
  useConfigStore: () => ({
    configList: [
      { id: 'c1', name: 'ECU_A', description: '', moduleCount: 12, lastModified: '2026-11-01T00:00:00.000Z' },
      { id: 'c2', name: 'ECU_B', description: '', moduleCount: 8, lastModified: '2026-10-01T00:00:00.000Z' },
    ],
    loadConfigList: vi.fn(),
  }),
}));

import { StartPage } from '@/pages/StartPage';

afterEach(cleanup);

describe('StartPage', () => {
  it('列出最近工程并提供新建/导入入口', () => {
    render(
      <MemoryRouter>
        <StartPage />
      </MemoryRouter>
    );
    expect(screen.getByText('ECU_A')).toBeTruthy();
    expect(screen.getByText('新建工程')).toBeTruthy();
    expect(screen.getByText('导入 ARXML')).toBeTruthy();
  });
});
```

- [ ] **Step 2: 运行确认失败**

Run: `pnpm --filter yuleasr-web test -- src/pages/__tests__/start-page.test.tsx`
Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现**

```tsx
// apps/yuleasr-web/src/pages/StartPage.tsx
import { FilePlus2, FolderOpen, Upload } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { formatDate } from '@/lib/utils';
import { useConfigStore } from '@/stores/configStore';

export function StartPage() {
  const navigate = useNavigate();
  const { configList, loadConfigList } = useConfigStore();

  useEffect(() => {
    void loadConfigList();
  }, [loadConfigList]);

  const recent = [...configList]
    .sort((a, b) => b.lastModified.localeCompare(a.lastModified))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-xl font-bold text-app-text-primary">yuleASR Configurator</h1>
      <p className="mt-1 text-sm text-app-text-secondary">选择工程开始配置</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 rounded-lg border border-app-border-primary px-4 py-3 text-left hover:bg-app-bg-secondary"
        >
          <FilePlus2 className="h-5 w-5 text-purple-500" />
          <span>
            <span className="block text-sm font-medium">新建工程</span>
            <span className="block text-xs text-app-text-secondary">从模板或空白开始</span>
          </span>
        </button>
        <button
          onClick={() => navigate('/ecuc')}
          className="flex items-center gap-2 rounded-lg border border-app-border-primary px-4 py-3 text-left hover:bg-app-bg-secondary"
        >
          <Upload className="h-5 w-5 text-blue-500" />
          <span>
            <span className="block text-sm font-medium">导入 ARXML</span>
            <span className="block text-xs text-app-text-secondary">支持拖拽到窗口</span>
          </span>
        </button>
      </div>

      <h2 className="mt-8 text-sm font-semibold text-app-text-primary">最近工程</h2>
      {recent.length === 0 ? (
        <p className="mt-2 text-xs text-app-text-secondary">还没有工程</p>
      ) : (
        <ul className="mt-2 divide-y divide-app-border-primary rounded-lg border border-app-border-primary">
          {recent.map(item => (
            <li key={item.id}>
              <button
                onClick={() => navigate(`/editor/${item.id}`)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-app-bg-secondary"
              >
                <FolderOpen className="h-4 w-4 text-app-text-secondary" />
                <span className="text-sm">{item.name}</span>
                <span className="ml-auto text-[11px] text-app-text-secondary">
                  {item.moduleCount} 模块 · {formatDate(item.lastModified)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 路由**

`App.tsx` 中把 `/` 与 `/dashboard` 拆开：

```tsx
const isDesktop = typeof window !== 'undefined' && !!window.electronAPI?.isElectron;
```

```tsx
<Route path="/" element={isDesktop ? <StartPage /> : <Dashboard />} />
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/start" element={<StartPage />} />
```

并 import `StartPage`。`/start` 供 Web 端手动访问调试。

- [ ] **Step 5: 运行测试**

Run: `pnpm --filter yuleasr-web test -- src/pages/__tests__/start-page.test.tsx`
Expected: 1 passed。

- [ ] **Step 6: 提交**

```bash
git add apps/yuleasr-web/src/pages/StartPage.tsx apps/yuleasr-web/src/App.tsx apps/yuleasr-web/src/pages/__tests__/start-page.test.tsx
git commit -m "feat(desktop): 启动工作台"
```

---

## Task 14: 全量验收

- [ ] **Step 1: 全量测试**

Run: `pnpm --filter yuleasr-web test`
Expected: 全绿。

- [ ] **Step 2: 类型检查与 lint**

Run: `pnpm --filter yuleasr-web exec tsc --noEmit -p tsconfig.json`
Expected: 无输出。

Run: `pnpm lint:ci`
Expected: `✅ lint:ci passed`。

- [ ] **Step 3: 桌面工具测试**

Run: `node --test apps/yuleasr-desktop/electron/desktop-utils.test.mjs`
Expected: 全绿。

- [ ] **Step 4: 构建 Web 与桌面**

Run: `pnpm --filter yuleasr-web build`
Expected: 构建成功，无 TS 错误。

Run: `pnpm --filter yuleasr-desktop electron:build`
Expected: 产出安装包或可执行文件（按平台）。

- [ ] **Step 5: 手动清单**

1. 桌面启动 → 启动工作台 → 点最近工程进入编辑器。
2. 树中点 `Can / CanConfigSet` → 中栏参数渲染 → 底部问题面板出现相关条目。
3. 点底部条目 → 左树定位、右检查器显示消息与建议。
4. 点「应用修复」→ 参数值被纠正、问题消失、状态栏计数刷新、`Ctrl+Z` 可撤销。
5. 拖拽栏宽与问题面板高度 → 重启后保持。
6. `Ctrl+S` / `Ctrl+F` / `Ctrl+Shift+V` / `Ctrl+Shift+G` 分别触发保存、搜索、校验、生成。
7. `Ctrl+Shift+N` 打开新窗口。
8. 拖入 `.arxml` 正常导入；拖入 `.txt` 提示仅支持 arxml。
9. 编辑后强杀进程 → 重开提示恢复草稿。
10. Web 端（`pnpm --filter yuleasr-web dev`）：无启动工作台、无多窗口入口、快捷键不劫持浏览器。

- [ ] **Step 6: 提交验收记录**

```bash
git add docs/superpowers apps/yuleasr-web apps/yuleasr-desktop
git commit -m "test(workbench): 完成工作台改造验收"
```
