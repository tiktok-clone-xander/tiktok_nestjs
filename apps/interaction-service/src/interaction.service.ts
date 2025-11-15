import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { Video } from '@app/database/entities/video.entity';
import { User } from '@app/database/entities/user.entity';
import { Like } from '@app/database/entities/like.entity';
import { Comment } from '@app/database/entities/comment.entity';
import { RedisService } from '@app/redis';
import { RabbitMQService } from '@app/rabbitmq';
import { logger } from '@app/common/utils/logger';

@Injectable()
export class InteractionService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async likeVideo(userId: string, videoId: string) {
    try {
      // Check if video exists
      const video = await this.videoRepository.findOne({
        where: { id: videoId },
      });

      if (!video) {
        throw new RpcException('Video not found');
      }

      // Check if user exists
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new RpcException('User not found');
      }

      // Check if already liked in Redis
      const hasLiked = await this.redisService.hasUserLiked(userId, videoId);

      if (hasLiked) {
        throw new RpcException('Already liked this video');
      }

      // Create like in database
      const like = this.likeRepository.create({
        userId,
        videoId,
      });

      await this.likeRepository.save(like);

      // Update Redis
      await Promise.all([
        this.redisService.incrementLikes(videoId),
        this.redisService.addUserLike(userId, videoId),
      ]);

      const totalLikes = await this.redisService.getLikes(videoId);

      // Publish event
      await this.rabbitMQService.publish('video.liked', {
        userId,
        videoId,
        totalLikes,
      });

      logger.info(`User ${userId} liked video ${videoId}`);

      return {
        success: true,
        likesCount: totalLikes,
      };
    } catch (error) {
      logger.error('Error liking video:', error);
      throw new RpcException(error.message || 'Failed to like video');
    }
  }

  async unlikeVideo(userId: string, videoId: string) {
    try {
      // Check if liked in Redis
      const hasLiked = await this.redisService.hasUserLiked(userId, videoId);

      if (!hasLiked) {
        throw new RpcException('Video not liked yet');
      }

      // Remove from database
      await this.likeRepository.delete({
        userId,
        videoId,
      });

      // Update Redis
      await Promise.all([
        this.redisService.decrementLikes(videoId),
        this.redisService.removeUserLike(userId, videoId),
      ]);

      const totalLikes = await this.redisService.getLikes(videoId);

      // Publish event
      await this.rabbitMQService.publish('video.unliked', {
        userId,
        videoId,
        totalLikes,
      });

      logger.info(`User ${userId} unliked video ${videoId}`);

      return {
        success: true,
        likesCount: totalLikes,
      };
    } catch (error) {
      logger.error('Error unliking video:', error);
      throw new RpcException(error.message || 'Failed to unlike video');
    }
  }

  async addComment(userId: string, videoId: string, content: string) {
    try {
      // Validate video and user
      const [video, user] = await Promise.all([
        this.videoRepository.findOne({ where: { id: videoId } }),
        this.userRepository.findOne({ where: { id: userId } }),
      ]);

      if (!video) {
        throw new RpcException('Video not found');
      }

      if (!user) {
        throw new RpcException('User not found');
      }

      // Create comment
      const comment = this.commentRepository.create({
        userId,
        videoId,
        content,
      });

      const savedComment = await this.commentRepository.save(comment);

      // Update Redis counter
      await this.redisService.incrementCommentsCount(videoId);
      const totalComments = await this.redisService.getCommentsCount(videoId);

      // Publish event
      await this.rabbitMQService.publish('comment.created', {
        commentId: savedComment.id,
        userId,
        videoId,
        content,
        totalComments,
      });

      logger.info(`User ${userId} commented on video ${videoId}`);

      return {
        comment: {
          id: savedComment.id,
          userId: savedComment.userId,
          videoId: savedComment.videoId,
          content: savedComment.content,
          createdAt: savedComment.createdAt.toISOString(),
          user: {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            avatar: user.avatar,
          },
        },
        commentsCount: totalComments,
      };
    } catch (error) {
      logger.error('Error adding comment:', error);
      throw new RpcException(error.message || 'Failed to add comment');
    }
  }

  async getComments(videoId: string, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const [comments, total] = await this.commentRepository.findAndCount({
        where: { videoId },
        relations: ['user'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      const formattedComments = comments.map((comment) => ({
        id: comment.id,
        userId: comment.userId,
        videoId: comment.videoId,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        user: {
          id: comment.user.id,
          username: comment.user.username,
          fullName: comment.user.fullName,
          avatar: comment.user.avatar,
        },
      }));

      return {
        comments: formattedComments,
        page,
        limit,
        total,
        hasMore: skip + comments.length < total,
      };
    } catch (error) {
      logger.error('Error getting comments:', error);
      throw new RpcException(error.message || 'Failed to get comments');
    }
  }

  async recordView(videoId: string, userId?: string) {
    try {
      // Check if video exists
      const video = await this.videoRepository.findOne({
        where: { id: videoId },
      });

      if (!video) {
        throw new RpcException('Video not found');
      }

      // Increment view counter in Redis
      await this.redisService.incrementViews(videoId);
      const totalViews = await this.redisService.getViews(videoId);

      // Publish event
      await this.rabbitMQService.publish('video.viewed', {
        videoId,
        userId,
        totalViews,
      });

      logger.info(`View recorded for video ${videoId}`);

      return {
        success: true,
        views: totalViews,
      };
    } catch (error) {
      logger.error('Error recording view:', error);
      throw new RpcException(error.message || 'Failed to record view');
    }
  }

  async deleteComment(commentId: string, userId: string) {
    try {
      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
      });

      if (!comment) {
        throw new RpcException('Comment not found');
      }

      if (comment.userId !== userId) {
        throw new RpcException(
          'Forbidden: You can only delete your own comments',
        );
      }

      await this.commentRepository.remove(comment);

      // Update Redis counter
      const currentCount = await this.redisService.getCommentsCount(
        comment.videoId,
      );
      if (currentCount > 0) {
        await this.redisService.set(
          `video:${comment.videoId}:comments`,
          String(currentCount - 1),
        );
      }

      logger.info(`Comment ${commentId} deleted`);

      return { success: true };
    } catch (error) {
      logger.error('Error deleting comment:', error);
      throw new RpcException(error.message || 'Failed to delete comment');
    }
  }

  async getLikeStatus(userId: string, videoId: string) {
    try {
      const hasLiked = await this.redisService.hasUserLiked(userId, videoId);

      return {
        hasLiked,
        videoId,
        userId,
      };
    } catch (error) {
      logger.error('Error getting like status:', error);
      throw new RpcException(error.message || 'Failed to get like status');
    }
  }
}
