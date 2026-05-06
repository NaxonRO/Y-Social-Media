import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { storage } from './storage';

function getApiUrl(): string {
  if (Platform.OS === 'web') {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return `http://${hostname}:3000/api/v1`;
  }
  const hostUri: string | undefined =
    (Constants as any).expoGoConfig?.hostUri ??
    Constants.expoConfig?.hostUri ??
    (Constants as any).manifest?.debuggerHost;
  const host = hostUri?.split(':')[0];
  if (host && host !== 'localhost') return `http://${host}:3000/api/v1`;
  return 'http://localhost:3000/api/v1';
}

export const API_BASE_URL = getApiUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = await storage.getRefreshToken();
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh } = res.data.data;
          await storage.saveTokens(accessToken, newRefresh);
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
