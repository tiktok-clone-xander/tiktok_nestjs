import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from './auth.module';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('AuthService');

  const app = await NestFactory.create(AuthModule);
  const configService = app.get(ConfigService);

  // gRPC Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(__dirname, '../../../proto/auth.proto'),
      url: configService.get('GRPC_AUTH_URL', 'localhost:50051'),
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.startAllMicroservices();
  logger.log('🚀 Auth Service is running on gRPC port 50051');

  // Also start HTTP for health checks
  const port = configService.get('AUTH_HTTP_PORT', 3001);
  await app.listen(port);
  logger.log(`🚀 Auth Service HTTP is running on port ${port}`);
}

bootstrap();
