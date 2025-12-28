# Sentry Quick Reference

## 🚀 Setup (One Time)

```bash
# 1. Get DSN from sentry.io
# 2. Add to .env
SENTRY_DSN=https://your-key@sentry.io/project-id
SENTRY_ENVIRONMENT=development

# 3. Install dependencies (already done)
npm install
```

## 📝 Common Operations

### Capture Exceptions

```typescript
import { SentryService } from '@app/common/sentry';

// Inject service
constructor(private sentryService: SentryService) {}

// Capture with context
this.sentryService.captureException(error, {
  userId: user.id,
  operation: 'upload-video',
});
```

### Capture Messages

```typescript
// Info
this.sentryService.captureMessage('Operation completed', 'info');

// Warning
this.sentryService.captureMessage('High memory usage', 'warning', {
  memory: process.memoryUsage(),
});

// Error
this.sentryService.captureMessage('Payment failed', 'error', {
  userId: user.id,
});
```

### Add Breadcrumbs

```typescript
this.sentryService.addBreadcrumb({
  type: 'info',
  category: 'user-action',
  message: 'User clicked button',
  level: 'info',
  data: { buttonId: 'submit' },
});
```

### Track Performance

```typescript
const transaction = this.sentryService.startTransaction('process-video', 'task');

try {
  await processVideo();
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

### Set User Context

```typescript
// After authentication
this.sentryService.setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});

// On logout
this.sentryService.clearUser();
```

### Add Tags

```typescript
this.sentryService.setTag('payment_method', 'stripe');
this.sentryService.setTag('user_tier', 'premium');
```

### Add Context

```typescript
this.sentryService.setContext('order', {
  id: order.id,
  amount: order.amount,
  items: order.items.length,
});
```

## 🔧 Configuration

### Environment Variables

```env
# Required
SENTRY_DSN=https://key@sentry.io/project

# Optional
SENTRY_ENVIRONMENT=production
SENTRY_TRACE_SAMPLE_RATE=0.1    # 10% of requests
SENTRY_PROFILE_SAMPLE_RATE=0.1   # 10% profiling
```

### Sample Rates

| Environment | Traces | Profiles | Reason         |
| ----------- | ------ | -------- | -------------- |
| Development | 100%   | 100%     | Full debugging |
| Staging     | 50%    | 25%      | Testing        |
| Production  | 10%    | 10%      | Performance    |

## 📊 What Gets Tracked

### Automatically Tracked

✅ All unhandled exceptions (5xx errors)
✅ HTTP request performance
✅ User context (when authenticated)
✅ Request breadcrumbs
✅ Stack traces

### Not Tracked (Filtered)

❌ Validation errors (400s)
❌ Not found errors (404s)
❌ Dev environment errors (logged only)

## 🎯 Best Practices

### DO ✅

```typescript
// Add context to errors
this.sentryService.captureException(error, {
  userId: user.id,
  videoId: video.id,
});

// Track important operations
const tx = this.sentryService.startTransaction('upload', 'task');
// ... work ...
tx.finish();

// Set user context after auth
this.sentryService.setUser({ id: user.id });

// Add meaningful breadcrumbs
this.sentryService.addBreadcrumb({
  message: 'Video processing started',
  data: { videoId: video.id },
});
```

### DON'T ❌

```typescript
// Don't capture expected errors
try {
  validateInput();
} catch (error) {
  this.sentryService.captureException(error); // ❌ Too noisy
}

// Don't send sensitive data
this.sentryService.captureException(error, {
  password: user.password, // ❌ Security risk
  creditCard: payment.card, // ❌ PCI violation
});

// Don't use in tight loops
for (let i = 0; i < 1000000; i++) {
  this.sentryService.addBreadcrumb({ ... }); // ❌ Performance issue
}
```

## 🐛 Debugging

### Check if Sentry is enabled

```typescript
if (this.sentryService.isInitialized()) {
  console.log('Sentry is tracking errors');
}
```

### Test error tracking

```bash
# Add test endpoint (dev only)
curl http://localhost:5555/api/test-error
```

### View logs

```bash
# Check Sentry initialization
npm run start:gateway
# Look for: "Sentry initialized for api-gateway"
```

## 📱 Dashboard

Access your Sentry dashboard:

- **Issues**: https://sentry.io/organizations/your-org/issues/
- **Performance**: https://sentry.io/organizations/your-org/performance/
- **Releases**: https://sentry.io/organizations/your-org/releases/

## 🆘 Troubleshooting

| Problem              | Solution                                       |
| -------------------- | ---------------------------------------------- |
| "DSN not configured" | Add `SENTRY_DSN` to `.env`                     |
| Errors not appearing | Check environment (dev errors are logged only) |
| Too many events      | Reduce `SENTRY_TRACE_SAMPLE_RATE`              |
| High CPU usage       | Lower sample rates to 0.1 or 0.05              |

## 📚 Learn More

- 📖 [Full Setup Guide](./SENTRY_SETUP.md)
- 💻 [Code Examples](./sentry-usage-examples.ts)
- 📋 [Configuration Summary](../SENTRY_CONFIGURATION_SUMMARY.md)
- 🌐 [Sentry Docs](https://docs.sentry.io/)

---

**Quick Help**: Check logs for initialization status, verify DSN, test with curl.
