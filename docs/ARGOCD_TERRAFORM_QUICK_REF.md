# 📚 ArgoCD & Terraform - Quick Commands Reference

## 🚀 Quick Start

```bash
# 1. Initialize
.\argocd-terraform-deploy.ps1 -Environment dev -Action init

# 2. Plan
.\argocd-terraform-deploy.ps1 -Environment dev -Action plan

# 3. Apply (create infrastructure)
.\argocd-terraform-deploy.ps1 -Environment dev -Action apply

# 4. Setup ArgoCD
.\argocd-terraform-deploy.ps1 -Environment dev -Action argocd

# 5. Check status
.\argocd-terraform-deploy.ps1 -Environment dev -Action status
```

---

## 🏗️ Terraform Commands

### Initialize & Validate

```bash
cd terraform

# Initialize (first time)
terraform init

# Validate configuration
terraform validate

# Format code
terraform fmt -recursive

# Check terraform version
terraform version
```

### Plan & Apply

```bash
# Plan for development
terraform plan -var="environment=dev" -out=dev.tfplan

# Plan for production
terraform plan -var="environment=prod" -out=prod.tfplan

# Show detailed plan
terraform show dev.tfplan

# Apply the plan
terraform apply dev.tfplan

# Auto-approve (caution!)
terraform apply -auto-approve

# Destroy infrastructure
terraform destroy -var="environment=dev" -auto-approve
```

### State Management

```bash
# List resources in state
terraform state list

# Show specific resource
terraform state show kubernetes_namespace.tiktok_clone

# Remove resource from state
terraform state rm kubernetes_namespace.tiktok_clone

# Import external resource
terraform import kubernetes_namespace.tiktok_clone my-namespace

# Refresh state (sync with actual infrastructure)
terraform refresh

# Backup state
cp terraform.tfstate terraform.tfstate.backup
```

### Debugging

```bash
# Enable debug logging
export TF_LOG=DEBUG

# Show all variables
terraform console
> var.environment

# Validate JSON output
terraform plan -json | jq

# Check provider version
terraform providers
```

---

## 🤖 ArgoCD CLI Commands

### Setup & Login

```bash
# Get ArgoCD server
ARGOCD_SERVER=$(kubectl get svc argocd-server -n argocd -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Get admin password
PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d)

# Login
argocd login $ARGOCD_SERVER --username admin --password $PASSWORD

# Update password
argocd account update-password
```

### Application Management

```bash
# List all applications
argocd app list

# Get application status
argocd app get tiktok-clone
argocd app get tiktok-clone-staging
argocd app get tiktok-clone-prod

# Detailed status
argocd app get tiktok-clone --refresh

# Sync application
argocd app sync tiktok-clone

# Sync with strategy
argocd app sync tiktok-clone --sync-strategy=apply

# Dry-run (show what would sync)
argocd app sync tiktok-clone --dry-run

# Rollback to previous revision
argocd app rollback tiktok-clone

# Rollback to specific revision
argocd app rollback tiktok-clone 1

# Delete application
argocd app delete tiktok-clone

# Wait for sync
argocd app wait tiktok-clone --sync
```

### Repository Management

```bash
# List repositories
argocd repo list

# Add repository
argocd repo add https://github.com/betuanminh22032003/tiktok_nestjs.git

# Test repository connection
argocd repo get https://github.com/betuanminh22032003/tiktok_nestjs.git

# Remove repository
argocd repo rm https://github.com/betuanminh22032003/tiktok_nestjs.git
```

### Account & RBAC

```bash
# List accounts
argocd account list

# List available roles
argocd account get-user-info

# Create API token
argocd account generate-token

# Revoke token
argocd account revoke-token
```

### Cluster Management

```bash
# List clusters
argocd cluster list

# Add cluster
argocd cluster add docker-desktop

# Remove cluster
argocd cluster rm https://kubernetes.default.svc
```

---

## 🐳 Kubernetes Commands for ArgoCD

### Namespace Management

```bash
# Create namespace
kubectl create namespace argocd

# View namespace
kubectl get namespace argocd

# Describe namespace
kubectl describe ns argocd
```

### Pod Management

```bash
# List ArgoCD pods
kubectl get pods -n argocd

# Describe pod
kubectl describe pod -n argocd -l app.kubernetes.io/name=argocd-server

# View pod logs
kubectl logs -n argocd deployment/argocd-server
kubectl logs -n argocd deployment/argocd-application-controller -f

# Execute command in pod
kubectl exec -it -n argocd deployment/argocd-server -- /bin/bash
```

### Service Management

```bash
# List services
kubectl get svc -n argocd

# Describe service
kubectl describe svc argocd-server -n argocd

# Port forward
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get external IP
kubectl get svc -n argocd argocd-server -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### ConfigMap & Secret Management

```bash
# View ConfigMaps
kubectl get cm -n argocd

# View secrets
kubectl get secrets -n argocd

# Edit ConfigMap
kubectl edit cm argocd-cm -n argocd

# Edit secret
kubectl edit secret argocd-secret -n argocd

# Get secret value
kubectl get secret -n argocd argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d
```

### Application Management

```bash
# List applications
kubectl get applications -n argocd

# List AppProjects
kubectl get appprojects -n argocd

# Describe application
kubectl describe app tiktok-clone -n argocd

# Watch application status
kubectl get apps -n argocd -w

# Get application YAML
kubectl get app tiktok-clone -n argocd -o yaml

# Delete application
kubectl delete app tiktok-clone -n argocd
```

---

## 🔍 Monitoring & Debugging

### Check ArgoCD Health

```bash
# ArgoCD server status
kubectl get deployment argocd-server -n argocd

# Application controller status
kubectl get deployment argocd-application-controller -n argocd

# All ArgoCD components
kubectl get all -n argocd

# Check resource usage
kubectl top nodes
kubectl top pods -n argocd
```

### Troubleshooting

```bash
# Check events
kubectl get events -n argocd --sort-by='.lastTimestamp'

# View application sync status
kubectl get applications -n argocd -o wide

# Check for errors in logs
kubectl logs -n argocd deployment/argocd-application-controller | grep -i error

# Validate manifests
kubectl apply -f argocd/application-dev.yaml --dry-run=client

# Check resource quotas
kubectl get resourcequotas -n tiktok-clone
```

### View Configuration

```bash
# Show all ArgoCD config
kubectl get cm -n argocd argocd-cm -o yaml

# Show RBAC policy
kubectl get cm -n argocd argocd-rbac-cm -o yaml

# Show current applications
kubectl get apps -n argocd -o yaml
```

---

## 🔄 Deployment Workflows

### Complete Deployment Flow

```bash
# 1. Prepare Terraform variables
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
# Edit terraform.tfvars with your values

# 2. Initialize Terraform
terraform init

# 3. Plan changes
terraform plan -out=dev.tfplan

# 4. Review and apply
terraform apply dev.tfplan

# 5. Verify deployment
kubectl get ns
kubectl get pods -n argocd

# 6. Setup ArgoCD applications
kubectl apply -f argocd/appproject.yaml
kubectl apply -f argocd/application-dev.yaml

# 7. Monitor sync
kubectl get apps -n argocd -w

# 8. Access dashboard
kubectl port-forward svc/argocd-server -n argocd 8080:443
# https://localhost:8080
```

### Update Application

```bash
# 1. Make changes in Git
git add helm/tiktok-clone/values-dev.yaml
git commit -m "Update configuration"
git push origin main

# 2. ArgoCD detects automatically
# OR manually refresh:
argocd app refresh tiktok-clone

# 3. Sync changes
argocd app sync tiktok-clone

# 4. Wait for sync
kubectl get apps tiktok-clone -n argocd -w
```

### Rollback Application

```bash
# Via ArgoCD CLI
argocd app history tiktok-clone
argocd app rollback tiktok-clone 1

# Via kubectl
kubectl get apps tiktok-clone -n argocd -o yaml | grep syncId

# Via dashboard
# 1. Open ArgoCD UI
# 2. Click on application
# 3. View History tab
# 4. Click Rollback
```

### Multi-Environment Deployment

```bash
# Deploy to dev
.\argocd-terraform-deploy.ps1 -Environment dev -Action apply

# Deploy to staging
.\argocd-terraform-deploy.ps1 -Environment staging -Action apply

# Deploy to production
.\argocd-terraform-deploy.ps1 -Environment prod -Action apply

# Check all
kubectl get apps -n argocd -o wide
```

---

## 📊 Useful Queries

### Show resources created by Terraform

```bash
terraform state list
terraform state list | grep helm_release
terraform state list | grep kubernetes
```

### Show all applications and their status

```bash
kubectl get applications -n argocd -o custom-columns=NAME:.metadata.name,STATUS:.status.operationState.phase,SYNC:.status.sync.status
```

### Show resource usage

```bash
kubectl top pod -n argocd
kubectl top pod -n tiktok-clone
```

### Watch deployment progress

```bash
kubectl rollout status deployment/auth-service -n tiktok-clone
kubectl get pods -n tiktok-clone -w
```

---

## 🚨 Common Issues & Solutions

### ArgoCD not accessible

```bash
# Check service
kubectl get svc -n argocd argocd-server

# Port forward
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Check logs
kubectl logs -n argocd deployment/argocd-server
```

### Application won't sync

```bash
# Check application status
kubectl describe app tiktok-clone -n argocd

# Check for errors
kubectl get events -n argocd

# Validate manifests
helm template tiktok-clone helm/tiktok-clone --debug
```

### Terraform state lock

```bash
# Remove lock (if stuck)
rm terraform.tfstate.lock.hcl

# Or refresh
terraform refresh
```

### Secret encoding issues

```bash
# Check secret
kubectl get secret argocd-secret -n argocd -o yaml

# Decode value
kubectl get secret argocd-secret -n argocd -o jsonpath='{.data.password}' | base64 -d
```

---

## 📝 Environment Variables

### For local development

```bash
# .env.local (DO NOT COMMIT)
export TF_VAR_environment=dev
export TF_VAR_argocd_admin_password=your-password
export TF_VAR_db_password=your-db-password
export TF_VAR_redis_password=your-redis-password
export TF_VAR_kafka_password=your-kafka-password
export KUBECONFIG=~/.kube/config
```

### For CI/CD

```bash
# GitHub Actions
TERRAFORM_VERSION: 1.5.0
KUBECTL_VERSION: 1.27.0
HELM_VERSION: 3.12.0
```

---

## 🔗 Useful Links

- [Terraform Docs](https://www.terraform.io/docs)
- [ArgoCD Docs](https://argo-cd.readthedocs.io)
- [Kubernetes Docs](https://kubernetes.io/docs)
- [Helm Docs](https://helm.sh/docs)

---

**Last Updated**: December 8, 2025
**Version**: 1.0
**Status**: Production Ready
