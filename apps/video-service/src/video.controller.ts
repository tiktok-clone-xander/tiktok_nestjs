import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { VideoService } from './video.service';
import {
  CreateVideoDto,
  GetVideoDto,
  GetFeedDto,
  UpdateVideoStatsDto,
  DeleteVideoDto,
} from '@app/common/dto/video.dto';

@Controller()
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @GrpcMethod('VideoService', 'CreateVideo')
  async createVideo(data: CreateVideoDto) {
    return this.videoService.createVideo(data);
  }

  @GrpcMethod('VideoService', 'GetVideo')
  async getVideo(data: GetVideoDto) {
    return this.videoService.getVideo(data.videoId);
  }

  @GrpcMethod('VideoService', 'GetFeed')
  async getFeed(data: GetFeedDto) {
    return this.videoService.getFeed(data.userId, data.page, data.limit);
  }

  @GrpcMethod('VideoService', 'UpdateVideoStats')
  async updateVideoStats(data: UpdateVideoStatsDto) {
    return this.videoService.updateVideoStats(data);
  }

  @GrpcMethod('VideoService', 'DeleteVideo')
  async deleteVideo(data: DeleteVideoDto) {
    return this.videoService.deleteVideo(data.videoId, data.userId);
  }

  @GrpcMethod('VideoService', 'GetUserVideos')
  async getUserVideos(data: { userId: string; page: number; limit: number }) {
    return this.videoService.getUserVideos(data.userId, data.page, data.limit);
  }

  @GrpcMethod('VideoService', 'SearchVideos')
  async searchVideos(data: { query: string; page: number; limit: number }) {
    return this.videoService.searchVideos(data.query, data.page, data.limit);
  }
}
