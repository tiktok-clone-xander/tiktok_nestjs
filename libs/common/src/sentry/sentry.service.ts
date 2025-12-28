import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { Integration } from '@sentry/types';

@Injectable()
export class SentryService {
  private readonly logger = new Logger(SentryService.name);
  private initialized = false;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Initialize Sentry SDK
   */
  initialize(serviceName: string): void {
    const dsn = this.configService.get<string>('SENTRY_DSN');
    const environment = this.configService.get<string>('NODE_ENV', 'development');

    if (!dsn) {
      this.logger.warn('Sentry DSN not configured. Error tracking is disabled.');
      return;
    }

    if (this.initialized) {
      this.logger.warn('Sentry already initialized');
      return;
    }

    try {
      const integrations: Integration[] = [
        // Automatic instrumentation
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app: undefined }),
        new Sentry.Integrations.OnUncaughtException(),
        new Sentry.Integrations.OnUnhandledRejection({ mode: 'warn' }),
      ];

      // Add profiling in production (optional - requires @sentry/profiling-node)
      if (environment === 'production') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { nodeProfilingIntegration } = require('@sentry/profiling-node');
          if (nodeProfilingIntegration) {
            integrations.push(nodeProfilingIntegration());
            this.logger.log('Sentry profiling enabled');
          }
        } catch (error) {
          this.logger.warn('Sentry profiling not available');
        }
      }

      Sentry.init({
        dsn,
        environment,
        serverName: serviceName,
        integrations,

        // Performance Monitoring
        tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // Sample 10% in production

        // Profiling
        profilesSampleRate: environment === 'production' ? 0.1 : 1.0,

        // Error filtering
        beforeSend(event, hint) {
          // Don't send errors in development
          if (environment === 'development') {
            console.error(
              'Sentry Event (development):',
              hint?.originalException || hint?.syntheticException,
            );
            return null;
          }

          // Filter out common non-critical errors
          const error = hint?.originalException;
          if (error instanceof Error) {
            // Skip validation errors
            if (error.message.includes('Validation failed')) {
              return null;
            }
            // Skip 404 errors
            if (error.message.includes('NotFoundException')) {
              return null;
            }
          }

          return event;
        },

        // Release tracking
        release: process.env.npm_package_version,

        // Additional options
        attachStacktrace: true,
        maxBreadcrumbs: 50,
        debug: environment === 'development',
      });

      this.initialized = true;
      this.logger.log(`Sentry initialized for ${serviceName} in ${environment} environment`);
    } catch (error) {
      this.logger.error('Failed to initialize Sentry', error);
    }
  }

  /**
   * Capture an exception
   */
  captureException(exception: any, context?: Record<string, any>): string | undefined {
    if (!this.initialized) {
      this.logger.error('Sentry not initialized', exception);
      return;
    }

    return Sentry.captureException(exception, {
      contexts: context ? { custom: context } : undefined,
    });
  }

  /**
   * Capture a message
   */
  captureMessage(
    message: string,
    level: Sentry.SeverityLevel = 'info',
    context?: Record<string, any>,
  ): string {
    if (!this.initialized) {
      this.logger.log(message);
      return '';
    }

    return Sentry.captureMessage(message, {
      level,
      contexts: context ? { custom: context } : undefined,
    });
  }

  /**
   * Set user context
   */
  setUser(user: { id: string | number; email?: string; username?: string }): void {
    if (!this.initialized) return;

    Sentry.setUser({
      id: String(user.id),
      email: user.email,
      username: user.username,
    });
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    if (!this.initialized) return;
    Sentry.setUser(null);
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
    if (!this.initialized) return;
    Sentry.addBreadcrumb(breadcrumb);
  }

  /**
   * Set tag
   */
  setTag(key: string, value: string): void {
    if (!this.initialized) return;
    Sentry.setTag(key, value);
  }

  /**
   * Set context
   */
  setContext(name: string, context: Record<string, any>): void {
    if (!this.initialized) return;
    Sentry.setContext(name, context);
  }

  /**
   * Start a transaction for performance monitoring
   */
  startTransaction(name: string, op: string): Sentry.Transaction {
    return Sentry.startTransaction({ name, op });
  }

  /**
   * Flush events (useful before shutdown)
   */
  async flush(timeout = 2000): Promise<boolean> {
    if (!this.initialized) return true;

    try {
      return await Sentry.flush(timeout);
    } catch (error) {
      this.logger.error('Failed to flush Sentry events', error);
      return false;
    }
  }

  /**
   * Close Sentry connection
   */
  async close(timeout = 2000): Promise<boolean> {
    if (!this.initialized) return true;

    try {
      return await Sentry.close(timeout);
    } catch (error) {
      this.logger.error('Failed to close Sentry connection', error);
      return false;
    }
  }

  /**
   * Get Sentry instance
   */
  getInstance(): typeof Sentry {
    return Sentry;
  }

  /**
   * Check if Sentry is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}
