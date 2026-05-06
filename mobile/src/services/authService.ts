import { api } from './api';
import { storage } from './storage';
import { User, AuthTokens } from '../types';

export const authService = {
  async register(email: string, username: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
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

  async updateProfile(data: { display_name?: string; bio?: string }): Promise<User> {
    const res = await api.patch('/users/me/profile', data);
    return res.data.data.user;
  },
};
