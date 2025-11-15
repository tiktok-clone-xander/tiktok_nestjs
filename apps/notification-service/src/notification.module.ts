import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { DatabaseModule } from '@app/database';
import { RabbitMQModule } from '@app/rabbitmq';
import { User } from '@app/database/entities/user.entity';
import { HealthController } from './health.controller';
import { RabbitMQService } from '@app/rabbitmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    RabbitMQModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [NotificationController, HealthController],
  providers: [NotificationService],
})
export class NotificationModule implements OnModuleInit {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async onModuleInit() {
    // Subscribe to events
    await this.rabbitMQService.subscribe('video.liked', async (data) => {
      await this.notificationService.handleVideoLiked(data);
    });

    await this.rabbitMQService.subscribe('comment.created', async (data) => {
      await this.notificationService.handleCommentCreated(data);
    });

    await this.rabbitMQService.subscribe('video.created', async (data) => {
      await this.notificationService.handleVideoCreated(data);
    });
  }
}
