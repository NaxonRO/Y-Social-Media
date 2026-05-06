import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'y_access_token';
const REFRESH_TOKEN_KEY = 'y_refresh_token';
const USER_KEY = 'y_user';

// Pe web folosim localStorage, pe telefon SecureStore
const store = {
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },

  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },

  async delete(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export const storage = {
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      store.set(ACCESS_TOKEN_KEY, accessToken),
      store.set(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },

  async getAccessToken(): Promise<string | null> {
    return store.get(ACCESS_TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return store.get(REFRESH_TOKEN_KEY);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      store.delete(ACCESS_TOKEN_KEY),
      store.delete(REFRESH_TOKEN_KEY),
    ]);
  },

  async saveUser(user: object): Promise<void> {
    await store.set(USER_KEY, JSON.stringify(user));
  },

  async getUser<T>(): Promise<T | null> {
    const raw = await store.get(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },

  async clearUser(): Promise<void> {
    await store.delete(USER_KEY);
  },

  async clearAll(): Promise<void> {
    await Promise.all([this.clearTokens(), this.clearUser()]);
  },
};
