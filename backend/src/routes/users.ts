import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/me', authenticate, userController.getMe);
router.patch('/me/profile', authenticate, userController.updateProfile);
router.get('/:id', userController.getUserById);

export default router;
