import { Response } from 'express';
import { MessageModel } from '../models/Message';
import { NotificationModel } from '../models/Notification';
import { query } from '../config/database';
import { AuthenticatedRequest } from '../types';

export const messageController = {
  async getConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversations = await MessageModel.getConversations(req.user!.id);
      res.status(200).json({
        success: true,
        data: { conversations: conversations.map(MessageModel.toPublicConv) },
      });
    } catch (error) {
      console.error('GetConversations error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async getOrCreateConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId: otherUserId } = req.params;
      if (otherUserId === req.user!.id) {
        res.status(400).json({ success: false, message: 'Nu poți trimite mesaj ție însuți' });
        return;
      }
      const conversationId = await MessageModel.getOrCreateConversation(req.user!.id, otherUserId);
      res.status(200).json({ success: true, data: { conversationId } });
    } catch (error) {
      console.error('GetOrCreateConversation error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async getMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: conversationId } = req.params;
      // verifica ca userul face parte din conversatie
      const conv = await query(
        `SELECT * FROM conversations WHERE id=$1 AND (participant1_id=$2 OR participant2_id=$2)`,
        [conversationId, req.user!.id]
      );
      if (conv.rows.length === 0) {
        res.status(403).json({ success: false, message: 'Acces interzis' });
        return;
      }
      const messages = await MessageModel.getMessages(conversationId, req.user!.id);
      res.status(200).json({
        success: true,
        data: { messages: messages.map(MessageModel.toPublicMsg) },
      });
    } catch (error) {
      console.error('GetMessages error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: conversationId } = req.params;
      const { content } = req.body as { content?: string };
      if (!content || content.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Mesajul nu poate fi gol' });
        return;
      }
      // verifica participare + gaseste destinatarul
      const conv = await query(
        `SELECT * FROM conversations WHERE id=$1 AND (participant1_id=$2 OR participant2_id=$2)`,
        [conversationId, req.user!.id]
      );
      if (conv.rows.length === 0) {
        res.status(403).json({ success: false, message: 'Acces interzis' });
        return;
      }
      const conversation = conv.rows[0];
      const recipientId = conversation.participant1_id === req.user!.id
        ? conversation.participant2_id
        : conversation.participant1_id;

      const message = await MessageModel.sendMessage(conversationId, req.user!.id, content.trim());

      // notificare pentru destinatar
      await NotificationModel.create({
        recipient_id: recipientId,
        actor_id: req.user!.id,
        type: 'message',
        conversation_id: conversationId,
        message_preview: content.trim().slice(0, 80),
      });

      res.status(201).json({ success: true, data: { message: MessageModel.toPublicMsg(message) } });
    } catch (error) {
      console.error('SendMessage error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },
};
