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
    // isDirty 置脏后 store 的自动保存订阅会写 localStorage
    const storage = new Map<string, string>();
    (globalThis as any).localStorage = {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => {
        storage.set(k, String(v));
      },
      removeItem: (k: string) => {
        storage.delete(k);
      },
    };
    useConfigStore.setState({
      currentConfig: structuredClone(config),
      isDirty: false,
      validationResult: null,
      validationIssues: [],
      validationDegraded: false,
    });
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

  it('修复无实际变更时不置脏、不重算校验', () => {
    const before = structuredClone(config);
    before.modules[0].parameters[0].value = 1000000;
    useConfigStore.setState({
      currentConfig: before,
      isDirty: false,
      validationResult: null,
      validationIssues: [],
    });

    useConfigStore.getState().applyIssueFix({
      id: 'e3',
      path: 'Can.BaudRate',
      message: 'too big',
      severity: 'error',
      module: 'Can',
      parameter: 'BaudRate',
      fix: { kind: 'clamp-max', module: 'Can', parameter: 'BaudRate', value: 1000000 },
    });

    const state = useConfigStore.getState();
    expect(state.currentConfig).toBe(before);
    expect(state.isDirty).toBe(false);
    expect(state.validationResult).toBeNull();
  });
});
