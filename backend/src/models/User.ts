import { query } from '../config/database';
import { User, Session } from '../types';

export const UserModel = {
  async findById(id: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1 AND is_active = true', [id]);
    return result.rows[0] || null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1 AND is_active = true', [
      email,
    ]);
    return result.rows[0] || null;
  },

  async findByUsername(username: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE username = $1 AND is_active = true', [
      username,
    ]);
    return result.rows[0] || null;
  },

  async create(data: {
    email: string;
    username: string;
    password_hash: string;
    email_verification_token: string;
  }): Promise<User> {
    const result = await query(
      `INSERT INTO users (email, username, password_hash, email_verification_token)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.email, data.username, data.password_hash, data.email_verification_token]
    );
    return result.rows[0];
  },

  async setPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await query(
      `UPDATE users
       SET password_reset_token = $1, password_reset_expires_at = $2, updated_at = NOW()
       WHERE id = $3`,
      [token, expiresAt, userId]
    );
  },

  async findByPasswordResetToken(token: string): Promise<User | null> {
    const result = await query(
      `SELECT * FROM users
       WHERE password_reset_token = $1 AND password_reset_expires_at > NOW() AND is_active = true`,
      [token]
    );
    return result.rows[0] || null;
  },

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await query(
      `UPDATE users
       SET password_hash = $1, password_reset_token = NULL, password_reset_expires_at = NULL, updated_at = NOW()
       WHERE id = $2`,
      [passwordHash, userId]
    );
  },

  async verifyEmail(token: string): Promise<User | null> {
    const result = await query(
      `UPDATE users
       SET is_verified = true, email_verified_at = NOW(), email_verification_token = NULL, updated_at = NOW()
       WHERE email_verification_token = $1
       RETURNING *`,
      [token]
    );
    return result.rows[0] || null;
  },

  toPublicProfile(user: User) {
    const {
      password_hash: _ph,
      email_verification_token: _evt,
      password_reset_token: _prt,
      password_reset_expires_at: _prea,
      ...publicData
    } = user;
    return publicData;
  },
};

export const SessionModel = {
  async create(data: {
    user_id: string;
    refresh_token: string;
    ip_address?: string;
    user_agent?: string;
    expires_at: Date;
  }): Promise<void> {
    await query(
      `INSERT INTO sessions (user_id, refresh_token, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        data.user_id,
        data.refresh_token,
        data.ip_address || null,
        data.user_agent || null,
        data.expires_at,
      ]
    );
  },

  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    const result = await query(
      `SELECT * FROM sessions
       WHERE refresh_token = $1 AND revoked_at IS NULL AND expires_at > NOW()`,
      [refreshToken]
    );
    return result.rows[0] || null;
  },

  async revoke(refreshToken: string): Promise<void> {
    await query(`UPDATE sessions SET revoked_at = NOW() WHERE refresh_token = $1`, [refreshToken]);
  },

  async revokeAllForUser(userId: string): Promise<void> {
    await query(
      `UPDATE sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId]
    );
  },

  async rotateRefreshToken(
    oldToken: string,
    newToken: string,
    newExpiresAt: Date
  ): Promise<void> {
    await query(
      `UPDATE sessions SET refresh_token = $1, expires_at = $2 WHERE refresh_token = $3`,
      [newToken, newExpiresAt, oldToken]
    );
  },
};
