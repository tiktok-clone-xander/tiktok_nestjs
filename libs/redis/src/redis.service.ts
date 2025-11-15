import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.client = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis connection error', err);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  // Video Views
  async incrementViews(videoId: string): Promise<number> {
    const key = `video:${videoId}:views`;
    return await this.client.incr(key);
  }

  async getViews(videoId: string): Promise<number> {
    const key = `video:${videoId}:views`;
    const views = await this.client.get(key);
    return views ? parseInt(views, 10) : 0;
  }

  // Video Likes
  async incrementLikes(videoId: string): Promise<number> {
    const key = `video:${videoId}:likes`;
    return await this.client.incr(key);
  }

  async decrementLikes(videoId: string): Promise<number> {
    const key = `video:${videoId}:likes`;
    return await this.client.decr(key);
  }

  async getLikes(videoId: string): Promise<number> {
    const key = `video:${videoId}:likes`;
    const likes = await this.client.get(key);
    return likes ? parseInt(likes, 10) : 0;
  }

  // User Liked Videos Set
  async addUserLike(userId: string, videoId: string): Promise<number> {
    const key = `user:${userId}:likes`;
    return await this.client.sadd(key, videoId);
  }

  async removeUserLike(userId: string, videoId: string): Promise<number> {
    const key = `user:${userId}:likes`;
    return await this.client.srem(key, videoId);
  }

  async hasUserLiked(userId: string, videoId: string): Promise<boolean> {
    const key = `user:${userId}:likes`;
    const result = await this.client.sismember(key, videoId);
    return result === 1;
  }

  // Comments Count
  async incrementCommentsCount(videoId: string): Promise<number> {
    const key = `video:${videoId}:comments`;
    return await this.client.incr(key);
  }

  async getCommentsCount(videoId: string): Promise<number> {
    const key = `video:${videoId}:comments`;
    const count = await this.client.get(key);
    return count ? parseInt(count, 10) : 0;
  }

  // Feed Cache
  async cacheFeed(userId: string, page: number, data: any, ttl = 300): Promise<void> {
    const key = `feed:${userId}:${page}`;
    await this.client.setex(key, ttl, JSON.stringify(data));
  }

  async getCachedFeed(userId: string, page: number): Promise<any> {
    const key = `feed:${userId}:${page}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async invalidateFeedCache(userId: string): Promise<void> {
    const pattern = `feed:${userId}:*`;
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  // Session Management
  async setSession(userId: string, sessionData: any, ttl = 86400): Promise<void> {
    const key = `session:${userId}`;
    await this.client.setex(key, ttl, JSON.stringify(sessionData));
  }

  async getSession(userId: string): Promise<any> {
    const key = `session:${userId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(userId: string): Promise<void> {
    const key = `session:${userId}`;
    await this.client.del(key);
  }

  // Generic Operations
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return await this.client.exists(key);
  }
}
