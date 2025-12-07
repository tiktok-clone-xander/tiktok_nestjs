import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpLoggingMiddleware } from './http-logging.middleware';
import { LoggingInterceptor } from './logger.interceptor';
import { CustomLoggerService } from './logger.service';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { SentryService } from './sentry.service';

@Module({
  imports: [ConfigModule],
  controllers: [MetricsController],
  providers: [
    CustomLoggerService,
    MetricsService,
    SentryService,
    LoggingInterceptor,
    HttpLoggingMiddleware,
  ],
  exports: [
    CustomLoggerService,
    MetricsService,
    SentryService,
    LoggingInterceptor,
    HttpLoggingMiddleware,
  ],
})
export class LoggerModule {}
