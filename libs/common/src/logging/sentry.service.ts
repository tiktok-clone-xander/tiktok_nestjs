import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
// import { ProfilingIntegration } from '@sentry/profiling-node';

@Injectable()
export class SentryService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit(): void {
    const sentryDsn = this.configService.get('SENTRY_DSN');
    const environment = this.configService.get('NODE_ENV', 'development');
    const enableProfiling = this.configService.get('SENTRY_PROFILING_ENABLED', false);

    if (sentryDsn) {
      const integrations = [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.OnUncaughtException(),
        new Sentry.Integrations.OnUnhandledRejection(),
      ];

      // if (enableProfiling) {
      //   integrations.push(new ProfilingIntegration());
      // }

      Sentry.init({
        dsn: sentryDsn,
        environment,
        integrations,
        tracesSampleRate: this.configService.get('SENTRY_TRACES_SAMPLE_RATE', 0.1),
        profilesSampleRate: enableProfiling ? 0.1 : 0,
        attachStacktrace: true,
        denyUrls: [/\/health/, /\/metrics/],
      });
    }
  }

  captureException(exception: Error, context?: Record<string, any>): void {
    Sentry.captureException(exception, {
      contexts: {
        app: context,
      },
    });
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    Sentry.captureMessage(message, level);
  }

  setUser(user: { id: string; email?: string; username?: string }): void {
    Sentry.setUser(user);
  }

  setContext(name: string, context: Record<string, any>): void {
    Sentry.setContext(name, context);
  }

  setTag(key: string, value: string): void {
    Sentry.setTag(key, value);
  }

  startTransaction(name: string, op: string): Sentry.Transaction {
    return Sentry.startTransaction({
      name,
      op,
    });
  }

  async flush(timeout = 5000): Promise<boolean> {
    return Sentry.close(timeout);
  }
}
