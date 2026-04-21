import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { jwtService } from '../services/jwtService';
import { redisService } from '../services/redisService';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Token de autentificare lipsă' });
      return;
    }

    const token = authHeader.split(' ')[1];

    const isBlacklisted = await redisService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      res.status(401).json({ success: false, message: 'Token invalid' });
      return;
    }

    const payload = jwtService.verifyAccessToken(token);
    if (payload.type !== 'access') {
      res.status(401).json({ success: false, message: 'Tip de token invalid' });
      return;
    }

    req.user = { id: payload.sub, email: payload.email, username: payload.username };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token invalid sau expirat' });
  }
};
