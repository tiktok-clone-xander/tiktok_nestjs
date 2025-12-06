import { CurrentUser } from '@app/common/decorators/current-user.decorator';
import { GetVideoFeedDto } from '@app/common/dto/video.dto';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { lastValueFrom, Observable } from 'rxjs';

interface JwtPayload {
  sub: string;
  email: string;
  username: string;
}

interface CreateVideoRequest {
  userId: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
}

interface GetVideoRequest {
  videoId: string;
}

interface GetFeedRequest {
  userId?: string;
  page: number;
  limit: number;
}

interface DeleteVideoRequest {
  videoId: string;
  userId: string;
}

interface GetUserVideosRequest {
  userId: string;
  page: number;
  limit: number;
}

interface SearchVideosRequest {
  query: string;
  page: number;
  limit: number;
}

interface VideoServiceClient {
  createVideo(data: CreateVideoRequest): Observable<unknown>;
  getVideo(data: GetVideoRequest): Observable<unknown>;
  getFeed(data: GetFeedRequest): Observable<unknown>;
  updateVideoStats(data: unknown): Observable<unknown>;
  deleteVideo(data: DeleteVideoRequest): Observable<unknown>;
  getUserVideos(data: GetUserVideosRequest): Observable<unknown>;
  searchVideos(data: SearchVideosRequest): Observable<unknown>;
}

@ApiTags('Videos')
@Controller('api/videos')
export class VideoController {
  private videoService: VideoServiceClient;

  constructor(@Inject('VIDEO_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.videoService = this.client.getService<VideoServiceClient>('VideoService');
  }

  @Get()
  @ApiOperation({ summary: 'Get all videos (feed)' })
  @ApiResponse({ status: 200, description: 'Videos retrieved successfully' })
  async getAllVideos(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('userId') userId?: string,
  ) {
    const feedData = {
      userId,
      page: page || 1,
      limit: limit || 10,
    };

    const result = await lastValueFrom(this.videoService.getFeed(feedData));
    return result;
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
        file: { type: 'string', format: 'binary', description: 'Video file' },
        text: { type: 'string', example: 'My awesome video caption' },
        userId: { type: 'string', example: 'user-id' },
      },
      required: ['file', 'text'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async createVideo(
    @CurrentUser() user: JwtPayload,
    @Body() body: { text?: string; userId?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Video file is required');
    }

    // Generate video URL from uploaded file
    const baseUrl = `http://localhost:4000`; // TODO: get from config
    const videoUrl = `${baseUrl}/uploads/videos/${file.filename}`;

    // Use 'text' field as title (matching frontend)
    const title = body.text || 'Untitled Video';
    const description = body.text || '';

    // In production, extract duration using ffmpeg
    const duration = 30; // default 30 seconds

    const videoData = {
      userId: user.sub,
      title,
      description,
      videoUrl,
      thumbnailUrl: '',
      duration,
    };

    const result = await lastValueFrom(this.videoService.createVideo(videoData));
    return {
      success: true,
      data: result,
    };
  }

  @Get('feed')
  @ApiOperation({ summary: 'Get video feed' })
  @ApiResponse({ status: 200, description: 'Video feed retrieved successfully' })
  async getFeed(@Query() query: GetVideoFeedDto, @CurrentUser() user?: JwtPayload) {
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
    const result: any = await lastValueFrom(this.videoService.getVideo({ videoId: id }));
    // Unwrap gRPC response: { video: {...} } -> return video object
    return result?.video || result;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete video' })
  @ApiResponse({ status: 200, description: 'Video deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async deleteVideo(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const result = await lastValueFrom(
      this.videoService.deleteVideo({
        videoId: id,
        userId: user.sub,
      }),
    );
    return result;
  }
}
