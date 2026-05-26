import { create } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';
import type { Role, Permission } from '../utils/permissions';
import { hasPermission, canAccessAdmin } from '../utils/permissions';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: Role;
  avatar?: string;
}

interface AdminState {
  user: AdminUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sidebarCollapsed: boolean;
  
  // Actions
  setUser: (user: AdminUser | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  toggleSidebar: () => void;
  logout: () => void;
  // Permission helpers
  checkPermission: (permission: Permission) => boolean;
  checkAdminAccess: () => boolean;
}

type AdminStorePersist = Pick<AdminState, 'token' | 'refreshToken' | 'user' | 'isAuthenticated' | 'sidebarCollapsed'>;

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get): AdminState => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      sidebarCollapsed: false,

      setUser: (user: AdminUser | null) => set({ user }),
      setToken: (token: string | null) => set({ token }),
      setRefreshToken: (refreshToken: string | null) => set({ refreshToken }),
      setAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      logout: () => set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      }),
      checkPermission: (permission: Permission) => {
        const { user } = get();
        if (!user) return false;
        return hasPermission(user.role, permission);
      },
      checkAdminAccess: () => {
        const { user } = get();
        return canAccessAdmin(user?.role);
      },
    }),
    {
      name: 'admin-storage',
      partialize: (state: AdminState): AdminStorePersist => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    } as PersistOptions<AdminState, AdminStorePersist>
  )
);
