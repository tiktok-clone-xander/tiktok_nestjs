import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { User } from '@app/database/entities/user.entity';
import { logger } from '@app/common/utils/logger';

interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  metadata?: any;
  read: boolean;
  createdAt: Date;
}

@Injectable()
export class NotificationService {
  // In-memory storage for demo purposes
  // In production, use a proper database table
  private notifications: Map<string, Notification[]> = new Map();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async sendNotification(
    userId: string,
    type: string,
    message: string,
    metadata?: any,
  ) {
    try {
      const notification: Notification = {
        id: this.generateId(),
        userId,
        type,
        message,
        metadata,
        read: false,
        createdAt: new Date(),
      };

      // Store notification
      const userNotifications = this.notifications.get(userId) || [];
      userNotifications.unshift(notification);
      this.notifications.set(userId, userNotifications);

      logger.info(`Notification sent to user ${userId}: ${type}`);

      // Here you would integrate with:
      // - WebSocket to send real-time notification
      // - Firebase Cloud Messaging for push notifications
      // - Email service
      // - SMS service

      return {
        success: true,
        notification: {
          id: notification.id,
          type: notification.type,
          message: notification.message,
          createdAt: notification.createdAt.toISOString(),
        },
      };
    } catch (error) {
      logger.error('Error sending notification:', error);
      throw new RpcException(error.message || 'Failed to send notification');
    }
  }

  async getNotifications(userId: string, page = 1, limit = 20) {
    try {
      const userNotifications = this.notifications.get(userId) || [];
      const skip = (page - 1) * limit;
      const paginatedNotifications = userNotifications.slice(skip, skip + limit);

      return {
        notifications: paginatedNotifications.map((n) => ({
          id: n.id,
          type: n.type,
          message: n.message,
          metadata: n.metadata,
          read: n.read,
          createdAt: n.createdAt.toISOString(),
        })),
        page,
        limit,
        total: userNotifications.length,
        hasMore: skip + paginatedNotifications.length < userNotifications.length,
      };
    } catch (error) {
      logger.error('Error getting notifications:', error);
      throw new RpcException(error.message || 'Failed to get notifications');
    }
  }

  async markAsRead(userId: string, notificationIds: string[]) {
    try {
      const userNotifications = this.notifications.get(userId) || [];

      notificationIds.forEach((id) => {
        const notification = userNotifications.find((n) => n.id === id);
        if (notification) {
          notification.read = true;
        }
      });

      this.notifications.set(userId, userNotifications);

      logger.info(`Marked ${notificationIds.length} notifications as read for user ${userId}`);

      return { success: true };
    } catch (error) {
      logger.error('Error marking notifications as read:', error);
      throw new RpcException(
        error.message || 'Failed to mark notifications as read',
      );
    }
  }

  // Event handlers for RabbitMQ events
  async handleVideoLiked(data: {
    userId: string;
    videoId: string;
    totalLikes: number;
  }) {
    logger.info(`Handling video.liked event for video ${data.videoId}`);
    // Get video owner and send notification
    // await this.sendNotification(videoOwnerId, 'like', `Someone liked your video`);
  }

  async handleCommentCreated(data: {
    commentId: string;
    userId: string;
    videoId: string;
    content: string;
  }) {
    logger.info(`Handling comment.created event for video ${data.videoId}`);
    // Get video owner and send notification
    // await this.sendNotification(videoOwnerId, 'comment', `Someone commented on your video`);
  }

  async handleVideoCreated(data: {
    videoId: string;
    userId: string;
    title: string;
  }) {
    logger.info(`Handling video.created event for video ${data.videoId}`);
    // Send notification to followers
    // const followers = await this.getFollowers(data.userId);
    // for (const follower of followers) {
    //   await this.sendNotification(follower.id, 'new_video', `New video from ${user.username}`);
    // }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
