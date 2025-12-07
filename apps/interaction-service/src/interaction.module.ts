import { InteractionDbModule } from '@app/interaction-db';
import { KafkaModule } from '@app/kafka';
import { RedisModule } from '@app/redis';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { LoggerModule } from '@app/common/logging';
import { HealthController } from './health.controller';
import { InteractionController } from './interaction.controller';
import { InteractionService } from './interaction.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    InteractionDbModule,
    RedisModule,
    KafkaModule.register({ name: 'interaction-service' }),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.GRPC,
        options: {
          // Align with other services/env vars (GRPC_AUTH_URL) so the client resolves correctly
          url: process.env.GRPC_AUTH_URL || 'localhost:50051',
          package: 'auth',
          protoPath: join(__dirname, '../../../proto/auth.proto'),
        },
      },
    ]),
    LoggerModule,
  ],
  controllers: [InteractionController, HealthController],
  providers: [InteractionService],
})
export class InteractionModule {}
