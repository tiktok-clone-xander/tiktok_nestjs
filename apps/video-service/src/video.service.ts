import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { Video } from '@app/database/entities/video.entity';
import { User } from '@app/database/entities/user.entity';
import { RedisService } from '@app/redis';
import { RabbitMQService } from '@app/rabbitmq';
import {
  CreateVideoDto,
  UpdateVideoStatsDto,
} from '@app/common/dto/video.dto';
import { logger } from '@app/common/utils/logger';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async createVideo(data: CreateVideoDto) {
    try {
      // Validate user exists
      const user = await this.userRepository.findOne({
        where: { id: data.userId },
      });

      if (!user) {
        throw new RpcException('User not found');
      }

      // Create video entity
      const video = this.videoRepository.create({
        userId: data.userId,
        title: data.title,
        description: data.description,
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl,
        duration: data.duration,
      });

      const savedVideo = await this.videoRepository.save(video);

      // Initialize Redis counters
      await Promise.all([
        this.redisService.set(`video:${savedVideo.id}:views`, '0'),
        this.redisService.set(`video:${savedVideo.id}:likes`, '0'),
        this.redisService.set(`video:${savedVideo.id}:comments`, '0'),
      ]);

      // Invalidate feed cache
      await this.redisService.invalidateFeedCache(data.userId);

      // Publish event to RabbitMQ
      await this.rabbitMQService.publish('video.created', {
        videoId: savedVideo.id,
        userId: data.userId,
        title: data.title,
      });

      logger.info(`Video created: ${savedVideo.id}`);

      return {
        video: {
          id: savedVideo.id,
          userId: savedVideo.userId,
          title: savedVideo.title,
          description: savedVideo.description,
          videoUrl: savedVideo.videoUrl,
          thumbnailUrl: savedVideo.thumbnailUrl,
          duration: savedVideo.duration,
          views: 0,
          likesCount: 0,
          commentsCount: 0,
          createdAt: savedVideo.createdAt.toISOString(),
        },
      };
    } catch (error) {
      logger.error('Error creating video:', error);
      throw new RpcException(error.message || 'Failed to create video');
    }
  }

  async getVideo(videoId: string) {
    try {
      // Try to get from cache first
      const cachedVideo = await this.redisService.get(`video:${videoId}`);
      if (cachedVideo) {
        return { video: JSON.parse(cachedVideo) };
      }

      // Get from database
      const video = await this.videoRepository.findOne({
        where: { id: videoId },
        relations: ['user'],
      });

      if (!video) {
        throw new RpcException('Video not found');
      }

      // Get stats from Redis
      const [views, likes, comments] = await Promise.all([
        this.redisService.getViews(videoId),
        this.redisService.getLikes(videoId),
        this.redisService.getCommentsCount(videoId),
      ]);

      const videoData = {
        id: video.id,
        userId: video.userId,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        views: views || video.views,
        likesCount: likes || video.likesCount,
        commentsCount: comments || video.commentsCount,
        createdAt: video.createdAt.toISOString(),
        user: {
          id: video.user.id,
          username: video.user.username,
          fullName: video.user.fullName,
          avatar: video.user.avatar,
        },
      };

      // Cache for 5 minutes
      await this.redisService.set(
        `video:${videoId}`,
        JSON.stringify(videoData),
        300,
      );

      return { video: videoData };
    } catch (error) {
      logger.error(`Error getting video ${videoId}:`, error);
      throw new RpcException(error.message || 'Failed to get video');
    }
  }

  async getFeed(userId?: string, page = 1, limit = 10) {
    try {
      const cacheKey = userId ? `feed:${userId}` : 'feed:global';
      const cachePageKey = `${cacheKey}:${page}:${limit}`;

      // Try cache first
      const cachedFeed = await this.redisService.getCachedFeed(
        userId || 'global',
        page,
        limit,
      );
      if (cachedFeed) {
        return { videos: cachedFeed, page, limit, hasMore: cachedFeed.length === limit };
      }

      // Get from database with pagination
      const skip = (page - 1) * limit;
      const [videos, total] = await this.videoRepository.findAndCount({
        relations: ['user'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      // Enrich with Redis stats
      const enrichedVideos = await Promise.all(
        videos.map(async (video) => {
          const [views, likes, comments] = await Promise.all([
            this.redisService.getViews(video.id),
            this.redisService.getLikes(video.id),
            this.redisService.getCommentsCount(video.id),
          ]);

          return {
            id: video.id,
            userId: video.userId,
            title: video.title,
            description: video.description,
            videoUrl: video.videoUrl,
            thumbnailUrl: video.thumbnailUrl,
            duration: video.duration,
            views: views || video.views,
            likesCount: likes || video.likesCount,
            commentsCount: comments || video.commentsCount,
            createdAt: video.createdAt.toISOString(),
            user: {
              id: video.user.id,
              username: video.user.username,
              fullName: video.user.fullName,
              avatar: video.user.avatar,
            },
          };
        }),
      );

      // Cache for 2 minutes
      await this.redisService.cacheFeed(
        userId || 'global',
        page,
        limit,
        enrichedVideos,
        120,
      );

      return {
        videos: enrichedVideos,
        page,
        limit,
        total,
        hasMore: skip + videos.length < total,
      };
    } catch (error) {
      logger.error('Error getting feed:', error);
      throw new RpcException(error.message || 'Failed to get feed');
    }
  }

  async updateVideoStats(data: UpdateVideoStatsDto) {
    try {
      const video = await this.videoRepository.findOne({
        where: { id: data.videoId },
      });

      if (!video) {
        throw new RpcException('Video not found');
      }

      // Update in database
      if (data.views !== undefined) {
        video.views = data.views;
      }
      if (data.likesCount !== undefined) {
        video.likesCount = data.likesCount;
      }
      if (data.commentsCount !== undefined) {
        video.commentsCount = data.commentsCount;
      }

      await this.videoRepository.save(video);

      // Invalidate cache
      await this.redisService.del(`video:${data.videoId}`);

      logger.info(`Video stats updated: ${data.videoId}`);

      return { success: true };
    } catch (error) {
      logger.error('Error updating video stats:', error);
      throw new RpcException(error.message || 'Failed to update video stats');
    }
  }

  async deleteVideo(videoId: string, userId: string) {
    try {
      const video = await this.videoRepository.findOne({
        where: { id: videoId },
      });

      if (!video) {
        throw new RpcException('Video not found');
      }

      if (video.userId !== userId) {
        throw new RpcException('Forbidden: You can only delete your own videos');
      }

      // Delete from database (cascade will handle likes and comments)
      await this.videoRepository.remove(video);

      // Clean up Redis
      await Promise.all([
        this.redisService.del(`video:${videoId}`),
        this.redisService.del(`video:${videoId}:views`),
        this.redisService.del(`video:${videoId}:likes`),
        this.redisService.del(`video:${videoId}:comments`),
      ]);

      // Invalidate feed cache
      await this.redisService.invalidateFeedCache(userId);

      // Publish event
      await this.rabbitMQService.publish('video.deleted', {
        videoId,
        userId,
      });

      logger.info(`Video deleted: ${videoId}`);

      return { success: true };
    } catch (error) {
      logger.error('Error deleting video:', error);
      throw new RpcException(error.message || 'Failed to delete video');
    }
  }

  async getUserVideos(userId: string, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const [videos, total] = await this.videoRepository.findAndCount({
        where: { userId },
        relations: ['user'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      const enrichedVideos = await Promise.all(
        videos.map(async (video) => {
          const [views, likes, comments] = await Promise.all([
            this.redisService.getViews(video.id),
            this.redisService.getLikes(video.id),
            this.redisService.getCommentsCount(video.id),
          ]);

          return {
            id: video.id,
            userId: video.userId,
            title: video.title,
            description: video.description,
            videoUrl: video.videoUrl,
            thumbnailUrl: video.thumbnailUrl,
            duration: video.duration,
            views: views || video.views,
            likesCount: likes || video.likesCount,
            commentsCount: comments || video.commentsCount,
            createdAt: video.createdAt.toISOString(),
          };
        }),
      );

      return {
        videos: enrichedVideos,
        page,
        limit,
        total,
        hasMore: skip + videos.length < total,
      };
    } catch (error) {
      logger.error('Error getting user videos:', error);
      throw new RpcException(error.message || 'Failed to get user videos');
    }
  }

  async searchVideos(query: string, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const [videos, total] = await this.videoRepository.findAndCount({
        where: [
          { title: ILike(`%${query}%`) },
          { description: ILike(`%${query}%`) },
        ],
        relations: ['user'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      const enrichedVideos = await Promise.all(
        videos.map(async (video) => {
          const [views, likes, comments] = await Promise.all([
            this.redisService.getViews(video.id),
            this.redisService.getLikes(video.id),
            this.redisService.getCommentsCount(video.id),
          ]);

          return {
            id: video.id,
            userId: video.userId,
            title: video.title,
            description: video.description,
            videoUrl: video.videoUrl,
            thumbnailUrl: video.thumbnailUrl,
            duration: video.duration,
            views: views || video.views,
            likesCount: likes || video.likesCount,
            commentsCount: comments || video.commentsCount,
            createdAt: video.createdAt.toISOString(),
            user: {
              id: video.user.id,
              username: video.user.username,
              fullName: video.user.fullName,
              avatar: video.user.avatar,
            },
          };
        }),
      );

      return {
        videos: enrichedVideos,
        page,
        limit,
        total,
        hasMore: skip + videos.length < total,
      };
    } catch (error) {
      logger.error('Error searching videos:', error);
      throw new RpcException(error.message || 'Failed to search videos');
    }
  }
}
