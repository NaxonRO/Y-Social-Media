import { Router } from 'express';
import { userController } from '../controllers/userController';
import { followController } from '../controllers/followController';
import { authenticate } from '../middleware/authenticate';
import { optionalAuthenticate } from '../middleware/optionalAuthenticate';

const router = Router();

router.get('/me', authenticate, userController.getMe);
router.patch('/me/profile', authenticate, userController.updateProfile);
router.get('/me/following-ids', authenticate, followController.getFollowingIds);
router.get('/me/counts', authenticate, followController.getMyCounts);

router.post('/:id/follow', authenticate, followController.follow);
router.delete('/:id/follow', authenticate, followController.unfollow);
router.get('/:id/follow-status', authenticate, followController.getFollowStatus);
router.get('/:id/followers', optionalAuthenticate, followController.getFollowers);
router.get('/:id/following', optionalAuthenticate, followController.getFollowing);
router.get('/:id', userController.getUserById);

export default router;
