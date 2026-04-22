import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  type: 'access' | 'refresh';
  jti?: string;
  iat?: number;
  exp?: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  is_active: boolean;
  email_verified_at: Date | null;
  email_verification_token: string | null;
  password_reset_token: string | null;
  password_reset_expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Session {
  id: string;
  user_id: string;
  refresh_token: string;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: Date;
  created_at: Date;
  revoked_at: Date | null;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}
