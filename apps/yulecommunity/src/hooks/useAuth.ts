/**
 * 用户认证 Hook
 * @description 管理用户登录状态和 Token（sessionStorage，关闭标签页即失效）
 * 支持 localStorage 降级：未登录时回到本地 mock
 */

import { useState, useEffect, useCallback } from 'react';
import { safeSessionGet, safeSessionSet, safeSessionRemove } from '../lib/utils';
import { userApi } from '@/services/userApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'user' | 'vip' | 'admin' | 'super_admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const USER_KEY = 'yuletech:auth:user';
const TOKEN_KEY = 'yuletech:auth:token';

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => {
    // Synchronous read from sessionStorage for instant init
    const userRaw = safeSessionGet(USER_KEY);
    const token = safeSessionGet(TOKEN_KEY);
    if (userRaw && token) {
      try {
        const user = JSON.parse(userRaw) as User;
        return { user, token, isAuthenticated: true, isLoading: false };
      } catch { /* fall through */ }
    }
    return { user: null, token: null, isAuthenticated: false, isLoading: false };
  });

  // Async re-check on mount — 验证 token 是否仍有效
  useEffect(() => {
    const token = safeSessionGet(TOKEN_KEY);
    if (token && !auth.isAuthenticated) {
      const userRaw = safeSessionGet(USER_KEY);
      if (userRaw) {
        try {
          const user = JSON.parse(userRaw) as User;
          userApi.setToken(token);
          setAuth({ user, token, isAuthenticated: true, isLoading: false });
          return;
        } catch { /* fall through */ }
      }
    }
    setAuth(prev => ({ ...prev, isLoading: false }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * 登录 — 调用后端 API
   * 若后端不可用，降级到本地模拟登录
   */
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return { success: false, message: err.message || '登录失败' };
      }

      const result = await response.json();
      if (result.success && result.data) {
        const { user, token } = result.data;
        safeSessionSet(USER_KEY, JSON.stringify(user));
        safeSessionSet(TOKEN_KEY, token);
        userApi.setToken(token);
        setAuth({ user, token, isAuthenticated: true, isLoading: false });
        return { success: true, message: '' };
      }

      return { success: false, message: result.message || '登录失败' };
    } catch (err) {
      console.warn('[useAuth] 后端不可用，降级到本地模拟登录', err);
      // 降级: 接受任何密码，创建本地 mock 用户
      const mockUser: User = {
        id: `local-${Date.now()}`,
        username: email.split('@')[0],
        email,
        role: 'user',
      };
      const mockToken = `mock-token-${Date.now()}`;
      safeSessionSet(USER_KEY, JSON.stringify(mockUser));
      safeSessionSet(TOKEN_KEY, mockToken);
      setAuth({ user: mockUser, token: mockToken, isAuthenticated: true, isLoading: false });
      return { success: true, message: '' };
    }
  }, []);

  /**
   * 注册 — 调用后端 API
   * 若后端不可用，降级到本地模拟注册
   */
  const register = useCallback(async (
    username: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const result = await response.json();
      if (response.ok && result.success && result.data) {
        const { user, token } = result.data;
        safeSessionSet(USER_KEY, JSON.stringify(user));
        safeSessionSet(TOKEN_KEY, token);
        userApi.setToken(token);
        setAuth({ user, token, isAuthenticated: true, isLoading: false });
        return { success: true, message: '' };
      }

      return { success: false, message: result.message || '注册失败' };
    } catch (err) {
      console.warn('[useAuth] 后端不可用，降级到本地模拟注册', err);
      // 降级: 本地 mock
      const mockUser: User = {
        id: `local-${Date.now()}`,
        username,
        email,
        role: 'user',
      };
      const mockToken = `mock-token-${Date.now()}`;
      safeSessionSet(USER_KEY, JSON.stringify(mockUser));
      safeSessionSet(TOKEN_KEY, mockToken);
      setAuth({ user: mockUser, token: mockToken, isAuthenticated: true, isLoading: false });
      return { success: true, message: '' };
    }
  }, []);

  const logout = useCallback(() => {
    safeSessionRemove(USER_KEY);
    safeSessionRemove(TOKEN_KEY);
    userApi.setToken(null);
    setAuth({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setAuth(prev => {
      if (!prev.user) return prev;
      const newUser = { ...prev.user, ...updates };
      safeSessionSet(USER_KEY, JSON.stringify(newUser));
      return { ...prev, user: newUser };
    });
  }, []);

  return {
    ...auth,
    login,
    register,
    logout,
    updateUser,
  };
}

export default useAuth;
