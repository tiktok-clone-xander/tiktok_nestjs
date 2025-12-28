# Sentry Configuration Summary

✅ **Sentry has been successfully configured across all microservices!**

## 📦 What's Been Configured

### 1. Core Sentry Library

- **Location**: `libs/common/src/sentry/`
- **Files**:
  - `sentry.service.ts` - Main Sentry service with all SDK methods
  - `sentry.module.ts` - Global module for DI
  - `sentry.interceptor.ts` - Automatic request tracking & performance monitoring
  - `sentry.filter.ts` - Global exception filter for error capture

### 2. Service Integration

All services have been configured with Sentry:

✅ **API Gateway** (`apps/api-gateway/`)

- Sentry initialized on startup
- Global exception filter active
- Performance monitoring enabled
- User context tracking

✅ **Auth Service** (`apps/auth-service/`)

- Sentry initialized for authentication errors
- JWT and login error tracking
- User session context

✅ **Video Service** (`apps/video-service/`)

- Video processing error tracking
- Upload and streaming monitoring
- Performance metrics for transcoding

✅ **Interaction Service** (`apps/interaction-service/`)

- Like/comment error tracking
- Real-time interaction monitoring

✅ **Notification Service** (`apps/notification-service/`)

- Push notification error tracking
- Email/SMS delivery monitoring

### 3. Dependencies

Added to `package.json`:

```json
{
  "@sentry/integrations": "^7.99.0",
  "@sentry/node": "^7.99.0",
  "@sentry/profiling-node": "^7.99.0"
}
```

### 4. Environment Configuration

Added to `.env`:

```env
# Sentry
SENTRY_DSN=
SENTRY_ENVIRONMENT=development
SENTRY_TRACE_SAMPLE_RATE=1.0
SENTRY_PROFILE_SAMPLE_RATE=1.0
```

### 5. Documentation

Created comprehensive guides:

- 📘 `docs/SENTRY_SETUP.md` - Complete setup and usage guide
- 💻 `docs/sentry-usage-examples.ts` - Code examples and best practices

## 🚀 Quick Start

### 1. Install Dependencies (if not already installed)

```bash
npm install
```

### 2. Get Your Sentry DSN

1. Go to [https://sentry.io](https://sentry.io)
2. Create an account (free tier available)
3. Create a new project
4. Copy the DSN from Project Settings

### 3. Configure Environment

Add to your `.env` file:

```env
SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/7654321
SENTRY_ENVIRONMENT=development
```

### 4. Start Services

```bash
# Start all services
npm run start:gateway
npm run start:auth
npm run start:video
npm run start:interaction
npm run start:notification
```

You should see in logs:

```
🐛 Sentry error tracking: enabled
```

### 5. Test Integration

Trigger a test error to verify:

```bash
# Create a test endpoint in your controller
curl http://localhost:5555/api/test-error
```

Check your Sentry dashboard - you should see the error!

## 🎯 Features

### ✅ Automatic Error Tracking

All unhandled exceptions are automatically captured with:

- Full stack traces
- Request context (URL, method, headers)
- User information (if authenticated)
- Environment data

### ✅ Performance Monitoring

Every HTTP request creates a transaction with:

- Response time
- Status code
- Database query count
- External API calls

### ✅ User Context

When users are authenticated:

- User ID
- Email
- Username

### ✅ Breadcrumbs

Automatic tracking of:

- HTTP requests
- Database queries
- Redis operations
- Kafka events

### ✅ Smart Filtering

Automatically filters out:

- Validation errors (400s)
- Not found errors (404s)
- Development environment errors (logged only)

### ✅ Environment-Based Config

- **Development**: 100% sampling, verbose logging
- **Production**: 10% sampling, optimized performance

## 📊 What Gets Tracked

### Errors (5xx)

- ✅ Internal server errors
- ✅ Database connection errors
- ✅ External API failures
- ✅ Unhandled exceptions
- ✅ Async errors

### Performance

- ✅ API response times
- ✅ Database query performance
- ✅ gRPC call latency
- ✅ Cache hit/miss rates

### User Actions

- ✅ Authentication attempts
- ✅ Video uploads
- ✅ Likes and comments
- ✅ Profile updates

## 🔧 Configuration Options

### Sample Rates

Control how much data is sent to Sentry:

```env
# Send all transactions (development)
SENTRY_TRACE_SAMPLE_RATE=1.0

# Send 10% of transactions (production)
SENTRY_TRACE_SAMPLE_RATE=0.1

# Disable performance monitoring
SENTRY_TRACE_SAMPLE_RATE=0.0
```

### Environment

Separate errors by environment:

```env
# Development
SENTRY_ENVIRONMENT=development

# Staging
SENTRY_ENVIRONMENT=staging

# Production
SENTRY_ENVIRONMENT=production
```

## 📝 Usage Examples

### Manual Exception Capture

```typescript
import { SentryService } from '@app/common/sentry';

export class MyService {
  constructor(private sentryService: SentryService) {}

  async processData(data: any) {
    try {
      // Your code
    } catch (error) {
      this.sentryService.captureException(error, {
        context: 'data-processing',
        dataSize: data.length,
      });
      throw error;
    }
  }
}
```

### Capture Messages

```typescript
// Info
this.sentryService.captureMessage('User completed onboarding', 'info');

// Warning
this.sentryService.captureMessage('Rate limit approaching', 'warning', {
  usage: '90%',
});

// Error
this.sentryService.captureMessage('Payment failed', 'error', {
  userId: user.id,
});
```

### Add Breadcrumbs

```typescript
this.sentryService.addBreadcrumb({
  type: 'user',
  category: 'action',
  message: 'User uploaded video',
  level: 'info',
  data: { videoId: video.id },
});
```

See `docs/sentry-usage-examples.ts` for more examples!

## 🐳 Docker & Production

### docker-compose.yml

```yaml
services:
  api-gateway:
    environment:
      - SENTRY_DSN=${SENTRY_DSN}
      - SENTRY_ENVIRONMENT=production
      - SENTRY_TRACE_SAMPLE_RATE=0.1
```

### Kubernetes

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: sentry-secrets
data:
  dsn: <base64-encoded-dsn>
---
apiVersion: apps/v1
kind: Deployment
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

## 🔍 Verifying Setup

### Check Logs

When services start, you should see:

```
[Nest] INFO  [SentryService] Sentry initialized for api-gateway in development environment
🐛 Sentry error tracking: enabled
```

### Check Without DSN

If `SENTRY_DSN` is not set:

```
[Nest] WARN  [SentryService] Sentry DSN not configured. Error tracking is disabled.
🐛 Sentry error tracking: disabled
```

This is normal for development - errors will be logged locally.

### Test Error Tracking

```bash
# Trigger an error
curl http://localhost:5555/api/videos/nonexistent-id

# Check Sentry dashboard
# You should see the error if DSN is configured
```

## 📚 Additional Resources

- 📖 [Full Setup Guide](./SENTRY_SETUP.md)
- 💻 [Usage Examples](./sentry-usage-examples.ts)
- 🌐 [Sentry Documentation](https://docs.sentry.io/)
- 🎯 [Performance Monitoring](https://docs.sentry.io/product/performance/)

## 🆘 Troubleshooting

### "Sentry not initialized" warnings

**Solution**: Make sure `SENTRY_DSN` is set in `.env`

### Errors not appearing in Sentry

1. Check DSN is correct
2. Verify environment is not 'development' (dev errors are logged only)
3. Check error is 5xx (4xx errors are filtered)
4. Verify internet connection

### High CPU usage

**Solution**: Reduce sample rates in production:

```env
SENTRY_TRACE_SAMPLE_RATE=0.1
SENTRY_PROFILE_SAMPLE_RATE=0.1
```

## ✅ Checklist

Before deploying to production:

- [ ] Get Sentry DSN from sentry.io
- [ ] Add `SENTRY_DSN` to environment variables
- [ ] Set `SENTRY_ENVIRONMENT=production`
- [ ] Reduce sample rates (`0.1` for production)
- [ ] Test error tracking in staging
- [ ] Set up Sentry alerts
- [ ] Configure integrations (Slack, email, etc.)
- [ ] Review and adjust error filtering rules
- [ ] Document DSN location for team
- [ ] Add Sentry to monitoring runbook

## 🎉 You're All Set!

Sentry is now fully configured and ready to track errors and performance across all your microservices.

**Next Steps**:

1. Add `SENTRY_DSN` to your `.env` file
2. Run the services and watch for initialization messages
3. Trigger a test error to verify
4. Check your Sentry dashboard

Happy error tracking! 🐛🔍
