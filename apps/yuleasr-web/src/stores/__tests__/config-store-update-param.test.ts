/**
 * Fix 32: configStore.updateParameter 路径解析测试（Fix 1/2 回归防护）。
 *
 * 覆盖四类路径语义：
 * - 模块级参数（无 container: 段）
 * - 静态容器参数（container: 段，无 instance:）
 * - 动态实例参数（container: + instance: 段，只更新目标实例）
 * - 非法路径 / 未知模块 / 未知参数（必须 console.error 且不改动配置，不得静默吞掉）
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from '@/stores/authStore';
import { useConfigStore } from '@/stores/configStore';
import type { ConfigFile, ConfigModule } from '@/types';

// ── 模块级 mock：隔离重依赖（core schema / 跨模块验证器 / 静态数据），
//    使测试聚焦 updateParameter 的路径解析与更新语义。 ──
vi.mock('@/services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
vi.mock('@yuletech/core/schema-extractor', () => ({
  schemaExtractor: { getAllSchemas: () => [] },
  defaultMcuSchema: { name: 'Mcu' },
  defaultCanSchema: { name: 'Can' },
  defaultGptSchema: { name: 'Gpt' },
}));
vi.mock('@yuletech/core/schema/load-generated', () => ({
  loadModuleSchemas: () => [],
}));
vi.mock('@yuletech/core/validators', () => ({
  CrossModuleValidator: class {
    validateAffectedBy() {
      return [];
    }
  },
}));
vi.mock('@/data/all-modules', () => ({ allModules: [] }));
vi.mock('@/data/os-config', () => ({ defaultOSConfig: {} }));

// ── Fixtures ──────────────────────────────────────────────────────────────

function makeModule(overrides: Partial<ConfigModule> = {}): ConfigModule {
  return {
    id: 'adc',
    name: 'Adc',
    layer: 'MCAL',
    version: '1.0.0',
    enabled: true,
    parameters: [
      { id: 'adcdozemode', name: 'DozeMode', type: 'enum', value: 'off' },
      { id: 'adcsampletime', name: 'SampleTime', type: 'float', value: 10.0 },
    ],
    containers: [
      {
        id: 'adcconfigset',
        name: 'AdcConfigSet',
        parameters: [{ id: 'adcdozemode', name: 'DozeMode', type: 'enum', value: 'off' }],
      },
      {
        id: 'cancontroller',
        name: 'CanController',
        multiple: true,
        parameters: [],
        instances: [
          { name: 'CanController_0', paramValues: { baudrate: 250000 } },
          { name: 'CanController_1', paramValues: { baudrate: 500000 } },
        ],
      },
    ],
    dependencies: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    configStatus: 'configured',
    ...overrides,
  };
}

function makeConfig(): ConfigFile {
  return {
    id: 'cfg-1',
    name: 'Test Config',
    modules: [makeModule()],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

const storage = new Map<string, string>();
beforeEach(() => {
  storage.clear();
  (globalThis as any).localStorage = {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => {
      storage.set(k, String(v));
    },
    removeItem: (k: string) => {
      storage.delete(k);
    },
  };
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  useConfigStore.setState({
    currentConfig: makeConfig(),
    isDirty: false,
    isCloudSynced: false,
    syncError: null,
    validationResult: null,
    validationIssues: [],
    validationDegraded: false,
  });
});

describe('configStore.updateParameter 路径解析（Fix 1/2）', () => {
  it('模块级参数路径：更新模块参数并置 isDirty', () => {
    useConfigStore.getState().updateParameter('layer:MCAL/module:adc/param:adcdozemode', 'on');

    const s = useConfigStore.getState();
    expect(s.currentConfig?.modules[0].parameters[0].value).toBe('on');
    expect(s.currentConfig?.modules[0].parameters[1].value).toBe(10.0); // 未改动参数不变
    expect(s.isDirty).toBe(true);
  });

  it('模块级参数按 name 匹配（UI 传入 display name）', () => {
    useConfigStore.getState().updateParameter('layer:MCAL/module:adc/param:SampleTime', 20.5);

    const s = useConfigStore.getState();
    expect(s.currentConfig?.modules[0].parameters[1].value).toBe(20.5);
    expect(s.isDirty).toBe(true);
  });

  it('静态容器参数路径：更新容器参数（container: 段，无 instance:）', () => {
    useConfigStore
      .getState()
      .updateParameter('layer:MCAL/module:adc/container:adcconfigset/param:adcdozemode', 'on');

    const s = useConfigStore.getState();
    const container = s.currentConfig?.modules[0].containers[0];
    expect(container?.parameters[0].value).toBe('on');
    // 模块级同名参数不受影响
    expect(s.currentConfig?.modules[0].parameters[0].value).toBe('off');
    expect(s.isDirty).toBe(true);
  });

  it('动态实例参数路径：只更新目标实例，其他实例不变', () => {
    useConfigStore
      .getState()
      .updateParameter(
        'layer:MCAL/module:adc/container:cancontroller/instance:CanController_0/param:baudrate',
        1000000
      );

    const s = useConfigStore.getState();
    const container = s.currentConfig?.modules[0].containers[1];
    expect(container?.instances?.[0].paramValues.baudrate).toBe(1000000);
    expect(container?.instances?.[1].paramValues.baudrate).toBe(500000); // 其他实例不变
    expect(s.isDirty).toBe(true);
  });

  it('非法路径（缺 module: 段）：console.error 且不改动配置、不置 dirty', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const before = JSON.stringify(useConfigStore.getState().currentConfig);

    useConfigStore.getState().updateParameter('layer:MCAL/param:adcdozemode', 'on');

    expect(spy).toHaveBeenCalled();
    expect(JSON.stringify(useConfigStore.getState().currentConfig)).toBe(before);
    expect(useConfigStore.getState().isDirty).toBe(false);
    spy.mockRestore();
  });

  it('未知模块 id：console.error 且不改动配置', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const before = JSON.stringify(useConfigStore.getState().currentConfig);

    useConfigStore.getState().updateParameter('layer:MCAL/module:nope/param:adcdozemode', 'on');

    expect(spy).toHaveBeenCalled();
    expect(JSON.stringify(useConfigStore.getState().currentConfig)).toBe(before);
    expect(useConfigStore.getState().isDirty).toBe(false);
    spy.mockRestore();
  });

  it('模块级参数不存在：console.error 且参数值不变', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    useConfigStore.getState().updateParameter('layer:MCAL/module:adc/param:notexist', 'on');

    expect(spy).toHaveBeenCalled();
    const s = useConfigStore.getState();
    // 关键契约（Fix 1）：参数值不被篡改（updatedAt/isDirty 会被 bump 属存量行为，此处不断言）
    expect(s.currentConfig?.modules[0].parameters[0].value).toBe('off');
    expect(s.currentConfig?.modules[0].parameters[1].value).toBe(10.0);
    spy.mockRestore();
  });

  it('无 currentConfig 时静默 no-op（不抛错）', () => {
    useConfigStore.setState({ currentConfig: null });
    expect(() =>
      useConfigStore.getState().updateParameter('layer:MCAL/module:adc/param:adcdozemode', 'on')
    ).not.toThrow();
    expect(useConfigStore.getState().isDirty).toBe(false);
  });

  it('递归容器树：更新嵌套子容器参数', () => {
    const config = makeConfig();
    config.modules[0].containers = [
      {
        id: 'parent',
        name: 'Parent',
        parameters: [],
        subContainers: [
          {
            id: 'nested',
            name: 'Nested',
            parameters: [{ id: 'depth', name: 'Depth', type: 'integer', value: 1 }],
          },
        ],
      },
    ];
    useConfigStore.setState({ currentConfig: config, isDirty: false });

    useConfigStore
      .getState()
      .updateParameter('layer:MCAL/module:adc/container:nested/param:depth', 99);

    const s = useConfigStore.getState();
    expect(s.currentConfig?.modules[0].containers[0].subContainers?.[0].parameters[0].value).toBe(
      99
    );
    expect(s.isDirty).toBe(true);
  });
});
