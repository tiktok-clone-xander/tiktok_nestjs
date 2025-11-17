import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InteractionController } from './interaction.controller';
import { InteractionService } from './interaction.service';
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
    RabbitMQModule.register({ name: 'interaction-service' }),
    TypeOrmModule.forFeature([Video, User, Like, Comment]),
  ],
  controllers: [InteractionController, HealthController],
  providers: [InteractionService],
})
export class InteractionModule {}
