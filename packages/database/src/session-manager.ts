import Redis from 'ioredis';

export class SessionManager {
  private redis: Redis;
  private serverId: string;

  constructor(redisUrl: string, serverId: string) {
    this.redis = new Redis(redisUrl);
    this.serverId = serverId;
  }

  /**
   * Gets the current server ID holding the session for the user.
   * Returns null if no session exists.
   */
  async getSessionServer(userId: string): Promise<string | null> {
    return await this.redis.get(`session:${userId}`);
  }

  /**
   * Creates a session for the user on this server.
   * Sets a TTL (e.g., 60s) which should be refreshed by a heartbeat.
   */
  async createSession(userId: string, ttlSeconds: number = 60): Promise<void> {
    await this.redis.set(`session:${userId}`, this.serverId, 'EX', ttlSeconds);
  }

  /**
   * Acquires a short-term lock to perform a kick operation.
   * Prevents other servers from trying to kick/login this user simultaneously.
   */
  async acquireLock(userId: string, ttlSeconds: number = 5): Promise<boolean> {
    const result = await this.redis.set(`lock:${userId}`, this.serverId, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  /**
   * Releases the lock for the user.
   */
  async releaseLock(userId: string): Promise<void> {
    const lockOwner = await this.redis.get(`lock:${userId}`);
    if (lockOwner === this.serverId) {
      await this.redis.del(`lock:${userId}`);
    }
  }

  /**
   * Publishes a FORCE_LOGOUT command to the target server.
   */
  async publishKickCommand(targetServerId: string, userId: string): Promise<void> {
    const channel = `kick:${targetServerId}`;
    const message = JSON.stringify({ userId, sourceServerId: this.serverId });
    await this.redis.publish(channel, message);
  }

  /**
   * Polls Redis until the session key is gone, indicating the previous server has released the user.
   * @param userId User ID to check
   * @param timeoutMs Max time to wait (default 5000ms)
   * @param intervalMs Polling interval (default 200ms)
   * @returns true if session was cleared, false if timed out
   */
  async waitForSessionRelease(
    userId: string,
    timeoutMs: number = 5000,
    intervalMs: number = 200,
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const currentSession = await this.redis.get(`session:${userId}`);
      if (!currentSession) {
        return true; // Session is gone!
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    return false; // Timed out
  }

  /**
   * Forcefully clears a session.
   * CAUTION: Should only be used if the previous server is unresponsive (timeout).
   */
  async forceClearSession(userId: string): Promise<void> {
    await this.redis.del(`session:${userId}`);
  }

  async close(): Promise<void> {
    this.redis.disconnect();
  }
}
