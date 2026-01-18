# TikTok Clone - AWS EKS Deployment Guide

## 📋 Prerequisites

1. **AWS CLI** configured with credentials

   ```bash
   aws configure
   # Or set environment variables:
   export AWS_ACCESS_KEY_ID="your-key"
   export AWS_SECRET_ACCESS_KEY="your-secret"
   export AWS_DEFAULT_REGION="us-east-1"
   ```

2. **Terraform** >= 1.5.0

   ```bash
   # Windows (Chocolatey)
   choco install terraform

   # Or download from: https://terraform.io/downloads
   ```

3. **kubectl**

   ```bash
   # Windows
   choco install kubernetes-cli
   ```

4. **Helm** >= 3.0

   ```bash
   choco install kubernetes-helm
   ```

5. **GitHub Personal Access Token** (for GHCR)
   - Go to: https://github.com/settings/tokens
   - Create token with `read:packages` scope

---

## 💰 Cost Estimation (~$130-140/month)

| Resource                | Cost/Month         |
| ----------------------- | ------------------ |
| EKS Cluster             | ~$72 (fixed)       |
| 2x t3.medium SPOT nodes | ~$18 (70% savings) |
| NAT Gateway (1 AZ)      | ~$32               |
| EBS Storage (35GB)      | ~$3.50             |
| Data Transfer           | ~$5-10             |
| **TOTAL**               | **~$130-140**      |

> 💡 With $199 budget, you have ~$60 buffer for traffic spikes!

---

## 🚀 Quick Start

### Step 1: Configure Variables

```powershell
cd terraform/aws-eks

# Copy example file
Copy-Item terraform.tfvars.example terraform.tfvars

# Edit with your values
notepad terraform.tfvars
```

**Required changes in `terraform.tfvars`:**

```hcl
db_password    = "YourSecureDbPassword123!"
redis_password = "YourSecureRedisPassword123!"
ghcr_token     = "ghp_xxxxxxxxxxxxxxxxxxxx"
```

### Step 2: Initialize Terraform

```powershell
terraform init
```

### Step 3: Plan & Review

```powershell
terraform plan -out=tfplan
```

### Step 4: Deploy! 🚀

```powershell
terraform apply tfplan
```

> ⏱️ First deployment takes ~15-20 minutes

### Step 5: Configure kubectl

```powershell
# Get the command from output
terraform output configure_kubectl

# Run it:
aws eks update-kubeconfig --region us-east-1 --name tiktok-clone-eks
```

### Step 6: Verify Deployment

```powershell
# Check nodes
kubectl get nodes

# Check pods
kubectl get pods -n tiktok-clone-prod

# Check services
kubectl get svc -n tiktok-clone-prod

# Get ALB URL
kubectl get ingress -n tiktok-clone-prod
```

---

## 📦 Architecture

```
                    ┌─────────────────────────────────────────────────┐
                    │                  AWS Cloud                       │
                    │  ┌───────────────────────────────────────────┐  │
                    │  │              VPC (10.0.0.0/16)             │  │
                    │  │                                            │  │
Internet ─────────► │  │  ┌──────────────┐    ┌──────────────┐     │  │
                    │  │  │ Public Subnet │    │ Public Subnet │    │  │
                    │  │  │   (AZ-1a)     │    │   (AZ-1b)     │    │  │
                    │  │  │     ALB       │    │               │    │  │
                    │  │  └──────┬────────┘    └───────────────┘    │  │
                    │  │         │                                   │  │
                    │  │         ▼            NAT Gateway            │  │
                    │  │  ┌──────────────┐    ┌──────────────┐      │  │
                    │  │  │Private Subnet│    │Private Subnet│      │  │
                    │  │  │   (AZ-1a)    │    │   (AZ-1b)    │      │  │
                    │  │  │              │    │              │      │  │
                    │  │  │ ┌──────────────────────────────┐│      │  │
                    │  │  │ │         EKS Cluster          ││      │  │
                    │  │  │ │                              ││      │  │
                    │  │  │ │  ┌─────────┐ ┌─────────┐    ││      │  │
                    │  │  │ │  │API GW   │ │Auth Svc │    ││      │  │
                    │  │  │ │  └─────────┘ └─────────┘    ││      │  │
                    │  │  │ │  ┌─────────┐ ┌─────────┐    ││      │  │
                    │  │  │ │  │Video Svc│ │Inter.Svc│    ││      │  │
                    │  │  │ │  └─────────┘ └─────────┘    ││      │  │
                    │  │  │ │  ┌─────────┐                ││      │  │
                    │  │  │ │  │Notif Svc│                ││      │  │
                    │  │  │ │  └─────────┘                ││      │  │
                    │  │  │ │                              ││      │  │
                    │  │  │ │  ┌────────┐ ┌─────┐ ┌─────┐ ││      │  │
                    │  │  │ │  │Postgres│ │Redis│ │Kafka│ ││      │  │
                    │  │  │ │  └────────┘ └─────┘ └─────┘ ││      │  │
                    │  │  │ └──────────────────────────────┘│      │  │
                    │  │  └──────────────┘    └──────────────┘      │  │
                    │  └───────────────────────────────────────────┘  │
                    └─────────────────────────────────────────────────┘
```

---

## 🔧 Common Operations

### Scale nodes

```powershell
# Edit node group
kubectl scale deployment api-gateway --replicas=3 -n tiktok-clone-prod
```

### View logs

```powershell
kubectl logs -f deployment/api-gateway -n tiktok-clone-prod
```

### Port forward for debugging

```powershell
kubectl port-forward svc/api-gateway 4000:4000 -n tiktok-clone-prod
```

### Update application

```powershell
# Update Helm release
helm upgrade tiktok-clone ./helm/tiktok-clone -n tiktok-clone-prod
```

---

## 🧹 Cleanup (Save Money!)

```powershell
# Destroy everything
terraform destroy

# Or scale down to 0 nodes (keeps cluster)
# Edit terraform.tfvars:
# desired_size = 0
# min_size = 0
terraform apply
```

---

## 🆘 Troubleshooting

### Pods not starting

```powershell
kubectl describe pod <pod-name> -n tiktok-clone-prod
kubectl logs <pod-name> -n tiktok-clone-prod
```

### Image pull errors

```powershell
# Check GHCR secret
kubectl get secret ghcr-secret -n tiktok-clone-prod -o yaml

# Recreate secret
kubectl delete secret ghcr-secret -n tiktok-clone-prod
terraform apply
```

### Node issues

```powershell
kubectl describe node <node-name>
kubectl get events --sort-by='.lastTimestamp'
```

---

## 📚 Files Structure

```
terraform/aws-eks/
├── versions.tf           # Terraform & provider versions
├── providers.tf          # AWS, Kubernetes, Helm providers
├── variables.tf          # All input variables
├── vpc.tf                # VPC, subnets, NAT gateway
├── eks.tf                # EKS cluster & node groups
├── ecr.tf                # Container registry (optional)
├── kubernetes.tf         # Helm releases & K8s resources
├── outputs.tf            # Output values
├── terraform.tfvars.example  # Example variables file
└── README.md             # This file
```

---

## 🔐 Security Notes

1. **Never commit** `terraform.tfvars` to git
2. Use **AWS Secrets Manager** for production secrets
3. Enable **AWS CloudTrail** for audit logging
4. Configure **Security Groups** properly
5. Use **Private subnets** for all workloads

---

Happy deploying! 🚀
