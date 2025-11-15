import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/ws',
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);
  private readonly userSockets = new Map<string, string>(); // userId -> socketId

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`Client ${client.id} connection rejected: No token`);
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      // Store user-socket mapping
      const userId = payload.sub;
      this.userSockets.set(userId, client.id);
      client.data.userId = userId;

      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.userSockets.delete(userId);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Subscribe to video room
  @SubscribeMessage('join_video')
  handleJoinVideo(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { videoId: string },
  ) {
    const room = `video:${data.videoId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { success: true, room };
  }

  // Leave video room
  @SubscribeMessage('leave_video')
  handleLeaveVideo(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { videoId: string },
  ) {
    const room = `video:${data.videoId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
    return { success: true, room };
  }

  // Broadcast methods for microservices to call

  /**
   * Broadcast when a video receives a like
   */
  broadcastLike(videoId: string, data: { userId: string; totalLikes: number }) {
    const room = `video:${videoId}`;
    this.server.to(room).emit('video:liked', {
      videoId,
      userId: data.userId,
      totalLikes: data.totalLikes,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Broadcasted like to room ${room}`);
  }

  /**
   * Broadcast when a video receives an unlike
   */
  broadcastUnlike(
    videoId: string,
    data: { userId: string; totalLikes: number },
  ) {
    const room = `video:${videoId}`;
    this.server.to(room).emit('video:unliked', {
      videoId,
      userId: data.userId,
      totalLikes: data.totalLikes,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Broadcasted unlike to room ${room}`);
  }

  /**
   * Broadcast when a new comment is added
   */
  broadcastComment(
    videoId: string,
    data: {
      commentId: string;
      userId: string;
      content: string;
      user: any;
      totalComments: number;
    },
  ) {
    const room = `video:${videoId}`;
    this.server.to(room).emit('video:comment', {
      videoId,
      commentId: data.commentId,
      userId: data.userId,
      content: data.content,
      user: data.user,
      totalComments: data.totalComments,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Broadcasted comment to room ${room}`);
  }

  /**
   * Broadcast when a comment is deleted
   */
  broadcastCommentDeleted(videoId: string, commentId: string) {
    const room = `video:${videoId}`;
    this.server.to(room).emit('video:comment_deleted', {
      videoId,
      commentId,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Broadcasted comment deletion to room ${room}`);
  }

  /**
   * Broadcast view count update
   */
  broadcastViewUpdate(videoId: string, totalViews: number) {
    const room = `video:${videoId}`;
    this.server.to(room).emit('video:views_updated', {
      videoId,
      totalViews,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send notification to specific user
   */
  sendNotificationToUser(
    userId: string,
    notification: {
      type: string;
      message: string;
      metadata?: any;
    },
  ) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', {
        ...notification,
        timestamp: new Date().toISOString(),
      });
      this.logger.log(`Sent notification to user ${userId}`);
    }
  }

  /**
   * Broadcast when a new video is uploaded
   */
  broadcastNewVideo(data: {
    videoId: string;
    userId: string;
    title: string;
    thumbnailUrl: string;
  }) {
    // Broadcast to all connected clients
    this.server.emit('video:new', {
      videoId: data.videoId,
      userId: data.userId,
      title: data.title,
      thumbnailUrl: data.thumbnailUrl,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Broadcasted new video: ${data.videoId}`);
  }
}
