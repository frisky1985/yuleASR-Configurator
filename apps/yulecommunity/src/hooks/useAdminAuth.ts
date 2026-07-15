import { useState, useEffect, useCallback } from 'react';

const ADMIN_AUTH_KEY = 'yuletech-admin-auth';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'yuletech2026';
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

interface AdminAuthState {
  loggedInAt: number;
}

function getStoredAuth(): AdminAuthState | null {
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminAuthState;
    return parsed;
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

  const login = useCallback((username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const state: AdminAuthState = { loggedInAt: Date.now() };
      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(state));
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAdmin(false);
  }, []);

  return { isAdmin, login, logout };
}
