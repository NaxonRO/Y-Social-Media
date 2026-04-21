import redis from '../config/redis';

const BLACKLIST_PREFIX = 'blacklist:';

export const redisService = {
  async blacklistToken(token: string, ttlSeconds: number): Promise<void> {
    if (ttlSeconds > 0) {
      await redis.setex(`${BLACKLIST_PREFIX}${token}`, ttlSeconds, '1');
    }
  },

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await redis.exists(`${BLACKLIST_PREFIX}${token}`);
    return result === 1;
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, value);
    } else {
      await redis.set(key, value);
    }
  },

  async get(key: string): Promise<string | null> {
    return redis.get(key);
  },

  async del(key: string): Promise<void> {
    await redis.del(key);
  },
};
