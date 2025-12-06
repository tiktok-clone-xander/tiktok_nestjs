import { CreateVideoDto } from '@app/common/dto/video.dto';
import { KafkaService } from '@app/kafka';
import { RedisService } from '@app/redis';
import { Video, VideoView } from '@app/video-db';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

interface InteractionServiceClient {
  getMultipleLikeStatus(data: { userId: string; videoIds: string[] }): any;
}

@Injectable()
export class VideoService implements OnModuleInit {
  private interactionService: InteractionServiceClient;

  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(VideoView)
    private readonly videoViewRepository: Repository<VideoView>,
    private readonly redisService: RedisService,
    private readonly kafkaService: KafkaService,
    @Inject('INTERACTION_SERVICE') private readonly interactionClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.interactionService =
      this.interactionClient.getService<InteractionServiceClient>('InteractionService');
  }

  async createVideo(data: CreateVideoDto) {
    try {
      // TODO: Validate user exists via gRPC call to auth service

      const video = this.videoRepository.create({
        userId: data.userId,
        title: data.title,
        description: data.description,
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl,
        duration: data.duration,
      });

      const savedVideo = await this.videoRepository.save(video);

      return { video: savedVideo };
    } catch (error) {
      throw new RpcException(`Error creating video: ${error.message}`);
    }
  }

  async getVideo(videoId: string, userId?: string) {
    try {
      const video = await this.videoRepository.findOne({
        where: { id: videoId },
      });

      if (!video) {
        throw new RpcException('Video not found');
      }

      let isLiked = false;
      let likesCount = video.likesCount;

      // Get like status from interaction service if userId provided
      if (userId) {
        try {
          const likeStatus = await lastValueFrom(
            this.interactionService.getMultipleLikeStatus({
              userId,
              videoIds: [videoId],
            }),
          );
          if (likeStatus?.likeInfos?.[0]) {
            isLiked = likeStatus.likeInfos[0].hasLiked;
            likesCount = likeStatus.likeInfos[0].likesCount;
          }
        } catch (error) {
          // If interaction service fails, use database likes count
          console.warn('Failed to get like status from interaction service:', error);
        }
      }

      return {
        id: video.id,
        userId: video.userId,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        views: video.views,
        likes: likesCount,
        comments: video.commentsCount,
        createdAt: video.createdAt.toISOString(),
        isLiked,
        likesCount,
        // User object for proto
        user: {
          id: video.userId,
          username: 'Unknown',
          fullName: 'Unknown',
          avatar: null,
        },
      };
    } catch (error) {
      throw new RpcException(`Error getting video: ${error.message}`);
    }
  }

  async getVideos(userId?: string, page: number = 1, limit: number = 10) {
    try {
      // Check Redis cache first
      const cacheKey = `videos:feed:${page}:${limit}`;
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      // Optimize query: select only needed fields
      const videos = await this.videoRepository.find({
        select: [
          'id',
          'userId',
          'title',
          'description',
          'videoUrl',
          'thumbnailUrl',
          'duration',
          'views',
          'likesCount',
          'commentsCount',
          'createdAt',
        ],
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      // Get like status for all videos if userId provided
      let likeMap: Map<string, { hasLiked: boolean; likesCount: number }> = new Map();
      if (userId && videos.length > 0) {
        try {
          const videoIds = videos.map((v) => v.id);
          const likeStatus = await lastValueFrom(
            this.interactionService.getMultipleLikeStatus({
              userId,
              videoIds,
            }),
          );
          if ((likeStatus as any)?.likeInfos) {
            (likeStatus as any).likeInfos.forEach((info: any) => {
              likeMap.set(info.videoId, {
                hasLiked: info.hasLiked,
                likesCount: info.likesCount,
              });
            });
          }
        } catch (error) {
          console.warn('Failed to get like status from interaction service:', error);
        }
      }

      const enrichedVideos = videos.map((video) => {
        const likeInfo = likeMap.get(video.id) || {
          hasLiked: false,
          likesCount: video.likesCount,
        };
        return {
          id: video.id,
          title: video.title,
          description: video.description,
          videoUrl: video.videoUrl,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          views: video.views,
          likes: likeInfo.likesCount,
          likesCount: likeInfo.likesCount,
          isLiked: likeInfo.hasLiked,
          commentsCount: video.commentsCount,
          createdAt: video.createdAt.toISOString(),
          // TODO: Get user data via gRPC call
          user: {
            id: video.userId,
            username: 'Unknown',
            fullName: 'Unknown',
            avatar: null,
          },
        };
      });

      const result = {
        videos: enrichedVideos,
        pagination: {
          page,
          limit,
          total: await this.videoRepository.count(),
        },
      };

      // Cache result for 5 minutes
      await this.redisService.set(cacheKey, JSON.stringify(result), 300);
      return result;
    } catch (error) {
      throw new RpcException(`Error getting videos: ${error.message}`);
    }
  }

  // Alias methods for controller compatibility
  async getFeed(userId?: string, page: number = 1, limit: number = 10) {
    return this.getVideos(userId, page, limit);
  }

  async getUserVideos(userId: string, page: number = 1, limit: number = 10) {
    try {
      // Check Redis cache
      const cacheKey = `videos:user:${userId}:${page}:${limit}`;
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const videos = await this.videoRepository.find({
        select: [
          'id',
          'userId',
          'title',
          'description',
          'videoUrl',
          'thumbnailUrl',
          'duration',
          'views',
          'likesCount',
          'commentsCount',
          'createdAt',
        ],
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      const enrichedVideos = videos.map((video) => ({
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        views: video.views,
        likesCount: video.likesCount,
        commentsCount: video.commentsCount,
        createdAt: video.createdAt.toISOString(),
        user: {
          id: video.userId,
          username: 'Unknown',
          fullName: 'Unknown',
          avatar: null,
        },
      }));

      const result = {
        videos: enrichedVideos,
        pagination: {
          page,
          limit,
          total: await this.videoRepository.count({ where: { userId } }),
        },
      };

      // Cache for 5 minutes
      await this.redisService.set(cacheKey, JSON.stringify(result), 300);
      return result;
    } catch (error) {
      throw new RpcException(`Error getting user videos: ${error.message}`);
    }
  }

  async searchVideos(query: string, page: number = 1, limit: number = 10) {
    try {
      // Check Redis cache for search results
      const cacheKey = `videos:search:${query}:${page}:${limit}`;
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      // Optimize search with select
      const videos = await this.videoRepository
        .createQueryBuilder('video')
        .select([
          'video.id',
          'video.userId',
          'video.title',
          'video.description',
          'video.videoUrl',
          'video.thumbnailUrl',
          'video.duration',
          'video.views',
          'video.likesCount',
          'video.commentsCount',
          'video.createdAt',
        ])
        .where('video.title ILIKE :query', { query: `%${query}%` })
        .orWhere('video.description ILIKE :query', { query: `%${query}%` })
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('video.createdAt', 'DESC')
        .getMany();

      const enrichedVideos = videos.map((video) => ({
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        views: video.views,
        likesCount: video.likesCount,
        commentsCount: video.commentsCount,
        createdAt: video.createdAt.toISOString(),
        user: {
          id: video.userId,
          username: 'Unknown',
          fullName: 'Unknown',
          avatar: null,
        },
      }));

      const result = {
        videos: enrichedVideos,
        pagination: {
          page,
          limit,
          total: enrichedVideos.length,
        },
      };

      // Cache search results for 10 minutes
      await this.redisService.set(cacheKey, JSON.stringify(result), 600);
      return result;
    } catch (error) {
      throw new RpcException(`Error searching videos: ${error.message}`);
    }
  }

  async updateVideoStats(data: any) {
    try {
      const video = await this.videoRepository.findOne({
        where: { id: data.videoId },
      });

      if (!video) {
        throw new RpcException('Video not found');
      }

      // Update stats
      if (data.views !== undefined) video.views = data.views;
      if (data.likesCount !== undefined) video.likesCount = data.likesCount;
      if (data.commentsCount !== undefined) video.commentsCount = data.commentsCount;

      await this.videoRepository.save(video);

      return { success: true, video };
    } catch (error) {
      throw new RpcException(`Error updating video stats: ${error.message}`);
    }
  }

  async deleteVideo(videoId: string, userId: string) {
    try {
      const video = await this.videoRepository.findOne({
        where: { id: videoId, userId },
      });

      if (!video) {
        throw new RpcException('Video not found or unauthorized');
      }

      await this.videoRepository.remove(video);

      return { success: true };
    } catch (error) {
      throw new RpcException(`Error deleting video: ${error.message}`);
    }
  }
}
