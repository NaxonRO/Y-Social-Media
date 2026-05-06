import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { AuthenticatedRequest } from '../types';

export const userController = {
  async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = await UserModel.findById(req.user!.id);
      if (!user) {
        res.status(404).json({ success: false, message: 'Utilizator negăsit' });
        return;
      }
      res.status(200).json({
        success: true,
        data: { user: UserModel.toPublicProfile(user) },
      });
    } catch (error) {
      console.error('GetMe error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { display_name, bio } = req.body as { display_name?: string; bio?: string };
      if (display_name !== undefined && display_name.length > 100) {
        res.status(400).json({ success: false, message: 'Numele afișat poate avea maxim 100 caractere' });
        return;
      }
      if (bio !== undefined && bio.length > 160) {
        res.status(400).json({ success: false, message: 'Bio poate avea maxim 160 caractere' });
        return;
      }
      const updated = await UserModel.updateProfile(req.user!.id, { display_name, bio });
      if (!updated) {
        res.status(404).json({ success: false, message: 'Utilizator negăsit' });
        return;
      }
      res.status(200).json({ success: true, data: { user: UserModel.toPublicProfile(updated) } });
    } catch (error) {
      console.error('UpdateProfile error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);
      if (!user) {
        res.status(404).json({ success: false, message: 'Utilizator negăsit' });
        return;
      }

      const profile = UserModel.toPublicProfile(user);
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: profile.id,
            username: profile.username,
            display_name: profile.display_name,
            bio: profile.bio,
            avatar_url: profile.avatar_url,
            is_verified: profile.is_verified,
            created_at: profile.created_at,
          },
        },
      });
    } catch (error) {
      console.error('GetUserById error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },
};
