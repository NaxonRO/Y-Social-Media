import { query } from '../config/database';

export interface PostRow {
  id: string;
  user_id: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  parent_id: string | null;
  like_count: number;
  comment_count: number;
  repost_count: number;
  created_at: Date;
}

export interface PostWithAuthor extends PostRow {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  liked_by_me?: boolean;
  reposted_by_me?: boolean;
}

function feedQuery(where: string, limitParam: string, userIdParam: string | null): string {
  const likedExpr = userIdParam
    ? `EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ${userIdParam})`
    : 'false';
  const repostedExpr = userIdParam
    ? `EXISTS(SELECT 1 FROM reposts WHERE post_id = p.id AND user_id = ${userIdParam})`
    : 'false';
  return `
    SELECT p.*, u.username, u.display_name, u.avatar_url, u.is_verified,
           ${likedExpr} AS liked_by_me,
           ${repostedExpr} AS reposted_by_me
    FROM posts p
    JOIN users u ON u.id = p.user_id
    ${where}
    ORDER BY p.created_at DESC
    LIMIT ${limitParam}
  `;
}

export const PostModel = {
  async create(userId: string, content: string): Promise<PostWithAuthor | null> {
    const result = await query(
      `INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING id`,
      [userId, content]
    );
    const id = result.rows[0]?.id;
    if (!id) return null;
    return this.findById(id);
  },

  async findById(id: string): Promise<PostWithAuthor | null> {
    const result = await query(
      `SELECT p.*, u.username, u.display_name, u.avatar_url, u.is_verified,
              false AS liked_by_me, false AS reposted_by_me
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async getFeed(limit = 20, cursor?: string, userId?: string, followingOnly = false): Promise<PostWithAuthor[]> {
    const params: unknown[] = [limit];
    const conditions: string[] = [];

    if (cursor) {
      params.push(cursor);
      conditions.push(`p.created_at < $${params.length}`);
    }
    if (followingOnly && userId) {
      params.push(userId);
      conditions.push(`p.user_id IN (SELECT following_id FROM followers WHERE follower_id=$${params.length})`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const userParam = userId ? (params.push(userId), `$${params.length}`) : null;
    const result = await query(feedQuery(where, '$1', userParam), params);
    return result.rows;
  },

  async getByUserId(ownerId: string, limit = 20, cursor?: string, viewerId?: string): Promise<PostWithAuthor[]> {
    const params: unknown[] = [ownerId, limit];
    let where = `WHERE p.user_id = $1`;
    if (cursor) {
      params.push(cursor);
      where += ` AND p.created_at < $${params.length}`;
    }
    const userParam = viewerId ? (params.push(viewerId), `$${params.length}`) : null;
    const result = await query(feedQuery(where, '$2', userParam), params);
    return result.rows;
  },

  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
    const existing = await query(
      `SELECT id FROM likes WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );
    if (existing.rows.length > 0) {
      await query(`DELETE FROM likes WHERE post_id = $1 AND user_id = $2`, [postId, userId]);
      const res = await query(
        `UPDATE posts SET like_count = GREATEST(0, like_count - 1) WHERE id = $1 RETURNING like_count`,
        [postId]
      );
      return { liked: false, likeCount: Number(res.rows[0].like_count) };
    }
    await query(`INSERT INTO likes (post_id, user_id) VALUES ($1, $2)`, [postId, userId]);
    const res = await query(
      `UPDATE posts SET like_count = like_count + 1 WHERE id = $1 RETURNING like_count`,
      [postId]
    );
    return { liked: true, likeCount: Number(res.rows[0].like_count) };
  },

  async toggleRepost(postId: string, userId: string): Promise<{ reposted: boolean; repostCount: number }> {
    const existing = await query(
      `SELECT id FROM reposts WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );
    if (existing.rows.length > 0) {
      await query(`DELETE FROM reposts WHERE post_id = $1 AND user_id = $2`, [postId, userId]);
      const res = await query(
        `UPDATE posts SET repost_count = GREATEST(0, repost_count - 1) WHERE id = $1 RETURNING repost_count`,
        [postId]
      );
      return { reposted: false, repostCount: Number(res.rows[0].repost_count) };
    }
    await query(`INSERT INTO reposts (post_id, user_id) VALUES ($1, $2)`, [postId, userId]);
    const res = await query(
      `UPDATE posts SET repost_count = repost_count + 1 WHERE id = $1 RETURNING repost_count`,
      [postId]
    );
    return { reposted: true, repostCount: Number(res.rows[0].repost_count) };
  },

  async searchByHashtag(tag: string, limit = 20, userId?: string): Promise<PostWithAuthor[]> {
    const searchTag = (tag.startsWith('#') ? tag : `#${tag}`).toLowerCase();
    const params: unknown[] = [limit, `%${searchTag}%`];
    const userParam = userId ? (params.push(userId), `$${params.length}`) : null;
    const result = await query(
      feedQuery('WHERE LOWER(p.content) LIKE $2', '$1', userParam),
      params
    );
    return result.rows;
  },

  async getTrendingHashtags(limit = 8): Promise<{ tag: string; count: number }[]> {
    const result = await query(
      `SELECT m[1] AS tag, COUNT(*) AS count
       FROM posts, regexp_matches(content, '#([A-Za-z0-9_]+)', 'g') AS m
       GROUP BY tag
       ORDER BY count DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows.map((r: any) => ({ tag: r.tag as string, count: Number(r.count) }));
  },

  async delete(postId: string, userId: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM posts WHERE id = $1 AND user_id = $2`,
      [postId, userId]
    );
    return (result.rowCount ?? 0) > 0;
  },

  toPublic(post: PostWithAuthor) {
    return {
      id: post.id,
      user_id: post.user_id,
      content: post.content,
      media_url: post.media_url,
      media_type: post.media_type as 'image' | 'gif' | 'video' | null,
      like_count: Number(post.like_count),
      comment_count: Number(post.comment_count),
      repost_count: Number(post.repost_count),
      liked_by_me: Boolean(post.liked_by_me),
      reposted_by_me: Boolean(post.reposted_by_me),
      created_at: post.created_at instanceof Date
        ? post.created_at.toISOString()
        : String(post.created_at),
      author: {
        id: post.user_id,
        username: post.username,
        display_name: post.display_name,
        avatar_url: post.avatar_url,
        is_verified: post.is_verified,
      },
    };
  },
};
