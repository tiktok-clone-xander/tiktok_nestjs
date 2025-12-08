# 🔧 Kubernetes & Helm Troubleshooting Guide

## 📋 Diagnostic Flowchart

```
Problem Detected
    ↓
[1] Check Pod Status: kubectl get pods -n tiktok-clone
    ├─ Pending → [2] Check Events
    ├─ CrashLoopBackOff → [3] Check Logs
    ├─ ImagePullBackOff → [4] Check Docker Images
    ├─ Not Ready → [5] Check Probes
    └─ Running → [6] Check Service
```

---

## Issue 1: Pods Stuck in Pending

### Symptoms

```powershell
kubectl get pods -n tiktok-clone
# STATUS: Pending (for > 30 seconds)
```

### Diagnosis

```powershell
# Step 1: Get events
kubectl get events -n tiktok-clone --sort-by='.lastTimestamp'

# Step 2: Describe pod
kubectl describe pod {pod-name} -n tiktok-clone
# Look for: "Conditions", "Events" sections

# Step 3: Check node resources
kubectl top nodes
kubectl describe node
```

### Solutions

#### A) Insufficient Memory

```powershell
# Error: "Insufficient memory"

# Solution 1: Increase Docker Desktop/Minikube resources
# Docker Desktop: Settings → Resources → Memory: 8GB+
# Minikube: minikube start --cpus=4 --memory=8192

# Solution 2: Reduce pod resources in values-dev.yaml
postgresql:
  resources:
    requests:
      memory: "128Mi"    # Reduce from 256Mi
      cpu: "100m"        # Reduce from 250m
    limits:
      memory: "256Mi"    # Reduce from 512Mi
      cpu: "200m"        # Reduce from 500m

# Apply changes
helm upgrade tiktok-clone ./helm/tiktok-clone -f values-dev.yaml
```

#### B) No Persistent Volume Available

```powershell
# Error: "no persistent volumes available"

# Solution 1: Check if PV exists
kubectl get pv

# Solution 2: Verify hostPath exists on node
# For Docker Desktop/Minikube: hostPath may not work
# Use: emptyDir (temporary) or create local directories

# Fix in values.yaml:
postgresql:
  persistence:
    storageClass: ""        # Use default
    # hostPath created automatically on first run
```

#### C) PVC Not Bound

```powershell
# Check PVC status
kubectl get pvc -n tiktok-clone

# If "Pending":
kubectl describe pvc postgres-pvc -n tiktok-clone
# Look at "Events" section

# Solution: Delete and recreate
kubectl delete pvc postgres-pvc -n tiktok-clone
# Wait for pod to create new PVC
```

---

## Issue 2: CrashLoopBackOff

### Symptoms

```powershell
kubectl get pods -n tiktok-clone
# STATUS: CrashLoopBackOff
# RESTARTS: 2, 3, 4... (continuously increasing)
```

### Diagnosis

```powershell
# Check logs (most important!)
kubectl logs {pod-name} -n tiktok-clone

# Get last exit code
kubectl describe pod {pod-name} -n tiktok-clone
# Look for: "Last State: Terminated" → "Exit Code"
```

### Common Exit Codes

| Exit Code | Meaning                   | Solution                       |
| --------- | ------------------------- | ------------------------------ |
| 1         | General application error | Check logs with `kubectl logs` |
| 127       | Command not found         | Check Dockerfile, entry point  |
| 139       | Segmentation fault        | Memory issue or bug            |
| 143       | Termination signal        | Graceful shutdown issue        |

### Solutions

#### A) Database Connection Error

```
Error: "connect ECONNREFUSED 127.0.0.1:5432"
```

```powershell
# Check if postgres is running
kubectl get pods -n tiktok-clone | grep postgres

# Check postgres logs
kubectl logs postgres-0 -n tiktok-clone

# Verify environment variables
kubectl exec {service-pod} -n tiktok-clone -- env | grep DB_

# Test connection from pod
kubectl exec -it {service-pod} -n tiktok-clone -- \
  pg_isready -h postgres -U postgres

# Common fix: Wrong service name in environment
# Check k8s/infrastructure/configmap.yaml
# Should be: postgres.tiktok-clone.svc.cluster.local
```

#### B) Missing Environment Variables

```
Error: "GRPC_AUTH_URL is not defined"
```

```powershell
# Check ConfigMap
kubectl get cm tiktok-db-config -n tiktok-clone -o yaml

# Check Secret
kubectl get secrets tiktok-db-secrets -n tiktok-clone -o yaml

# If missing, recreate:
kubectl apply -f k8s/infrastructure/configmap.yaml
kubectl apply -f k8s/infrastructure/secrets.yaml

# Or with Helm:
helm upgrade --force tiktok-clone ./helm/tiktok-clone -f values-prod.yaml
```

#### C) Image Not Found

```
Error: "image pull error", "ErrImagePull", "ImagePullBackOff"
```

```powershell
# Check if image exists
docker images | grep tiktok

# Build image if missing
docker build -t tiktok-auth-service:latest -f apps/auth-service/Dockerfile .

# Check image name in values.yaml
kubectl get deployment auth-service -n tiktok-clone -o yaml | grep image:

# Fix: Update values.yaml with correct image
services:
  auth:
    image:
      repository: tiktok-auth-service
      tag: latest

helm upgrade tiktok-clone ./helm/tiktok-clone -f values-prod.yaml
```

#### D) Port Already in Use

```
Error: "listen EADDRINUSE :::4001"
```

```powershell
# This shouldn't happen in K8s, but if it does:

# Find process using port
netstat -ano | findstr :4001

# Kill process (if needed)
taskkill /PID {PID} /F

# Usually a pod crashed ungracefully - restart it:
kubectl delete pod {pod-name} -n tiktok-clone
# K8s will auto-recreate

# Or restart deployment:
kubectl rollout restart deployment/auth-service -n tiktok-clone
```

---

## Issue 3: Services Can't Communicate

### Symptoms

```
Error: "getaddrinfo ENOTFOUND auth-service"
Error: "connect ECONNREFUSED"
Connection timeout
```

### Diagnosis

```powershell
# Step 1: Check if services exist
kubectl get svc -n tiktok-clone

# Step 2: Check if services have endpoints
kubectl get endpoints -n tiktok-clone

# Step 3: Test DNS from inside pod
kubectl exec -it {pod-name} -n tiktok-clone -- nslookup auth-service

# Step 4: Test full DNS name
kubectl exec -it {pod-name} -n tiktok-clone -- \
  nslookup auth-service.tiktok-clone.svc.cluster.local

# Step 5: Test HTTP connection
kubectl exec -it {pod-name} -n tiktok-clone -- \
  curl http://auth-service:4001/health

# Step 6: Check service port
kubectl get svc auth-service -n tiktok-clone -o yaml | grep port
```

### Solutions

#### A) Service Doesn't Exist

```powershell
# Error: "nslookup auth-service" → "can't resolve"

# Check if service created
kubectl get svc -n tiktok-clone | grep auth

# If not, apply:
kubectl apply -f k8s/services/auth-service.yaml

# Or with Helm:
helm upgrade tiktok-clone ./helm/tiktok-clone -f values-prod.yaml
```

#### B) Service Has No Endpoints

```powershell
# Output: "ENDPOINTS: <none>"

# This means no pods are running for this service

# Solution 1: Check if pods exist
kubectl get pods -n tiktok-clone -l app=auth-service

# Solution 2: If pods don't exist, create them
kubectl apply -f k8s/services/auth-service.yaml

# Solution 3: Check pod labels match selector
# In auth-service.yaml:
# selector:
#   app: auth-service
#
# Pod must have label:
#   labels:
#     app: auth-service

kubectl get pods -n tiktok-clone --show-labels
```

#### C) Wrong Service DNS Name

```powershell
# Wrong: "postgres.default" or "postgres:5432"
# Right: "postgres.tiktok-clone.svc.cluster.local:5432"

# Check environment in pod
kubectl exec {pod} -n tiktok-clone -- env | grep DB_

# Fix in values.yaml or configmap.yaml:
DB_HOST: postgres.tiktok-clone.svc.cluster.local

# Update ConfigMap:
kubectl apply -f k8s/infrastructure/configmap.yaml

# Restart pods to pick up new config:
kubectl rollout restart deployment/auth-service -n tiktok-clone
```

#### D) Port Mismatch

```powershell
# Service exposes port 4001
# Pod listens on port 4002

# Check service definition
kubectl get svc auth-service -n tiktok-clone -o yaml

# Check pod listening ports
kubectl exec {pod} -n tiktok-clone -- netstat -tlnp

# Fix in auth-service.yaml:
spec:
  ports:
    - port: 4001              # External port
      targetPort: 4001        # Container port (must match!)
```

---

## Issue 4: Readiness/Liveness Probe Failures

### Symptoms

```powershell
kubectl describe pod {pod-name} -n tiktok-clone
# "Readiness probe failed"
# "Liveness probe failed"
```

### Diagnosis

```powershell
# Check probe configuration
kubectl get pod {pod-name} -n tiktok-clone -o yaml | grep -A10 livenessProbe

# Check if /health endpoint exists
kubectl port-forward pod/{pod-name} 4001:4001 -n tiktok-clone
# Open: http://localhost:4001/health

# Check pod logs
kubectl logs {pod-name} -n tiktok-clone -f
```

### Solutions

#### A) /health Endpoint Returns Error

```powershell
# Test manually
kubectl port-forward pod/{pod-name} 4001:4001 -n tiktok-clone
# In another terminal:
curl http://localhost:4001/health

# If error, check:
# 1. Endpoint is implemented in NestJS
# 2. Service is ready (database initialized)
# 3. Port is correct
```

#### B) Probe Initial Delay Too Short

```powershell
# Pod needs time to start up

# In auth-service.yaml:
livenessProbe:
  httpGet:
    path: /health
    port: 4001
  initialDelaySeconds: 30      # ← Increase this!
  periodSeconds: 10

# For database services, increase more:
initialDelaySeconds: 60
periodSeconds: 15
```

#### C) Service Dependencies Not Ready

```powershell
# Service A can't start because Service B isn't ready

# Add pod dependencies in deployment:
spec:
  template:
    spec:
      initContainers:
        - name: wait-for-db
          image: busybox
          command: ['sh', '-c', 'until nc -z postgres 5432; do echo waiting for postgres; sleep 2; done;']
```

---

## Issue 5: Out of Memory (OOMKilled)

### Symptoms

```powershell
kubectl describe pod {pod-name} -n tiktok-clone
# Last State → Terminated: Exit Code 137 (OOMKilled)
# Reason: OOMKilled
```

### Diagnosis

```powershell
# Check memory limits
kubectl get pod {pod-name} -n tiktok-clone -o yaml | grep -A5 memory:

# Check actual memory usage
kubectl top pods -n tiktok-clone

# Check node memory
kubectl top nodes

# View memory events
kubectl describe pod {pod-name} -n tiktok-clone | grep -i memory
```

### Solutions

#### A) Increase Pod Memory Limit

```powershell
# Edit values-dev.yaml:
services:
  auth:
    resources:
      limits:
        memory: "512Mi"    # Increase from previous
        cpu: "500m"

# Apply:
helm upgrade tiktok-clone ./helm/tiktok-clone -f values-dev.yaml
```

#### B) Increase Cluster Memory

```powershell
# Docker Desktop: Settings → Resources → Memory: 8GB, 12GB, 16GB

# Minikube:
minikube stop
minikube delete
minikube start --cpus=4 --memory=16384
```

#### C) Reduce Number of Replicas

```powershell
# In values-dev.yaml, reduce replicas:
services:
  auth:
    replicas: 1      # Down from 2
  video:
    replicas: 1      # Down from 2

helm upgrade tiktok-clone ./helm/tiktok-clone -f values-dev.yaml
```

---

## Issue 6: Helm Install/Upgrade Fails

### Symptoms

```powershell
helm install tiktok-clone ./helm/tiktok-clone -f values-prod.yaml
# Error: some error message
```

### Solutions

#### A) Template Syntax Error

```powershell
# Use dry-run to see generated manifests
helm install tiktok-clone ./helm/tiktok-clone --dry-run --debug -f values-prod.yaml

# Or render and check:
helm template tiktok-clone ./helm/tiktok-clone -f values-prod.yaml > output.yaml
# Review output.yaml for issues

# Check template syntax:
helm lint ./helm/tiktok-clone
```

#### B) Values File Not Found

```powershell
# Error: "values.yaml: no such file"

# Make sure path is correct:
helm install tiktok-clone ./helm/tiktok-clone \
  -f helm/tiktok-clone/values-prod.yaml

# Or from project root:
helm install tiktok-clone helm/tiktok-clone \
  -f helm/tiktok-clone/values-prod.yaml
```

#### C) Release Already Exists

```powershell
# Error: "release tiktok-clone already exists"

# Use upgrade instead:
helm upgrade tiktok-clone ./helm/tiktok-clone -f values-prod.yaml

# Or delete and reinstall:
helm uninstall tiktok-clone -n tiktok-clone
helm install tiktok-clone ./helm/tiktok-clone -f values-prod.yaml
```

#### D) Invalid YAML in values file

```powershell
# Validate values file:
# Check for: quotes, colons, dashes alignment

# Example wrong:
postgresql:
  auth
    password: "test"  # Missing colon after "auth"

# Example right:
postgresql:
  auth:
    password: "test"  # Colon added
```

---

## Quick Diagnostic Script

```powershell
# Save as: k8s-diagnose.ps1

$namespace = "tiktok-clone"

Write-Host "=== CLUSTER STATUS ===" -ForegroundColor Green
kubectl cluster-info

Write-Host "`n=== NAMESPACE ===" -ForegroundColor Green
kubectl get ns | grep $namespace

Write-Host "`n=== PODS ===" -ForegroundColor Green
kubectl get pods -n $namespace -o wide

Write-Host "`n=== SERVICES ===" -ForegroundColor Green
kubectl get svc -n $namespace

Write-Host "`n=== RECENT EVENTS ===" -ForegroundColor Green
kubectl get events -n $namespace --sort-by='.lastTimestamp' | tail -10

Write-Host "`n=== POD DETAILS ===" -ForegroundColor Green
foreach ($pod in (kubectl get pods -n $namespace -o jsonpath='{.items[*].metadata.name}')) {
    Write-Host "`n  Pod: $pod" -ForegroundColor Yellow
    kubectl get pod $pod -n $namespace -o wide
    kubectl get pod $pod -n $namespace -o yaml | grep -A5 "conditions:"
}

Write-Host "`n=== RESOURCE USAGE ===" -ForegroundColor Green
kubectl top pods -n $namespace
kubectl top nodes

# Run:
# pwsh k8s-diagnose.ps1
```

---

## Need More Help?

```powershell
# Get interactive help
kubectl explain pod.spec
kubectl explain service.spec

# Check Kubernetes documentation
# https://kubernetes.io/docs

# Run:
kubectl api-resources

# List all events across cluster
kubectl get events -A --sort-by='.lastTimestamp' | tail -20
```
