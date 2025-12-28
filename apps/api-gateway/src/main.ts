import { AllExceptionsFilter } from '@app/common/filters';
import { LoggingInterceptor, TransformInterceptor } from '@app/common/interceptors';
import { SentryExceptionFilter, SentryInterceptor, SentryService } from '@app/common/sentry';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { join } from 'path';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const logger = new Logger('APIGateway');
  const app = await NestFactory.create<NestExpressApplication>(ApiGatewayModule);

  const configService = app.get(ConfigService);

  // Initialize Sentry
  const sentryService = app.get(SentryService);
  sentryService.initialize('api-gateway');

  // Serve static files (uploaded videos, images)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Security
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // CORS
  const isProduction = configService.get('NODE_ENV') === 'production';
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5555', // Frontend dev server
  ];

  app.enableCors({
    origin: isProduction ? allowedOrigins : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Filters and Interceptors
  app.useGlobalFilters(new SentryExceptionFilter(sentryService), new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new SentryInterceptor(sentryService),
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('TikTok Clone API')
    .setDescription('TikTok Clone Microservices API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT', 4000);
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 API Gateway is running on http://localhost:${port}`);
  logger.log(`📚 Swagger docs available at http://localhost:${port}/api/docs`);
  logger.log(`🐛 Sentry error tracking: ${sentryService.isInitialized() ? 'enabled' : 'disabled'}`);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM signal received: closing HTTP server');
    await sentryService.flush();
    await app.close();
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT signal received: closing HTTP server');
    await sentryService.flush();
    await app.close();
  });
}

bootstrap();
