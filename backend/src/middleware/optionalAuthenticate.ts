import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { jwtService } from '../services/jwtService';
import { redisService } from '../services/redisService';

export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    const isBlacklisted = await redisService.isTokenBlacklisted(token);
    if (isBlacklisted) return next();

    const payload = jwtService.verifyAccessToken(token);
    if (payload.type === 'access') {
      req.user = { id: payload.sub, email: payload.email, username: payload.username };
    }
  } catch {
    // token invalid → continuă fără user
  }
  next();
};
