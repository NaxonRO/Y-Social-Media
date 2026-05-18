import { api } from './api';
import { Conversation, DirectMessage } from '../types';

export const messageService = {
  async getConversations(): Promise<Conversation[]> {
    const res = await api.get('/messages/conversations');
    return res.data.data.conversations;
  },

  async getOrCreateConversation(otherUserId: string): Promise<string> {
    const res = await api.post(`/messages/conversations/${otherUserId}`);
    return res.data.data.conversationId;
  },

  async getMessages(conversationId: string): Promise<DirectMessage[]> {
    const res = await api.get(`/messages/conversations/${conversationId}/messages`);
    return res.data.data.messages;
  },

  async sendMessage(conversationId: string, content: string): Promise<DirectMessage> {
    const res = await api.post(`/messages/conversations/${conversationId}/messages`, { content });
    return res.data.data.message;
  },
};
