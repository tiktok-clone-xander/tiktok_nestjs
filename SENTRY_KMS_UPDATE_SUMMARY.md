# 🔐 Sentry + KMS Security Update - Summary

## ✅ Hoàn thành

Đã cập nhật cấu hình Sentry với bảo mật cấp production:

### 1. ⚙️ Environment Restriction

**Sentry CHỈ chạy trên staging và production:**

| Environment             | Sentry | Lý do                                      |
| ----------------------- | ------ | ------------------------------------------ |
| `local` / `development` | ❌ TẮT | Debug thủ công, không gọi external service |
| `staging`               | ✅ BẬT | Test với real errors                       |
| `production`            | ✅ BẬT | Full error tracking với KMS encryption     |

### 2. 🔐 KMS Encryption

**DSN được mã hóa bằng AWS KMS:**

- ✅ DSN không bao giờ được lưu dạng plaintext trong production
- ✅ Tự động decrypt khi service khởi động
- ✅ Sử dụng AWS KMS để quản lý keys
- ✅ Graceful degradation nếu KMS không available

### 3. 📁 Files mới

**KMS Service:**

- `libs/common/src/kms/kms.service.ts` - AWS KMS encryption/decryption
- `libs/common/src/kms/kms.module.ts` - KMS module
- `libs/common/src/kms/index.ts` - Exports

**Updated Files:**

- `libs/common/src/sentry/sentry.service.ts` - Added KMS integration
- `libs/common/src/sentry/sentry.module.ts` - Import KmsModule
- All `main.ts` files - Async Sentry initialization

**Scripts:**

- `scripts/encrypt-sentry-dsn.js` - Encrypt DSN với KMS
- `scripts/decrypt-sentry-dsn.js` - Decrypt DSN để verify

**Documentation:**

- `docs/SENTRY_KMS_SECURITY.md` - Chi tiết setup KMS
- Updated `SENTRY_CONFIGURATION_SUMMARY.md`

### 4. 📦 Dependencies

```bash
npm install aws-sdk  # ✅ Đã cài
```

## 🚀 Cách sử dụng

### Development (Local)

**Không cần làm gì!** Sentry tự động TẮT.

```bash
npm run start:gateway
# Log: "Sentry disabled in local/development environment"
```

### Staging/Production

#### Bước 1: Tạo KMS Key

```bash
aws kms create-key --description "Sentry DSN Encryption"
# Lưu KeyId: arn:aws:kms:ap-southeast-1:xxx:key/xxx
```

#### Bước 2: Lấy Sentry DSN

1. Vào https://sentry.io
2. Tạo project
3. Copy DSN: `https://key@o123456.ingest.sentry.io/project`

#### Bước 3: Encrypt DSN

```bash
node scripts/encrypt-sentry-dsn.js \
  "https://your-key@sentry.io/project" \
  "arn:aws:kms:ap-southeast-1:xxx:key/xxx"

# Output: Base64 encrypted string
# AQICAHiXXXXXXXXXXXXXXXXX...
```

#### Bước 4: Cấu hình Environment

**.env.production:**

```env
NODE_ENV=production

# Sentry - PHẢI mã hóa bằng KMS
SENTRY_DSN=AQICAHiXXXXXXXXXXXXX...

# AWS KMS - BẮT BUỘC
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=AKIAXXXXX
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_KMS_KEY_ID=arn:aws:kms:region:account:key/xxx
```

#### Bước 5: Deploy

**Docker:**

```yaml
services:
  api-gateway:
    environment:
      - NODE_ENV=production
      - SENTRY_DSN=${SENTRY_DSN_ENCRYPTED}
      - AWS_REGION=ap-southeast-1
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
```

**Kubernetes:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: sentry-secret
data:
  sentry-dsn: QVFJQxxxxxxx # Base64 của encrypted DSN
---
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
        - env:
            - name: SENTRY_DSN
              valueFrom:
                secretKeyRef:
                  name: sentry-secret
                  key: sentry-dsn
```

## 🔍 Verification

Khi service khởi động, check logs:

**Development:**

```
[SentryService] Sentry disabled in local/development environment
```

**Production:**

```
[KmsService] KMS initialized for region: ap-southeast-1
[SentryService] Decrypting Sentry DSN with KMS...
[SentryService] Sentry DSN decrypted successfully
[SentryService] Sentry initialized for api-gateway in production environment
🐛 Sentry error tracking: enabled
```

## 🔐 Security Best Practices

### ✅ PHẢI LÀM

1. **Mã hóa DSN trong production**: Luôn sử dụng KMS
2. **Tách KMS keys theo env**: Key riêng cho staging/production
3. **Sử dụng IAM roles**: Ưu tiên IRSA thay vì access keys trong K8s
4. **Rotate keys định kỳ**: 90 ngày/lần
5. **Enable CloudTrail**: Audit logs cho KMS operations

### ❌ KHÔNG ĐƯỢC

1. ❌ Commit encrypted values vào git
2. ❌ Share KMS keys giữa các environments
3. ❌ Hardcode credentials
4. ❌ Disable KMS trong production
5. ❌ Log decrypted values

## 📚 Documentation

Chi tiết xem tại:

- 🔐 [SENTRY_KMS_SECURITY.md](docs/SENTRY_KMS_SECURITY.md) - KMS setup hoàn chỉnh
- 📋 [SENTRY_CONFIGURATION_SUMMARY.md](SENTRY_CONFIGURATION_SUMMARY.md) - Tổng quan
- 📖 [SENTRY_SETUP.md](docs/SENTRY_SETUP.md) - General setup
- ⚡ [SENTRY_QUICK_REFERENCE.md](docs/SENTRY_QUICK_REFERENCE.md) - Quick reference

## 🆘 Troubleshooting

### "Failed to decrypt secret with KMS"

**Nguyên nhân:**

- KMS key sai
- IAM permissions không đủ
- AWS region sai
- Encrypted value không hợp lệ

**Giải pháp:**

```bash
# Verify key exists
aws kms describe-key --key-id <key-id>

# Test decrypt
aws kms decrypt --ciphertext-blob fileb://encrypted.bin

# Check permissions
aws iam simulate-principal-policy \
  --policy-source-arn <role-arn> \
  --action-names kms:Decrypt
```

### "Sentry disabled in local/development"

**Đây là behavior đúng!** Development không cần Sentry.

### KMS Not Available

Service sẽ log warning và continue (graceful degradation).

## ✅ Checklist cho Production

Trước khi deploy production:

- [ ] Tạo KMS key trong AWS
- [ ] Encrypt Sentry DSN với KMS
- [ ] Set `NODE_ENV=production`
- [ ] Configure AWS credentials (prefer IAM roles)
- [ ] Test KMS decryption
- [ ] Verify Sentry initialization trong logs
- [ ] Setup CloudWatch alarms cho KMS failures
- [ ] Document KMS key ID và recovery procedures
- [ ] Configure IAM policies với least privilege
- [ ] Enable CloudTrail cho audit logs

## 🎉 Kết luận

Sentry đã được cấu hình với:

- ✅ Environment restriction (chỉ staging/production)
- ✅ KMS encryption cho DSN
- ✅ Automatic decryption
- ✅ Graceful degradation
- ✅ Production-ready security
- ✅ Complete documentation

**Local development**: Thoải mái debug không lo Sentry gửi errors
**Production**: An toàn với KMS encryption và proper error tracking

---

**Questions?** Check documentation hoặc contact DevOps team.
