# 🚀 TikTok Clone - AWS EKS Deployment

Deploy your TikTok Clone backend to AWS EKS with **~$130-140/month** cost!

## 💰 Cost Breakdown

| Resource          | Monthly Cost  |
| ----------------- | ------------- |
| EKS Cluster       | ~$72          |
| 2x t3.medium SPOT | ~$18          |
| NAT Gateway       | ~$32          |
| EBS Storage       | ~$3.50        |
| Data Transfer     | ~$5-10        |
| **TOTAL**         | **~$130-140** |

> With $199 budget, you have ~$60 buffer! 🎉

---

## ⚡ Quick Start (5 Minutes)

### Prerequisites

```powershell
# 1. Install tools
choco install awscli terraform kubernetes-cli kubernetes-helm -y

# 2. Configure AWS
aws configure
```

### Deploy

```powershell
# 1. Clone & navigate
cd terraform/aws-eks

# 2. Setup variables
Copy-Item terraform.tfvars.example terraform.tfvars
notepad terraform.tfvars  # Edit with your values

# 3. Deploy!
terraform init
terraform apply
```

### Or Use Script

```powershell
.\scripts\deploy-eks.ps1 -Action deploy
```

---

## 🎯 After Deployment

```powershell
# Get kubeconfig
aws eks update-kubeconfig --region us-east-1 --name tiktok-clone-eks

# Check pods
kubectl get pods -n tiktok-clone-prod

# Get ALB URL
kubectl get ingress -n tiktok-clone-prod

# Test API
curl http://<ALB_URL>/health
```

---

## 📁 Files Structure

```
terraform/aws-eks/
├── versions.tf        # Terraform version
├── providers.tf       # AWS/K8s providers
├── variables.tf       # Input variables
├── vpc.tf             # VPC & networking
├── eks.tf             # EKS cluster
├── ecr.tf             # Container registry
├── kubernetes.tf      # Helm deployments
├── outputs.tf         # Outputs
└── terraform.tfvars.example
```

---

## 🔐 Required Secrets

| Secret           | Description         |
| ---------------- | ------------------- |
| `db_password`    | PostgreSQL password |
| `redis_password` | Redis password      |
| `ghcr_token`     | GitHub PAT for GHCR |

---

## 🧹 Cleanup (Stop Billing)

```powershell
cd terraform/aws-eks
terraform destroy
```

---

## 📚 Documentation

- [Full EKS Guide](./terraform/aws-eks/README.md)
- [Helm Charts](./helm/tiktok-clone/README.md)
- [CI/CD Pipeline](./docs/CICD_GUIDE.md)

---

Happy deploying! 🚀
