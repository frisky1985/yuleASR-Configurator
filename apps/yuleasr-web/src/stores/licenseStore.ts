import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { api } from '@/services/api';

// ── Feature definitions ──────────────────────────────────────────────────

export interface FeatureDef {
  name: string;
  free: boolean | number;
  pro: boolean | number;
}

export const FEATURES: FeatureDef[] = [
  { name: 'maxModules', free: 5, pro: 9999 },
  { name: 'maxProjects', free: 1, pro: 9999 },
  { name: 'arxmlExport', free: false, pro: true },
  { name: 'codeGen', free: true, pro: true },
  { name: 'vscodeExtension', free: false, pro: true },
  { name: 'templateMarketUpload', free: false, pro: true },
];

export type FeatureName = (typeof FEATURES)[number]['name'];

// ── Types ─────────────────────────────────────────────────────────────────

export interface LicenseState {
  tier: 'free' | 'pro';
  maxModules: number;
  maxProjects: number;
  expiresAt: string | null;
  features: Record<string, boolean | number>;
  /** The raw license key (if activated) */
  licenseKey: string | null;
  /** Whether we have checked the server / loaded from local */
  initialized: boolean;
  /** Loading indicator */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Fix 26: 最近一次服务端确认的 tier（serverTier 优先，本地缓存仅作弱降级） */
  serverTier: 'free' | 'pro' | null;
  /** Fix 26: 服务端不可达时的「离线试用」标记 —— UI 必须标注，不再静默视为 Pro */
  offlineTrial: boolean;
}

interface LicenseActions {
  /** Load license state from server (via GET /v1/api/license/status) */
  loadFromServer: () => Promise<void>;
  /** Activate a license key */
  activateLicense: (key: string) => Promise<void>;
  /** Check if a feature is available for the current tier */
  hasFeature: (featureName: FeatureName) => boolean;
  /** Get the numeric limit for a numeric feature (maxModules, maxProjects) */
  getFeatureLimit: (featureName: FeatureName) => number;
  /** Reset to free tier (logout) */
  resetToFree: () => void;
}

const DEFAULT_FREE_STATE: LicenseState = {
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
};

// ── localStorage helpers ──────────────────────────────────────────────────

const STORAGE_KEY = 'yuleasr_license';

function saveToStorage(state: LicenseState): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      tier: state.tier,
      maxModules: state.maxModules,
      maxProjects: state.maxProjects,
      expiresAt: state.expiresAt,
      features: state.features,
      licenseKey: state.licenseKey,
    })
  );
}

function loadFromStorage(): Partial<LicenseState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Store ─────────────────────────────────────────────────────────────────

export const useLicenseStore = create<LicenseState & LicenseActions>()(
  devtools(
    (set, get) => ({
      ...DEFAULT_FREE_STATE,

      loadFromServer: async () => {
        set({ loading: true, error: null });
        try {
          // Fix 26: GET（服务端路由为 GET /v1/api/license/status），此前误用 POST 导致
          // serverTier 永远拿不到 —— serverTier 优先，本地缓存仅作弱降级。
          const data = await api.get<{
            tier: string;
            maxModules: number;
            maxProjects: number;
            expiresAt: string | null;
            features: Record<string, boolean | number>;
          }>('/v1/api/license/status');

          const tier = data.tier === 'pro' ? 'pro' : 'free';
          const newState: LicenseState = {
            tier,
            maxModules: data.maxModules,
            maxProjects: data.maxProjects,
            expiresAt: data.expiresAt,
            features: data.features,
            licenseKey: get().licenseKey,
            initialized: true,
            loading: false,
            error: null,
            serverTier: tier,
            offlineTrial: false,
          };
          saveToStorage(newState);
          set(newState);
        } catch {
          // Fix 26: 服务端不可达 → 弱降级为「离线试用」。缓存仍可展示，但
          // hasFeature/getFeatureLimit 不再信任（可被篡改的）本地 features，
          // 按 free 定义判定；UI（LicenseBadge）必须标注「离线试用」。
          const cached = loadFromStorage();
          if (cached) {
            set({
              ...cached,
              initialized: true,
              loading: false,
              error: null,
              serverTier: null,
              offlineTrial: true,
            } as LicenseState);
          } else {
            set({
              ...DEFAULT_FREE_STATE,
              initialized: true,
              loading: false,
              error: null,
              serverTier: null,
              offlineTrial: true,
            });
          }
        }
      },

      activateLicense: async (key: string) => {
        set({ loading: true, error: null });
        try {
          const data = await api.post<{
            tier: string;
            maxModules: number;
            maxProjects: number;
            expiresAt: string | null;
            features: Record<string, boolean | number>;
          }>('/v1/api/license/activate', { key });

          const newState: LicenseState = {
            tier: 'pro',
            maxModules: data.maxModules,
            maxProjects: data.maxProjects,
            expiresAt: data.expiresAt,
            features: data.features,
            licenseKey: key,
            initialized: true,
            loading: false,
            error: null,
            serverTier: 'pro',
            offlineTrial: false,
          };
          saveToStorage(newState);
          set(newState);
        } catch (err: any) {
          const message = err?.message || 'Failed to activate license';
          set({ loading: false, error: message });
          throw err;
        }
      },

      hasFeature: (featureName: FeatureName): boolean => {
        const state = get();
        // Fix 26: 离线试用时不信任（可被篡改的）本地缓存 features，按 free 定义判定；
        // serverTier 优先 —— 在线时 features 由服务端响应填充，本地缓存仅作弱降级。
        if (state.offlineTrial) {
          const def = FEATURES.find(f => f.name === featureName);
          const v = def ? def.free : false;
          return typeof v === 'number' ? v > 0 : !!v;
        }
        const val = state.features[featureName];
        if (typeof val === 'number') {
          return val > 0;
        }
        return !!val;
      },

      getFeatureLimit: (featureName: FeatureName): number => {
        const state = get();
        // Fix 26: 同上 —— 离线试用按 free 定义返回上限，不再静默视为 Pro。
        if (state.offlineTrial) {
          const def = FEATURES.find(f => f.name === featureName);
          const v = def ? def.free : 0;
          return typeof v === 'number' ? v : v ? 9999 : 0;
        }
        const val = state.features[featureName];
        if (typeof val === 'number') return val;
        return val ? 9999 : 0;
      },

      resetToFree: () => {
        clearStorage();
        set(DEFAULT_FREE_STATE);
      },
    }),
    { name: 'license-store' }
  )
);
