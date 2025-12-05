import { CurrentUser } from '@app/common/decorators/current-user.decorator';
import { CreateCommentDto, LikeVideoDto, ViewVideoDto } from '@app/common/dto/interaction.dto';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { lastValueFrom, Observable } from 'rxjs';
import { WebsocketGateway } from '../websocket/websocket.gateway';

interface JwtPayload {
  sub: string;
  email: string;
  username: string;
}

interface UserInfo {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  email?: string;
}

interface LikeResponse {
  likesCount: number;
  success?: boolean;
}

interface CommentResponse {
  id: string;
  userId: string;
  videoId: string;
  content: string;
  createdAt: string;
  likesCount: number;
  repliesCount: number;
  user: UserInfo;
  commentsCount: number;
}

interface CommentsListResponse {
  comments: CommentResponse[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

interface ViewResponse {
  views: number;
  success?: boolean;
}

interface LikeVideoRequest {
  userId: string;
  videoId: string;
}

interface AddCommentRequest {
  userId: string;
  videoId: string;
  content: string;
}

interface GetCommentsRequest {
  videoId: string;
  page: number;
  limit: number;
}

interface DeleteCommentRequest {
  commentId: string;
  userId: string;
}

interface RecordViewRequest {
  videoId: string;
  userId?: string;
}

interface InteractionServiceClient {
  likeVideo(data: LikeVideoRequest): Observable<LikeResponse>;
  unlikeVideo(data: LikeVideoRequest): Observable<LikeResponse>;
  addComment(data: AddCommentRequest): Observable<CommentResponse>;
  getComments(data: GetCommentsRequest): Observable<CommentsListResponse>;
  recordView(data: RecordViewRequest): Observable<ViewResponse>;
  deleteComment(data: DeleteCommentRequest): Observable<{ success: boolean }>;
  getLikeStatus(data: LikeVideoRequest): Observable<{ hasLiked: boolean }>;
}

@ApiTags('Interactions')
@Controller('api/interactions')
export class InteractionController {
  private interactionService: InteractionServiceClient;

  constructor(
    @Inject('INTERACTION_SERVICE') private readonly client: ClientGrpc,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  onModuleInit() {
    this.interactionService =
      this.client.getService<InteractionServiceClient>('InteractionService');
  }

  @Post('like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like a video' })
  @ApiResponse({ status: 201, description: 'Video liked successfully' })
  async likeVideo(@Body() dto: LikeVideoDto, @CurrentUser() user: JwtPayload) {
    const result = (await lastValueFrom(
      this.interactionService.likeVideo({
        userId: user.sub,
        videoId: dto.videoId,
      }),
    )) as LikeResponse;

    // Broadcast via WebSocket
    this.websocketGateway.broadcastLike(dto.videoId, {
      userId: user.sub,
      totalLikes: result.likesCount,
    });

    return result;
  }

  @Post('unlike')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlike a video' })
  @ApiResponse({ status: 200, description: 'Video unliked successfully' })
  async unlikeVideo(@Body() dto: LikeVideoDto, @CurrentUser() user: JwtPayload) {
    const result = (await lastValueFrom(
      this.interactionService.unlikeVideo({
        userId: user.sub,
        videoId: dto.videoId,
      }),
    )) as LikeResponse;

    // Broadcast via WebSocket
    this.websocketGateway.broadcastUnlike(dto.videoId, {
      userId: user.sub,
      totalLikes: result.likesCount,
    });

    return result;
  }

  @Get('like-status/:videoId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if user liked a video' })
  @ApiResponse({ status: 200, description: 'Like status retrieved' })
  async getLikeStatus(@Param('videoId') videoId: string, @CurrentUser() user: JwtPayload) {
    const result = await lastValueFrom(
      this.interactionService.getLikeStatus({
        userId: user.sub,
        videoId,
      }),
    );
    return result;
  }

  @Post('comment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a comment to a video' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  async addComment(@Body() dto: CreateCommentDto, @CurrentUser() user: JwtPayload) {
    const result = (await lastValueFrom(
      this.interactionService.addComment({
        userId: user.sub,
        videoId: dto.videoId,
        content: dto.content,
      }),
    )) as CommentResponse;

    // Broadcast via WebSocket
    this.websocketGateway.broadcastComment(dto.videoId, {
      commentId: result.id,
      userId: user.sub,
      content: dto.content,
      user: result.user,
      totalComments: result.commentsCount,
    });

    return result;
  }

  @Get('comments/:videoId')
  @ApiOperation({ summary: 'Get comments for a video' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  async getComments(
    @Param('videoId') videoId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await lastValueFrom(
      this.interactionService.getComments({
        videoId,
        page: page || 1,
        limit: limit || 20,
      }),
    );
    return result;
  }

  @Delete('comment/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteComment(@Param('commentId') commentId: string, @CurrentUser() user: JwtPayload) {
    const result = await lastValueFrom(
      this.interactionService.deleteComment({
        commentId,
        userId: user.sub,
      }),
    );

    // You might want to broadcast this too
    // this.websocketGateway.broadcastCommentDeleted(videoId, commentId);

    return result;
  }

  @Post('view')
  @ApiOperation({ summary: 'Record a video view' })
  @ApiResponse({ status: 201, description: 'View recorded successfully' })
  async recordView(@Body() dto: ViewVideoDto, @CurrentUser() user?: JwtPayload) {
    const result = (await lastValueFrom(
      this.interactionService.recordView({
        videoId: dto.videoId,
        userId: user?.sub,
      }),
    )) as ViewResponse;

    // Optionally broadcast view count update
    this.websocketGateway.broadcastViewUpdate(dto.videoId, result.views);

    return result;
  }
}
