import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
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

    const transaction = this.sentryService.startTransaction(`${method} ${url}`, 'http.request');

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
          transaction.setStatus('ok');
          transaction.finish();
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

        this.sentryService.captureException(error, {
          method,
          url,
          duration,
        });

        if (transaction) {
          transaction.setStatus('error');
          transaction.finish();
        }

        throw error;
      }),
    );
  }
}
