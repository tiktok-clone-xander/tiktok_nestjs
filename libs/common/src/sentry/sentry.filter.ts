import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { SentryService } from './sentry.service';

/**
 * Global exception filter that captures all exceptions and sends them to Sentry
 * Safely handles cases where Sentry is disabled (development/local environment)
 */
@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SentryExceptionFilter.name);

  constructor(private readonly sentryService: SentryService) {}

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<any>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException ? exception.message : 'Internal server error';

    // Log error locally (only for server errors to reduce noise)
    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url}`, exception.stack);
    }

    // Capture exception in Sentry (only for server errors and when Sentry is initialized)
    if (status >= 500 && this.sentryService.isInitialized()) {
      this.sentryService.captureException(exception, {
        request: {
          method: request.method,
          url: request.url,
          headers: request.headers,
          body: request.body,
          query: request.query,
          params: request.params,
          user_id: request.user?.id,
        },
        response: {
          status,
        },
      });
    }

    // Send response
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
