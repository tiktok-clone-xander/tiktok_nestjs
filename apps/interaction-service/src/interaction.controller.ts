import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { InteractionService } from './interaction.service';
import {
  LikeVideoDto,
  UnlikeVideoDto,
  AddCommentDto,
  GetCommentsDto,
  RecordViewDto,
} from '@app/common/dto/interaction.dto';

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
    return this.interactionService.addComment(
      data.userId,
      data.videoId,
      data.content,
    );
  }

  @GrpcMethod('InteractionService', 'GetComments')
  async getComments(data: GetCommentsDto) {
    return this.interactionService.getComments(
      data.videoId,
      data.page,
      data.limit,
    );
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
}
