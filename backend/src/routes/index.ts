import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import postRoutes from './posts';
import notificationRoutes from './notifications';
import messageRoutes from './messages';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/notifications', notificationRoutes);
router.use('/messages', messageRoutes);

export default router;
