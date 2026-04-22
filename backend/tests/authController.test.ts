import request from 'supertest';
import app from '../src/app';
import pool from '../src/config/database';
import redis from '../src/config/redis';

const TEST_USER = {
  email: 'test_auth@test.com',
  username: 'testauthuser',
  password: 'Password123!',
};

beforeAll(async () => {
  await redis.connect().catch(() => {});
  // Clean up any leftover test data
  await pool.query('DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email = $1)', [TEST_USER.email]);
  await pool.query('DELETE FROM users WHERE email = $1', [TEST_USER.email]);
});

afterAll(async () => {
  await pool.query('DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email = $1)', [TEST_USER.email]);
  await pool.query('DELETE FROM users WHERE email = $1', [TEST_USER.email]);
  await pool.end();
  await redis.quit();
});

describe('POST /api/v1/auth/register', () => {
  it('should register a new user and return tokens', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(TEST_USER);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user.email).toBe(TEST_USER.email);
    expect(res.body.data.user.username).toBe(TEST_USER.username);
    expect(res.body.data.user).not.toHaveProperty('password_hash');
  });

  it('should reject duplicate email with 409', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(TEST_USER);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should reject duplicate username with 409', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...TEST_USER, email: 'other@test.com' });
    expect(res.status).toBe(409);
  });

  it('should reject invalid email with 422', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', username: 'newuser', password: 'Password123!' });
    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('email');
  });

  it('should reject short password with 422', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'new@test.com', username: 'newuser', password: '123' });
    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('password');
  });

  it('should reject short username with 422', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'new@test.com', username: 'ab', password: 'Password123!' });
    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('username');
  });
});

describe('POST /api/v1/auth/login', () => {
  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user).not.toHaveProperty('password_hash');
  });

  it('should reject wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: 'WrongPassword!' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject non-existent email with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@test.com', password: 'Password123!' });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/refresh', () => {
  it('should return new token pair with valid refresh token', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });
    const { refreshToken } = loginRes.body.data;

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    // Rotated — new token must differ
    expect(res.body.data.refreshToken).not.toBe(refreshToken);
  });

  it('should reject invalid refresh token with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'this.is.invalid' });
    expect(res.status).toBe(401);
  });

  it('should reject missing refresh token with 422', async () => {
    const res = await request(app).post('/api/v1/auth/refresh').send({});
    expect(res.status).toBe(422);
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('should logout successfully and blacklist the access token', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });
    const { accessToken, refreshToken } = loginRes.body.data;

    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    // Access token must now be rejected
    const meRes = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(meRes.status).toBe(401);
  });

  it('should reject unauthenticated logout with 401', async () => {
    const res = await request(app).post('/api/v1/auth/logout');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/forgot-password', () => {
  it('should return 200 for existing email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: TEST_USER.email });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 200 for non-existent email (no enumeration)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'nobody@test.com' });
    expect(res.status).toBe(200);
  });

  it('should reject invalid email format with 422', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'not-valid' });
    expect(res.status).toBe(422);
  });
});

describe('GET /api/v1/users/me', () => {
  it('should return current user profile with valid token', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });
    const { accessToken } = loginRes.body.data;

    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(TEST_USER.email);
    expect(res.body.data.user).not.toHaveProperty('password_hash');
  });

  it('should reject unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/users/:id', () => {
  it('should return public user profile', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });
    const userId = loginRes.body.data.user.id;

    const res = await request(app).get(`/api/v1/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.username).toBe(TEST_USER.username);
    expect(res.body.data.user).not.toHaveProperty('email');
    expect(res.body.data.user).not.toHaveProperty('password_hash');
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app).get('/api/v1/users/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });
});
