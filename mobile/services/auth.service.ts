import { api } from './api';
import type { AuthTokens, User } from '@/types/index';

type LoginPayload = { email: string; password: string };
type RegisterPayload = LoginPayload & { name?: string };
type AuthResponse = { user: User; tokens: AuthTokens };

export type UpdateMePayload = {
  name?: string | null;
  defaultCycleLength?: number;
  defaultPeriodLength?: number;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    return data;
  },
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    return data;
  },
  me: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>(
      '/auth/refresh',
      { refreshToken },
      { _skipAuthRefresh: true } as never,
    );
    return data;
  },
  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken });
  },
  updateMe: async (payload: UpdateMePayload): Promise<User> => {
    const { data } = await api.put<User>('/auth/me', payload);
    return data;
  },
  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await api.put('/auth/me/password', payload);
  },
  deleteMe: async (): Promise<void> => {
    await api.delete('/auth/me');
  },
};
