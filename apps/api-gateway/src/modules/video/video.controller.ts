import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Inject,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { CurrentUser } from '@app/common/decorators/current-user.decorator';
import { CreateVideoDto, GetVideoFeedDto } from '@app/common/dto/video.dto';
import { lastValueFrom } from 'rxjs';

interface VideoServiceClient {
  createVideo(data: any): any;
  getVideo(data: any): any;
  getFeed(data: any): any;
  updateVideoStats(data: any): any;
  deleteVideo(data: any): any;
  getUserVideos(data: any): any;
  searchVideos(data: any): any;
}

@ApiTags('Videos')
@Controller('api/videos')
export class VideoController {
  private videoService: VideoServiceClient;

  constructor(@Inject('VIDEO_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.videoService =
      this.client.getService<VideoServiceClient>('VideoService');
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new video' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'My awesome video' },
        description: { type: 'string', example: 'Video description' },
        videoUrl: { type: 'string', example: 'https://cdn.example.com/video.mp4' },
        thumbnailUrl: { type: 'string', example: 'https://cdn.example.com/thumb.jpg' },
        duration: { type: 'number', example: 60 },
        video: { type: 'string', format: 'binary' },
      },
      required: ['title', 'videoUrl'],
    },
  })
  @UseInterceptors(FileInterceptor('video'))
  async createVideo(
    @CurrentUser() user: any,
    @Body() createVideoDto: CreateVideoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // In a real app, upload file to S3/CloudFlare and get URL
    // For now, we'll use the provided URL or placeholder
    const videoData = {
      userId: user.sub,
      title: createVideoDto.title,
      description: createVideoDto.description,
      videoUrl: createVideoDto.videoUrl || 'https://example.com/placeholder.mp4',
      thumbnailUrl: createVideoDto.thumbnailUrl,
      duration: createVideoDto.duration || 0,
    };

    const result = await lastValueFrom(this.videoService.createVideo(videoData));
    return result;
  }

  @Get('feed')
  @ApiOperation({ summary: 'Get video feed' })
  @ApiResponse({ status: 200, description: 'Video feed retrieved successfully' })
  async getFeed(@Query() query: GetVideoFeedDto, @CurrentUser() user?: any) {
    const feedData = {
      userId: user?.sub || query.userId,
      page: query.page || 1,
      limit: query.limit || 10,
    };

    const result = await lastValueFrom(this.videoService.getFeed(feedData));
    return result;
  }

  @Get('search')
  @ApiOperation({ summary: 'Search videos' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchVideos(
    @Query('q') query: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    if (!query) {
      throw new BadRequestException('Search query is required');
    }

    const result = await lastValueFrom(
      this.videoService.searchVideos({
        query,
        page: page || 1,
        limit: limit || 10,
      }),
    );
    return result;
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get videos by user' })
  @ApiResponse({ status: 200, description: 'User videos retrieved successfully' })
  async getUserVideos(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await lastValueFrom(
      this.videoService.getUserVideos({
        userId,
        page: page || 1,
        limit: limit || 10,
      }),
    );
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get video by ID' })
  @ApiResponse({ status: 200, description: 'Video retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async getVideo(@Param('id') id: string) {
    const result = await lastValueFrom(
      this.videoService.getVideo({ videoId: id }),
    );
    return result;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete video' })
  @ApiResponse({ status: 200, description: 'Video deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async deleteVideo(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await lastValueFrom(
      this.videoService.deleteVideo({
        videoId: id,
        userId: user.sub,
      }),
    );
    return result;
  }
}
