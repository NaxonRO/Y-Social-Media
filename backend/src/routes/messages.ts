import { Router } from 'express';
import { messageController } from '../controllers/messageController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/conversations', authenticate, messageController.getConversations);
router.post('/conversations/:userId', authenticate, messageController.getOrCreateConversation);
router.get('/conversations/:id/messages', authenticate, messageController.getMessages);
router.post('/conversations/:id/messages', authenticate, messageController.sendMessage);

export default router;
