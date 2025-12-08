# ⚡ Quick Command Reference - Copy & Paste Ready

## 🚀 Deployment

```powershell
# Option 1: Using automation script (RECOMMENDED)
.\deploy.ps1 -Environment dev -Action install
.\deploy.ps1 -Environment prod -Action upgrade
.\deploy.ps1 -Environment staging -Action uninstall

# Option 2: Using Helm directly
helm install tiktok-clone helm/tiktok-clone \
  -f helm/tiktok-clone/values-dev.yaml \
  -n tiktok-clone --create-namespace

helm upgrade tiktok-clone helm/tiktok-clone \
  -f helm/tiktok-clone/values-prod.yaml \
  -n tiktok-clone

helm uninstall tiktok-clone -n tiktok-clone

# Option 3: Using kubectl (raw manifests)
kubectl apply -f k8s/infrastructure/
kubectl apply -f k8s/services/
```

---

## 📊 Status & Monitoring

```powershell
# Watch everything in real-time
kubectl get all -n tiktok-clone -w

# Watch only pods
kubectl get pods -n tiktok-clone -w

# All services
kubectl get svc -n tiktok-clone

# All ConfigMaps & Secrets
kubectl get cm,secrets -n tiktok-clone

# All events (recent)
kubectl get events -n tiktok-clone --sort-by='.lastTimestamp'

# Resource usage
kubectl top pods -n tiktok-clone
kubectl top nodes
```

---

## 🐛 Debugging

```powershell
# View logs from specific service
kubectl logs -n tiktok-clone -l app=auth-service -f

# View logs from specific pod
kubectl logs {pod-name} -n tiktok-clone -f

# Get into pod (debug terminal)
kubectl exec -it {pod-name} -n tiktok-clone -- bash

# Describe pod (detailed info)
kubectl describe pod {pod-name} -n tiktok-clone

# Test service connectivity
kubectl exec -it {pod-name} -n tiktok-clone -- curl http://auth-service:4001/health

# Test database connection
kubectl exec -it postgres-0 -n tiktok-clone -- psql -U postgres

# DNS resolution test
kubectl exec -it {pod-name} -n tiktok-clone -- nslookup postgres
```

---

## 🔗 Port Forwarding (Local Access)

```powershell
# API Gateway
kubectl port-forward -n tiktok-clone svc/api-gateway 4000:4000

# Frontend
kubectl port-forward -n tiktok-clone svc/frontend 3000:3000

# Database
kubectl port-forward -n tiktok-clone svc/postgres 5432:5432

# Redis
kubectl port-forward -n tiktok-clone svc/redis 6379:6379

# Kafka
kubectl port-forward -n tiktok-clone svc/kafka 9092:9092

# Multiple at once (separate terminals)
# Terminal 1:
kubectl port-forward -n tiktok-clone svc/api-gateway 4000:4000

# Terminal 2:
kubectl port-forward -n tiktok-clone svc/frontend 3000:3000

# Terminal 3:
kubectl port-forward -n tiktok-clone svc/postgres 5432:5432
```

---

## 🔄 Scaling

```powershell
# Manual scale
kubectl scale deployment auth-service --replicas=5 -n tiktok-clone
kubectl scale deployment video-service --replicas=3 -n tiktok-clone

# View HPA status
kubectl get hpa -n tiktok-clone
kubectl describe hpa auth-service-hpa -n tiktok-clone

# View metrics (requires metrics-server)
kubectl top pods -n tiktok-clone
```

---

## 🔄 Rollout Management

```powershell
# Check rollout status
kubectl rollout status deployment/auth-service -n tiktok-clone

# View rollout history
kubectl rollout history deployment/auth-service -n tiktok-clone

# Restart deployment
kubectl rollout restart deployment/auth-service -n tiktok-clone

# Undo last rollout
kubectl rollout undo deployment/auth-service -n tiktok-clone

# Rollback to specific revision
kubectl rollout undo deployment/auth-service --to-revision=2 -n tiktok-clone
```

---

## ⚙️ Configuration Management

```powershell
# View ConfigMap
kubectl get cm -n tiktok-clone
kubectl get cm tiktok-db-config -n tiktok-clone -o yaml

# Edit ConfigMap
kubectl edit cm tiktok-db-config -n tiktok-clone

# View Secret (base64)
kubectl get secrets -n tiktok-clone
kubectl get secret tiktok-db-secrets -n tiktok-clone -o yaml

# Recreate from files
kubectl apply -f k8s/infrastructure/configmap.yaml
kubectl apply -f k8s/infrastructure/secrets.yaml

# Delete and reapply
kubectl delete cm tiktok-db-config -n tiktok-clone
kubectl apply -f k8s/infrastructure/configmap.yaml
```

---

## 💾 Storage Management

```powershell
# View persistent volumes
kubectl get pv

# View persistent volume claims
kubectl get pvc -n tiktok-clone

# Describe PVC
kubectl describe pvc postgres-pvc -n tiktok-clone

# Check storage usage inside pod
kubectl exec -it postgres-0 -n tiktok-clone -- df -h

# View volume status
kubectl get pv,pvc -n tiktok-clone -o wide
```

---

## 🗑️ Cleanup & Deletion

```powershell
# Delete specific resource
kubectl delete pod {pod-name} -n tiktok-clone
kubectl delete deployment auth-service -n tiktok-clone

# Delete all resources in namespace
kubectl delete all -n tiktok-clone

# Delete namespace (WARNING: deletes all resources inside)
kubectl delete namespace tiktok-clone

# Delete Helm release
helm uninstall tiktok-clone -n tiktok-clone
```

---

## 📦 Helm Specific Commands

```powershell
# List installed releases
helm list -n tiktok-clone

# Show release values
helm get values tiktok-clone -n tiktok-clone

# Show all rendered manifests
helm get manifest tiktok-clone -n tiktok-clone

# Dry run (preview without applying)
helm install tiktok-clone helm/tiktok-clone \
  -f values-prod.yaml --dry-run --debug -n tiktok-clone

# Template rendering
helm template tiktok-clone helm/tiktok-clone -f values-prod.yaml > output.yaml

# Lint chart
helm lint helm/tiktok-clone

# Show release history
helm history tiktok-clone -n tiktok-clone

# Rollback release
helm rollback tiktok-clone 1 -n tiktok-clone
helm rollback tiktok-clone 1 --force -n tiktok-clone

# Get release info
helm status tiktok-clone -n tiktok-clone
```

---

## 🐳 Docker Commands

```powershell
# Build images
docker build -t tiktok-auth-service:latest -f apps/auth-service/Dockerfile .
docker build -t tiktok-video-service:latest -f apps/video-service/Dockerfile .
docker build -t tiktok-interaction-service:latest -f apps/interaction-service/Dockerfile .
docker build -t tiktok-notification-service:latest -f apps/notification-service/Dockerfile .
docker build -t tiktok-api-gateway:latest -f apps/api-gateway/Dockerfile .
docker build -t tiktok-frontend:latest -f tiktok-frontend/Dockerfile ./tiktok-frontend

# List images
docker images | grep tiktok

# Run image locally
docker run -it -p 4001:4001 tiktok-auth-service:latest

# Push to registry (if needed)
docker tag tiktok-auth-service:latest myregistry/tiktok-auth-service:latest
docker push myregistry/tiktok-auth-service:latest
```

---

## 🎯 Useful Aliases (Add to Profile)

```powershell
# In $PROFILE (edit with: code $PROFILE)

function k { kubectl $args -n tiktok-clone }
function kl { kubectl logs $args -n tiktok-clone }
function kd { kubectl describe $args -n tiktok-clone }
function kg { kubectl get $args -n tiktok-clone }
function kx { kubectl exec $args -n tiktok-clone }

# Usage:
k get pods                    # Same as: kubectl get pods -n tiktok-clone
kl pod/{pod-name}             # Same as: kubectl logs pod/{pod-name} -n tiktok-clone
kd pod {pod-name}             # Same as: kubectl describe pod {pod-name} -n tiktok-clone
```

---

## 🔧 Common Patterns

```powershell
# Deploy and wait
helm install tiktok-clone helm/tiktok-clone -f values-dev.yaml -n tiktok-clone
kubectl wait --for=condition=ready pod -l app=auth-service -n tiktok-clone --timeout=300s

# Logs from all pods with label
kubectl logs -n tiktok-clone -l app=auth-service --tail=100 -f

# Get specific field
kubectl get pod {pod} -n tiktok-clone -o jsonpath='{.spec.containers[0].image}'

# Get pods by node
kubectl get pods -n tiktok-clone -o wide | grep {node-name}

# Check pod resource request/limit
kubectl get pod {pod} -n tiktok-clone -o yaml | grep -A10 resources:
```

---

## 📝 One-Liners

```powershell
# Restart all pods in deployment
kubectl rollout restart deployment/auth-service -n tiktok-clone

# Force delete stuck pod
kubectl delete pod {pod} -n tiktok-clone --grace-period=0 --force

# Copy file from pod
kubectl cp tiktok-clone/{pod}:{path} {local-path}

# Copy file to pod
kubectl cp {local-path} tiktok-clone/{pod}:{path}

# Execute command in all pods
kubectl exec -n tiktok-clone -l app=auth-service -- {command}

# Get pod YAML
kubectl get pod {pod} -n tiktok-clone -o yaml > pod.yaml

# Apply manifest from URL
kubectl apply -f https://example.com/manifest.yaml -n tiktok-clone

# Watch specific resource
kubectl get hpa -n tiktok-clone -w

# Get external IPs
kubectl get svc -n tiktok-clone -o jsonpath='{.items[*].status.loadBalancer.ingress[*].ip}'
```

---

## 🆘 Emergency Commands

```powershell
# Delete namespace forcefully
kubectl delete ns tiktok-clone --grace-period=0 --force

# Kill all pods in namespace
kubectl delete pods -n tiktok-clone --all

# Restart stuck Deployment
kubectl rollout restart deployment/auth-service -n tiktok-clone

# Reset cluster (WARNING: Deletes everything)
helm uninstall tiktok-clone -n tiktok-clone
kubectl delete ns tiktok-clone

# View API resources
kubectl api-resources

# Explain resource
kubectl explain pod.spec
```

---

## 📚 Help & Information

```powershell
# kubectl help
kubectl help
kubectl help deploy
kubectl help service

# Version info
kubectl version
helm version
docker version

# Cluster info
kubectl cluster-info
kubectl cluster-info dump

# Get available commands
kubectl --help
helm --help

# Check kubectl config
kubectl config view
kubectl config current-context
```

---

## 💾 Saving Output

```powershell
# Save pod logs to file
kubectl logs {pod} -n tiktok-clone > pod-logs.txt

# Save pod YAML to file
kubectl get pod {pod} -n tiktok-clone -o yaml > pod.yaml

# Save all resources to file
kubectl get all -n tiktok-clone -o yaml > all-resources.yaml

# Save events
kubectl get events -n tiktok-clone > events.txt

# Export for backup
kubectl get all -n tiktok-clone -o yaml | Out-File backup.yaml
```

---

**Pro Tip**: Create aliases in your PowerShell profile for commonly used commands!
