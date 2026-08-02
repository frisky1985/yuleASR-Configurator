/**
 * Fix 32: syncToCloud 2xx/404/500 三分支的 isCloudSynced 语义测试（Fix 4 / C4 回归防护）。
 *
 * 语义契约：
 * - 2xx（PUT 成功）→ isCloudSynced: true, syncError: null
 * - 404（服务端无此配置）→ POST 创建；post 成功且返回 id → isCloudSynced: true 并回写服务端 id；
 *   post 失败或未返回 id → 抛出异常，isCloudSynced 必须保持 false（不得假标记已同步）
 * - 500 及其他错误 → 原样抛出，isCloudSynced 保持 false
 * - saveConfig 层面：同步失败必须置 isCloudSynced: false 并暴露 syncError
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { useConfigStore } from '@/stores/configStore';
import type { ConfigFile, ConfigModule } from '@/types';

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

const mockedApiPut = vi.mocked(api.put);
const mockedApiPost = vi.mocked(api.post);

function makeModule(): ConfigModule {
  return {
    id: 'adc',
    name: 'Adc',
    layer: 'MCAL',
    version: '1.0.0',
    enabled: true,
    parameters: [{ id: 'adcdozemode', name: 'DozeMode', type: 'enum', value: 'off' }],
    containers: [],
    dependencies: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    configStatus: 'configured',
  };
}

function makeConfig(id = 'config-local-1'): ConfigFile {
  return {
    id,
    name: 'Test Config',
    modules: [makeModule()],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

const storage = new Map<string, string>();
function mockLocalStorage(): void {
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
}

beforeEach(() => {
  mockLocalStorage();
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
  mockedApiPut.mockReset();
  mockedApiPost.mockReset();
});

/** 登录态：syncToCloud 仅在有 JWT 时执行 */
function authenticate(): void {
  useAuthStore.setState({
    user: { id: '1', email: 'a@b.c', username: 'a' },
    token: 'jwt-token',
    isAuthenticated: true,
  });
}

describe('syncToCloud 2xx 分支（Fix 4）', () => {
  it('PUT 成功：isCloudSynced=true, syncError=null，且不触发 POST', async () => {
    authenticate();
    mockedApiPut.mockResolvedValue({} as any);

    await useConfigStore.getState().syncToCloud();

    expect(mockedApiPut).toHaveBeenCalledWith('/v1/api/configs/config-local-1', expect.anything());
    expect(mockedApiPost).not.toHaveBeenCalled();
    const s = useConfigStore.getState();
    expect(s.isCloudSynced).toBe(true);
    expect(s.syncError).toBeNull();
  });
});

describe('syncToCloud 404 分支（Fix C4）', () => {
  it('PUT 404 → POST 创建成功且返回 id：置 true 并回写服务端 id', async () => {
    authenticate();
    mockedApiPut.mockRejectedValue(Object.assign(new Error('not found'), { status: 404 }));
    mockedApiPost.mockResolvedValue({ id: 'server-7' } as any);

    await useConfigStore.getState().syncToCloud();

    expect(mockedApiPost).toHaveBeenCalledWith('/v1/api/configs', expect.anything());
    const s = useConfigStore.getState();
    expect(s.isCloudSynced).toBe(true);
    expect(s.syncError).toBeNull();
    // 服务端 id 回写本地 state 与 localStorage
    expect(s.currentConfig?.id).toBe('server-7');
    expect(storage.get('yuleasr_config_server-7')).toBeTruthy();
  });

  it('PUT 404 → POST 失败：必须抛出，isCloudSynced 保持 false（不得假标记已同步）', async () => {
    authenticate();
    mockedApiPut.mockRejectedValue(Object.assign(new Error('not found'), { status: 404 }));
    mockedApiPost.mockRejectedValue(new Error('post failed'));

    await expect(useConfigStore.getState().syncToCloud()).rejects.toThrow('post failed');

    const s = useConfigStore.getState();
    expect(s.isCloudSynced).toBe(false);
    expect(s.currentConfig?.id).toBe('config-local-1'); // 本地 id 不被篡改
  });

  it('PUT 404 → POST 成功但未返回 id：抛出并保持 false', async () => {
    authenticate();
    mockedApiPut.mockRejectedValue(Object.assign(new Error('not found'), { status: 404 }));
    mockedApiPost.mockResolvedValue({ name: 'no-id-here' } as any);

    await expect(useConfigStore.getState().syncToCloud()).rejects.toThrow(
      'Server did not return a config id after create'
    );

    const s = useConfigStore.getState();
    expect(s.isCloudSynced).toBe(false);
  });
});

describe('syncToCloud 500 / 其他错误分支', () => {
  it('PUT 500：原样抛出，isCloudSynced 保持 false', async () => {
    authenticate();
    mockedApiPut.mockRejectedValue(Object.assign(new Error('server error'), { status: 500 }));

    await expect(useConfigStore.getState().syncToCloud()).rejects.toThrow('server error');

    const s = useConfigStore.getState();
    expect(s.isCloudSynced).toBe(false);
    expect(mockedApiPost).not.toHaveBeenCalled();
  });
});

describe('syncToCloud 未认证', () => {
  it('未登录：直接返回，不发任何请求、不改状态', async () => {
    await useConfigStore.getState().syncToCloud();

    expect(mockedApiPut).not.toHaveBeenCalled();
    expect(mockedApiPost).not.toHaveBeenCalled();
    const s = useConfigStore.getState();
    expect(s.isCloudSynced).toBe(false);
  });
});

describe('saveConfig 层面的同步语义（Fix C4 暴露 syncError）', () => {
  it('同步失败：saveConfig 置 isCloudSynced=false 并暴露 syncError（不保留旧“已同步”标记）', async () => {
    authenticate();
    // 先置成“已同步”，验证失败路径必须把它打回 false
    useConfigStore.setState({ isCloudSynced: true, syncError: null });
    mockedApiPut.mockRejectedValue(Object.assign(new Error('boom'), { status: 500 }));

    await useConfigStore.getState().saveConfig();

    const s = useConfigStore.getState();
    expect(s.isCloudSynced).toBe(false);
    expect(s.syncError).toBe('boom');
    // 本地保存仍然保留（offline-safe）
    expect(storage.get('yuleasr_config_config-local-1')).toBeTruthy();
    expect(s.isDirty).toBe(false);
  });

  it('同步成功：saveConfig 置 isCloudSynced=true 且 syncError=null', async () => {
    authenticate();
    mockedApiPut.mockResolvedValue({} as any);

    await useConfigStore.getState().saveConfig();

    const s = useConfigStore.getState();
    expect(s.isCloudSynced).toBe(true);
    expect(s.syncError).toBeNull();
  });
});
