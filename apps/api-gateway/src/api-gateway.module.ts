import { LoggerModule, LoggingInterceptor } from '@app/common/logging';
import { SentryModule } from '@app/common/sentry';
import { RedisModule } from '@app/redis';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { HealthController } from './health.controller';
import { MetricsController } from './metrics.controller';
import { AuthModule } from './modules/auth/auth.module';
import { InteractionModule } from './modules/interaction/interaction.module';
import { UploadModule } from './modules/upload/upload.module';
import { UserModule } from './modules/user/user.module';
import { VideoModule } from './modules/video/video.module';
import { WebsocketModule } from './modules/websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule,
    SentryModule,
    RedisModule,

    // gRPC Clients
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(process.cwd(), 'proto', 'auth.proto'),
          url: process.env.GRPC_AUTH_URL || 'localhost:50051',
        },
      },
      {
        name: 'VIDEO_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'video',
          protoPath: join(process.cwd(), 'proto', 'video.proto'),
          url: process.env.GRPC_VIDEO_URL || 'localhost:50052',
        },
      },
      {
        name: 'INTERACTION_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'interaction',
          protoPath: join(process.cwd(), 'proto', 'interaction.proto'),
          url: process.env.GRPC_INTERACTION_URL || 'localhost:50053',
        },
      },
    ]),

    AuthModule,
    VideoModule,
    InteractionModule,
    WebsocketModule,
    UserModule,
    UploadModule,
  ],
  controllers: [HealthController, MetricsController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class ApiGatewayModule {}
