# 📚 Kubernetes & Helm - Visual Learning Guide

## 1️⃣ What is Kubernetes?

```
Your Application (in containers)
         ↓
    Kubernetes (Orchestrator)
         ↓
    ┌─────────────────────────────┐
    │  • Runs containers          │
    │  • Scales automatically     │
    │  • Heals failed pods        │
    │  • Networks containers      │
    │  • Manages storage          │
    │  • Updates without downtime │
    └─────────────────────────────┘
```

---

## 2️⃣ Key Kubernetes Objects

### Pod (Smallest Unit)

```
┌─────────────────────┐
│      Pod            │
│  ┌───────────────┐  │
│  │   Container   │  │
│  │ (Docker/Node) │  │
│  └───────────────┘  │
└─────────────────────┘
```

### Service (Network)

```
         Service
    (DNS entry + Load Balancer)
             ↓
    ┌────────┴────────┐
    │        │        │
  Pod 1    Pod 2    Pod 3
```

### Deployment (Manage Pods)

```
Deployment
    ├─ Replica 1 ─→ Pod
    ├─ Replica 2 ─→ Pod
    ├─ Replica 3 ─→ Pod
    └─ Auto-scales based on load
```

### StatefulSet (Stateful Apps)

```
StatefulSet
    ├─ postgres-0  ─→ Pod (stable name)
    ├─ postgres-1  ─→ Pod (persistent storage)
    └─ postgres-2  ─→ Pod (ordered startup)
```

---

## 3️⃣ Your TikTok Clone Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    External Users (Internet)               │
└──────────────────────────┬─────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
   ┌─────────────┐                    ┌────────────┐
   │ API Gateway │                    │ Frontend   │
   │ Service     │◄────calls────►     │ (Next.js)  │
   │ (4000)      │                    │ (3000)     │
   └──────┬──────┘                    └────────────┘
          │
    ┌─────┼─────────┬──────┬────────┐
    │     │         │      │        │
    ▼     ▼         ▼      ▼        ▼
  ┌──┐  ┌──┐  ┌──────┐ ┌────┐    gRPC communication
  │AS│  │VS│  │Inter │ │Notif│   (microservices)
  │  │  │  │  │Svc   │ │Svc  │
  └──┘  └──┘  └──────┘ └────┘
    │     │      │        │
    └─────┼──────┼────────┘
          │
    ┌─────┴──────────┬───────┬────────┐
    │                │       │        │
    ▼                ▼       ▼        ▼
  ┌──────────┐  ┌────────┐ ┌──────┐ ┌──────┐
  │PostgreSQL│  │ Redis  │ │Kafka │ │ ...  │
  │  (Data)  │  │(Cache) │ │ (Msg)│ │      │
  └──────────┘  └────────┘ └──────┘ └──────┘
```

**Key Points**:

- Services find each other by name: `auth-service.tiktok-clone.svc.cluster.local`
- gRPC for internal communication (fast, binary)
- HTTP/REST for external APIs
- Database & Cache shared by all services

---

## 4️⃣ ConfigMap & Secret (Configuration)

### Without ConfigMap/Secret (❌ Bad)

```
Service Code:
    const dbHost = "auth-service-db-prod-server";
    const dbPort = 5432;
    const dbPassword = "super-secret-123";

Problem: Hardcoded! Can't change without rebuilding image
```

### With ConfigMap/Secret (✅ Good)

```
ConfigMap (tiktok-db-config):
    DB_HOST: postgres.tiktok-clone.svc.cluster.local
    DB_PORT: 5432
    DB_NAME: tiktok_clone

Secret (tiktok-db-secrets):
    DB_PASSWORD: (base64 encoded)
    JWT_ACCESS_SECRET: (base64 encoded)

Service Code:
    const dbHost = process.env.DB_HOST;      // From ConfigMap
    const dbPassword = process.env.DB_PASSWORD; // From Secret

Benefit: Change config without rebuilding!
```

### Environment Injection

```
┌──────────────────────┐
│   Container starts   │
└──────────┬───────────┘
           │
    ┌──────▼──────┐
    │ Load env    │
    │ from:       │
    │ ┌────────┐  │
    │ │ConfigMP│  │
    │ │Secret  │  │
    │ └────────┘  │
    └──────┬──────┘
           │
    ┌──────▼───────────────┐
    │ Available inside     │
    │ container:           │
    │ DB_HOST, DB_PASSWORD │
    │ JWT_ACCESS_SECRET... │
    └──────────────────────┘
```

---

## 5️⃣ Helm Templating

### Helm Template Flow

```
values.yaml
    │
    ├─ postgresql:
    │   auth:
    │     password: "postgres"
    │
    ├─ services:
    │   auth:
    │     replicas: 2
    │     port: 4001
    └─ ...
         │
         ▼
    Helm Template Engine
         │
    ├─ {{ .Values.postgresql.auth.password }}
    │  becomes: "postgres"
    │
    ├─ {{ if .Values.postgresql.enabled }}
    │  conditionally include postgres
    │
    └─ {{ range .Values.services }}
       loop through each service
         │
         ▼
    Generated K8s Manifests (YAML)
         │
         ▼
    kubectl apply
         │
         ▼
    Kubernetes Cluster
         │
         ▼
    Running Pods ✅
```

### Before/After Example

**Before (hardcoded - k8s/services/auth-service.yaml)**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 2 # ← Hardcoded! Can't change
  template:
    spec:
      containers:
        - image: tiktok-auth-service:latest
          ports:
            - containerPort: 4001 # ← Hardcoded!
          env:
            - name: PORT
              value: '4001' # ← Hardcoded!
```

**After (templated - helm/templates/auth-service.yaml)**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: { { .Values.services.auth.name } }
spec:
  replicas: { { .Values.services.auth.replicas } } # ← From values!
  template:
    spec:
      containers:
        - image: '{{ .Values.services.auth.image.repository }}:{{ .Values.services.auth.image.tag }}'
          ports:
            - containerPort: { { .Values.services.auth.port } } # ← From values!
          env:
            - name: PORT
              value: { { .Values.services.auth.port | quote } } # ← From values!
```

**Using different values files**:

```
helm install ... -f values.yaml -f values-dev.yaml
      ↓
values.yaml: replicas: 2
values-dev.yaml: replicas: 1
      ↓
Final value: 1 ✅ (dev override wins)

helm install ... -f values.yaml -f values-prod.yaml
      ↓
values.yaml: replicas: 2
values-prod.yaml: replicas: 3
      ↓
Final value: 3 ✅ (prod override wins)
```

---

## 6️⃣ Pod Lifecycle & Health Checks

### Pod Starting

```
1. Pod created
         ↓
2. Image pulled from registry
         ↓
3. Container starts
         ↓
4. Application initializes (connects to DB, etc.)
         ↓
5. Readiness probe runs: GET /health
    ├─ Success (200 OK) → Pod becomes ready
    └─ Failure → Retry (5s, then mark not ready)
         ↓
6. Service starts sending traffic
```

### Health Probes

```
Readiness Probe (Can I receive traffic?)
    ├─ Runs every 5 seconds
    ├─ Check: GET /health
    ├─ If fails → Remove from load balancer
    └─ Pod still alive, just not receiving traffic

Liveness Probe (Is the pod alive?)
    ├─ Runs every 10 seconds
    ├─ Check: GET /health
    ├─ If fails for 3 times → RESTART pod
    └─ Automatic recovery from crashes
```

### Pod States

```
Pending → Container init
   ↓
Running → Healthy & ready
   ├─ Receives traffic ✅
   │
   └─ CrashLoopBackOff
      └─ Application crashing, K8s retrying
         └─ Check logs: kubectl logs {pod}

      └─ ImagePullBackOff
         └─ Docker image not found
         └─ Build image or fix image name

      └─ ErrImagePull
         └─ Registry unreachable
         └─ Check image URL, registry creds
```

---

## 7️⃣ Service Discovery

### How Services Find Each Other

**Inside a Pod**:

```
Container A needs to call Auth Service

1. Container: curl http://auth-service:4001/health
2. DNS: What's the IP of "auth-service"?
3. CoreDNS (K8s DNS): 10.5.123.45
4. Request: 10.5.123.45:4001 ✅
5. Service: Routes to Pod 1, Pod 2, or Pod 3 (load balanced)
6. Response ✅
```

**DNS Names**:

```
Short name (same namespace):
    postgres
    redis
    auth-service

Full name (any namespace):
    postgres.tiktok-clone.svc.cluster.local
    redis.tiktok-clone.svc.cluster.local
    auth-service.tiktok-clone.svc.cluster.local

Format:
    {service}.{namespace}.svc.cluster.local
```

**Behind the Scenes**:

```
┌─────────────────────────────────────┐
│ Service: auth-service               │
│  - Port: 4001                       │
│  - Selector: app: auth-service      │
└──────────┬────────────────────────┬─┘
           │                        │
         Load Balancing            Pod Selection
           │                        │
           ▼                        ▼
    ┌────────────────┐   ┌──────────────────────┐
    │ kubernetes     │   │ Find all Pods with   │
    │ kube-proxy     │   │ label: app=auth-svc  │
    │ distributes    │   └──────────────────────┘
    │ traffic        │            ↓
    │ Round-robin    │   ┌──────────────────────┐
    └────────────────┘   │ auth-pod-1: 10.1     │
                         │ auth-pod-2: 10.2     │
                         │ auth-pod-3: 10.3     │
                         └──────────────────────┘
```

---

## 8️⃣ Scaling & Auto-Scaling

### Manual Scaling

```
kubectl scale deployment auth-service --replicas=5

Before:                After:
┌────┐                 ┌────┐
│pod1│                 │pod1│
├────┤                 ├────┤
│pod2│                 │pod2│
├────┤                 ├────┤
│    │                 │pod3│
     ├────┤           ├────┤
     │pod4│
     ├────┤
     │pod5│
     └────┘

Replicas: 2 → 5
```

### Auto-Scaling (HPA)

```
HPA: Horizontal Pod Autoscaler

Monitor CPU/Memory:
    ├─ High load (CPU > 70%)
    │   └─ Scale UP (add pods)
    │
    └─ Low load (CPU < 30%)
        └─ Scale DOWN (remove pods)

Example: auth-service
    ├─ Min: 2 pods
    ├─ Max: 5 pods
    └─ Target CPU: 70%

Load increases:
    Step 1: Current 2 pods, CPU = 85% (> 70%)
    Step 2: Scale to 3 pods
    Step 3: Wait 3 minutes
    Step 4: CPU = 72% (still > 70%)
    Step 5: Scale to 4 pods
    ... repeat until CPU < 70%
```

---

## 9️⃣ Deployment Strategy

### Rolling Update (Default)

```
Version 1 → Version 2 (gradual replacement)

Old:  ┌─────┐ ┌─────┐ ┌─────┐
      │ v1  │ │ v1  │ │ v1  │ (3 pods)
      └─────┘ └─────┘ └─────┘
         ↓
      ┌─────┐ ┌─────┐ ┌─────┐
      │ v2  │ │ v1  │ │ v1  │ (1 updated)
      └─────┘ └─────┘ └─────┘
         ↓
      ┌─────┐ ┌─────┐ ┌─────┐
      │ v2  │ │ v2  │ │ v1  │ (2 updated)
      └─────┘ └─────┘ └─────┘
         ↓
      ┌─────┐ ┌─────┐ ┌─────┐
      │ v2  │ │ v2  │ │ v2  │ (3 updated)
      └─────┘ └─────┘ └─────┘

No downtime! Gradual transition.
If new version fails, rollback automatically.
```

---

## 🔟 Your Deployment Workflow

### Step 1: Create Images

```
Source Code → Docker Build → Image → Registry
                    ↓
        tiktok-auth-service:latest
        tiktok-video-service:latest
        ... etc
```

### Step 2: Create K8s Resources

```
Helm values + templates → Generated manifests → kubectl apply
                              ↓
                        postgres.yaml
                        redis.yaml
                        auth-service.yaml
                        ... etc
```

### Step 3: Pods Start

```
Manifest applied → Pod created → Container starts
                                      ↓
                            Application initialization
                                      ↓
                            Readiness probe → Ready ✅
```

### Step 4: Services Connect

```
ConfigMap injected → Services get DB host
       ↓
       postgres.tiktok-clone.svc.cluster.local:5432
       ↓
       Connection established ✅
```

### Step 5: Traffic Flows

```
Client → LoadBalancer (api-gateway)
           ↓
        Service (distributes traffic)
           ↓
        ┌──┴──────┬──┐
        ↓         ↓  ↓
      pod1      pod2 pod3
                    ↓
      Response to client ✅
```

---

## 🎯 Summary

**Key Takeaways**:

1. ✅ **Pod** = Container wrapper
2. ✅ **Service** = Stable DNS + load balancer
3. ✅ **Deployment** = Manage pod replicas
4. ✅ **ConfigMap** = Configuration (non-sensitive)
5. ✅ **Secret** = Sensitive data (passwords)
6. ✅ **Helm** = Template engine + version control
7. ✅ **HPA** = Automatic scaling
8. ✅ **Health Checks** = Automatic recovery
9. ✅ **Service Discovery** = DNS inside cluster
10. ✅ **Rolling Updates** = Zero-downtime deployments

---

**Next**: Read `KUBERNETES_HELM_SETUP.md` for detailed implementation! 🚀
