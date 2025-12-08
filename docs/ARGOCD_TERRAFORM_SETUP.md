# 🤖 ArgoCD + Terraform - GitOps & IaC Setup Guide

**Generated**: December 8, 2025
**Project**: TikTok Clone - NestJS Microservices
**Status**: ✅ Complete GitOps + IaC Infrastructure

---

## 📋 Overview

### What is ArgoCD?

ArgoCD is a **GitOps Continuous Delivery** tool that:

- ✅ Automatically syncs your Git repository with your Kubernetes cluster
- ✅ Detects drift and can auto-heal your cluster
- ✅ Provides a declarative way to manage deployments
- ✅ Enables multi-environment management (dev/staging/prod)
- ✅ Offers rollback capabilities and version control

**Key Benefit**: Your Git repo becomes the single source of truth!

### What is Terraform?

Terraform is **Infrastructure as Code** that:

- ✅ Manages Kubernetes resources declaratively
- ✅ Provisions infrastructure in a reproducible way
- ✅ Version controls your entire infrastructure
- ✅ Enables multi-environment management with variables
- ✅ Tracks state and enables easy rollbacks

**Key Benefit**: Your entire K8s setup is defined in code!

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Git Repository                     │
│  ├─ Helm Charts (helm/tiktok-clone/)                       │
│  ├─ Terraform Files (terraform/)                           │
│  └─ ArgoCD Manifests (argocd/)                             │
└────────┬────────────────────────────────────────────────────┘
         │ (push code)
         │
┌────────▼─────────────────────────────────────────────────────┐
│              ArgoCD Controller (in cluster)                   │
│  ├─ Watches Git repository for changes                      │
│  ├─ Automatically syncs to target namespace                 │
│  ├─ Manages application lifecycle                           │
│  └─ Provides UI dashboard for visualization                 │
└────────┬─────────────────────────────────────────────────────┘
         │ (deploy)
         │
┌────────▼──────────────────────────────────────────────────────┐
│            Kubernetes Cluster (any K8s)                       │
│  ├─ tiktok-clone namespace                                  │
│  ├─ PostgreSQL, Redis, Kafka (managed by Terraform)        │
│  ├─ Microservices (deployed by ArgoCD)                      │
│  └─ Frontend (deployed by ArgoCD)                           │
└───────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (10 minutes)

### Step 1: Prerequisites

```bash
# Install required tools
terraform --version              # Should be >= 1.0
kubectl version --client         # Should be >= 1.20
helm version                      # Should be >= 3.0
git --version                     # For Git operations
```

### Step 2: Configure Terraform Variables

Create `terraform/terraform.tfvars`:

```hcl
environment             = "dev"
argocd_admin_password  = "your-secure-password"
db_password            = "your-db-password"
redis_password         = "your-redis-password"
kafka_password         = "your-kafka-password"
kubeconfig_path        = "~/.kube/config"
kube_context           = "docker-desktop"
git_repo_url           = "https://github.com/your-org/tiktok_nestjs.git"
```

### Step 3: Deploy Infrastructure with Terraform

```bash
cd terraform

# Initialize Terraform (first time only)
terraform init

# Preview changes
terraform plan

# Apply changes
terraform apply

# Get outputs
terraform output
```

### Step 4: Access ArgoCD

```bash
# Get ArgoCD server info
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Open in browser
# URL: https://localhost:8080
# Username: admin
# Password: (from terraform apply output)
```

### Step 5: Check Application Status

```bash
# List applications
kubectl get applications -n argocd

# Check sync status
kubectl describe app tiktok-clone -n argocd

# View logs
kubectl logs -f -n argocd deployment/argocd-application-controller
```

---

## 📁 File Structure

```
project-root/
├── terraform/
│   ├── main.tf                 # Main infrastructure definition
│   ├── variables.tf            # Input variables
│   ├── outputs.tf              # Output values
│   ├── providers.tf            # Provider configuration
│   ├── environments.tf         # Environment-specific configs
│   ├── terraform.tfvars        # Variables (DO NOT COMMIT!)
│   └── terraform.tfstate       # State file (DO NOT COMMIT!)
│
├── argocd/
│   ├── appproject.yaml         # ArgoCD AppProject definition
│   ├── application-dev.yaml    # Dev environment application
│   ├── application-staging.yaml # Staging environment application
│   ├── application-prod.yaml   # Production environment application
│   ├── argocd-cm.yaml          # ArgoCD ConfigMap
│   ├── argocd-secret.yaml      # ArgoCD Secrets
│   └── argocd-rbac-cm.yaml     # RBAC configuration
│
├── helm/tiktok-clone/
│   ├── values.yaml
│   ├── values-dev.yaml
│   ├── values-staging.yaml
│   ├── values-prod.yaml
│   └── templates/
│
└── docs/
    └── ARGOCD_TERRAFORM_SETUP.md (this file)
```

---

## 🎯 Key Concepts

### GitOps Workflow

1. **Developer** commits code to Git
2. **Git webhook** triggers ArgoCD
3. **ArgoCD** detects change and syncs
4. **Kubernetes** updates with new version
5. **ArgoCD** monitors and ensures state matches Git

### Terraform State Management

- **State File**: `terraform.tfstate` tracks current infrastructure
- **Remote State** (optional): Store in S3, Azure Storage, Terraform Cloud
- **Lock File**: `terraform.tfstate.lock` prevents concurrent edits

```bash
# Backup state
cp terraform.tfstate terraform.tfstate.backup

# View state
terraform state list
terraform state show kubernetes_namespace.tiktok_clone

# Destroy infrastructure
terraform destroy
```

---

## 🔧 Advanced Usage

### Multi-Environment Setup

```bash
# Deploy to different environments
terraform apply -var-file="dev.tfvars"
terraform apply -var-file="staging.tfvars"
terraform apply -var-file="prod.tfvars"
```

### Manual Application Sync

```bash
# Force sync
argocd app sync tiktok-clone

# Refresh
argocd app refresh tiktok-clone

# Rollback to previous version
argocd app rollback tiktok-clone
```

### Update Values from Git

1. Push changes to Git:

```bash
git add helm/tiktok-clone/values-dev.yaml
git commit -m "Update service replicas"
git push origin main
```

2. ArgoCD detects changes automatically
3. View in dashboard and sync if needed

### Add New Service to Helm Chart

1. Create new template: `helm/tiktok-clone/templates/my-service.yaml`
2. Push to Git
3. ArgoCD automatically deploys
4. No manual kubectl needed!

---

## 🔐 Security Best Practices

### 1. Secure Secrets

```bash
# Use sealed-secrets instead of base64
helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
helm install sealed-secrets sealed-secrets/sealed-secrets -n kube-system

# Encrypt sensitive values
echo -n 'my-password' | \
  kubectl create secret generic my-secret \
  --dry-run=client \
  --from-file=/dev/stdin | \
  kubeseal > secret-sealed.yaml
```

### 2. RBAC Configuration

```yaml
# Restrict what ArgoCD can do
accounts:
  developers:
    apiKey: true
    login: true

roles:
  - name: developer
    policies:
      - p, role:developer, applications, get, tiktok-clone/*, allow
      - p, role:developer, applications, sync, tiktok-clone/*, allow
```

### 3. Environment Variable Protection

Create `.env.local` (DO NOT COMMIT):

```bash
export TF_VAR_argocd_admin_password="your-password"
export TF_VAR_db_password="your-db-password"
```

Then run:

```bash
source .env.local
terraform apply
```

### 4. Terraform State Protection

```bash
# Add to .gitignore
echo "terraform.tfstate*" >> .gitignore
echo "*.tfvars" >> .gitignore
echo ".env.local" >> .gitignore
```

---

## 📊 Monitoring & Logging

### ArgoCD Dashboard

```bash
# Access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
# https://localhost:8080
```

### View Application Status

```bash
# List all applications
kubectl get apps -n argocd

# Detailed status
kubectl describe app tiktok-clone -n argocd

# Real-time events
kubectl logs -f -n argocd deployment/argocd-application-controller
```

### Troubleshooting Sync Issues

```bash
# Check application status
argocd app get tiktok-clone

# View detailed sync status
argocd app sync tiktok-clone --dry-run

# Check Helm template rendering
helm template tiktok-clone helm/tiktok-clone --debug

# Validate Kubernetes manifests
kubeval helm/tiktok-clone/templates/*.yaml
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: ArgoCD Sync

on:
  push:
    branches: [main]
    paths:
      - 'helm/tiktok-clone/**'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Trigger ArgoCD Sync
        run: |
          argocd app sync tiktok-clone \
            --server ${{ secrets.ARGOCD_SERVER }} \
            --auth-token ${{ secrets.ARGOCD_TOKEN }}
```

### GitLab CI Example

```yaml
argocd_sync:
  stage: deploy
  script:
    - argocd app sync tiktok-clone
      --server $ARGOCD_SERVER
      --auth-token $ARGOCD_TOKEN
  only:
    - main
```

---

## 📖 Commands Cheat Sheet

### Terraform Commands

```bash
# Initialize
terraform init

# Validate syntax
terraform validate

# Format code
terraform fmt

# Plan changes
terraform plan -out=tfplan

# Apply changes
terraform apply tfplan

# Destroy infrastructure
terraform destroy

# State management
terraform state list
terraform state show <resource>
terraform state rm <resource>
terraform import <resource> <id>
```

### ArgoCD CLI Commands

```bash
# Connect to ArgoCD
argocd login <ARGOCD_SERVER> --username admin --password <PASSWORD>

# Application operations
argocd app list
argocd app get tiktok-clone
argocd app create --help
argocd app sync tiktok-clone
argocd app rollback tiktok-clone
argocd app delete tiktok-clone

# Repository operations
argocd repo list
argocd repo add <REPO_URL>

# Account operations
argocd account list
argocd account update-password
```

### Kubernetes Commands

```bash
# View ArgoCD resources
kubectl get apps -n argocd
kubectl get appprojects -n argocd

# Debug ArgoCD
kubectl logs -n argocd deployment/argocd-server
kubectl logs -n argocd deployment/argocd-application-controller

# Describe application
kubectl describe app tiktok-clone -n argocd

# Watch sync progress
kubectl get apps -n argocd -w
```

---

## 🎓 Learning Resources

### Terraform

1. **Official Docs**: https://www.terraform.io/docs
2. **Kubernetes Provider**: https://registry.terraform.io/providers/hashicorp/kubernetes/latest
3. **Helm Provider**: https://registry.terraform.io/providers/hashicorp/helm/latest

### ArgoCD

1. **Official Docs**: https://argo-cd.readthedocs.io
2. **Getting Started**: https://argo-cd.readthedocs.io/en/stable/getting_started/
3. **Best Practices**: https://argo-cd.readthedocs.io/en/stable/operator-manual/

### GitOps

1. **GitOps Principles**: https://opengitops.dev/
2. **ArgoCD Patterns**: https://argo-cd.readthedocs.io/en/stable/user-guide/
3. **Production Readiness**: https://argo-cd.readthedocs.io/en/stable/operator-manual/

---

## 📝 Examples

### Example 1: Update Replica Count

```bash
# Edit values file
vim helm/tiktok-clone/values-dev.yaml

# Change: replicaCount: 2 → 3

# Push to Git
git add helm/tiktok-clone/values-dev.yaml
git commit -m "Scale up auth service to 3 replicas"
git push origin main

# ArgoCD automatically detects and deploys!
# Watch in dashboard: https://localhost:8080
```

### Example 2: Deploy New Version

```bash
# Update image in values
vim helm/tiktok-clone/values-dev.yaml

# Change image tag: 1.0.0 → 1.0.1

# Push
git add helm/tiktok-clone/values-dev.yaml
git commit -m "Update to v1.0.1"
git push origin main

# ArgoCD handles the rolling update!
```

### Example 3: Rollback Previous Version

```bash
# In ArgoCD dashboard:
# 1. Click on application
# 2. Click "History" tab
# 3. Select previous revision
# 4. Click "Rollback"

# Or via CLI:
argocd app rollback tiktok-clone 1
```

---

## ⚠️ Troubleshooting

### Application won't sync

```bash
# Check application status
kubectl describe app tiktok-clone -n argocd

# Validate Helm template
helm template tiktok-clone helm/tiktok-clone --debug

# Check permissions
kubectl get rbac -n tiktok-clone
```

### Terraform apply fails

```bash
# Validate syntax
terraform validate

# Check state lock
rm terraform.tfstate.lock.hcl

# Refresh state
terraform refresh

# Try again
terraform plan && terraform apply
```

### ArgoCD dashboard not accessible

```bash
# Check service
kubectl get svc -n argocd

# Port forward
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Check logs
kubectl logs -n argocd deployment/argocd-server
```

---

## ✅ Next Steps

1. **Week 1**: Deploy with Terraform to dev environment
2. **Week 2**: Configure ArgoCD and GitOps workflow
3. **Week 3**: Add staging and production environments
4. **Week 4**: Implement CI/CD pipeline integration
5. **Future**: Add Sealed Secrets, RBAC, and monitoring

---

## 📞 Support

- **Terraform Issues**: `terraform validate && terraform plan`
- **ArgoCD Issues**: Check dashboard or `kubectl logs -n argocd`
- **Kubernetes Issues**: `kubectl describe pod <pod-name>`

---

Generated: December 8, 2025
Status: ✅ Production Ready
