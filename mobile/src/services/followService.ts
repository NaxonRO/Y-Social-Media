import { api } from './api';

export const followService = {
  async follow(userId: string): Promise<void> {
    await api.post(`/users/${userId}/follow`);
  },

  async unfollow(userId: string): Promise<void> {
    await api.delete(`/users/${userId}/follow`);
  },

  async getFollowStatus(userId: string): Promise<{ isFollowing: boolean; followers: number; following: number }> {
    const res = await api.get(`/users/${userId}/follow-status`);
    return res.data.data;
  },

  async getFollowingIds(): Promise<string[]> {
    const res = await api.get('/users/me/following-ids');
    return res.data.data.ids;
  },

  async getMyCounts(): Promise<{ followers: number; following: number }> {
    const res = await api.get('/users/me/counts');
    return res.data.data;
  },

  async getFollowers(userId: string): Promise<any[]> {
    const res = await api.get(`/users/${userId}/followers`);
    return res.data.data.users;
  },

  async getFollowing(userId: string): Promise<any[]> {
    const res = await api.get(`/users/${userId}/following`);
    return res.data.data.users;
  },
};
