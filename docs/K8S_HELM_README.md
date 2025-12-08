# 🚀 Kubernetes & Helm Setup - Complete Guide

**Status**: ✅ Production Ready
**Last Updated**: December 8, 2025
**Difficulty**: Intermediate (Learning-focused)

---

## 📌 What You Got

This complete K8s + Helm setup includes:

✅ **Raw Kubernetes Manifests** (`k8s/` folder)

- Infrastructure: PostgreSQL, Redis, Kafka with persistent storage
- 5 Microservices: Auth, Video, Interaction, Notification, API Gateway
- Frontend: Next.js with LoadBalancer

✅ **Helm Charts** (`helm/` folder)

- Production-grade templating
- Environment-specific values (dev, staging, prod)
- Automatic scaling, health checks, resource limits

✅ **Complete Documentation**

- `KUBERNETES_HELM_SETUP.md` → Full learning guide (30 min read)
- `KUBERNETES_HELM_QUICK_REF.md` → Command reference (quick lookup)
- `KUBERNETES_TROUBLESHOOTING.md` → Issue resolution guide

---

## 🎯 Quick Start (5 minutes)

### 1. Prerequisites

```powershell
# Install these first:
- Docker Desktop (enable Kubernetes)
- kubectl
- Helm

# Verify
kubectl version --client
helm version
```

### 2. Build Images

```powershell
cd e:\code\senior\tiktok_nestjs

docker build -t tiktok-auth-service:latest -f apps/auth-service/Dockerfile .
docker build -t tiktok-video-service:latest -f apps/video-service/Dockerfile .
docker build -t tiktok-interaction-service:latest -f apps/interaction-service/Dockerfile .
docker build -t tiktok-notification-service:latest -f apps/notification-service/Dockerfile .
docker build -t tiktok-api-gateway:latest -f apps/api-gateway/Dockerfile .
docker build -t tiktok-frontend:latest -f tiktok-frontend/Dockerfile ./tiktok-frontend
```

### 3. Deploy with Helm

```powershell
# Development (1 replica, minimal resources)
helm install tiktok-clone helm/tiktok-clone \
  -f helm/tiktok-clone/values-dev.yaml \
  -n tiktok-clone --create-namespace

# Watch pods start
kubectl get pods -n tiktok-clone -w
```

### 4. Access Application

```powershell
# Port forward
kubectl port-forward -n tiktok-clone svc/frontend 3000:3000
kubectl port-forward -n tiktok-clone svc/api-gateway 4000:4000

# Open browser
Start-Process "http://localhost:3000"
```

### 5. Monitor

```powershell
# Watch everything
kubectl get all -n tiktok-clone -w

# Check logs
kubectl logs -n tiktok-clone -l app=auth-service -f
```

---

## 📂 File Structure

```
project/
│
├── k8s/                              # Raw Kubernetes manifests
│   ├── infrastructure/               # Databases & message queues
│   │   ├── namespace.yaml           # Isolated environment
│   │   ├── configmap.yaml           # Service configuration
│   │   ├── secrets.yaml             # Passwords & keys
│   │   ├── postgres.yaml            # Database
│   │   ├── redis.yaml               # Cache
│   │   └── kafka.yaml               # Event streaming
│   │
│   └── services/                     # Microservices & Frontend
│       ├── auth-service.yaml
│       ├── video-service.yaml
│       ├── interaction-service.yaml
│       ├── notification-service.yaml
│       ├── api-gateway.yaml
│       └── frontend.yaml
│
├── helm/                             # Helm charts (recommended)
│   └── tiktok-clone/
│       ├── Chart.yaml               # Chart metadata
│       ├── values.yaml              # Default values
│       ├── values-dev.yaml          # Development overrides
│       ├── values-staging.yaml      # Staging overrides
│       ├── values-prod.yaml         # Production overrides
│       │
│       └── templates/               # Go templates (generates manifests)
│           ├── namespace.yaml
│           ├── configmap.yaml
│           ├── secrets.yaml
│           ├── postgres.yaml
│           ├── redis.yaml
│           ├── kafka.yaml
│           ├── auth-service.yaml
│           ├── video-service.yaml
│           ├── interaction-service.yaml
│           ├── notification-service.yaml
│           ├── api-gateway.yaml
│           └── frontend.yaml
│
└── docs/
    ├── KUBERNETES_HELM_SETUP.md           # 📖 Full guide (30 min)
    ├── KUBERNETES_HELM_QUICK_REF.md       # ⚡ Quick commands
    ├── KUBERNETES_TROUBLESHOOTING.md      # 🔧 Fix issues
    └── K8S_HELM_README.md                 # 👈 This file
```

---

## 🎓 Learning Path

### Phase 1: Understanding (Read Only)

```
1. Read: docs/KUBERNETES_HELM_SETUP.md
   └─ Focus: Architecture, concepts

2. Review: k8s/infrastructure/namespace.yaml
   └─ Understand: Namespaces (isolated environments)

3. Review: k8s/services/auth-service.yaml
   └─ Understand: Pod, Service, Deployment, HPA
```

### Phase 2: Deploy (Hands-On)

```
1. Build Docker images (see Quick Start)

2. Deploy with Helm (development):
   helm install tiktok-clone helm/tiktok-clone -f values-dev.yaml

3. Watch: kubectl get pods -n tiktok-clone -w

4. Debug: kubectl logs, kubectl describe, kubectl exec
```

### Phase 3: Understand ConfigMaps & Secrets

```
1. Edit: helm/tiktok-clone/values.yaml

2. Understand how services discover each other:
   kubectl get cm tiktok-db-config -n tiktok-clone -o yaml

3. Track environment variables:
   kubectl exec -it {pod} -n tiktok-clone -- env | grep DB_
```

### Phase 4: Scaling & Auto-Scaling

```
1. Manual scale:
   kubectl scale deployment auth-service --replicas=5

2. Check HPA:
   kubectl get hpa -n tiktok-clone
   kubectl describe hpa auth-service-hpa

3. Monitor:
   kubectl top pods -n tiktok-clone
```

### Phase 5: Troubleshooting

```
1. Use: docs/KUBERNETES_TROUBLESHOOTING.md

2. Diagnose pod issues:
   kubectl describe pod {pod}
   kubectl logs {pod} -f
   kubectl events {pod}

3. Resolve and update deployment
```

---

## 🚀 Deployment Strategies

### Strategy 1: Kubectl (Simple, Direct)

```powershell
# Apply raw manifests one by one
kubectl apply -f k8s/infrastructure/
kubectl apply -f k8s/services/

# Pros: Simple, direct control
# Cons: Hard to manage multiple environments
```

### Strategy 2: Helm (Recommended)

```powershell
# Development
helm install tiktok-clone helm/tiktok-clone -f values-dev.yaml

# Staging
helm install tiktok-clone helm/tiktok-clone -f values-staging.yaml

# Production
helm install tiktok-clone helm/tiktok-clone -f values-prod.yaml

# Pros: Versioning, rollback, environment management
# Cons: Go template syntax to learn
```

### Strategy 3: Combined

```powershell
# Infrastructure with kubectl (stable)
kubectl apply -f k8s/infrastructure/

# Services with Helm (easier to update)
helm install tiktok-clone helm/tiktok-clone -f values-prod.yaml
```

---

## 🔑 Key Concepts

### 1. **Pod** (Smallest K8s Unit)

- Container wrapper
- Can contain multiple containers
- Usually 1 container per pod

### 2. **Service** (Network Layer)

- Stable DNS name: `auth-service.tiktok-clone.svc.cluster.local`
- Load balances traffic to pods
- Types: ClusterIP (internal), LoadBalancer (external)

### 3. **Deployment** (Managing Pods)

- Maintains desired number of replicas
- Handles rolling updates
- Auto-restarts failed pods

### 4. **StatefulSet** (For Databases)

- Like Deployment but for stateful apps
- Maintains identity (postgres-0, postgres-1)
- Persistent storage per replica

### 5. **ConfigMap** (Configuration)

- Non-sensitive data (config files, env vars)
- Example: Database host, service URLs

### 6. **Secret** (Sensitive Data)

- Base64 encoded (not encrypted by default!)
- Example: Passwords, API keys
- ⚠️ Use sealed-secrets in production

### 7. **HPA** (Horizontal Pod Autoscaler)

- Auto scales based on CPU/Memory metrics
- Example: Scale from 2 to 5 pods when CPU > 70%

---

## 🛠️ Common Commands

```powershell
# See everything
kubectl get all -n tiktok-clone

# Watch pods
kubectl get pods -n tiktok-clone -w

# Pod logs
kubectl logs -n tiktok-clone -l app=auth-service -f

# Debug pod
kubectl exec -it {pod} -n tiktok-clone -- bash

# Scale manually
kubectl scale deployment auth-service --replicas=5

# Port forward
kubectl port-forward svc/api-gateway 4000:4000

# Helm commands
helm install tiktok-clone ...          # Deploy
helm upgrade tiktok-clone ...          # Update
helm rollback tiktok-clone 1           # Undo
helm history tiktok-clone              # Version history
helm uninstall tiktok-clone            # Remove
```

See `KUBERNETES_HELM_QUICK_REF.md` for more commands.

---

## 🔍 Troubleshooting Quick Guide

| Issue                | Command                                               | Check                       |
| -------------------- | ----------------------------------------------------- | --------------------------- |
| Pods not starting    | `kubectl describe pod`                                | Resources, images, secrets  |
| Container crashing   | `kubectl logs {pod}`                                  | Application errors          |
| Services unreachable | `kubectl exec {pod} -- curl http://auth-service:4001` | Service exists, pod healthy |
| Out of memory        | `kubectl top pods`                                    | Increase memory limits      |
| DNS not resolving    | `kubectl exec {pod} -- nslookup postgres`             | CoreDNS running             |

See `KUBERNETES_TROUBLESHOOTING.md` for detailed solutions.

---

## 📊 Environment Comparison

| Aspect        | Development   | Staging     | Production     |
| ------------- | ------------- | ----------- | -------------- |
| Replicas      | 1             | 2           | 3              |
| Memory        | 256Mi         | 256Mi       | 512Mi          |
| CPU           | 200m          | 200m        | 500m           |
| HPA           | Disabled      | Limited     | Enabled (2-10) |
| Database Size | 10Gi          | 20Gi        | 50Gi           |
| Use Case      | Local testing | Pre-release | Live users     |

---

## 🔒 Security Considerations

### ⚠️ Current Setup (Development Only)

```yaml
# Secrets stored as base64 (not encrypted)
# Default passwords used
# CORS allows localhost
```

### 🔐 Production Checklist

```
☐ Use sealed-secrets or external-secrets for sensitive data
☐ Change all default passwords
☐ Enable RBAC (Role-Based Access Control)
☐ Use network policies to restrict traffic
☐ Enable pod security policies
☐ Set resource quotas per namespace
☐ Enable audit logging
☐ Use private container registry
☐ Set up regular backups of persistent data
☐ Implement monitoring and alerting
```

---

## 📚 Learning Resources

### Official Documentation

- [Kubernetes Docs](https://kubernetes.io/docs)
- [Helm Docs](https://helm.sh/docs)
- [kubectl Cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet)

### Key Topics in This Setup

1. **Service Discovery**: How pods find each other via DNS
2. **StatefulSet**: Database pods maintain identity
3. **Persistent Storage**: Data survives pod restarts
4. **ConfigMap/Secret**: External configuration
5. **HPA**: Automatic scaling

### Hands-On Practice

1. Deploy locally (this setup)
2. Scale up/down pods
3. Update ConfigMap and watch pods restart
4. Check logs and events
5. Practice troubleshooting common issues

---

## 🎯 Next Steps

### Immediate (Today)

- [ ] Read `KUBERNETES_HELM_SETUP.md` sections 1-3
- [ ] Build Docker images
- [ ] Deploy with Helm (dev)
- [ ] Verify all pods are running

### Short-term (This Week)

- [ ] Understand ConfigMap/Secrets
- [ ] Practice scaling commands
- [ ] Deploy to staging/production
- [ ] Try Helm upgrade and rollback

### Medium-term (This Month)

- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Implement ingress controller
- [ ] Set up CI/CD pipeline
- [ ] Practice disaster recovery

---

## 💡 Pro Tips

1. **Always use namespace**: `kubectl ... -n tiktok-clone`
2. **Watch, don't poll**: `kubectl get pods -w`
3. **Check events first**: `kubectl get events`
4. **Test with --dry-run**: `helm install --dry-run --debug`
5. **Use labels**: `kubectl get pods -l app=auth-service`
6. **HPA is automatic**: Don't manually scale in production
7. **Backup values**: Before helm upgrade, save values files
8. **Logs first, describe second**: `kubectl logs` before `kubectl describe`

---

## 📞 Need Help?

1. **Check logs**: `kubectl logs {pod} -n tiktok-clone`
2. **Describe pod**: `kubectl describe pod {pod} -n tiktok-clone`
3. **View events**: `kubectl get events -n tiktok-clone`
4. **Troubleshooting guide**: See `KUBERNETES_TROUBLESHOOTING.md`
5. **Quick reference**: See `KUBERNETES_HELM_QUICK_REF.md`
6. **Full documentation**: See `KUBERNETES_HELM_SETUP.md`

---

## ✨ What This Setup Teaches

By working through this setup, you'll learn:

- ✅ How Kubernetes organizes and runs containerized apps
- ✅ How services discover and communicate with each other
- ✅ How to manage configuration across environments
- ✅ How to handle persistent data (databases)
- ✅ How auto-scaling works in production
- ✅ How to debug container issues
- ✅ How to use Helm for package management
- ✅ Production deployment strategies
- ✅ Troubleshooting container issues
- ✅ Monitoring and observability basics

---

**Happy Learning! 🚀🎓**

For detailed learning, start with: `docs/KUBERNETES_HELM_SETUP.md`
