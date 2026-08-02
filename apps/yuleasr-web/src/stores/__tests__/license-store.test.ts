/**
 * Fix 26: licenseStore —— serverTier 优先（GET /v1/api/license/status）+ 离线时
 * 降级为「离线试用」（offlineTrial），hasFeature/getFeatureLimit 不再信任可被
 * 篡改的本地缓存，按 free 定义判定；UI 标注由 LicenseBadge 负责。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/services/api';

import { FEATURES, useLicenseStore } from '../licenseStore';

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApiGet = vi.mocked(api.get);

// ── localStorage mock ──
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
  mockedApiGet.mockReset();
  // 重置 store 到默认状态
  useLicenseStore.setState({
    tier: 'free',
    maxModules: 5,
    maxProjects: 1,
    expiresAt: null,
    features: Object.fromEntries(FEATURES.map(f => [f.name, f.free])) as Record<
      string,
      boolean | number
    >,
    licenseKey: null,
    initialized: false,
    loading: false,
    error: null,
    serverTier: null,
    offlineTrial: false,
  });
});

const PRO_RESPONSE = {
  tier: 'pro',
  maxModules: 9999,
  maxProjects: 9999,
  expiresAt: '2027-01-01T00:00:00Z',
  features: Object.fromEntries(FEATURES.map(f => [f.name, f.pro])) as Record<
    string,
    boolean | number
  >,
};

describe('licenseStore loadFromServer（Fix 26）', () => {
  it('服务端返回 pro：GET /v1/api/license/status，serverTier=pro 且 offlineTrial=false', async () => {
    mockedApiGet.mockResolvedValue(PRO_RESPONSE as any);

    await useLicenseStore.getState().loadFromServer();

    const s = useLicenseStore.getState();
    expect(mockedApiGet).toHaveBeenCalledWith('/v1/api/license/status');
    expect(s.serverTier).toBe('pro');
    expect(s.offlineTrial).toBe(false);
    expect(s.tier).toBe('pro');
    expect(s.hasFeature('arxmlExport')).toBe(true);
    expect(s.getFeatureLimit('maxModules')).toBe(9999);
  });

  it('服务端不可达且本地缓存 pro：降级为离线试用，不再静默视为 Pro', async () => {
    // 本地缓存伪造/缓存的 pro 状态
    storage.set(
      'yuleasr_license',
      JSON.stringify({
        tier: 'pro',
        maxModules: 9999,
        maxProjects: 9999,
        expiresAt: '2027-01-01T00:00:00Z',
        features: Object.fromEntries(FEATURES.map(f => [f.name, f.pro])),
        licenseKey: 'YULE-TAMPERED-0000-0000',
      })
    );
    mockedApiGet.mockRejectedValue(new Error('network down'));

    await useLicenseStore.getState().loadFromServer();

    const s = useLicenseStore.getState();
    expect(s.offlineTrial).toBe(true);
    expect(s.serverTier).toBeNull();
    // 缓存 pro 不生效：离线试用按 free 定义判定
    expect(s.hasFeature('arxmlExport')).toBe(false);
    expect(s.hasFeature('codeGen')).toBe(true); // free 也有的功能仍可用
    expect(s.getFeatureLimit('maxModules')).toBe(5);
    expect(s.getFeatureLimit('maxProjects')).toBe(1);
  });

  it('服务端不可达且无缓存：回退到 free 默认并标记离线试用', async () => {
    mockedApiGet.mockRejectedValue(new Error('network down'));

    await useLicenseStore.getState().loadFromServer();

    const s = useLicenseStore.getState();
    expect(s.offlineTrial).toBe(true);
    expect(s.tier).toBe('free');
    expect(s.getFeatureLimit('maxModules')).toBe(5);
  });
});

describe('licenseStore hasFeature/getFeatureLimit（Fix 26）', () => {
  it('正常（非离线）时使用服务端 features', () => {
    useLicenseStore.setState({
      tier: 'pro',
      features: Object.fromEntries(FEATURES.map(f => [f.name, f.pro])),
      offlineTrial: false,
    });
    const s = useLicenseStore.getState();
    expect(s.hasFeature('arxmlExport')).toBe(true);
    expect(s.getFeatureLimit('maxModules')).toBe(9999);
  });

  it('离线试用时 getFeatureLimit 按 free 上限返回', () => {
    useLicenseStore.setState({
      tier: 'pro',
      features: Object.fromEntries(FEATURES.map(f => [f.name, f.pro])),
      offlineTrial: true,
    });
    const s = useLicenseStore.getState();
    expect(s.getFeatureLimit('maxModules')).toBe(5);
    expect(s.getFeatureLimit('maxProjects')).toBe(1);
    expect(s.hasFeature('arxmlExport')).toBe(false);
  });
});
