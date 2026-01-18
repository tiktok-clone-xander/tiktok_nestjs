# First Time Setup - Remote State Backend

This guide is for the **first time setup only**. After this, everything is automatic.

## 🎯 Quick Setup (2 minutes)

Run this **one time** to create the S3 backend:

```bash
cd terraform/aws-eks
./../../scripts/setup-production-backend.ps1
```

That's it! The script will:

1. ✅ Create S3 bucket for state storage
2. ✅ Enable versioning & encryption
3. ✅ Create DynamoDB table for locking
4. ✅ Migrate local state to S3

## 📋 What This Sets Up

**S3 Bucket:** `tiktok-clone-terraform-state`

- Encryption: AES256
- Versioning: Enabled
- Public Access: Blocked

**DynamoDB Table:** `terraform-state-locks`

- Purpose: Prevent concurrent terraform runs
- Cost: ~$0/month (on-demand)

**Total Cost:** < $0.10/month

## ✅ After Setup

**All operations automatically use remote state:**

```bash
# Plan - reads from S3
terraform plan

# Apply - saves to S3
terraform apply

# Destroy - uses S3 state
terraform destroy
```

**GitHub Actions workflows automatically:**

- Check if backend exists
- Create if missing
- Use remote state for all operations

## 🔒 Benefits

| Feature                     | Without Backend          | With Backend       |
| --------------------------- | ------------------------ | ------------------ |
| **State Storage**           | Local (lost on redeploy) | S3 (permanent)     |
| **"Already exists" errors** | ❌ Common                | ✅ Never           |
| **Team collaboration**      | ❌ Manual sync           | ✅ Automatic       |
| **State history**           | ❌ None                  | ✅ Versioned       |
| **Concurrent protection**   | ❌ Conflicts             | ✅ Locked          |
| **CI/CD support**           | ❌ Breaks                | ✅ Works perfectly |

## 🚀 Verify Setup

```bash
# Check backend is configured
cd terraform/aws-eks
terraform init

# Should show:
# Initializing the backend...
# Successfully configured the backend "s3"!

# Verify state is in S3
aws s3 ls s3://tiktok-clone-terraform-state/eks/
```

## 💡 How It Works

1. **First Run:** Workflow detects no backend → creates it automatically
2. **Subsequent Runs:** Workflow uses existing backend
3. **State:** Always synced across all environments
4. **Locking:** DynamoDB prevents conflicts

## 🐛 Troubleshooting

### "Backend already exists" warning

This is OK! It means setup is complete.

### State lock error

```bash
terraform force-unlock <LOCK_ID>
```

### Lost state

S3 versioning lets you restore:

```bash
aws s3api list-object-versions \
  --bucket tiktok-clone-terraform-state \
  --prefix eks/terraform.tfstate
```

## 📚 Learn More

- [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) - Detailed guide
- [Terraform S3 Backend Docs](https://www.terraform.io/docs/backends/types/s3.html)

---

**That's all!** After this one-time setup, everything works automatically. 🎉
