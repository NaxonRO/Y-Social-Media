import { Request, Response } from 'express';
import { FollowModel } from '../models/Follow';
import { NotificationModel } from '../models/Notification';
import { AuthenticatedRequest } from '../types';

export const followController = {
  async follow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: targetId } = req.params;
      if (targetId === req.user!.id) {
        res.status(400).json({ success: false, message: 'Nu te poți urmări pe tine însuți' });
        return;
      }
      await FollowModel.follow(req.user!.id, targetId);
      NotificationModel.create({
        recipient_id: targetId,
        actor_id: req.user!.id,
        type: 'follow',
      }).catch(() => {});
      res.status(200).json({ success: true, data: { following: true } });
    } catch (error) {
      console.error('Follow error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async unfollow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: targetId } = req.params;
      await FollowModel.unfollow(req.user!.id, targetId);
      res.status(200).json({ success: true, data: { following: false } });
    } catch (error) {
      console.error('Unfollow error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async getFollowStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: targetId } = req.params;
      const [isFollowing, counts] = await Promise.all([
        FollowModel.isFollowing(req.user!.id, targetId),
        FollowModel.getCounts(targetId),
      ]);
      res.status(200).json({ success: true, data: { isFollowing, ...counts } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async getFollowingIds(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ids = await FollowModel.getFollowingIds(req.user!.id);
      res.status(200).json({ success: true, data: { ids } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async getFollowers(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const viewerId = (req as AuthenticatedRequest).user?.id;
      const [followers, counts] = await Promise.all([
        FollowModel.getFollowers(id, viewerId),
        FollowModel.getCounts(id),
      ]);
      res.status(200).json({ success: true, data: { users: followers, ...counts } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async getFollowing(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const viewerId = (req as AuthenticatedRequest).user?.id;
      const [following, counts] = await Promise.all([
        FollowModel.getFollowing(id, viewerId),
        FollowModel.getCounts(id),
      ]);
      res.status(200).json({ success: true, data: { users: following, ...counts } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async getMyCounts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const counts = await FollowModel.getCounts(req.user!.id);
      res.status(200).json({ success: true, data: counts });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },
};
