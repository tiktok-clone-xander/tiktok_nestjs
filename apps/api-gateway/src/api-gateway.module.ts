import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { RedisModule } from '@app/redis';
import { AuthModule } from './modules/auth/auth.module';
import { VideoModule } from './modules/video/video.module';
import { InteractionModule } from './modules/interaction/interaction.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule,
    
    // gRPC Clients
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(__dirname, '../../../proto/auth.proto'),
          url: process.env.GRPC_AUTH_URL || 'localhost:50051',
        },
      },
      {
        name: 'VIDEO_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'video',
          protoPath: join(__dirname, '../../../proto/video.proto'),
          url: process.env.GRPC_VIDEO_URL || 'localhost:50052',
        },
      },
      {
        name: 'INTERACTION_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'interaction',
          protoPath: join(__dirname, '../../../proto/interaction.proto'),
          url: process.env.GRPC_INTERACTION_URL || 'localhost:50053',
        },
      },
    ]),
    
    AuthModule,
    VideoModule,
    InteractionModule,
    WebsocketModule,
  ],
  controllers: [HealthController],
})
export class ApiGatewayModule {}
