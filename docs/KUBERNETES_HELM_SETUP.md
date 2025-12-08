# 🚀 Kubernetes & Helm Setup Guide

## 📚 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Kubernetes Architecture](#kubernetes-architecture)
3. [Quick Start](#quick-start)
4. [Helm Setup](#helm-setup)
5. [Deployment Strategies](#deployment-strategies)
6. [Monitoring & Health](#monitoring--health)
7. [Troubleshooting](#troubleshooting)
8. [Learning Resources](#learning-resources)

---

## Prerequisites

### 1. Install Required Tools

#### a) **Docker Desktop** (local K8s development)

```powershell
# Install Docker Desktop from: https://www.docker.com/products/docker-desktop
# Enable Kubernetes in Docker Desktop settings
```

#### b) **kubectl** - Kubernetes Command Line Tool

```powershell
# Download and install
$version = "v1.28.0"
$os = "windows"
$arch = "amd64"

# Or use choco
choco install kubernetes-cli

# Verify
kubectl version --client
```

#### c) **Helm** - Package Manager for Kubernetes

```powershell
# Method 1: Choco
choco install kubernetes-helm

# Method 2: Manual download
# Download from: https://github.com/helm/helm/releases

# Verify
helm version
```

#### d) **minikube** (Optional - for local testing)

```powershell
# For production-like environment locally
choco install minikube

# Start minikube
minikube start --cpus=4 --memory=8192 --driver=docker
```

---

## Kubernetes Architecture

### 📊 Application Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (External)                 │
└────────────────┬────────────────────────────┬────────────────┘
                 │                            │
         ┌───────▼────────┐          ┌────────▼─────────┐
         │  API Gateway   │          │    Frontend      │
         │  (4000)        │          │   Next.js        │
         │  Service       │          │   (3000)         │
         └───────┬────────┘          └────────┬─────────┘
                 │                            │
      ┌──────────┼──────────┬────────┬────────┼──────┐
      │          │          │        │        │      │
  ┌───▼──┐  ┌───▼──┐  ┌───▼─┐  ┌──▼──┐  ┌───▼──┐  │
  │Auth  │  │Video │  │Inter│  │Not  │  │      │  │
  │Svc   │  │Svc   │  │-act │  │ify  │  │      │  │
  │4001  │  │4002  │  │4003 │  │4004 │  │      │  │
  └───┬──┘  └───┬──┘  └──┬──┘  └──┬──┘  └──────┘  │
      │         │        │        │               │
      └─────────┼────────┼────────┼───────────────┘
                │        │        │
        ┌───────┴────────┴────────┴────────┐
        │   PostgreSQL   │   Redis   │  Kafka │
        │   (5432)       │  (6379)   │ (9092) │
        │                │           │        │
        │  persistent    │  cache    │ events │
        └────────────────┴───────────┴────────┘
```

### 🔄 Service Communication

**Internal Communication** (Service Discovery):

- Services reach each other via K8s Service DNS
- Format: `{service-name}.{namespace}.svc.cluster.local:{port}`
- Example: `auth-service.tiktok-clone.svc.cluster.local:50051` (gRPC)

**External Communication**:

- Only LoadBalancer services expose outside cluster
- API Gateway (4000) and Frontend (3000) are LoadBalancer type

---

## Quick Start

### 1️⃣ Build Docker Images

```powershell
# Navigate to project root
cd e:\code\senior\tiktok_nestjs

# Build all service images
docker build -t tiktok-auth-service:latest -f apps/auth-service/Dockerfile .
docker build -t tiktok-video-service:latest -f apps/video-service/Dockerfile .
docker build -t tiktok-interaction-service:latest -f apps/interaction-service/Dockerfile .
docker build -t tiktok-notification-service:latest -f apps/notification-service/Dockerfile .
docker build -t tiktok-api-gateway:latest -f apps/api-gateway/Dockerfile .
docker build -t tiktok-frontend:latest -f tiktok-frontend/Dockerfile ./tiktok-frontend
```

### 2️⃣ Start Kubernetes Cluster

```powershell
# Using Docker Desktop (already running if enabled)
# Or using minikube:
minikube start --cpus=4 --memory=8192 --driver=docker

# Verify cluster is running
kubectl cluster-info
kubectl get nodes
```

### 3️⃣ Create Namespace

```powershell
# Method 1: Using kubectl
kubectl create namespace tiktok-clone

# Method 2: Using Helm (will do this automatically)
```

### 4️⃣ Deploy with Helm

```powershell
# Navigate to helm directory
cd helm

# Deploy to development environment
helm install tiktok-clone tiktok-clone -f tiktok-clone/values.yaml -f tiktok-clone/values-dev.yaml

# Or for production
helm install tiktok-clone tiktok-clone -f tiktok-clone/values.yaml -f tiktok-clone/values-prod.yaml

# Or staging
helm install tiktok-clone tiktok-clone -f tiktok-clone/values.yaml -f tiktok-clone/values-staging.yaml
```

### 5️⃣ Verify Deployment

```powershell
# Check all resources
kubectl get all -n tiktok-clone

# Check pods
kubectl get pods -n tiktok-clone -w  # -w = watch mode

# Check services
kubectl get svc -n tiktok-clone

# Check persistent volumes
kubectl get pv,pvc -n tiktok-clone
```

### 6️⃣ Access Services

```powershell
# Get LoadBalancer IPs
kubectl get svc -n tiktok-clone

# Forward ports to localhost
kubectl port-forward -n tiktok-clone svc/api-gateway 4000:4000
kubectl port-forward -n tiktok-clone svc/frontend 3000:3000

# Access
Start-Process "http://localhost:3000"  # Frontend
Start-Process "http://localhost:4000"  # API Gateway
```

---

## Helm Setup

### 📁 Helm Directory Structure

```
helm/
├── tiktok-clone/
│   ├── Chart.yaml                    # Helm chart metadata
│   ├── values.yaml                   # Default values
│   ├── values-dev.yaml               # Development overrides
│   ├── values-staging.yaml           # Staging overrides
│   ├── values-prod.yaml              # Production overrides
│   ├── templates/                    # Kubernetes manifests (Go templates)
│   │   ├── namespace.yaml
│   │   ├── configmap.yaml
│   │   ├── secrets.yaml
│   │   ├── postgres.yaml
│   │   ├── redis.yaml
│   │   ├── kafka.yaml
│   │   ├── auth-service.yaml
│   │   ├── video-service.yaml
│   │   ├── interaction-service.yaml
│   │   ├── notification-service.yaml
│   │   ├── api-gateway.yaml
│   │   └── frontend.yaml
│   └── charts/                       # Sub-charts (optional)
```

### 🎯 Helm Key Concepts

#### **Chart.yaml**

- Metadata about the Helm chart
- Version, appVersion, dependencies

#### **values.yaml**

- Default configuration values
- Can be overridden by environment-specific files
- Values are injected into templates via Go template syntax: `{{ .Values.key }}`

#### **Templates**

- Kubernetes manifests with Go template logic
- Access values: `{{ .Values.postgresql.auth.password }}`
- Conditionals: `{{ if .Values.postgresql.enabled }}`
- Loops: `{{ range .Values.services }}`

#### **values-\*.yaml**

- Environment-specific overrides
- Merged with values.yaml during deployment

---

## Deployment Strategies

### 🚀 Strategy 1: Direct kubectl (Simple)

```powershell
# Apply raw K8s manifests
kubectl apply -f k8s/infrastructure/namespace.yaml
kubectl apply -f k8s/infrastructure/configmap.yaml
kubectl apply -f k8s/infrastructure/secrets.yaml
kubectl apply -f k8s/infrastructure/postgres.yaml
kubectl apply -f k8s/infrastructure/redis.yaml
kubectl apply -f k8s/infrastructure/kafka.yaml
kubectl apply -f k8s/services/

# All at once
kubectl apply -f k8s/
```

**Pros**: Simple, direct control
**Cons**: Hard to manage different environments, no versioning

---

### 🎁 Strategy 2: Helm (Recommended)

```powershell
# Install new release
helm install tiktok-clone ./helm/tiktok-clone -f ./helm/tiktok-clone/values-prod.yaml

# Upgrade existing release
helm upgrade tiktok-clone ./helm/tiktok-clone -f ./helm/tiktok-clone/values-prod.yaml

# Rollback to previous version
helm rollback tiktok-clone 1

# Check history
helm history tiktok-clone

# Uninstall
helm uninstall tiktok-clone
```

**Pros**: Versioning, rollback, environment management, templating
**Cons**: Steeper learning curve

---

### 🔧 Strategy 3: Combined Approach

```powershell
# Deploy infrastructure with kubectl
kubectl apply -f k8s/infrastructure/

# Deploy services with Helm
helm install tiktok-clone ./helm/tiktok-clone -f ./helm/tiktok-clone/values-prod.yaml
```

---

## Monitoring & Health

### ✅ Health Checks

Each service includes:

- **Liveness Probe**: Restarts pod if unhealthy
- **Readiness Probe**: Removes pod from load balancer if not ready

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 4001
  initialDelaySeconds: 30 # Wait before first check
  periodSeconds: 10 # Check every 10s
```

### 📊 Check Pod Status

```powershell
# Watch pods
kubectl get pods -n tiktok-clone -w

# Get detailed info
kubectl describe pod {pod-name} -n tiktok-clone

# View logs
kubectl logs {pod-name} -n tiktok-clone
kubectl logs {pod-name} -n tiktok-clone -f  # Follow

# Get into pod (debug)
kubectl exec -it {pod-name} -n tiktok-clone -- /bin/bash
```

### 🔄 Horizontal Pod Autoscaling (HPA)

```powershell
# View HPA status
kubectl get hpa -n tiktok-clone
kubectl describe hpa auth-service-hpa -n tiktok-clone

# HPA scales based on:
# - CPU usage (70% default)
# - Memory usage (80% default)
# - min/max replicas defined in values
```

**Example**: Auth Service HPA

- Min replicas: 2
- Max replicas: 5
- Scales up when CPU > 70%

---

## Troubleshooting

### ❌ Common Issues

#### **1. Pods not starting**

```powershell
# Check pod status
kubectl describe pod {pod-name} -n tiktok-clone

# Check events
kubectl get events -n tiktok-clone --sort-by='.lastTimestamp'

# Check logs
kubectl logs {pod-name} -n tiktok-clone
```

**Common causes**:

- Image not found/pulled → Check image name, registry
- Insufficient resources → Increase cluster resources
- ConfigMap/Secret missing → Check dependencies

---

#### **2. Services can't communicate**

```powershell
# Test DNS resolution inside pod
kubectl exec -it {pod-name} -n tiktok-clone -- nslookup postgres

# Test connection
kubectl exec -it {pod-name} -n tiktok-clone -- curl http://auth-service:4001/health

# Check service endpoints
kubectl get endpoints -n tiktok-clone
```

**Common causes**:

- Wrong service name → Use `{service}.{namespace}.svc.cluster.local`
- Port mismatch → Check service ports vs container ports
- Network policy blocking → Check network policies

---

#### **3. Database connection errors**

```powershell
# Verify PostgreSQL pod is running
kubectl get pods -n tiktok-clone | grep postgres

# Check PostgreSQL logs
kubectl logs postgres-0 -n tiktok-clone

# Connect to PostgreSQL inside container
kubectl exec -it postgres-0 -n tiktok-clone -- psql -U postgres

# Check PersistentVolume
kubectl get pv,pvc -n tiktok-clone
```

**Common causes**:

- Wrong password → Check secrets
- Database not initialized → Check migrations
- PV not mounted → Check storage configuration

---

#### **4. Memory/CPU issues**

```powershell
# Check resource usage
kubectl top pods -n tiktok-clone
kubectl top nodes

# Adjust resources in values.yaml
# Then: helm upgrade tiktok-clone ./helm/tiktok-clone ...
```

---

### 🔍 Useful Debug Commands

```powershell
# Complete cluster audit
kubectl get all -n tiktok-clone

# Event history (last 10 minutes)
kubectl get events -n tiktok-clone --sort-by='.lastTimestamp'

# Logs from all pods
kubectl logs -n tiktok-clone -l app=auth-service --tail=50

# Scale specific service
kubectl scale deployment auth-service --replicas=3 -n tiktok-clone

# Manual rollout restart
kubectl rollout restart deployment/auth-service -n tiktok-clone
```

---

## Learning Resources

### 📖 Kubernetes Fundamentals

| Topic                | File                                | Learn                                    |
| -------------------- | ----------------------------------- | ---------------------------------------- |
| **Pod**              | `k8s/services/auth-service.yaml`    | Smallest K8s unit, container wrapper     |
| **Service**          | Line 1-15 in any service file       | Network abstraction, DNS, load balancing |
| **Deployment**       | Line 18-50                          | Manage pod replicas, rolling updates     |
| **StatefulSet**      | `k8s/infrastructure/postgres.yaml`  | For stateful apps (databases)            |
| **ConfigMap**        | `k8s/infrastructure/configmap.yaml` | Non-sensitive config storage             |
| **Secret**           | `k8s/infrastructure/secrets.yaml`   | Sensitive data (passwords, keys)         |
| **PersistentVolume** | `k8s/infrastructure/postgres.yaml`  | Persistent storage                       |
| **HPA**              | Line 45-60 in any service           | Auto-scaling based on metrics            |

### 🎯 Understanding Your Architecture

1. **Read**: `k8s/infrastructure/namespace.yaml` → Creates isolated environment
2. **Read**: `k8s/infrastructure/configmap.yaml` → How services find each other
3. **Read**: `k8s/services/auth-service.yaml` → Complete service example
4. **Practice**: Deploy one service at a time:
   ```powershell
   kubectl apply -f k8s/infrastructure/postgres.yaml
   kubectl wait --for=condition=ready pod -l app=postgres -n tiktok-clone --timeout=300s
   kubectl apply -f k8s/services/auth-service.yaml
   ```

### 🧑‍🏫 Helm Learning Path

1. **Level 1**: Understand values files
   - Read `helm/tiktok-clone/values.yaml`
   - Understand structure

2. **Level 2**: Template syntax
   - Read `helm/tiktok-clone/templates/configmap.yaml`
   - Understand `{{ .Values.* }}` syntax

3. **Level 3**: Conditionals & Loops
   - Read `helm/tiktok-clone/templates/postgres.yaml`
   - Understand `{{ if .Values.postgresql.enabled }}`

4. **Level 4**: Operations
   - Install, upgrade, rollback releases
   - Override values from command line

### 💡 Key Learning Points

#### **Service Discovery in K8s**

```yaml
# Inside container, access database like this:
DB_HOST: postgres.tiktok-clone.svc.cluster.local
# Pattern: {service-name}.{namespace}.svc.cluster.local
```

#### **Configuration Management**

```yaml
# Instead of hardcoding, inject from ConfigMap:
env:
  - name: DB_HOST
    valueFrom:
      configMapKeyRef:
        name: tiktok-db-config
        key: DB_HOST
```

#### **Secret Management**

```yaml
# Sensitive data in Secrets (base64 encoded):
- name: DB_PASSWORD
  valueFrom:
    secretKeyRef:
      name: tiktok-db-secrets
      key: DB_PASSWORD
```

#### **Auto-scaling**

```yaml
# HPA automatically scales based on metrics:
HorizontalPodAutoscaler:
  minReplicas: 2
  maxReplicas: 5
  targetCPUUtilization: 70% # Scale up when > 70%
```

---

## 🎓 Next Steps

1. ✅ **Deploy locally**: `helm install tiktok-clone ./helm/tiktok-clone -f values-dev.yaml`
2. ✅ **Monitor**: `kubectl get pods -n tiktok-clone -w`
3. ✅ **Debug**: `kubectl logs {pod} -n tiktok-clone -f`
4. ✅ **Scale manually**: `kubectl scale deployment auth-service --replicas=5`
5. ✅ **Update values**: Edit `values.yaml` then `helm upgrade tiktok-clone ...`
6. ✅ **Rollback**: `helm rollback tiktok-clone 1`

---

## 📚 References

- [Kubernetes Documentation](https://kubernetes.io/docs)
- [Helm Documentation](https://helm.sh/docs)
- [YAML Format](https://yaml.org)
- [kubectl Cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet)
- [Container Best Practices](https://docs.docker.com/develop/dev-best-practices)

---

**Happy Kubernetes learning! 🚀**
