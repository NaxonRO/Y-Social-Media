import { query } from '../config/database';

export interface UserSummary {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  is_followed_by_viewer?: boolean;
}

export const FollowModel = {
  async follow(followerId: string, followingId: string): Promise<void> {
    await query(
      `INSERT INTO followers (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [followerId, followingId]
    );
  },

  async unfollow(followerId: string, followingId: string): Promise<void> {
    await query(
      `DELETE FROM followers WHERE follower_id=$1 AND following_id=$2`,
      [followerId, followingId]
    );
  },

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const result = await query(
      `SELECT 1 FROM followers WHERE follower_id=$1 AND following_id=$2`,
      [followerId, followingId]
    );
    return result.rows.length > 0;
  },

  async getFollowingIds(userId: string): Promise<string[]> {
    const result = await query(
      `SELECT following_id FROM followers WHERE follower_id=$1`,
      [userId]
    );
    return result.rows.map((r: any) => r.following_id);
  },

  async getCounts(userId: string): Promise<{ followers: number; following: number }> {
    const result = await query(
      `SELECT
        (SELECT COUNT(*) FROM followers WHERE following_id=$1) AS followers,
        (SELECT COUNT(*) FROM followers WHERE follower_id=$1) AS following`,
      [userId]
    );
    return {
      followers: Number(result.rows[0].followers),
      following: Number(result.rows[0].following),
    };
  },

  async getFollowers(userId: string, viewerId?: string): Promise<UserSummary[]> {
    const result = await query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, u.is_verified,
              ${viewerId ? `EXISTS(SELECT 1 FROM followers WHERE follower_id=$2 AND following_id=u.id)` : 'false'} AS is_followed_by_viewer
       FROM followers f JOIN users u ON u.id = f.follower_id
       WHERE f.following_id=$1
       ORDER BY f.created_at DESC`,
      viewerId ? [userId, viewerId] : [userId]
    );
    return result.rows;
  },

  async getFollowing(userId: string, viewerId?: string): Promise<UserSummary[]> {
    const result = await query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, u.is_verified,
              ${viewerId ? `EXISTS(SELECT 1 FROM followers WHERE follower_id=$2 AND following_id=u.id)` : 'false'} AS is_followed_by_viewer
       FROM followers f JOIN users u ON u.id = f.following_id
       WHERE f.follower_id=$1
       ORDER BY f.created_at DESC`,
      viewerId ? [userId, viewerId] : [userId]
    );
    return result.rows;
  },
};
