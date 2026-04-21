import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { JwtPayload } from '../types';

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-production-min32';
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production-min32';
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const jwtService = {
  generateAccessToken(payload: Omit<JwtPayload, 'type' | 'iat' | 'exp' | 'jti'>): string {
    return jwt.sign({ ...payload, type: 'access', jti: uuidv4() }, ACCESS_SECRET, {
      expiresIn: ACCESS_EXPIRES_IN,
    } as jwt.SignOptions);
  },

  generateRefreshToken(
    payload: Omit<JwtPayload, 'type' | 'iat' | 'exp' | 'jti'>
  ): { token: string; expiresAt: Date } {
    const token = jwt.sign(
      { ...payload, type: 'refresh', jti: uuidv4() },
      REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRES_IN } as jwt.SignOptions
    );
    const decoded = jwt.decode(token) as JwtPayload;
    const expiresAt = new Date((decoded.exp as number) * 1000);
    return { token, expiresAt };
  },

  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
  },

  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
  },

  getRemainingTTL(token: string): number {
    const decoded = jwt.decode(token) as JwtPayload;
    const exp = decoded?.exp || 0;
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, exp - now);
  },
};
