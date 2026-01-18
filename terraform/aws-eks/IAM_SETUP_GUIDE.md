# 🔐 IAM Setup Guide - Least Privilege Permissions

Thay vì dùng Managed Policies với FullAccess, hãy tạo custom policy với quyền tối thiểu.

---

## 📋 Bước 1: Tạo IAM User cho Terraform

### AWS Console

1. Vào **IAM Console** → **Users** → **Create user**
2. Username: `terraform-eks-deployer`
3. **Không** tick "Provide user access to AWS Management Console"
4. Next

---

## 📋 Bước 2: Tạo Custom Policy

### Option A: Dùng AWS Console

1. **IAM** → **Policies** → **Create policy**
2. Tab **JSON** → Copy nội dung từ file `iam-policy.json`
3. Next
4. Policy name: `TerraformEKSDeployPolicy`
5. Description: `Minimal permissions for EKS + VPC + IAM deployment via Terraform`
6. **Create policy**

### Option B: Dùng AWS CLI

```bash
aws iam create-policy \
  --policy-name TerraformEKSDeployPolicy \
  --policy-document file://iam-policy.json \
  --description "Minimal permissions for EKS deployment"
```

---

## 📋 Bước 3: Attach Policy vào User

### AWS Console

1. **IAM** → **Users** → `terraform-eks-deployer`
2. **Add permissions** → **Attach policies directly**
3. Search: `TerraformEKSDeployPolicy`
4. Tick ✅ → **Next** → **Add permissions**

### AWS CLI

```bash
# Lấy Policy ARN
POLICY_ARN=$(aws iam list-policies --query "Policies[?PolicyName=='TerraformEKSDeployPolicy'].Arn" --output text)

# Attach vào user
aws iam attach-user-policy \
  --user-name terraform-eks-deployer \
  --policy-arn $POLICY_ARN
```

---

## 📋 Bước 4: Tạo Access Keys

### AWS Console

1. **IAM** → **Users** → `terraform-eks-deployer`
2. **Security credentials** tab
3. **Create access key**
4. Use case: **Application running outside AWS** (hoặc **CLI**)
5. Next → **Create access key**
6. **Download .csv** hoặc copy:
   - Access Key ID
   - Secret Access Key

⚠️ **LƯU Ý**: Secret key chỉ hiện 1 lần duy nhất!

---

## 📋 Bước 5: Configure Secrets

### GitHub Secrets

Vào **GitHub repo** → **Settings** → **Secrets and variables** → **Actions**:

| Secret Name             | Value                |
| ----------------------- | -------------------- |
| `AWS_ACCESS_KEY_ID`     | Access Key từ bước 4 |
| `AWS_SECRET_ACCESS_KEY` | Secret Key từ bước 4 |

### Local Development (optional)

```bash
aws configure --profile terraform-eks
# AWS Access Key ID: <paste>
# AWS Secret Access Key: <paste>
# Default region: us-east-1
# Default output format: json
```

Update `terraform.tfvars`:

```hcl
aws_profile = "terraform-eks"
```

---

## ✅ Verify Permissions

Test xem user có đủ quyền không:

```bash
# Test EKS permissions
aws eks list-clusters --region us-east-1

# Test EC2 permissions
aws ec2 describe-vpcs --region us-east-1

# Test IAM permissions
aws iam list-roles --max-items 1
```

Nếu không có lỗi `AccessDenied` → ✅ Setup thành công!

---

## 🔒 Security Best Practices

### 1. Least Privilege

Policy này chỉ có quyền **cần thiết** để chạy Terraform, không có quyền:

- ❌ DeleteAccount
- ❌ Access to S3/RDS (trừ khi bạn thêm)
- ❌ Billing/Cost management

### 2. Rotate Access Keys định kỳ

```bash
# Tạo key mới
aws iam create-access-key --user-name terraform-eks-deployer

# Xóa key cũ (sau khi update secret)
aws iam delete-access-key \
  --user-name terraform-eks-deployer \
  --access-key-id <OLD_KEY_ID>
```

### 3. Enable MFA (khuyến khích)

Cho IAM user nếu dùng AWS Console

### 4. Audit CloudTrail logs

Check những gì user làm:

```bash
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=Username,AttributeValue=terraform-eks-deployer \
  --max-results 10
```

---

## 📊 So sánh với Managed Policies

| Permission | Managed Policy                       | Custom Policy        |
| ---------- | ------------------------------------ | -------------------- |
| **EKS**    | `AmazonEKSFullAccess` (110 actions)  | 27 actions cụ thể    |
| **VPC**    | `AmazonVPCFullAccess` (150+ actions) | 38 actions cần thiết |
| **IAM**    | `IAMFullAccess` (200+ actions)       | 26 actions cho IRSA  |
| **EC2**    | `AmazonEC2FullAccess` (400+ actions) | 22 actions cho nodes |

→ Giảm ~90% attack surface! 🔐

---

## ❓ FAQ

**Q: Policy này có đủ để chạy Terraform không?**
A: Có, đủ để:

- Tạo VPC, Subnets, NAT Gateway
- Tạo EKS Cluster + Node Groups
- Tạo IAM Roles cho IRSA
- Tạo ALB Ingress Controller
- Tạo CloudWatch Log Groups

**Q: Nếu thiếu quyền thì sao?**
A: Terraform sẽ báo lỗi `AccessDenied` với action cụ thể. Add action đó vào policy.

**Q: Có thể restrictive hơn không?**
A: Có, bạn có thể thêm `Condition` để giới hạn theo:

- Region: `"StringEquals": {"aws:RequestedRegion": "ap-southeast-1"}`
- Tags: `"StringEquals": {"aws:ResourceTag/Project": "tiktok-clone"}`

---

## 🆘 Troubleshooting

### Error: "is not authorized to perform: eks:CreateCluster"

```bash
# Check policy đã attach chưa
aws iam list-attached-user-policies --user-name terraform-eks-deployer

# Nếu chưa có, attach lại
aws iam attach-user-policy \
  --user-name terraform-eks-deployer \
  --policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/TerraformEKSDeployPolicy
```

### Error: "Access Denied" trong Terraform

1. Check AWS credentials đúng chưa:

   ```bash
   aws sts get-caller-identity
   ```

2. Check policy document có action thiếu không:

   ```bash
   aws iam get-policy-version \
     --policy-arn <POLICY_ARN> \
     --version-id v1 \
     --query 'PolicyVersion.Document' \
     --output json
   ```

3. Thêm action thiếu vào `iam-policy.json` và update:
   ```bash
   aws iam create-policy-version \
     --policy-arn <POLICY_ARN> \
     --policy-document file://iam-policy.json \
     --set-as-default
   ```

---

**Happy secure deploying! 🔐**
