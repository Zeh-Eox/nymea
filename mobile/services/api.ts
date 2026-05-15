import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { ACCESS_TOKEN_KEY, API_BASE_URL, REFRESH_TOKEN_KEY } from '@/constants/config';
import { storage } from '@/utils/storage';

type RetriableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
};

type AuthTokensPair = { accessToken: string; refreshToken: string };

console.log('[api] baseURL =', API_BASE_URL);

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
});

let refreshPromise: Promise<AuthTokensPair | null> | null = null;
let onUnauthorized: (() => Promise<void>) | null = null;

export function setUnauthorizedHandler(handler: () => Promise<void>): void {
  onUnauthorized = handler;
}

async function performRefresh(): Promise<AuthTokensPair | null> {
  const refreshToken = await storage.get(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post<{ tokens: AuthTokensPair }>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { timeout: 10_000 },
    );
    await storage.set(ACCESS_TOKEN_KEY, data.tokens.accessToken);
    await storage.set(REFRESH_TOKEN_KEY, data.tokens.refreshToken);
    return data.tokens;
  } catch {
    await storage.remove(ACCESS_TOKEN_KEY);
    await storage.remove(REFRESH_TOKEN_KEY);
    return null;
  }
}

api.interceptors.request.use(async (config) => {
  const token = await storage.get(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableRequest | undefined;

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      original._skipAuthRefresh
    ) {
      return Promise.reject(error);
    }

    original._retry = true;
    refreshPromise ??= performRefresh().finally(() => {
      refreshPromise = null;
    });
    const tokens = await refreshPromise;

    if (!tokens) {
      await onUnauthorized?.();
      return Promise.reject(error);
    }

    original.headers.Authorization = `Bearer ${tokens.accessToken}`;
    return api.request(original);
  },
);
