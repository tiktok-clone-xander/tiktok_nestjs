import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CustomLoggerService } from './logger.service';
import { MetricsService } from './metrics.service';
import { SentryService } from './sentry.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private loggerService: CustomLoggerService,
    private metricsService: MetricsService,
    private sentryService: SentryService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();
    const { method, url, headers } = request;

    // Only create transaction if Sentry DSN is configured
    let transaction: Sentry.Transaction | null = null;
    try {
      transaction = this.sentryService.startTransaction(`${method} ${url}`, 'http.request');
    } catch {
      // Sentry not initialized, skip transaction
    }

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        this.metricsService.recordHttpRequest(method, url, statusCode, duration);

        this.loggerService.log('HTTP Request', {
          method,
          url,
          statusCode,
          duration,
          userAgent: headers['user-agent'],
          ip: request.ip,
        });

        if (transaction) {
          try {
            transaction.setStatus('ok');
            transaction.finish();
          } catch {
            // Ignore transaction finish errors
          }
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode || 500;

        this.metricsService.recordHttpRequest(method, url, statusCode, duration);

        this.loggerService.error('HTTP Request Error', error, {
          method,
          url,
          statusCode,
          duration,
          userAgent: headers['user-agent'],
          ip: request.ip,
        });

        // Only capture if Sentry is configured
        try {
          this.sentryService.captureException(error, {
            method,
            url,
            duration,
          });
        } catch {
          // Sentry not initialized, skip capture
        }

        if (transaction) {
          try {
            transaction.setStatus('error');
            transaction.finish();
          } catch {
            // Ignore transaction finish errors
          }
        }

        throw error;
      }),
    );
  }
}
