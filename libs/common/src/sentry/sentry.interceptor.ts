import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SentryService } from './sentry.service';

/**
 * Interceptor to automatically capture exceptions and track performance
 * Safely handles cases where Sentry is disabled (development/local environment)
 */
@Injectable()
export class SentryInterceptor implements NestInterceptor {
  constructor(private readonly sentryService: SentryService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Skip Sentry operations if not initialized
    if (!this.sentryService.isInitialized()) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;

    // Set user context if authenticated
    if (user) {
      this.sentryService.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    }

    // Add breadcrumb for the request
    this.sentryService.addBreadcrumb({
      type: 'http',
      category: 'request',
      message: `${method} ${url}`,
      data: {
        method,
        url,
        user_id: user?.id,
      },
      level: 'info',
    });

    // Start transaction for performance monitoring
    const transaction = this.sentryService.startTransaction(`${method} ${url}`, 'http.server');

    return next.handle().pipe(
      tap(() => {
        // Successful response
        if (transaction) {
          try {
            transaction.setStatus?.('ok');
            transaction.finish?.();
          } catch {
            // Ignore errors when finishing transaction
          }
        }
      }),
      catchError((error) => {
        // Capture exception in Sentry
        this.sentryService.captureException(error, {
          request: {
            method,
            url,
            user_id: user?.id,
          },
        });

        if (transaction) {
          try {
            transaction.setStatus?.('internal_error');
            transaction.finish?.();
          } catch {
            // Ignore errors when finishing transaction
          }
        }

        return throwError(() => error);
      }),
    );
  }
}
