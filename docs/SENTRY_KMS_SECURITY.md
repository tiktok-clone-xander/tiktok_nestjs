# Sentry + KMS Security Setup Guide

## 🔐 Overview

Sentry is configured with the following security best practices:

1. **Environment Restriction**: Only active on `staging` and `production`
2. **KMS Encryption**: DSN is encrypted using AWS KMS
3. **Local Development**: Sentry disabled - debug locally without external tracking

## 🎯 Environment Behavior

| Environment   | Sentry Status | KMS         | Notes                              |
| ------------- | ------------- | ----------- | ---------------------------------- |
| `local`       | ❌ Disabled   | ❌          | Debug locally, no external calls   |
| `development` | ❌ Disabled   | ❌          | Team development, manual debugging |
| `staging`     | ✅ Enabled    | ⚠️ Optional | Testing with real errors           |
| `production`  | ✅ Enabled    | ✅ Required | Full security with KMS             |

## 🔧 Setup Instructions

### 1. AWS KMS Setup

#### Create KMS Key

```bash
# Login to AWS Console
aws kms create-key \
  --description "Sentry DSN Encryption Key" \
  --key-policy file://kms-policy.json

# Get Key ID
aws kms describe-key --key-id <key-arn>
```

#### KMS Policy (kms-policy.json)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Enable IAM User Permissions",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:root"
      },
      "Action": "kms:*",
      "Resource": "*"
    },
    {
      "Sid": "Allow service to decrypt",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:role/tiktok-service-role"
      },
      "Action": ["kms:Decrypt", "kms:DescribeKey"],
      "Resource": "*"
    }
  ]
}
```

### 2. Encrypt Sentry DSN

#### Method 1: Using AWS CLI

```bash
# Get your Sentry DSN from sentry.io
SENTRY_DSN="https://your-key@o123456.ingest.sentry.io/7654321"

# Encrypt with KMS
aws kms encrypt \
  --key-id alias/sentry-dsn-key \
  --plaintext "$SENTRY_DSN" \
  --output text \
  --query CiphertextBlob

# Output: Base64 encrypted string
# Example: AQICAHiXXXXXXXX...
```

#### Method 2: Using Node.js Script

Create `scripts/encrypt-dsn.ts`:

```typescript
import { KMS } from 'aws-sdk';

async function encryptDsn() {
  const kms = new KMS({ region: 'ap-southeast-1' });

  const dsn = process.argv[2];
  const keyId = process.env.AWS_KMS_KEY_ID;

  if (!dsn || !keyId) {
    console.error('Usage: ts-node encrypt-dsn.ts <DSN>');
    process.exit(1);
  }

  const result = await kms
    .encrypt({
      KeyId: keyId,
      Plaintext: dsn,
    })
    .promise();

  const encrypted = result.CiphertextBlob?.toString('base64');
  console.log('Encrypted DSN:', encrypted);
}

encryptDsn();
```

Run:

```bash
AWS_KMS_KEY_ID=your-key-id \
ts-node scripts/encrypt-dsn.ts "https://your-dsn@sentry.io/project"
```

### 3. Environment Configuration

#### Staging (.env.staging)

```env
NODE_ENV=staging

# Sentry with plaintext DSN (for testing) or encrypted
SENTRY_DSN=https://key@sentry.io/project
# OR encrypted:
# SENTRY_DSN=AQICAHiXXXXXXXX...

# AWS KMS (optional in staging)
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=AKIAXXXXX
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_KMS_KEY_ID=arn:aws:kms:region:account:key/xxx
```

#### Production (.env.production)

```env
NODE_ENV=production

# Sentry - MUST be KMS encrypted
SENTRY_DSN=AQICAHiXXXXXXXXXXXXXXXXXXXXXXXXXXXX...

# AWS KMS - REQUIRED
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=AKIAXXXXX
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_KMS_KEY_ID=arn:aws:kms:ap-southeast-1:123456789:key/xxx-xxx-xxx
```

### 4. Docker Deployment

#### docker-compose.production.yml

```yaml
version: '3.8'

services:
  api-gateway:
    environment:
      - NODE_ENV=production
      # Load encrypted DSN from AWS Secrets Manager or Parameter Store
      - SENTRY_DSN=${SENTRY_DSN_ENCRYPTED}
      - AWS_REGION=ap-southeast-1
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_KMS_KEY_ID=${AWS_KMS_KEY_ID}
```

### 5. Kubernetes Setup

#### ConfigMap (kms-config.yaml)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kms-config
  namespace: tiktok
data:
  AWS_REGION: 'ap-southeast-1'
  AWS_KMS_KEY_ID: 'arn:aws:kms:ap-southeast-1:123456789:key/xxx'
```

#### Secret (sentry-secret.yaml)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: sentry-secret
  namespace: tiktok
type: Opaque
data:
  # Base64 encoded encrypted DSN
  sentry-dsn: QVFJQxxxxxxxxxxxxxxxxxxxxxxx
```

#### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  template:
    spec:
      serviceAccountName: tiktok-service-account
      containers:
        - name: api-gateway
          env:
            - name: NODE_ENV
              value: 'production'
            - name: SENTRY_DSN
              valueFrom:
                secretKeyRef:
                  name: sentry-secret
                  key: sentry-dsn
            - name: AWS_REGION
              valueFrom:
                configMapKeyRef:
                  name: kms-config
                  key: AWS_REGION
            - name: AWS_KMS_KEY_ID
              valueFrom:
                configMapKeyRef:
                  name: kms-config
                  key: AWS_KMS_KEY_ID
```

#### IAM Role for Service Account (IRSA)

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: tiktok-service-account
  namespace: tiktok
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789:role/tiktok-kms-role
```

### 6. AWS Secrets Manager (Alternative)

Thay vì truyền encrypted DSN qua env, có thể dùng AWS Secrets Manager:

```typescript
// In sentry.service.ts
import { SecretsManager } from 'aws-sdk';

async getSecretFromSecretsManager(secretName: string): Promise<string> {
  const client = new SecretsManager({ region: this.configService.get('AWS_REGION') });

  const data = await client.getSecretValue({ SecretId: secretName }).promise();

  if (data.SecretString) {
    return data.SecretString;
  }

  throw new Error('Secret not found');
}
```

## 🔍 Verification

### Check KMS Status

```bash
# Check logs when service starts
npm run start:gateway

# Should see:
# [SentryService] Sentry disabled in local/development environment (if local)
# [KmsService] KMS initialized for region: ap-southeast-1 (if production)
# [SentryService] Decrypting Sentry DSN with KMS... (if production)
# [SentryService] Sentry DSN decrypted successfully
```

### Test Decryption

```typescript
// Test script
import { KmsService } from '@app/common/kms';

async function test() {
  const kms = new KmsService(configService);
  const encrypted = 'AQICAHiXXXXXX...';
  const decrypted = await kms.decrypt(encrypted);
  console.log('Decrypted:', decrypted);
}
```

## 🚨 Security Best Practices

### ✅ DO

- **Use KMS in production**: Always encrypt DSN with KMS
- **Rotate keys regularly**: Update KMS keys every 90 days
- **Use IAM roles**: Prefer IRSA over access keys in K8s
- **Audit logs**: Enable CloudTrail for KMS operations
- **Separate keys per environment**: Different KMS keys for staging/production
- **Least privilege**: Only grant decrypt permission to services

### ❌ DON'T

- **Don't commit encrypted values**: Use Secrets Manager or Parameter Store
- **Don't share KMS keys**: Each environment should have its own key
- **Don't hardcode credentials**: Use IAM roles whenever possible
- **Don't disable KMS in production**: Always enforce encryption
- **Don't log decrypted values**: Never log the actual DSN

## 🔐 IAM Policy for Application

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["kms:Decrypt", "kms:DescribeKey"],
      "Resource": "arn:aws:kms:ap-southeast-1:123456789:key/xxx-xxx-xxx"
    }
  ]
}
```

## 📊 Monitoring

### CloudWatch Alarms

```bash
# KMS Decrypt failures
aws cloudwatch put-metric-alarm \
  --alarm-name kms-decrypt-failures \
  --alarm-description "Alert on KMS decrypt failures" \
  --metric-name DecryptErrors \
  --namespace AWS/KMS \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

### Application Logs

```typescript
// Monitor in your logs
this.logger.log('KMS decryption successful');
this.logger.error('KMS decryption failed', error);
```

## 🆘 Troubleshooting

### Error: "Failed to decrypt secret with KMS"

**Causes**:

1. Invalid encrypted value
2. Wrong KMS key ID
3. Insufficient IAM permissions
4. Wrong AWS region

**Solutions**:

```bash
# Verify KMS key exists
aws kms describe-key --key-id <key-id>

# Test decrypt manually
aws kms decrypt --ciphertext-blob fileb://encrypted.bin

# Check IAM permissions
aws iam simulate-principal-policy \
  --policy-source-arn <role-arn> \
  --action-names kms:Decrypt \
  --resource-arns <key-arn>
```

### Error: "Sentry not initialized"

**In Production**: Check if DSN is properly encrypted and KMS is configured

**In Local**: This is expected behavior - Sentry is disabled

### KMS Not Available

If KMS is temporarily unavailable, service will log warning and continue without Sentry (graceful degradation).

## 📚 Additional Resources

- [AWS KMS Best Practices](https://docs.aws.amazon.com/kms/latest/developerguide/best-practices.html)
- [Sentry Security](https://docs.sentry.io/security/)
- [EKS IRSA](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html)

---

**Security Note**: Always follow your organization's security policies and compliance requirements.
