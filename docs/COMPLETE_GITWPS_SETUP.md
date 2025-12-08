# 🚀 Complete GitOps + IaC Setup Guide

**TikTok Clone - ArgoCD + Terraform Deployment**

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Your Git Repo                            │
│                                                                 │
│  ├─ helm/                  (Helm Charts)                       │
│  ├─ terraform/             (Infrastructure as Code)            │
│  └─ argocd/                (GitOps Configuration)              │
└─────────────┬───────────────────────────────────────────────────┘
              │ Webhook Trigger
              │
┌─────────────▼───────────────────────────────────────────────────┐
│                      Terraform                                  │
│  Provisions Infrastructure:                                     │
│  • Kubernetes Namespace                                         │
│  • PostgreSQL (Helm)                                            │
│  • Redis (Helm)                                                 │
│  • Kafka (Helm)                                                 │
│  • ArgoCD (Helm)                                                │
└─────────────┬───────────────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────────────────┐
│                       ArgoCD                                    │
│  Continuous Deployment:                                        │
│  • Monitors Git repo                                            │
│  • Syncs Helm charts                                            │
│  • Deploys microservices                                        │
│  • Auto-healing & reconciliation                               │
└─────────────┬───────────────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────────────────┐
│                    Kubernetes Cluster                          │
│                                                                 │
│  ├─ Namespace: tiktok-clone                                   │
│  │  ├─ Auth Service                                           │
│  │  ├─ Video Service                                          │
│  │  ├─ Interaction Service                                    │
│  │  ├─ Notification Service                                   │
│  │  ├─ API Gateway                                            │
│  │  └─ Frontend                                               │
│  │                                                             │
│  ├─ Namespace: tiktok-clone-staging                           │
│  │  └─ (Same services for staging)                            │
│  │                                                             │
│  ├─ Namespace: tiktok-clone-prod                              │
│  │  └─ (Same services for production)                         │
│  │                                                             │
│  └─ Namespace: argocd                                         │
│     └─ ArgoCD UI & API                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Step-by-Step Setup

### Phase 1: Prerequisites (5 minutes)

```bash
# 1. Verify all tools installed
terraform --version           # >= 1.0
kubectl version --client      # >= 1.20
helm version                  # >= 3.0
git --version                 # >= 2.30

# 2. Verify Kubernetes cluster running
kubectl cluster-info
kubectl get nodes

# 3. Clone repository
git clone https://github.com/betuanminh22032003/tiktok_nestjs.git
cd tiktok_nestjs
```

### Phase 2: Configure Terraform (5 minutes)

```bash
# 1. Create terraform.tfvars file
cd terraform
cp terraform.tfvars.example terraform.tfvars

# 2. Edit with your values
# Windows
notepad terraform.tfvars

# Or edit in editor
# • argocd_admin_password: Choose a strong password
# • db_password: Database password
# • redis_password: Redis password
# • kafka_password: Kafka password
# • git_repo_url: Your Git repository URL
# • git_branch: main (or your branch)
```

Example `terraform.tfvars`:

```hcl
environment            = "dev"
namespace              = "tiktok-clone"
kubeconfig_path        = "~/.kube/config"
kube_context           = "docker-desktop"
argocd_admin_password  = "MySecureArgoPassword123"
db_password            = "MySecureDBPassword456"
redis_password         = "MySecureRedisPassword789"
kafka_password         = "MySecureKafkaPassword101"
git_repo_url           = "https://github.com/betuanminh22032003/tiktok_nestjs.git"
git_branch             = "main"
```

### Phase 3: Deploy Infrastructure with Terraform (15 minutes)

```bash
# From terraform/ directory

# 1. Initialize Terraform
terraform init

# 2. Validate configuration
terraform validate

# 3. Plan changes (review what will be created)
terraform plan -var="environment=dev" -out=dev.tfplan

# 4. Review the plan
# Look for:
# - kubernetes_namespace creation
# - helm_release for PostgreSQL
# - helm_release for Redis
# - helm_release for Kafka
# - helm_release for ArgoCD

# 5. Apply changes
terraform apply dev.tfplan

# Output should show:
# ✓ kubernetes_namespace.tiktok_clone
# ✓ helm_release.postgresql
# ✓ helm_release.redis
# ✓ helm_release.kafka
# ✓ helm_release.argocd
# ✓ kubernetes_manifest.argocd_project
# ✓ kubernetes_manifest.argocd_application
```

### Phase 4: Verify Infrastructure (10 minutes)

```bash
# 1. Check namespaces
kubectl get ns

# 2. Check ArgoCD pods
kubectl get pods -n argocd -w

# 3. Wait for all pods to be ready (5-10 minutes)
# Expected pods:
# - argocd-dex-server
# - argocd-redis
# - argocd-server
# - argocd-application-controller
# - argocd-repo-server

# 4. Check created resources
kubectl get all -n argocd
```

### Phase 5: Access ArgoCD Dashboard (5 minutes)

```bash
# 1. Port forward to ArgoCD server
kubectl port-forward svc/argocd-server -n argocd 8080:443

# 2. Get admin password from Terraform output
terraform output argocd_password

# 3. Open in browser
# URL: https://localhost:8080
# Username: admin
# Password: (from step 2)

# Accept self-signed certificate if prompted
```

### Phase 6: Configure ArgoCD Applications (10 minutes)

```bash
# 1. Go back to project root
cd ..

# 2. Create argocd namespace if not exists
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

# 3. Apply AppProject
kubectl apply -f argocd/appproject.yaml

# 4. Apply configuration
kubectl apply -f argocd/argocd-cm.yaml
kubectl apply -f argocd/argocd-rbac-cm.yaml

# 5. Deploy application for your environment
kubectl apply -f argocd/application-dev.yaml
# OR
kubectl apply -f argocd/application-staging.yaml
# OR
kubectl apply -f argocd/application-prod.yaml

# 6. Check application status
kubectl get applications -n argocd
kubectl describe app tiktok-clone -n argocd
```

### Phase 7: Monitor Deployment (10-15 minutes)

```bash
# 1. Watch application sync
kubectl get apps -n argocd -w

# 2. Check pod status
kubectl get pods -n tiktok-clone -w

# 3. View ArgoCD dashboard
# Should show "Synced" status for tiktok-clone application

# 4. Check all resources
kubectl get all -n tiktok-clone
```

### Phase 8: Access Your Application

```bash
# 1. Port forward to API Gateway
kubectl port-forward svc/api-gateway -n tiktok-clone 4000:4000

# 2. Port forward to Frontend
kubectl port-forward svc/frontend -n tiktok-clone 3000:3000

# 3. Open in browser
# Frontend: http://localhost:3000
# API: http://localhost:4000

# 4. Test endpoints
curl http://localhost:4000/health
```

---

## 📋 Automated Deployment Script

Use the provided PowerShell script for automated setup:

```bash
# One-command deployment
.\argocd-terraform-deploy.ps1 -Environment dev -Action apply -AutoApprove

# Step by step
.\argocd-terraform-deploy.ps1 -Environment dev -Action init
.\argocd-terraform-deploy.ps1 -Environment dev -Action plan
.\argocd-terraform-deploy.ps1 -Environment dev -Action apply
.\argocd-terraform-deploy.ps1 -Environment dev -Action argocd
.\argocd-terraform-deploy.ps1 -Environment dev -Action status
```

---

## 🔄 Multi-Environment Deployment

### Deploy to All Environments

```bash
# Development
.\argocd-terraform-deploy.ps1 -Environment dev -Action apply -AutoApprove

# Staging
.\argocd-terraform-deploy.ps1 -Environment staging -Action apply -AutoApprove

# Production
.\argocd-terraform-deploy.ps1 -Environment prod -Action apply -AutoApprove
```

### Check All Environments

```bash
# List applications
kubectl get applications -n argocd -o wide

# Expected output:
# NAME                    STATUS
# tiktok-clone            Synced
# tiktok-clone-staging    Synced
# tiktok-clone-prod       Synced
```

---

## 🔄 Workflow: Making Changes

### Scenario 1: Update Application Configuration

```bash
# 1. Edit values file
# For dev:
vim helm/tiktok-clone/values-dev.yaml

# Change something like:
# replicaCount: 2 → 3
# or image tag: 1.0.0 → 1.0.1

# 2. Commit and push
git add helm/tiktok-clone/values-dev.yaml
git commit -m "Update service replicas"
git push origin main

# 3. ArgoCD automatically detects and syncs!
# Check dashboard or:
kubectl get pods -n tiktok-clone -w
```

### Scenario 2: Update Infrastructure with Terraform

```bash
# 1. Modify terraform configuration
vim terraform/main.tf
# or
vim terraform/variables.tf

# 2. Plan changes
cd terraform
terraform plan -out=update.tfplan

# 3. Review and apply
terraform apply update.tfplan

# 4. Verify
kubectl get all -n argocd
```

### Scenario 3: Scale Up Services

```bash
# Method 1: Via Values (Recommended)
vim helm/tiktok-clone/values-dev.yaml
# Change: replicas: 2 → 5

git add helm/tiktok-clone/values-dev.yaml
git commit -m "Scale up to 5 replicas"
git push origin main

# ArgoCD syncs automatically!

# Method 2: Manual Scaling (temporary)
kubectl scale deployment auth-service --replicas=5 -n tiktok-clone
```

### Scenario 4: Rollback to Previous Version

```bash
# Option 1: ArgoCD Dashboard
# 1. Open https://localhost:8080
# 2. Click on tiktok-clone application
# 3. Click "History" tab
# 4. Select previous revision
# 5. Click "Rollback"

# Option 2: CLI
kubectl get apps tiktok-clone -n argocd -o yaml | grep -A 5 "history"
argocd app rollback tiktok-clone 1

# Option 3: Git
git revert <commit-hash>
git push origin main
# ArgoCD syncs back to previous state
```

---

## 🛠️ Maintenance Tasks

### Regular Checks

```bash
# Every day
kubectl get apps -n argocd

# Every week
kubectl get events -n argocd --sort-by='.lastTimestamp'

# Every month
terraform plan  # Check for drift
terraform refresh  # Update state
```

### Backup

```bash
# Backup Terraform state
cp terraform/terraform.tfstate terraform/terraform.tfstate.backup.$(date +%s)

# Backup ArgoCD config
kubectl get -n argocd cm,secret -o yaml > argocd-config-backup.yaml

# Backup application definitions
argocd app list -o json > applications-backup.json
```

### Update Tools

```bash
# Update Terraform providers
cd terraform
terraform init -upgrade

# Update Helm charts (ArgoCD will handle)
# Just push new chart versions to Git

# Update ArgoCD
helm repo update
```

---

## 📚 File Locations Quick Reference

| File                         | Purpose                       |
| ---------------------------- | ----------------------------- |
| `terraform/main.tf`          | Main infrastructure           |
| `terraform/variables.tf`     | Input variables               |
| `terraform/outputs.tf`       | Output values                 |
| `terraform/environments.tf`  | Environment configs           |
| `terraform/terraform.tfvars` | Your settings (DO NOT COMMIT) |
| `argocd/appproject.yaml`     | RBAC & project definition     |
| `argocd/application-*.yaml`  | Deployment definitions        |
| `argocd/argocd-cm.yaml`      | ArgoCD configuration          |
| `argocd/argocd-secret.yaml`  | Secrets (DO NOT COMMIT)       |
| `helm/tiktok-clone/`         | Application charts            |

---

## ✅ Verification Checklist

After complete setup:

- [ ] Terraform initialized (`terraform/.terraform` exists)
- [ ] State file created (`terraform.tfstate` exists)
- [ ] ArgoCD namespace created (`kubectl get ns argocd`)
- [ ] ArgoCD pods running (`kubectl get pods -n argocd`)
- [ ] ArgoCD dashboard accessible (https://localhost:8080)
- [ ] Application Project created (`kubectl get appprojects -n argocd`)
- [ ] Application syncing (`kubectl get apps -n argocd`)
- [ ] Services deployed (`kubectl get svc -n tiktok-clone`)
- [ ] Pods running (`kubectl get pods -n tiktok-clone`)
- [ ] Frontend accessible (http://localhost:3000)
- [ ] API accessible (http://localhost:4000)

---

## 🐛 Troubleshooting

### ArgoCD pods not starting

```bash
# Check events
kubectl describe pod -n argocd -l app.kubernetes.io/name=argocd-server

# Check logs
kubectl logs -n argocd deployment/argocd-server

# Check PVCs
kubectl get pvc -n argocd
```

### Application won't sync

```bash
# Check application status
kubectl describe app tiktok-clone -n argocd

# Check Helm template
helm template tiktok-clone helm/tiktok-clone --debug

# Check Git access
kubectl logs -n argocd deployment/argocd-repo-server
```

### Terraform apply fails

```bash
# Validate
terraform validate

# Refresh state
terraform refresh

# Try with detailed output
TF_LOG=DEBUG terraform apply dev.tfplan
```

---

## 📖 Learning Resources

- **Terraform**: `docs/ARGOCD_TERRAFORM_SETUP.md`
- **Quick Commands**: `docs/ARGOCD_TERRAFORM_QUICK_REF.md`
- **Kubernetes**: `docs/KUBERNETES_HELM_SETUP.md`
- **Official Docs**:
  - https://www.terraform.io/docs
  - https://argo-cd.readthedocs.io
  - https://kubernetes.io/docs

---

## 🎓 Next Learning Steps

### Week 1: Foundation

- [ ] Complete this guide
- [ ] Deploy to dev environment
- [ ] Access ArgoCD dashboard

### Week 2: Advanced

- [ ] Deploy to staging
- [ ] Learn Helm templating
- [ ] Practice Git-based updates

### Week 3: Production

- [ ] Deploy to production
- [ ] Implement RBAC
- [ ] Setup monitoring

### Week 4+: Mastery

- [ ] Add sealed-secrets
- [ ] Implement CI/CD
- [ ] Add service mesh

---

**Last Updated**: December 8, 2025
**Status**: ✅ Production Ready
**Difficulty**: Intermediate
