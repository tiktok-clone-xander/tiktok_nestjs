# 🚀 Kubernetes & Helm Quick Reference

## One-Liner Commands

### Setup & Cluster

```powershell
# Verify cluster
kubectl cluster-info

# Create namespace
kubectl create namespace tiktok-clone

# Get all resources
kubectl get all -n tiktok-clone
```

### Helm Deployment

```powershell
# Development (1 replica, minimal resources)
helm install tiktok-clone ./helm/tiktok-clone -f values-dev.yaml -n tiktok-clone

# Staging (2 replicas, medium resources)
helm install tiktok-clone ./helm/tiktok-clone -f values-staging.yaml -n tiktok-clone

# Production (3 replicas, full resources + HPA)
helm install tiktok-clone ./helm/tiktok-clone -f values-prod.yaml -n tiktok-clone

# Upgrade existing
helm upgrade tiktok-clone ./helm/tiktok-clone -f values-prod.yaml -n tiktok-clone

# Rollback to version 1
helm rollback tiktok-clone 1

# View history
helm history tiktok-clone

# Uninstall
helm uninstall tiktok-clone -n tiktok-clone
```

### Pods & Logs

```powershell
# Watch all pods
kubectl get pods -n tiktok-clone -w

# View pod details
kubectl describe pod {pod-name} -n tiktok-clone

# Follow logs
kubectl logs {pod-name} -n tiktok-clone -f

# Get logs from all pods matching label
kubectl logs -n tiktok-clone -l app=auth-service --tail=50

# Execute command in pod
kubectl exec -it {pod-name} -n tiktok-clone -- bash

# Test connectivity
kubectl exec -it {pod-name} -n tiktok-clone -- curl http://auth-service:4001/health
```

### Services & Networking

```powershell
# View all services
kubectl get svc -n tiktok-clone

# Port forward to localhost
kubectl port-forward -n tiktok-clone svc/api-gateway 4000:4000
kubectl port-forward -n tiktok-clone svc/frontend 3000:3000

# Check DNS inside pod
kubectl exec -it {pod-name} -n tiktok-clone -- nslookup postgres

# Get service endpoints
kubectl get endpoints -n tiktok-clone
```

### Scaling & Performance

```powershell
# Scale deployment
kubectl scale deployment auth-service --replicas=5 -n tiktok-clone

# View HPA status
kubectl get hpa -n tiktok-clone

# View HPA details
kubectl describe hpa auth-service-hpa -n tiktok-clone

# Check resource usage
kubectl top pods -n tiktok-clone
kubectl top nodes

# Manual rollout restart
kubectl rollout restart deployment/auth-service -n tiktok-clone
```

### ConfigMap & Secrets

```powershell
# View ConfigMap
kubectl get cm -n tiktok-clone
kubectl describe cm tiktok-db-config -n tiktok-clone

# View Secret (base64 encoded)
kubectl get secrets -n tiktok-clone
kubectl get secret tiktok-db-secrets -o yaml -n tiktok-clone

# Update ConfigMap
kubectl edit cm tiktok-db-config -n tiktok-clone

# Delete and recreate
kubectl delete cm tiktok-db-config -n tiktok-clone
kubectl apply -f k8s/infrastructure/configmap.yaml
```

### Storage

```powershell
# View persistent volumes
kubectl get pv

# View persistent volume claims
kubectl get pvc -n tiktok-clone

# Check volume usage (inside pod)
kubectl exec -it postgres-0 -n tiktok-clone -- df -h
```

### Debugging

```powershell
# Get events (most recent)
kubectl get events -n tiktok-clone --sort-by='.lastTimestamp'

# Describe node for resource info
kubectl describe node

# Get events for specific pod
kubectl get events -n tiktok-clone --field-selector involvedObject.name={pod-name}

# Complete pod info
kubectl get pod {pod-name} -n tiktok-clone -o yaml

# YAML output of deployment
kubectl get deployment auth-service -n tiktok-clone -o yaml
```

---

## Helm Values Override Examples

### Override values from CLI

```powershell
# Single value
helm install tiktok-clone ./helm/tiktok-clone --set postgresql.auth.password=newpassword

# Multiple values
helm install tiktok-clone ./helm/tiktok-clone \
  --set services.auth.replicas=3 \
  --set services.video.replicas=4 \
  --set global.environment=staging

# Nested values
helm install tiktok-clone ./helm/tiktok-clone \
  --set postgresql.persistence.size=50Gi
```

### Dry-run to see what will be deployed

```powershell
# See generated manifests without deploying
helm install tiktok-clone ./helm/tiktok-clone --dry-run --debug -f values-prod.yaml

# Render templates only
helm template tiktok-clone ./helm/tiktok-clone -f values-prod.yaml > output.yaml
```

---

## Environment-Specific Deployment

### Development

```powershell
helm install tiktok-clone ./helm/tiktok-clone \
  -f helm/tiktok-clone/values.yaml \
  -f helm/tiktok-clone/values-dev.yaml \
  -n tiktok-clone

# Results in: 1 replica per service, minimal resources
```

### Staging

```powershell
helm install tiktok-clone ./helm/tiktok-clone \
  -f helm/tiktok-clone/values.yaml \
  -f helm/tiktok-clone/values-staging.yaml \
  -n tiktok-clone

# Results in: 2 replicas per service, medium resources
```

### Production

```powershell
helm install tiktok-clone ./helm/tiktok-clone \
  -f helm/tiktok-clone/values.yaml \
  -f helm/tiktok-clone/values-prod.yaml \
  -n tiktok-clone

# Results in: 3 replicas, HPA enabled, full resources
```

---

## Common Helm Patterns

### Check what will be installed

```powershell
# Before actual installation
helm template tiktok-clone ./helm/tiktok-clone -f values-prod.yaml | Out-File preview.yaml

# Review preview.yaml
code preview.yaml
```

### Lint chart for errors

```powershell
# Check for issues
helm lint ./helm/tiktok-clone
```

### Package chart for distribution

```powershell
# Create .tgz file
helm package ./helm/tiktok-clone

# Upload to chart repository (optional)
```

---

## Troubleshooting Quick Guide

| Problem              | Command                                     | Check                         |
| -------------------- | ------------------------------------------- | ----------------------------- |
| Pod not starting     | `kubectl describe pod`                      | Image, resources, secrets     |
| Container crashing   | `kubectl logs {pod} -f`                     | Application errors            |
| Can't access service | `kubectl get svc` + `kubectl get endpoints` | Service exists, has endpoints |
| DNS not resolving    | `kubectl exec {pod} -- nslookup`            | DNS working inside cluster    |
| No storage           | `kubectl get pv,pvc`                        | PersistentVolume exists       |
| High CPU             | `kubectl top pods`                          | Which pod, scale up replicas  |
| No response from pod | `kubectl port-forward svc/{svc}`            | Test locally                  |

---

## File Locations Reference

```
project/
├── k8s/                                    # Raw K8s manifests
│   ├── infrastructure/                     # DB, Redis, Kafka
│   │   ├── namespace.yaml
│   │   ├── configmap.yaml
│   │   ├── secrets.yaml
│   │   ├── postgres.yaml
│   │   ├── redis.yaml
│   │   └── kafka.yaml
│   ├── services/                           # Microservices
│   │   ├── auth-service.yaml
│   │   ├── video-service.yaml
│   │   ├── interaction-service.yaml
│   │   ├── notification-service.yaml
│   │   ├── api-gateway.yaml
│   │   └── frontend.yaml
│   └── monitoring/                         # (future)
│
├── helm/                                   # Helm charts
│   └── tiktok-clone/
│       ├── Chart.yaml                      # Chart metadata
│       ├── values.yaml                     # Default config
│       ├── values-dev.yaml                 # Dev overrides
│       ├── values-staging.yaml             # Staging overrides
│       ├── values-prod.yaml                # Production overrides
│       ├── templates/                      # Go templates
│       └── charts/                         # Sub-charts (empty)
│
└── docs/
    └── KUBERNETES_HELM_SETUP.md            # Full documentation
```

---

## Service URLs Inside Cluster

```
PostgreSQL:            postgres.tiktok-clone.svc.cluster.local:5432
Redis:                 redis.tiktok-clone.svc.cluster.local:6379
Kafka:                 kafka.tiktok-clone.svc.cluster.local:9092

Auth Service:          auth-service.tiktok-clone.svc.cluster.local:4001
Video Service:         video-service.tiktok-clone.svc.cluster.local:4002
Interaction Service:   interaction-service.tiktok-clone.svc.cluster.local:4003
Notification Service:  notification-service.tiktok-clone.svc.cluster.local:4004

Auth gRPC:             auth-service.tiktok-clone.svc.cluster.local:50051
Video gRPC:            video-service.tiktok-clone.svc.cluster.local:50052
Interaction gRPC:      interaction-service.tiktok-clone.svc.cluster.local:50053
Notification gRPC:     notification-service.tiktok-clone.svc.cluster.local:50054

API Gateway:           api-gateway.tiktok-clone.svc.cluster.local:4000
Frontend:              frontend.tiktok-clone.svc.cluster.local:3000
```

---

## Windows PowerShell Tips

```powershell
# Run multiple port forwards
Start-Process powershell -ArgumentList "kubectl port-forward -n tiktok-clone svc/api-gateway 4000:4000"
Start-Process powershell -ArgumentList "kubectl port-forward -n tiktok-clone svc/frontend 3000:3000"
Start-Process powershell -ArgumentList "kubectl port-forward -n tiktok-clone svc/postgres 5432:5432"

# Watch pods with color
kubectl get pods -n tiktok-clone -w | Tee-Object -FilePath watch.log

# Get specific field from YAML
kubectl get pod {pod-name} -n tiktok-clone -o jsonpath='{.spec.containers[0].image}'
```

---

**Pro Tips:**

- 🎯 Always use `-n tiktok-clone` to avoid mistakes
- 📊 Use `kubectl get ... -w` to watch changes in real-time
- 🐛 Check logs first, then describe, then events
- 🔄 HPA is automatic after threshold—no manual action needed
- 💾 Always backup values files before upgrade
- 🚀 Test with `--dry-run --debug` before deploying
