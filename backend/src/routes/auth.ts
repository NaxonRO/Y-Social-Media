import { Router } from 'express';
import { authController, registerSchema, loginSchema, forgotPasswordSchema, refreshSchema } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

export default router;
