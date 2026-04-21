import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Joi from 'joi';
import { UserModel, SessionModel } from '../models/User';
import { jwtService } from '../services/jwtService';
import { redisService } from '../services/redisService';
import { emailService } from '../services/emailService';
import { AuthenticatedRequest } from '../types';

const BCRYPT_ROUNDS = 12;

export const registerSchema = Joi.object({
  email: Joi.string().email().lowercase().required().messages({
    'string.email': 'Adresa de email nu este validă',
    'any.required': 'Email-ul este obligatoriu',
  }),
  username: Joi.string().alphanum().min(3).max(30).lowercase().required().messages({
    'string.alphanum': 'Username-ul poate conține doar litere și cifre',
    'string.min': 'Username-ul trebuie să aibă cel puțin 3 caractere',
    'string.max': 'Username-ul poate avea maxim 30 de caractere',
    'any.required': 'Username-ul este obligatoriu',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Parola trebuie să aibă cel puțin 8 caractere',
    'any.required': 'Parola este obligatorie',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const generateTokenPair = async (
  user: { id: string; email: string; username: string },
  req: Request
) => {
  const payload = { sub: user.id, email: user.email, username: user.username };
  const accessToken = jwtService.generateAccessToken(payload);
  const { token: refreshToken, expiresAt } = jwtService.generateRefreshToken(payload);

  await SessionModel.create({
    user_id: user.id,
    refresh_token: refreshToken,
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
    expires_at: expiresAt,
  });

  return { accessToken, refreshToken };
};

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, username, password } = req.body;

      const [existingEmail, existingUsername] = await Promise.all([
        UserModel.findByEmail(email),
        UserModel.findByUsername(username),
      ]);

      if (existingEmail) {
        res.status(409).json({ success: false, message: 'Email-ul este deja folosit' });
        return;
      }
      if (existingUsername) {
        res.status(409).json({ success: false, message: 'Username-ul este deja folosit' });
        return;
      }

      const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const email_verification_token = crypto.randomBytes(32).toString('hex');

      const user = await UserModel.create({
        email,
        username,
        password_hash,
        email_verification_token,
      });

      emailService
        .sendVerificationEmail(email, username, email_verification_token)
        .catch(console.error);

      const { accessToken, refreshToken } = await generateTokenPair(user, req);

      res.status(201).json({
        success: true,
        message: 'Cont creat cu succes. Verifică emailul pentru confirmare.',
        data: {
          user: UserModel.toPublicProfile(user),
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({ success: false, message: 'Credențiale invalide' });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        res.status(401).json({ success: false, message: 'Credențiale invalide' });
        return;
      }

      const { accessToken, refreshToken } = await generateTokenPair(user, req);

      res.status(200).json({
        success: true,
        data: {
          user: UserModel.toPublicProfile(user),
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];

      if (token) {
        const ttl = jwtService.getRemainingTTL(token);
        await redisService.blacklistToken(token, ttl);
      }

      const { refreshToken } = req.body;
      if (refreshToken) {
        await SessionModel.revoke(refreshToken);
      }

      res.status(200).json({ success: true, message: 'Deconectare reușită' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const session = await SessionModel.findByRefreshToken(refreshToken);
      if (!session) {
        res.status(401).json({ success: false, message: 'Refresh token invalid sau expirat' });
        return;
      }

      let payload;
      try {
        payload = jwtService.verifyRefreshToken(refreshToken);
      } catch {
        await SessionModel.revoke(refreshToken);
        res.status(401).json({ success: false, message: 'Refresh token invalid' });
        return;
      }

      const newAccessToken = jwtService.generateAccessToken({
        sub: payload.sub,
        email: payload.email,
        username: payload.username,
      });

      const { token: newRefreshToken, expiresAt } = jwtService.generateRefreshToken({
        sub: payload.sub,
        email: payload.email,
        username: payload.username,
      });

      await SessionModel.rotateRefreshToken(refreshToken, newRefreshToken, expiresAt);

      res.status(200).json({
        success: true,
        data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      });
    } catch (error) {
      console.error('Refresh error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const user = await UserModel.findByEmail(email);
      if (user) {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await UserModel.setPasswordResetToken(user.id, resetToken, expiresAt);
        emailService.sendPasswordResetEmail(email, resetToken).catch(console.error);
      }

      // Always return 200 to avoid email enumeration
      res.status(200).json({
        success: true,
        message: 'Dacă emailul există, vei primi un link de resetare a parolei.',
      });
    } catch (error) {
      console.error('ForgotPassword error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },
};
