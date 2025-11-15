import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { VideoModule } from './video.module';
import { AllExceptionsFilter } from '@app/common/filters/all-exceptions.filter';
import { LoggingInterceptor } from '@app/common/interceptors/logging.interceptor';
import { logger } from '@app/common/utils/logger';

async function bootstrap() {
  // Create hybrid application (gRPC + HTTP)
  const app = await NestFactory.create(VideoModule);

  // Setup gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'video',
      protoPath: join(__dirname, '../../../proto/video.proto'),
      url: `0.0.0.0:${process.env.VIDEO_GRPC_PORT || 50052}`,
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
  logger.info('Video gRPC service is listening on port 50052');

  // Start HTTP server for health checks
  const port = process.env.VIDEO_HTTP_PORT || 3002;
  await app.listen(port);
  logger.info(`Video HTTP server is running on port ${port}`);
}

bootstrap();
