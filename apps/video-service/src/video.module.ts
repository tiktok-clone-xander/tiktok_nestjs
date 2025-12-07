import { KafkaModule } from '@app/kafka';
import { RedisModule } from '@app/redis';
import { VideoDbModule } from '@app/video-db';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { LoggerModule } from '@app/common/logging';
import { HealthController } from './health.controller';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    VideoDbModule,
    RedisModule,
    KafkaModule.register({ name: 'video-service' }),
    ClientsModule.register([
      {
        name: 'INTERACTION_SERVICE',
        transport: Transport.GRPC,
        options: {
          url: process.env.INTERACTION_SERVICE_URL || 'localhost:5003',
          package: 'interaction',
          protoPath: join(__dirname, '../../../proto/interaction.proto'),
        },
      },
    ]),
    LoggerModule,
  ],
  controllers: [VideoController, HealthController],
  providers: [VideoService],
})
export class VideoModule {}
