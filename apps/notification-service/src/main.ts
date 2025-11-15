import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NotificationModule } from './notification.module';
import { AllExceptionsFilter } from '@app/common/filters/all-exceptions.filter';
import { LoggingInterceptor } from '@app/common/interceptors/logging.interceptor';
import { logger } from '@app/common/utils/logger';

async function bootstrap() {
  const app = await NestFactory.create(NotificationModule);

  // Setup gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'notification',
      protoPath: join(__dirname, '../../../proto/notification.proto'),
      url: `0.0.0.0:${process.env.NOTIFICATION_GRPC_PORT || 50054}`,
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
  logger.info('Notification gRPC service is listening on port 50054');

  const port = process.env.NOTIFICATION_HTTP_PORT || 3004;
  await app.listen(port);
  logger.info(`Notification HTTP server is running on port ${port}`);
}

bootstrap();
