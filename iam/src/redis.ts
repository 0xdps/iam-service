import { createClient } from 'redis';
import { config } from './config';
import { logger } from './utils/logger';

class RedisClient {
  private client: any;

  constructor() {
    this.client = createClient({
      url: config.redis.url
    });

    this.client.on('error', (err: any) => {
      logger.error('Redis Client Error', err);
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
    logger.info('Redis connected successfully');
  }

  async quit(): Promise<void> {
    await this.client.quit();
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async publish(stream: string, data: any): Promise<void> {
    await this.client.xAdd(stream, '*', data);
  }

  async readStream(stream: string, group: string, consumer: string): Promise<any[]> {
    try {
      const messages = await this.client.xReadGroup(
        group,
        consumer,
        { key: stream, id: '>' },
        { COUNT: 10, BLOCK: 1000 }
      );
      return messages || [];
    } catch (error) {
      return [];
    }
  }

  async ackMessage(stream: string, group: string, id: string): Promise<void> {
    await this.client.xAck(stream, group, id);
  }

  async createConsumerGroup(stream: string, group: string): Promise<void> {
    try {
      await this.client.xGroupCreate(stream, group, '0', { MKSTREAM: true });
    } catch (error) {
      // Group might already exist
    }
  }

  // Cache operations
  async cacheUserPermissions(userId: string, permissions: any[]): Promise<void> {
    const key = `cache:perms:user:${userId}`;
    await this.set(key, JSON.stringify(permissions), 60); // 60 seconds TTL
  }

  async getCachedUserPermissions(userId: string): Promise<any[] | null> {
    const key = `cache:perms:user:${userId}`;
    const cached = await this.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async invalidateUserPermissions(userId: string): Promise<void> {
    const key = `cache:perms:user:${userId}`;
    await this.del(key);
  }
}

export const redisClient = new RedisClient();