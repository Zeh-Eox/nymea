import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { REFRESH_TOKEN_KEY } from '@/constants/config';
import { storage } from '@/utils/storage';

export function useAuth() {
  const { user, isAuthenticated, isHydrating, setUser, setTokens, clearTokens } = useAuthStore();

  const login = async (email: string, password: string): Promise<void> => {
    const { user: nextUser, tokens } = await authService.login({ email, password });
    await setTokens(tokens.accessToken, tokens.refreshToken);
    setUser(nextUser);
  };

  const register = async (email: string, password: string, name?: string): Promise<void> => {
    const { user: nextUser, tokens } = await authService.register({ email, password, name });
    await setTokens(tokens.accessToken, tokens.refreshToken);
    setUser(nextUser);
  };

  const logout = async (): Promise<void> => {
    const refreshToken = await storage.get(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch {
        // best-effort revoke; clear local state regardless
      }
    }
    await clearTokens();
  };

  return { user, isAuthenticated, isHydrating, login, register, logout };
}
