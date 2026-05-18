import { api } from './api';
import { Post, Comment } from '../types';

export const postService = {
  async createPost(content: string): Promise<Post> {
    const res = await api.post('/posts', { content });
    return res.data.data.post;
  },

  async getFeed(cursor?: string, followingOnly = false): Promise<{ posts: Post[]; nextCursor: string | null }> {
    const res = await api.get('/posts/feed', {
      params: { limit: 20, ...(cursor ? { cursor } : {}), ...(followingOnly ? { following: 'true' } : {}) },
    });
    return { posts: res.data.data.posts, nextCursor: res.data.data.nextCursor };
  },

  async toggleLike(postId: string): Promise<{ liked: boolean; likeCount: number }> {
    const res = await api.post(`/posts/${postId}/like`);
    return res.data.data;
  },

  async toggleRepost(postId: string): Promise<{ reposted: boolean; repostCount: number }> {
    const res = await api.post(`/posts/${postId}/repost`);
    return res.data.data;
  },

  async getMyPosts(cursor?: string): Promise<{ posts: Post[]; nextCursor: string | null }> {
    const res = await api.get('/posts/mine', {
      params: { limit: 20, ...(cursor ? { cursor } : {}) },
    });
    return { posts: res.data.data.posts, nextCursor: res.data.data.nextCursor };
  },

  async deletePost(postId: string): Promise<void> {
    await api.delete(`/posts/${postId}`);
  },

  async getComments(postId: string): Promise<Comment[]> {
    const res = await api.get(`/posts/${postId}/comments`);
    return res.data.data.comments;
  },

  async createComment(postId: string, content: string): Promise<Comment> {
    const res = await api.post(`/posts/${postId}/comments`, { content });
    return res.data.data.comment;
  },

  async deleteComment(postId: string, commentId: string): Promise<void> {
    await api.delete(`/posts/${postId}/comments/${commentId}`);
  },

  async getPostById(postId: string): Promise<Post> {
    const res = await api.get(`/posts/${postId}`);
    const p = res.data.data.post;
    return { ...p, liked_by_me: p.liked_by_me ?? false, reposted_by_me: p.reposted_by_me ?? false };
  },

  async searchByHashtag(query: string): Promise<Post[]> {
    const res = await api.get('/posts/search', { params: { q: query } });
    return res.data.data.posts;
  },

  async getTrendingHashtags(): Promise<{ tag: string; count: number }[]> {
    const res = await api.get('/posts/trending-tags');
    return res.data.data.tags;
  },
};
