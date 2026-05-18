import { Response } from 'express';
import { NotificationModel } from '../models/Notification';
import { AuthenticatedRequest } from '../types';

export const notificationController = {
  async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const notifications = await NotificationModel.getForUser(req.user!.id);
      const unreadCount = await NotificationModel.getUnreadCount(req.user!.id);
      res.status(200).json({
        success: true,
        data: { notifications: notifications.map(NotificationModel.toPublic), unreadCount },
      });
    } catch (error) {
      console.error('GetNotifications error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async getUnreadCount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const count = await NotificationModel.getUnreadCount(req.user!.id);
      res.status(200).json({ success: true, data: { count } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async markRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await NotificationModel.markRead(req.params.id, req.user!.id);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async markAllRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await NotificationModel.markAllRead(req.user!.id);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },
};
