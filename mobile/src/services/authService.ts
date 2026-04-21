import axios, { AxiosError } from 'axios';
import { storage } from './storage';
import { User, AuthTokens } from '../types';

const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL as string) || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use(async (config) => {
  const token = await storage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const refreshToken = await storage.getRefreshToken();
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;
          await storage.saveTokens(accessToken, newRefreshToken);
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${accessToken}`;
            return api.request(error.config);
          }
        } catch {
          await storage.clearAll();
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async register(
    email: string,
    username: string,
    password: string
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const res = await api.post('/auth/register', { email, username, password });
    const { user, accessToken, refreshToken } = res.data.data;
    await storage.saveTokens(accessToken, refreshToken);
    await storage.saveUser(user);
    return { user, tokens: { accessToken, refreshToken } };
  },

  async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    const res = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = res.data.data;
    await storage.saveTokens(accessToken, refreshToken);
    await storage.saveUser(user);
    return { user, tokens: { accessToken, refreshToken } };
  },

  async logout(): Promise<void> {
    const refreshToken = await storage.getRefreshToken();
    await api.post('/auth/logout', { refreshToken }).catch(() => {});
    await storage.clearAll();
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async getMe(): Promise<User> {
    const res = await api.get('/users/me');
    return res.data.data.user;
  },
};
