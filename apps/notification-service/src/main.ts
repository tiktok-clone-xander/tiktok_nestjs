import { AllExceptionsFilter } from '@app/common/filters';
import { LoggingInterceptor } from '@app/common/interceptors';
import { SentryExceptionFilter, SentryInterceptor, SentryService } from '@app/common/sentry';
import { logger } from '@app/common/utils';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { NotificationModule } from './notification.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationModule);
  const configService = app.get(ConfigService);

  // Initialize Sentry
  const sentryService = app.get(SentryService);
  sentryService.initialize('notification-service');

  // Setup gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'notification',
      protoPath: join(__dirname, '../../../proto/notification.proto'),
      url: `localhost:${configService.get('NOTIFICATION_GRPC_PORT', 50054)}`,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new SentryExceptionFilter(sentryService), new AllExceptionsFilter());
  app.useGlobalInterceptors(new SentryInterceptor(sentryService), new LoggingInterceptor());

  await app.startAllMicroservices();
  const grpcPort = configService.get('NOTIFICATION_GRPC_PORT', 50054);
  logger.info(`Notification gRPC service is listening on port ${grpcPort}`);

  const port = configService.get('NOTIFICATION_HTTP_PORT', 4004);
  await app.listen(port, '0.0.0.0');
  logger.info(`Notification HTTP server is running on port ${port}`);
  logger.info(`Sentry error tracking: ${sentryService.isInitialized() ? 'enabled' : 'disabled'}`);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received');
    await sentryService.flush();
    await app.close();
  });
}

bootstrap();
