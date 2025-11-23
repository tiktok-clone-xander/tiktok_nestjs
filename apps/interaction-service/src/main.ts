import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { InteractionModule } from './interaction.module';
import { AllExceptionsFilter } from '@app/common/filters';
import { LoggingInterceptor } from '@app/common/interceptors';
import { logger } from '@app/common/utils';

async function bootstrap() {
  const app = await NestFactory.create(InteractionModule);
  const configService = app.get(ConfigService);

  // Setup gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'interaction',
      protoPath: join(__dirname, '../../../proto/interaction.proto'),
      url: `0.0.0.0:${configService.get('INTERACTION_GRPC_PORT', 50053)}`,
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
  logger.info('Interaction gRPC service is listening on port 50053');

  const port = configService.get('INTERACTION_HTTP_PORT', 3003);
  await app.listen(port);
  logger.info(`Interaction HTTP server is running on port ${port}`);
}

bootstrap();
