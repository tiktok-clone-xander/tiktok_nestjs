import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { DatabaseModule } from '@app/database';
import { RedisModule } from '@app/redis';
import { RabbitMQModule } from '@app/rabbitmq';
import { Video } from '@app/database/entities/video.entity';
import { User } from '@app/database/entities/user.entity';
import { Like } from '@app/database/entities/like.entity';
import { Comment } from '@app/database/entities/comment.entity';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    RedisModule,
    RabbitMQModule.register({ name: 'video-service' }),
    TypeOrmModule.forFeature([Video, User, Like, Comment]),
  ],
  controllers: [VideoController, HealthController],
  providers: [VideoService],
})
export class VideoModule {}
