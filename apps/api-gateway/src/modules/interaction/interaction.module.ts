import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InteractionController } from './interaction.controller';
import { WebsocketModule } from '../websocket/websocket.module';
import { join } from 'path';

@Module({
  imports: [
    WebsocketModule,
    ClientsModule.register([
      {
        name: 'INTERACTION_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'interaction',
          protoPath: join(__dirname, '../../../../../proto/interaction.proto'),
          url: process.env.GRPC_INTERACTION_URL || 'localhost:50053',
        },
      },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [InteractionController],
})
export class InteractionModule {}
