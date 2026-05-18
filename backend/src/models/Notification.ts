import { query } from '../config/database';

export type NotificationType = 'like' | 'comment' | 'repost' | 'message' | 'follow';

export interface NotificationRow {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: NotificationType;
  post_id: string | null;
  conversation_id: string | null;
  message_preview: string | null;
  is_read: boolean;
  created_at: Date;
  actor_username: string;
  actor_display_name: string | null;
  actor_avatar_url: string | null;
  actor_is_verified: boolean;
  post_content: string | null;
}

export const NotificationModel = {
  async create(data: {
    recipient_id: string;
    actor_id: string;
    type: NotificationType;
    post_id?: string;
    conversation_id?: string;
    message_preview?: string;
  }): Promise<void> {
    // nu trimite notificare catre tine insuti
    if (data.recipient_id === data.actor_id) return;
    // evita duplicate: daca exista deja aceeasi notificare necitita, nu o dubla
    if (data.type !== 'message') {
      const existing = await query(
        `SELECT id FROM notifications WHERE recipient_id=$1 AND actor_id=$2 AND type=$3 AND post_id IS NOT DISTINCT FROM $4 AND is_read=false`,
        [data.recipient_id, data.actor_id, data.type, data.post_id ?? null]
      );
      if (existing.rows.length > 0) return;
    }
    await query(
      `INSERT INTO notifications (recipient_id, actor_id, type, post_id, conversation_id, message_preview)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [data.recipient_id, data.actor_id, data.type,
       data.post_id ?? null, data.conversation_id ?? null, data.message_preview ?? null]
    );
  },

  async getForUser(userId: string, limit = 30): Promise<NotificationRow[]> {
    const result = await query(
      `SELECT n.*,
              u.username AS actor_username, u.display_name AS actor_display_name,
              u.avatar_url AS actor_avatar_url, u.is_verified AS actor_is_verified,
              p.content AS post_content
       FROM notifications n
       JOIN users u ON u.id = n.actor_id
       LEFT JOIN posts p ON p.id = n.post_id
       WHERE n.recipient_id = $1
       ORDER BY n.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },

  async getUnreadCount(userId: string): Promise<number> {
    const result = await query(
      `SELECT COUNT(*) FROM notifications WHERE recipient_id=$1 AND is_read=FALSE`,
      [userId]
    );
    return Number(result.rows[0].count);
  },

  async markRead(notificationId: string, userId: string): Promise<void> {
    await query(
      `UPDATE notifications SET is_read=TRUE WHERE id=$1 AND recipient_id=$2`,
      [notificationId, userId]
    );
  },

  async markAllRead(userId: string): Promise<void> {
    await query(`UPDATE notifications SET is_read=TRUE WHERE recipient_id=$1`, [userId]);
  },

  toPublic(n: NotificationRow) {
    return {
      id: n.id,
      type: n.type,
      post_id: n.post_id,
      conversation_id: n.conversation_id,
      message_preview: n.message_preview,
      post_preview: n.post_content ? n.post_content.slice(0, 80) : null,
      is_read: n.is_read,
      created_at: n.created_at instanceof Date ? n.created_at.toISOString() : String(n.created_at),
      actor: {
        id: n.actor_id,
        username: n.actor_username,
        display_name: n.actor_display_name,
        avatar_url: n.actor_avatar_url,
        is_verified: n.actor_is_verified,
      },
    };
  },
};
