import {
  AddCommentDto,
  GetCommentsDto,
  LikeVideoDto,
  RecordViewDto,
  UnlikeVideoDto,
} from '@app/common/dto/interaction.dto';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { InteractionService } from './interaction.service';

@Controller()
export class InteractionController {
  constructor(private readonly interactionService: InteractionService) {}

  @GrpcMethod('InteractionService', 'LikeVideo')
  async likeVideo(data: LikeVideoDto) {
    return this.interactionService.likeVideo(data.userId, data.videoId);
  }

  @GrpcMethod('InteractionService', 'UnlikeVideo')
  async unlikeVideo(data: UnlikeVideoDto) {
    return this.interactionService.unlikeVideo(data.userId, data.videoId);
  }

  @GrpcMethod('InteractionService', 'AddComment')
  async addComment(data: AddCommentDto) {
    return this.interactionService.addComment(data.userId, data.videoId, data.content);
  }

  @GrpcMethod('InteractionService', 'GetComments')
  async getComments(data: GetCommentsDto) {
    return this.interactionService.getComments(data.videoId, data.page, data.limit);
  }

  @GrpcMethod('InteractionService', 'RecordView')
  async recordView(data: RecordViewDto) {
    return this.interactionService.recordView(data.videoId, data.userId);
  }

  @GrpcMethod('InteractionService', 'DeleteComment')
  async deleteComment(data: { commentId: string; userId: string }) {
    return this.interactionService.deleteComment(data.commentId, data.userId);
  }

  @GrpcMethod('InteractionService', 'GetLikeStatus')
  async getLikeStatus(data: { userId: string; videoId: string }) {
    return this.interactionService.getLikeStatus(data.userId, data.videoId);
  }

  @GrpcMethod('InteractionService', 'GetMultipleLikeStatus')
  async getMultipleLikeStatus(data: { userId: string; videoIds: string[] }) {
    return this.interactionService.getMultipleLikeStatus(data.userId, data.videoIds);
  }

  @GrpcMethod('InteractionService', 'FollowUser')
  async followUser(data: { followerId: string; followingId: string }) {
    return this.interactionService.followUser(data.followerId, data.followingId);
  }

  @GrpcMethod('InteractionService', 'UnfollowUser')
  async unfollowUser(data: { followerId: string; followingId: string }) {
    return this.interactionService.unfollowUser(data.followerId, data.followingId);
  }

  @GrpcMethod('InteractionService', 'GetFollowStatus')
  async getFollowStatus(data: { followerId: string; followingId: string }) {
    return this.interactionService.getFollowStatus(data.followerId, data.followingId);
  }

  @GrpcMethod('InteractionService', 'GetFollowers')
  async getFollowers(data: { userId: string; page: number; limit: number }) {
    return this.interactionService.getFollowers(data.userId, data.page, data.limit);
  }

  @GrpcMethod('InteractionService', 'GetFollowing')
  async getFollowing(data: { userId: string; page: number; limit: number }) {
    return this.interactionService.getFollowing(data.userId, data.page, data.limit);
  }
}
