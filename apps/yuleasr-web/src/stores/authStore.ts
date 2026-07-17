import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { api } from '@/services/api';

export interface User {
  id: string;
  email: string;
  username: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;

  /** Computed — true when token is present */
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const result = await api.post<{ token: string; user: User }>('/api/auth/login', {
          email,
          password,
        });

        localStorage.setItem('yuleasr_token', result.token);
        localStorage.setItem('yuleasr_user', JSON.stringify(result.user));

        set({
          token: result.token,
          user: result.user,
          isAuthenticated: true,
        });
      },

      register: async (email: string, username: string, password: string) => {
        const result = await api.post<{ token: string; user: User }>('/api/auth/register', {
          email,
          username,
          password,
        });

        localStorage.setItem('yuleasr_token', result.token);
        localStorage.setItem('yuleasr_user', JSON.stringify(result.user));

        set({
          token: result.token,
          user: result.user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem('yuleasr_token');
        localStorage.removeItem('yuleasr_user');

        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      loadFromStorage: () => {
        const token = localStorage.getItem('yuleasr_token');
        const userStr = localStorage.getItem('yuleasr_user');

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr) as User;
            set({ token, user, isAuthenticated: true });
          } catch {
            // Corrupted data — clear
            localStorage.removeItem('yuleasr_token');
            localStorage.removeItem('yuleasr_user');
            set({ token: null, user: null, isAuthenticated: false });
          }
        }
      },
    }),
    { name: 'auth-store' }
  )
);
