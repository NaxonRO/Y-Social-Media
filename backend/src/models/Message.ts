import { query } from '../config/database';

export interface ConversationRow {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at: Date | null;
  created_at: Date;
  other_username: string;
  other_display_name: string | null;
  other_avatar_url: string | null;
  other_is_verified: boolean;
  last_message_content: string | null;
  unread_count: number;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: Date;
  sender_username: string;
  sender_display_name: string | null;
  sender_avatar_url: string | null;
}

export const MessageModel = {
  async getOrCreateConversation(userId: string, otherUserId: string): Promise<string> {
    // ordonam pentru a garanta unicitate (participant1 < participant2 lexicografic)
    const [p1, p2] = [userId, otherUserId].sort();
    const existing = await query(
      `SELECT id FROM conversations WHERE participant1_id=$1 AND participant2_id=$2`,
      [p1, p2]
    );
    if (existing.rows.length > 0) return existing.rows[0].id;
    const result = await query(
      `INSERT INTO conversations (participant1_id, participant2_id) VALUES ($1, $2) RETURNING id`,
      [p1, p2]
    );
    return result.rows[0].id;
  },

  async getConversations(userId: string): Promise<ConversationRow[]> {
    const result = await query(
      `SELECT c.*,
              u.username AS other_username, u.display_name AS other_display_name,
              u.avatar_url AS other_avatar_url, u.is_verified AS other_is_verified,
              m.content AS last_message_content,
              (SELECT COUNT(*) FROM messages WHERE conversation_id=c.id AND sender_id!=u.id AND is_read=FALSE) AS unread_count
       FROM conversations c
       JOIN users u ON u.id = CASE WHEN c.participant1_id=$1 THEN c.participant2_id ELSE c.participant1_id END
       LEFT JOIN messages m ON m.id = (
         SELECT id FROM messages WHERE conversation_id=c.id ORDER BY created_at DESC LIMIT 1
       )
       WHERE c.participant1_id=$1 OR c.participant2_id=$1
       ORDER BY COALESCE(c.last_message_at, c.created_at) DESC`,
      [userId]
    );
    return result.rows;
  },

  async getMessages(conversationId: string, userId: string): Promise<MessageRow[]> {
    // marcheaza ca citite mesajele celuilalt
    await query(
      `UPDATE messages SET is_read=TRUE WHERE conversation_id=$1 AND sender_id!=$2`,
      [conversationId, userId]
    );
    const result = await query(
      `SELECT m.*, u.username AS sender_username, u.display_name AS sender_display_name, u.avatar_url AS sender_avatar_url
       FROM messages m JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id=$1
       ORDER BY m.created_at ASC`,
      [conversationId]
    );
    return result.rows;
  },

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<MessageRow> {
    const result = await query(
      `INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING id`,
      [conversationId, senderId, content]
    );
    await query(
      `UPDATE conversations SET last_message_at=NOW() WHERE id=$1`,
      [conversationId]
    );
    const full = await query(
      `SELECT m.*, u.username AS sender_username, u.display_name AS sender_display_name, u.avatar_url AS sender_avatar_url
       FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.id=$1`,
      [result.rows[0].id]
    );
    return full.rows[0];
  },

  toPublicConv(c: ConversationRow) {
    return {
      id: c.id,
      last_message_at: c.last_message_at ? (c.last_message_at instanceof Date ? c.last_message_at.toISOString() : String(c.last_message_at)) : null,
      last_message: c.last_message_content,
      unread_count: Number(c.unread_count),
      other_user: {
        id: c.participant1_id === c.participant2_id ? c.participant1_id : 'other',
        username: c.other_username,
        display_name: c.other_display_name,
        avatar_url: c.other_avatar_url,
        is_verified: c.other_is_verified,
      },
    };
  },

  toPublicMsg(m: MessageRow) {
    return {
      id: m.id,
      conversation_id: m.conversation_id,
      sender_id: m.sender_id,
      content: m.content,
      is_read: m.is_read,
      created_at: m.created_at instanceof Date ? m.created_at.toISOString() : String(m.created_at),
      sender: {
        username: m.sender_username,
        display_name: m.sender_display_name,
        avatar_url: m.sender_avatar_url,
      },
    };
  },
};
