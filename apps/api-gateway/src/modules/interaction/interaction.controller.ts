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
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { CurrentUser } from '@app/common/decorators/current-user.decorator';
import {
  CreateCommentDto,
  LikeVideoDto,
  ViewVideoDto,
} from '@app/common/dto/interaction.dto';
import { lastValueFrom } from 'rxjs';
import { WebsocketGateway } from '../websocket/websocket.gateway';

interface InteractionServiceClient {
  likeVideo(data: any): any;
  unlikeVideo(data: any): any;
  addComment(data: any): any;
  getComments(data: any): any;
  recordView(data: any): any;
  deleteComment(data: any): any;
  getLikeStatus(data: any): any;
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
  async likeVideo(@Body() dto: LikeVideoDto, @CurrentUser() user: any) {
    const result = await lastValueFrom(
      this.interactionService.likeVideo({
        userId: user.sub,
        videoId: dto.videoId,
      }),
    );

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
  async unlikeVideo(@Body() dto: LikeVideoDto, @CurrentUser() user: any) {
    const result = await lastValueFrom(
      this.interactionService.unlikeVideo({
        userId: user.sub,
        videoId: dto.videoId,
      }),
    );

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
  async getLikeStatus(@Param('videoId') videoId: string, @CurrentUser() user: any) {
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
  async addComment(@Body() dto: CreateCommentDto, @CurrentUser() user: any) {
    const result = await lastValueFrom(
      this.interactionService.addComment({
        userId: user.sub,
        videoId: dto.videoId,
        content: dto.content,
      }),
    );

    // Broadcast via WebSocket
    this.websocketGateway.broadcastComment(dto.videoId, {
      commentId: result.comment.id,
      userId: user.sub,
      content: dto.content,
      user: result.comment.user,
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
  async deleteComment(@Param('commentId') commentId: string, @CurrentUser() user: any) {
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
  async recordView(@Body() dto: ViewVideoDto, @CurrentUser() user?: any) {
    const result = await lastValueFrom(
      this.interactionService.recordView({
        videoId: dto.videoId,
        userId: user?.sub,
      }),
    );

    // Optionally broadcast view count update
    this.websocketGateway.broadcastViewUpdate(dto.videoId, result.views);

    return result;
  }
}
