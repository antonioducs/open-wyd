import { getRedisClient } from '@repo/database';

export class LoginGuard {
  private static readonly MAX_ATTEMPTS = 10;
  private static readonly LOCKOUT_DURATION = 300; // 5 minutes

  static async checkIp(ip: string): Promise<boolean> {
    const redis = getRedisClient();
    const key = `ratelimit:login:${ip}`;

    const attempts = await redis.get(key);

    if (attempts && parseInt(attempts) >= this.MAX_ATTEMPTS) {
      return false;
    }

    return true;
  }

  static async recordFailure(ip: string) {
    const redis = getRedisClient();
    const key = `ratelimit:login:${ip}`;

    // Increment the counter
    const current = await redis.incr(key);

    // Set expiry on first failure
    if (current === 1) {
      await redis.expire(key, this.LOCKOUT_DURATION);
    }
  }

  static async reset(ip: string) {
    const redis = getRedisClient();
    const key = `ratelimit:login:${ip}`;
    await redis.del(key);
  }
}
