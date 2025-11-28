import { CreateVideoDto } from '@app/common/dto/video.dto';
import { KafkaService } from '@app/kafka';
import { RedisService } from '@app/redis';
import { Video, VideoView } from '@app/video-db';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(VideoView)
    private readonly videoViewRepository: Repository<VideoView>,
    private readonly redisService: RedisService,
    private readonly kafkaService: KafkaService,
  ) {}

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

  async getVideo(videoId: string) {
    try {
      const video = await this.videoRepository.findOne({
        where: { id: videoId },
      });

      if (!video) {
        throw new RpcException('Video not found');
      }

      return {
        video: {
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
          // TODO: Get user data via gRPC call
          user: {
            id: video.userId,
            username: 'Unknown',
            fullName: 'Unknown',
            avatar: null,
          },
        },
      };
    } catch (error) {
      throw new RpcException(`Error getting video: ${error.message}`);
    }
  }

  async getVideos(userId?: string, page: number = 1, limit: number = 10) {
    try {
      const videos = await this.videoRepository.find({
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
        // TODO: Get user data via gRPC call
        user: {
          id: video.userId,
          username: 'Unknown',
          fullName: 'Unknown',
          avatar: null,
        },
      }));

      return {
        videos: enrichedVideos,
        pagination: {
          page,
          limit,
          total: await this.videoRepository.count(),
        },
      };
    } catch (error) {
      throw new RpcException(`Error getting videos: ${error.message}`);
    }
  }
}
