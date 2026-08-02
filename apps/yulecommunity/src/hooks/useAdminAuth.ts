import { useState, useEffect, useCallback } from 'react';

/**
 * 管理端认证 Hook
 * Fix 11: 删除硬编码口令（内置 admin 演示账号），改为服务端校验。
 * 登录走 POST /v1/auth/admin/login，仅当服务端返回 role ∈ admin/super_admin 才写入会话。
 */

const ADMIN_AUTH_KEY = 'yuletech-admin-auth';
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface AdminAuthState {
  loggedInAt: number;
  user: {
    id: number;
    email: string;
    username: string;
    role: string;
  };
  token: string;
}

function getStoredAuth(): AdminAuthState | null {
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminAuthState;
  } catch {
    return null;
  }
}

function isAuthValid(state: AdminAuthState | null): boolean {
  if (!state) return false;
  const now = Date.now();
  return now - state.loggedInAt < SESSION_DURATION_MS;
}

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = getStoredAuth();
    return isAuthValid(stored);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const current = getStoredAuth();
      if (!isAuthValid(current)) {
        setIsAdmin(false);
        localStorage.removeItem(ADMIN_AUTH_KEY);
      }
    }, 60000); // check every minute

    return () => clearInterval(interval);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.token || !result.user) {
        return { success: false, message: result.message || '管理员登录失败' };
      }

      // Fix 11: 角色必须来自服务端，且属于 admin/super_admin
      const role = result.user.role as string;
      if (!['admin', 'super_admin'].includes(role)) {
        return { success: false, message: '无管理员权限' };
      }

      const state: AdminAuthState = {
        loggedInAt: Date.now(),
        user: result.user,
        token: result.token,
      };
      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(state));
      setIsAdmin(true);
      return { success: true, message: '' };
    } catch (err) {
      console.warn('[useAdminAuth] 后端不可达:', err);
      return { success: false, message: '服务暂时不可用，请稍后重试' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAdmin(false);
  }, []);

  return { isAdmin, login, logout };
}
