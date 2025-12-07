import { AllExceptionsFilter } from '@app/common/filters';
import { LoggingInterceptor } from '@app/common/interceptors';
import { logger } from '@app/common/utils';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { InteractionModule } from './interaction.module';

async function bootstrap() {
  const app = await NestFactory.create(InteractionModule);
  const configService = app.get(ConfigService);

  // Setup gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'interaction',
      protoPath: join(__dirname, '../../../proto/interaction.proto'),
      url: `localhost:${configService.get('INTERACTION_GRPC_PORT', 50053)}`,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.startAllMicroservices();
  const grpcPort = configService.get('INTERACTION_GRPC_PORT', 50053);
  logger.info(`Interaction gRPC service is listening on port ${grpcPort}`);

  const port = configService.get('INTERACTION_HTTP_PORT', 4003);
  await app.listen(port, '0.0.0.0');
  logger.info(`Interaction HTTP server is running on port ${port}`);
}

bootstrap();
