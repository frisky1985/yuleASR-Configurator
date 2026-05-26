/**
 * 用户认证 Hook
 * @description 管理用户登录状态和 Token
 */

import { useState, useEffect, useCallback } from 'react';

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

const AUTH_KEY = 'yuletech:auth';

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // 初始化时从 localStorage 读取
  useEffect(() => {
    const initAuth = () => {
      try {
        const stored = localStorage.getItem(AUTH_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setAuth({
            user: parsed.user,
            token: parsed.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuth(prev => ({ ...prev, isLoading: false }));
        }
      } catch {
        setAuth(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = useCallback((user: User, token: string) => {
    const authData = { user, token };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    setAuth({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setAuth({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setAuth(prev => {
      if (!prev.user) return prev;
      const newUser = { ...prev.user, ...updates };
      const authData = { user: newUser, token: prev.token };
      localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
      return { ...prev, user: newUser };
    });
  }, []);

  return {
    ...auth,
    login,
    logout,
    updateUser,
  };
}

export default useAuth;
