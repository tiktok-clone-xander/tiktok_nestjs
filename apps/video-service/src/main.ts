import { AllExceptionsFilter } from '@app/common/filters';
import { LoggingInterceptor } from '@app/common/interceptors';
import { SentryExceptionFilter, SentryInterceptor, SentryService } from '@app/common/sentry';
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

  // Initialize Sentry
  const sentryService = app.get(SentryService);
  sentryService.initialize('video-service');

  // Setup gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'video',
      protoPath: join(__dirname, '../../../proto/video.proto'),
      url: `localhost:${configService.get('VIDEO_GRPC_PORT', 50052)}`,
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
  app.useGlobalFilters(new SentryExceptionFilter(sentryService), new AllExceptionsFilter());
  app.useGlobalInterceptors(new SentryInterceptor(sentryService), new LoggingInterceptor());

  // Start all microservices
  await app.startAllMicroservices();
  const grpcPort = configService.get('VIDEO_GRPC_PORT', 50052);
  logger.info(`Video gRPC service is listening on port ${grpcPort}`);

  // Start HTTP server for health checks
  const port = configService.get('VIDEO_HTTP_PORT', 4002);
  await app.listen(port, '0.0.0.0');
  logger.info(`Video HTTP server is running on port ${port}`);
  logger.info(`Sentry error tracking: ${sentryService.isInitialized() ? 'enabled' : 'disabled'}`);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received');
    await sentryService.flush();
    await app.close();
  });
}

bootstrap();
