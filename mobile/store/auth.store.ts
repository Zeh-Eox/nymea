import { create } from 'zustand';
import type { User } from '@/types/index';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/constants/config';
import { storage } from '@/utils/storage';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  clearTokens: () => Promise<void>;
  logout: () => Promise<void>;
  hydrate: (loadMe: () => Promise<User>) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isHydrating: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setTokens: async (accessToken, refreshToken) => {
    await storage.set(ACCESS_TOKEN_KEY, accessToken);
    await storage.set(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens: async () => {
    await storage.remove(ACCESS_TOKEN_KEY);
    await storage.remove(REFRESH_TOKEN_KEY);
    set({ user: null, isAuthenticated: false });
  },
  logout: async () => {
    await get().clearTokens();
  },
  hydrate: async (loadMe) => {
    const token = await storage.get(ACCESS_TOKEN_KEY);
    if (!token) {
      set({ isHydrating: false });
      return;
    }
    try {
      const user = await loadMe();
      set({ user, isAuthenticated: true, isHydrating: false });
    } catch {
      await get().clearTokens();
      set({ isHydrating: false });
    }
  },
}));
