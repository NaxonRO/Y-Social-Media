import { api } from './api';
import { AppNotification } from '../types';

export const notificationService = {
  async getNotifications(): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
    const res = await api.get('/notifications');
    return res.data.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await api.get('/notifications/unread-count');
    return res.data.data.count;
  },

  async markRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },
};
