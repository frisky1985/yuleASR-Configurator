/**
 * Fix 26: api.ts 401 不再整页跳转 —— 抛带 unauthorized 标记的错误 + 派发
 * yuleasr:unauthorized 事件（由路由层 Layout 监听后跳 `${BASE_URL}login`）。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { api, ApiError, UNAUTHORIZED_EVENT } from '../api';

// ── node 环境 mock（vitest 默认 node env，无 window/localStorage）──
const storage = new Map<string, string>();
const listeners = new Map<string, Set<Function>>();

function installBrowserMocks(): void {
  (globalThis as any).localStorage = {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => {
      storage.set(k, String(v));
    },
    removeItem: (k: string) => {
      storage.delete(k);
    },
  };
  (globalThis as any).window = {
    dispatchEvent: (ev: Event) => {
      for (const fn of listeners.get(ev.type) ?? []) fn(ev);
      return true;
    },
    addEventListener: (type: string, fn: Function) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(fn);
    },
    removeEventListener: (type: string, fn: Function) => {
      listeners.get(type)?.delete(fn);
    },
  };
}

function jsonResponse(status: number, body: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: () => 'application/json' },
    json: async () => body,
  } as unknown as Response;
}

beforeEach(() => {
  storage.clear();
  listeners.clear();
  installBrowserMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete (globalThis as any).localStorage;
  delete (globalThis as any).window;
});

describe('api 401 处理（Fix 26）', () => {
  it('401 抛带 unauthorized 标记的 ApiError，并清理 token/user', async () => {
    storage.set('yuleasr_token', 'expired-token');
    storage.set('yuleasr_user', '{"id":1,"username":"t"}');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { message: 'Unauthorized' })));

    let caught: any;
    try {
      await api.get('/v1/api/configs');
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(ApiError);
    expect(caught.status).toBe(401);
    expect(caught.unauthorized).toBe(true);
    expect(storage.has('yuleasr_token')).toBe(false);
    expect(storage.has('yuleasr_user')).toBe(false);
  });

  it('401 派发 yuleasr:unauthorized 事件（路由层据此跳转登录）', async () => {
    let fired = 0;
    (globalThis as any).window.addEventListener(UNAUTHORIZED_EVENT, () => {
      fired += 1;
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { message: 'Unauthorized' })));

    await expect(api.get('/x')).rejects.toThrow('Unauthorized');
    expect(fired).toBe(1);
  });

  it('非 401 错误不带 unauthorized 标记', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(500, { message: 'boom' })));

    let caught: any;
    try {
      await api.get('/x');
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(ApiError);
    expect(caught.status).toBe(500);
    expect(caught.unauthorized).toBeUndefined();
  });
});
