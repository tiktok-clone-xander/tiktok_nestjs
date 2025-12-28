# Sentry Integration Guide

This project has Sentry error tracking integrated across all microservices.

## 🎯 Features

- ✅ **Automatic Exception Tracking**: All exceptions are automatically captured
- ✅ **Performance Monitoring**: Transaction tracing for HTTP requests and gRPC calls
- ✅ **User Context**: User information is attached to error reports
- ✅ **Breadcrumbs**: Request history and application flow tracking
- ✅ **Environment Tagging**: Separate error tracking for dev, staging, and production
- ✅ **Graceful Degradation**: Error tracking works without DSN (logs locally)
- ✅ **Profiling**: Performance profiling in production (10% sample rate)

## 🚀 Quick Setup

### 1. Create Sentry Account & Projects

1. Go to [https://sentry.io](https://sentry.io) and sign up
2. Create a new organization (or use existing)
3. Create projects for each service:
   - `tiktok-api-gateway`
   - `tiktok-auth-service`
   - `tiktok-video-service`
   - `tiktok-interaction-service`
   - `tiktok-notification-service`

### 2. Configure Environment Variables

For **single DSN** (all services report to same project):

```env
# .env
SENTRY_DSN=https://your-dsn-key@o123456.ingest.sentry.io/7654321
SENTRY_ENVIRONMENT=development
```

For **multiple DSNs** (separate projects per service):

Create separate .env files or use docker-compose environment overrides:

```yaml
# docker-compose.yml
services:
  api-gateway:
    environment:
      - SENTRY_DSN=https://key1@o123456.ingest.sentry.io/1111111
      - SENTRY_ENVIRONMENT=production

  auth-service:
    environment:
      - SENTRY_DSN=https://key2@o123456.ingest.sentry.io/2222222
      - SENTRY_ENVIRONMENT=production
```

### 3. Test the Integration

```bash
# Run services
npm run start:gateway

# Check logs for Sentry status
# You should see: "🐛 Sentry error tracking: enabled"
```

## 📊 Configuration Options

### Environment Variables

| Variable                     | Required | Default                     | Description                                                    |
| ---------------------------- | -------- | --------------------------- | -------------------------------------------------------------- |
| `SENTRY_DSN`                 | No       | -                           | Sentry project DSN. If not set, errors are logged locally only |
| `SENTRY_ENVIRONMENT`         | No       | `development`               | Environment name (development, staging, production)            |
| `SENTRY_TRACE_SAMPLE_RATE`   | No       | `1.0` (dev)<br>`0.1` (prod) | Percentage of transactions to trace (0.0-1.0)                  |
| `SENTRY_PROFILE_SAMPLE_RATE` | No       | `1.0` (dev)<br>`0.1` (prod) | Percentage of transactions to profile (0.0-1.0)                |

### Sample Rates

The default configuration uses different sample rates based on environment:

**Development:**

- Traces: 100% (all requests tracked)
- Profiles: 100% (all performance data)

**Production:**

- Traces: 10% (reduced overhead)
- Profiles: 10% (reduced overhead)

You can override these in production:

```env
SENTRY_TRACE_SAMPLE_RATE=0.25  # 25% of requests
SENTRY_PROFILE_SAMPLE_RATE=0.1  # 10% profiling
```

## 🔧 Usage in Code

### Manual Exception Capture

```typescript
import { SentryService } from '@app/common/sentry';

export class MyService {
  constructor(private readonly sentryService: SentryService) {}

  async someMethod() {
    try {
      // Your code
    } catch (error) {
      // Automatically captured by global filter, but you can also:
      this.sentryService.captureException(error, {
        method: 'someMethod',
        userId: user.id,
      });
      throw error;
    }
  }
}
```

### Capture Messages

```typescript
// Info message
this.sentryService.captureMessage('User completed onboarding', 'info', {
  userId: user.id,
});

// Warning
this.sentryService.captureMessage('Rate limit approaching', 'warning', {
  endpoint: '/api/videos',
  usage: '90%',
});

// Error
this.sentryService.captureMessage('Payment failed', 'error', {
  userId: user.id,
  amount: payment.amount,
});
```

### Add Breadcrumbs

```typescript
this.sentryService.addBreadcrumb({
  type: 'user',
  category: 'action',
  message: 'User uploaded video',
  level: 'info',
  data: {
    videoId: video.id,
    size: video.size,
  },
});
```

### Set User Context

```typescript
// In auth middleware/guard
this.sentryService.setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});

// Clear on logout
this.sentryService.clearUser();
```

### Performance Tracking

```typescript
const transaction = this.sentryService.startTransaction('process-video', 'task');

try {
  // Your processing code
  await processVideo(video);
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

## 🏗️ Architecture

### Automatic Integration

Sentry is automatically integrated via:

1. **Global Exception Filter** ([SentryExceptionFilter](../libs/common/src/sentry/sentry.filter.ts))
   - Captures all unhandled exceptions
   - Filters out 4xx errors (only captures 5xx)
   - Attaches request context

2. **Global Interceptor** ([SentryInterceptor](../libs/common/src/sentry/sentry.interceptor.ts))
   - Tracks performance metrics
   - Creates transactions for each request
   - Adds breadcrumbs
   - Sets user context

### Service Integration

Each microservice initializes Sentry on startup:

```typescript
// apps/api-gateway/src/main.ts
const sentryService = app.get(SentryService);
sentryService.initialize('api-gateway');

app.useGlobalFilters(new SentryExceptionFilter(sentryService), new AllExceptionsFilter());
app.useGlobalInterceptors(new SentryInterceptor(sentryService), new LoggingInterceptor());
```

## 📈 Monitoring Best Practices

### 1. Alert Setup

Configure alerts in Sentry dashboard:

- **High Priority**: Errors affecting >5% of users
- **Medium Priority**: New error types
- **Low Priority**: Performance degradation

### 2. Error Filtering

The configuration automatically filters:

- Validation errors (400s)
- Not found errors (404s)
- Development environment errors (logged only)

To customize filtering, edit [sentry.service.ts](../libs/common/src/sentry/sentry.service.ts):

```typescript
beforeSend(event, hint) {
  const error = hint?.originalException;
  if (error instanceof Error) {
    // Add your custom filters
    if (error.message.includes('Expected error')) {
      return null; // Don't send to Sentry
    }
  }
  return event;
}
```

### 3. Performance Monitoring

Monitor these metrics in Sentry:

- **Transaction Duration**: API response times
- **Throughput**: Requests per second
- **Error Rate**: Percentage of failed requests
- **Apdex Score**: User satisfaction metric

### 4. Release Tracking

Tag errors with releases for better tracking:

```bash
# In CI/CD pipeline
export SENTRY_RELEASE="tiktok@1.2.3"
```

Or in code (already configured):

```typescript
// Uses package.json version
release: process.env.npm_package_version;
```

## 🧪 Testing Sentry Integration

### Manual Test

Add test endpoints to trigger errors:

```typescript
// For development only
@Get('test-error')
testError() {
  throw new Error('Test Sentry integration');
}

@Get('test-warning')
testWarning() {
  this.sentryService.captureMessage('Test warning', 'warning');
  return { message: 'Warning sent to Sentry' };
}
```

### Verify in Sentry Dashboard

1. Go to your Sentry project
2. Navigate to **Issues**
3. You should see the test errors
4. Check **Performance** for transaction data

## 🔒 Security

### DSN Protection

- Never commit DSN to git
- Use environment variables
- Different DSNs for each environment

### Data Sanitization

Sensitive data is automatically filtered:

```typescript
// Configured in sentry.service.ts
beforeSend(event, hint) {
  // Remove sensitive headers
  if (event.request?.headers) {
    delete event.request.headers['authorization'];
    delete event.request.headers['cookie'];
  }
  return event;
}
```

## 🐳 Docker Deployment

### docker-compose.yml

```yaml
services:
  api-gateway:
    environment:
      - SENTRY_DSN=${SENTRY_DSN}
      - SENTRY_ENVIRONMENT=${NODE_ENV}
    build:
      context: .
      dockerfile: apps/api-gateway/Dockerfile
```

### Kubernetes

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: sentry-secrets
type: Opaque
stringData:
  dsn: https://key@o123456.ingest.sentry.io/7654321

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  template:
    spec:
      containers:
        - name: api-gateway
          env:
            - name: SENTRY_DSN
              valueFrom:
                secretKeyRef:
                  name: sentry-secrets
                  key: dsn
```

## 📚 Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Sentry Node SDK](https://docs.sentry.io/platforms/node/)
- [NestJS Integration](https://docs.sentry.io/platforms/node/guides/nestjs/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Error Tracking Best Practices](https://docs.sentry.io/product/issues/)

## 🆘 Troubleshooting

### Sentry not capturing errors

1. Check DSN is set: `echo $SENTRY_DSN`
2. Verify initialization logs: "Sentry initialized for..."
3. Check environment: Development errors are logged, not sent
4. Verify error is 5xx (4xx are filtered by default)

### High event volume

1. Reduce sample rates in production
2. Add more beforeSend filters
3. Enable release-based sampling
4. Set up proper alerting to avoid alert fatigue

### Performance impact

1. Use lower sample rates in production (10%)
2. Disable profiling if not needed
3. Use async error submission (default)
4. Monitor Sentry SDK overhead in metrics

## 📝 Changelog

### v1.0.0 (2025-12-28)

- ✅ Initial Sentry integration
- ✅ Global exception filter
- ✅ Performance monitoring
- ✅ User context tracking
- ✅ Breadcrumb support
- ✅ Graceful degradation
- ✅ Multi-service support
- ✅ Environment-based configuration

---

**Need help?** Check the [main documentation](../README.md) or open an issue.
