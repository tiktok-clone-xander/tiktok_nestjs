import { AllExceptionsFilter } from '@app/common/filters';
import { LoggingInterceptor } from '@app/common/interceptors';
import { logger } from '@app/common/utils';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { VideoModule } from './video.module';

async function bootstrap() {
  // Create hybrid application (gRPC + HTTP)
  const app = await NestFactory.create(VideoModule);
  const configService = app.get(ConfigService);

  // Setup gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'video',
      protoPath: join(__dirname, '../../../proto/video.proto'),
      url: `0.0.0.0:${configService.get('VIDEO_GRPC_PORT', 50052)}`,
    },
  });

  // Global pipes, filters, and interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Start all microservices
  await app.startAllMicroservices();
  const grpcPort = configService.get('VIDEO_GRPC_PORT', 50052);
  logger.info(`Video gRPC service is listening on port ${grpcPort}`);

  // Start HTTP server for health checks
  const port = configService.get('VIDEO_HTTP_PORT', 4002);
  await app.listen(port);
  logger.info(`Video HTTP server is running on port ${port}`);
}

bootstrap();
