import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @GrpcMethod('NotificationService', 'SendNotification')
  async sendNotification(data: {
    userId: string;
    type: string;
    message: string;
    metadata?: any;
  }) {
    return this.notificationService.sendNotification(
      data.userId,
      data.type,
      data.message,
      data.metadata,
    );
  }

  @GrpcMethod('NotificationService', 'GetNotifications')
  async getNotifications(data: { userId: string; page?: number; limit?: number }) {
    return this.notificationService.getNotifications(
      data.userId,
      data.page,
      data.limit,
    );
  }

  @GrpcMethod('NotificationService', 'MarkAsRead')
  async markAsRead(data: { userId: string; notificationIds: string[] }) {
    return this.notificationService.markAsRead(data.userId, data.notificationIds);
  }
}
