import { AllExceptionsFilter } from '@app/common/filters';
import { LoggingInterceptor } from '@app/common/interceptors';
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

  // Setup gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'notification',
      protoPath: join(__dirname, '../../../proto/notification.proto'),
      url: `0.0.0.0:${configService.get('NOTIFICATION_GRPC_PORT', 50054)}`,
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
  const grpcPort = configService.get('NOTIFICATION_GRPC_PORT', 50054);
  logger.info(`Notification gRPC service is listening on port ${grpcPort}`);

  const port = configService.get('NOTIFICATION_HTTP_PORT', 4004);
  await app.listen(port);
  logger.info(`Notification HTTP server is running on port ${port}`);
}

bootstrap();
