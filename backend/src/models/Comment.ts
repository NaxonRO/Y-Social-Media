import { query } from '../config/database';

export interface CommentWithAuthor {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  like_count: number;
  created_at: Date;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

export const CommentModel = {
  async create(postId: string, userId: string, content: string): Promise<CommentWithAuthor | null> {
    await query(
      `INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3)`,
      [postId, userId, content]
    );
    await query(
      `UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1`,
      [postId]
    );
    const result = await query(
      `SELECT c.*, u.username, u.display_name, u.avatar_url, u.is_verified
       FROM comments c JOIN users u ON u.id = c.user_id
       WHERE c.post_id = $1 AND c.user_id = $2
       ORDER BY c.created_at DESC LIMIT 1`,
      [postId, userId]
    );
    return result.rows[0] || null;
  },

  async getForPost(postId: string, limit = 50): Promise<CommentWithAuthor[]> {
    const result = await query(
      `SELECT c.*, u.username, u.display_name, u.avatar_url, u.is_verified
       FROM comments c JOIN users u ON u.id = c.user_id
       WHERE c.post_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2`,
      [postId, limit]
    );
    return result.rows;
  },

  async delete(commentId: string, userId: string): Promise<boolean> {
    const res = await query(
      `DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING post_id`,
      [commentId, userId]
    );
    if ((res.rowCount ?? 0) === 0) return false;
    const postId = res.rows[0].post_id;
    await query(
      `UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = $1`,
      [postId]
    );
    return true;
  },

  toPublic(c: CommentWithAuthor) {
    return {
      id: c.id,
      post_id: c.post_id,
      user_id: c.user_id,
      content: c.content,
      like_count: Number(c.like_count),
      created_at: c.created_at instanceof Date ? c.created_at.toISOString() : String(c.created_at),
      author: {
        id: c.user_id,
        username: c.username,
        display_name: c.display_name,
        avatar_url: c.avatar_url,
        is_verified: c.is_verified,
      },
    };
  },
};
