/**
 * 统一的 GitHub API 客户端
 * 提供共享的 fetch 封装、缓存系统和可选的 Token 认证
 */

import { safeGet, safeSet, safeRemove } from '../lib/utils';

const TOKEN_KEY = 'yuletech_github_token';
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟

// 通用缓存条目
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

// 缓存 token 到模块变量，避免每次请求读 localStorage
let cachedToken: string | null | undefined; // undefined = uninitialized, null = set to null

/**
 * 获取可选的 GitHub Token（用户可在 localStorage 中设置）
 * 无 token 时自动降级为未认证请求（限流 60次/小时）
 */
function getToken(): string | null {
  if (cachedToken !== undefined) return cachedToken;
  cachedToken = safeGet(TOKEN_KEY);
  return cachedToken;
}

/**
 * 设置 GitHub Token（写入 localStorage + 模块缓存）
 */
export function setToken(token: string | null): void {
  cachedToken = token;
  if (token) safeSet(TOKEN_KEY, token);
  else safeRemove(TOKEN_KEY);
}

/**
 * 带认证的统一 fetch 封装
 * - 自动附加 Accept header
 * - 有 token 时附加 Authorization header（提升限流至 5000次/小时）
 */
export async function githubFetch(url: string): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    // 429 = rate limited, suggest adding a token
    if (response.status === 429) {
      console.warn(
        '[GitHub API] Rate limited. Set a GitHub token in localStorage via:\n' +
        `  localStorage.setItem('${TOKEN_KEY}', 'ghp_xxx');`
      );
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response;
}

/**
 * 统一缓存获取
 * 优先内存缓存 -> 降级 sessionStorage
 * 同时清除过期条目，防止 memoryCache 无限增长
 */
function cacheGet<T>(key: string): T | null {
  // 1. 检查内存缓存
  const mem = memoryCache.get(key);
  if (mem) {
    if (Date.now() - mem.timestamp < CACHE_TTL) {
      return mem.data as T;
    }
    // 过期了，清除
    memoryCache.delete(key);
  }

  // 2. 检查 sessionStorage（向后兼容已缓存的用户数据）
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() - entry.timestamp < CACHE_TTL) {
        // 提升到内存缓存
        memoryCache.set(key, entry);
        return entry.data;
      }
      sessionStorage.removeItem(key);
    }
  } catch {
    // Ignore storage errors
  }

  return null;
}

/**
 * 统一缓存写入
 * 写入内存 + sessionStorage（持久化）
 */
function cacheSet<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  memoryCache.set(key, entry as CacheEntry<unknown>);

  try {
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // sessionStorage full or unavailable — memory cache still works
  }
}

/**
 * 清除统一缓存
 */
export function clearGitHubCache(): void {
  memoryCache.clear();
  try {
    Object.values(CACHE_KEYS).forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // Ignore
  }
}

/**
 * 缓存键常量
 */
export const CACHE_KEYS = {
  USER_REPOS: 'yuletech_github_cache',
  REPO_STATS: 'yuletech_github_repo_stats',
} as const;

export { cacheGet, cacheSet };
export type { CacheEntry };
