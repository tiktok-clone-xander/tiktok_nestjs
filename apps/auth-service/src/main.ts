import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthModule } from './auth.module';

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
      url: `localhost:${configService.get('AUTH_GRPC_PORT', 50051)}`,
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
  const grpcPort = configService.get('AUTH_GRPC_PORT', 50051);
  logger.log(`🚀 Auth Service is running on gRPC port ${grpcPort}`);

  // Also start HTTP for health checks
  const port = configService.get('AUTH_HTTP_PORT', 4001);
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Auth Service HTTP is running on port ${port}`);
}

bootstrap();
