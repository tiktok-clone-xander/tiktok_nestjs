# 📚 HƯỚNG DẪN HỌC TẬP - TikTok Clone Project

> **Dành cho người mới bắt đầu** - Hướng dẫn chi tiết từng bước để hiểu và build được dự án này!

## 🎯 Mục Lục

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Kiến thức nền tảng cần có](#2-kiến-thức-nền-tảng-cần-có)
3. [Roadmap học tập](#3-roadmap-học-tập)
4. [Chi tiết từng công nghệ](#4-chi-tiết-từng-công-nghệ)
5. [Kiến trúc dự án](#5-kiến-trúc-dự-án)
6. [Cách build dự án](#6-cách-build-dự-án)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Tổng quan dự án

### Dự án này là gì?

Đây là một ứng dụng **TikTok Clone** được xây dựng với:

- **Kiến trúc Microservices**: Chia thành nhiều service nhỏ, mỗi service làm 1 việc riêng
- **Monorepo**: Tất cả code nằm trong 1 repository duy nhất
- **Full-stack**: Có cả Backend (NestJS) và Frontend (Next.js)

### Dự án có những gì?

```
📦 tiktok_nestjs/
├── 🔴 Backend (NestJS - Microservices)
│   ├── API Gateway (cổng vào chính)
│   ├── Auth Service (đăng ký/đăng nhập)
│   ├── Video Service (upload/xem video)
│   ├── Interaction Service (like/comment)
│   └── Notification Service (thông báo real-time)
│
├── 🟢 Frontend (Next.js)
│   └── Giao diện người dùng (như TikTok)
│
├── 🗄️ Database & Storage
│   ├── PostgreSQL (lưu data)
│   ├── Redis (cache - làm nhanh hơn)
│   └── Kafka (message queue)
│
├── 🐳 DevOps & Deployment
│   ├── Docker (đóng gói ứng dụng)
│   ├── Kubernetes (quản lý containers)
│   ├── ArgoCD (tự động deploy)
│   └── Terraform (infrastructure as code)
│
└── 📊 Monitoring & Logging
    ├── Prometheus (thu thập metrics)
    ├── Grafana (dashboard đẹp)
    ├── Loki (log management)
    └── Sentry (theo dõi lỗi)
```

---

## 2. Kiến thức nền tảng cần có

### ✅ Bắt buộc phải biết

- [ ] **JavaScript/TypeScript** cơ bản
- [ ] **Node.js** và npm
- [ ] **REST API** là gì
- [ ] **Git** cơ bản

### ⚠️ Nên biết (học theo dự án cũng được)

- [ ] **NestJS** hoặc **Express.js**
- [ ] **React** hoặc **Next.js**
- [ ] **SQL** cơ bản
- [ ] **Docker** cơ bản

---

## 3. Roadmap học tập

### 🎓 Lộ trình học (4-8 tuần)

```
Tuần 1-2: Nền tảng Backend
├── TypeScript + NestJS
├── REST API
└── PostgreSQL + TypeORM

Tuần 3: Kiến trúc Microservices
├── gRPC là gì?
├── Message Queue (Kafka)
└── Service communication

Tuần 4: DevOps cơ bản
├── Docker & Docker Compose
├── Container là gì?
└── Chạy dự án local

Tuần 5: Frontend
├── Next.js basics
├── React hooks
└── API integration

Tuần 6-7: Advanced DevOps
├── Kubernetes
├── Helm Charts
└── ArgoCD

Tuần 8: Monitoring & Production
├── Prometheus + Grafana
├── Logging (Loki)
└── Error tracking (Sentry)
```

---

## 4. Chi tiết từng công nghệ

### 🔵 1. NestJS - Backend Framework

**NestJS là gì?**

- Framework để build ứng dụng Node.js
- Giống như Express nhưng có cấu trúc rõ ràng hơn
- Dùng TypeScript
- Hỗ trợ Microservices rất tốt

**Tại sao dùng NestJS?**

- ✅ Có sẵn cấu trúc (modules, controllers, services)
- ✅ Dễ test
- ✅ Hỗ trợ Dependency Injection
- ✅ Tích hợp sẵn với nhiều thứ (TypeORM, gRPC, Kafka...)

**Học NestJS ở đâu?**

- 📖 Docs chính thức: https://docs.nestjs.com/
- 🎥 YouTube: "NestJS Crash Course"
- 📝 Bắt đầu: `npm i -g @nestjs/cli` → `nest new project-name`

**Trong dự án này:**

```typescript
// Ví dụ: apps/auth-service/src/auth.controller.ts
@Controller('auth')
export class AuthController {
  @Post('register') // POST /auth/register
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
```

---

### 🔴 2. gRPC - Service Communication

**gRPC là gì?**

- Cách để các **microservices nói chuyện với nhau**
- Nhanh hơn REST API rất nhiều
- Dùng Protocol Buffers (protobuf) thay vì JSON

**Tại sao không dùng REST API giữa các services?**

- ❌ REST: Chậm, JSON nặng
- ✅ gRPC: Nhanh, binary format, type-safe

**Cách hoạt động:**

```protobuf
// proto/auth.proto - Định nghĩa interface
service AuthService {
  rpc ValidateToken(ValidateTokenRequest) returns (ValidateTokenResponse);
}

message ValidateTokenRequest {
  string token = 1;
}
```

**Học gRPC:**

- 📖 https://grpc.io/docs/what-is-grpc/
- 🎥 "gRPC Crash Course" trên YouTube
- 📝 Hiểu: Client gọi method như local function, nhưng thực ra chạy ở service khác

**Trong dự án:**

```typescript
// API Gateway gọi Auth Service qua gRPC
const result = await this.authService.validateToken({ token });
// Không cần fetch/axios!
```

---

### 🟠 3. Kafka - Message Queue

**Kafka là gì?**

- **Message broker** - như hệ thống bưu điện cho services
- Service A gửi message → Kafka giữ → Service B nhận
- **Asynchronous** - không cần đợi phản hồi ngay

**Tại sao cần Kafka?**
Ví dụ: User upload video

```
Video Service → Kafka → "video.uploaded" event
                    ↓
            ┌───────┴────────┐
            ↓                ↓
    Notification Service  Interaction Service
    (gửi thông báo)      (tạo counter)
```

**Khái niệm cơ bản:**

- **Producer**: Service gửi message
- **Consumer**: Service nhận message
- **Topic**: Chủ đề của message (vd: `video.uploaded`, `user.registered`)

**Học Kafka:**

- 📖 https://kafka.apache.org/intro
- 🎥 "Apache Kafka in 5 minutes"
- 📝 Cài Docker: `docker run -d apache/kafka`

**Trong dự án:**

```typescript
// Producer - Video Service
await this.kafkaClient.emit('video.uploaded', {
  videoId: video.id,
  userId: video.userId
});

// Consumer - Notification Service
@EventPattern('video.uploaded')
handleVideoUploaded(data: any) {
  // Gửi thông báo cho followers
}
```

---

### 🐘 4. PostgreSQL - Database

**PostgreSQL là gì?**

- **Relational Database** - CSDL quan hệ
- Lưu data trong tables với rows và columns
- Support SQL queries

**Trong dự án có gì?**

```sql
-- Table users
id | email | username | password_hash | created_at
1  | a@b.c | john     | $2b$10...    | 2024-01-01

-- Table videos
id | user_id | title | video_url | likes_count
1  | 1       | Demo  | /video/1  | 100
```

**Học PostgreSQL:**

- 📖 https://www.postgresql.org/docs/
- 🎥 "PostgreSQL Tutorial for Beginners"
- 📝 Try online: https://www.db-fiddle.com/

**TypeORM - ORM Tool:**

```typescript
// Thay vì viết SQL:
// SELECT * FROM users WHERE id = 1

// Dùng TypeORM:
const user = await this.userRepository.findOne({ where: { id: 1 } });
```

---

### 🔴 5. Redis - Caching Layer

**Redis là gì?**

- **In-memory database** - lưu trong RAM, cực nhanh
- Dùng để **cache** - lưu tạm data hay dùng
- Cũng dùng cho session, rate limiting

**Tại sao cần cache?**

```
Without Cache:
User request → Database (100ms) → Response
↑ Mỗi request đều phải query DB

With Redis:
User request → Redis (5ms) → Response (nếu có)
             ↘ Database (100ms) → Save to Redis (nếu chưa có)
```

**Học Redis:**

- 📖 https://redis.io/docs/
- 🎥 "Redis Crash Course"
- 📝 Try: `docker run -d redis` → `redis-cli`

**Trong dự án:**

```typescript
// Cache video data
await this.redisService.set(`video:${id}`, videoData, 3600); // TTL 1h

// Get from cache
const cached = await this.redisService.get(`video:${id}`);
if (cached) return cached; // Nhanh!
```

---

### 🐳 6. Docker - Containerization

**Docker là gì?**

- Đóng gói ứng dụng vào **container** (hộp kín)
- Container có tất cả: code, dependencies, environment
- "Works on my machine" → "Works everywhere!"

**Khái niệm cơ bản:**

- **Image**: Template (như file .iso)
- **Container**: Instance đang chạy (như máy ảo nhưng nhẹ hơn)
- **Dockerfile**: Công thức để build image

**Ví dụ Dockerfile:**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "start:prod"]
```

**Docker Compose:**

- Chạy nhiều containers cùng lúc
- Định nghĩa trong `docker-compose.yml`

**Học Docker:**

- 📖 https://docs.docker.com/get-started/
- 🎥 "Docker Tutorial for Beginners"
- 📝 Cài Docker Desktop

**Lệnh cơ bản:**

```bash
docker build -t my-app .           # Build image
docker run -p 3000:3000 my-app     # Chạy container
docker ps                          # Xem containers đang chạy
docker logs <container-id>         # Xem logs
docker-compose up -d               # Chạy tất cả services
```

---

### ☸️ 7. Kubernetes (K8s) - Container Orchestration

**Kubernetes là gì?**

- Quản lý **hàng trăm/hàng nghìn containers**
- Auto-scaling, load balancing, self-healing
- Production-grade orchestration

**Khi nào cần K8s?**

- ❌ Không cần: Small project, 1-3 services
- ✅ Cần: Production, nhiều services, cần scale

**Khái niệm cơ bản:**

```yaml
Pod: Container nhỏ nhất (1 hoặc nhiều containers)
Deployment: Quản lý Pods (replicas, updates)
Service: Load balancer cho Pods
Ingress: HTTP routing (như Nginx)
ConfigMap: Config files
Secret: Lưu passwords, keys
```

**Ví dụ:**

```yaml
# k8s/services/auth-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 3 # Chạy 3 instances
  template:
    spec:
      containers:
        - name: auth
          image: auth-service:latest
          ports:
            - containerPort: 3001
```

**Học K8s:**

- 📖 https://kubernetes.io/docs/tutorials/
- 🎥 "Kubernetes Tutorial for Beginners"
- 📝 Cài Minikube (K8s local): https://minikube.sigs.k8s.io/

**Lệnh cơ bản:**

```bash
kubectl get pods                    # Xem pods
kubectl get services                # Xem services
kubectl logs <pod-name>             # Xem logs
kubectl apply -f deployment.yaml    # Deploy
kubectl delete -f deployment.yaml   # Xóa
```

---

### 🎩 8. Helm - Kubernetes Package Manager

**Helm là gì?**

- **Package manager** cho Kubernetes (như npm cho Node.js)
- Đóng gói tất cả K8s YAML files thành 1 "Chart"
- Dễ install/upgrade/rollback

**Tại sao cần Helm?**

```
Without Helm:
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f configmap.yaml
... 20 files

With Helm:
helm install tiktok-clone ./helm/tiktok-clone
✅ Done!
```

**Cấu trúc Helm Chart:**

```
helm/tiktok-clone/
├── Chart.yaml        # Metadata
├── values.yaml       # Config (có thể override)
└── templates/        # K8s YAML templates
    ├── deployment.yaml
    ├── service.yaml
    └── ingress.yaml
```

**Học Helm:**

- 📖 https://helm.sh/docs/
- 🎥 "Helm Kubernetes Tutorial"
- 📝 Cài Helm: https://helm.sh/docs/intro/install/

**Lệnh cơ bản:**

```bash
helm install my-app ./chart           # Deploy
helm upgrade my-app ./chart           # Update
helm rollback my-app 1                # Rollback
helm list                             # Xem apps
helm uninstall my-app                 # Xóa
```

---

### 🐙 9. ArgoCD - GitOps Continuous Delivery

**ArgoCD là gì?**

- **GitOps tool** - Deploy tự động từ Git
- Theo dõi Git repo → Tự động sync với K8s cluster
- UI đẹp để quản lý deployments

**GitOps là gì?**

```
Traditional:
Developer → CI/CD → kubectl apply → K8s
           (phức tạp, dễ sai)

GitOps:
Developer → Git push → ArgoCD → K8s
           (ArgoCD tự động sync)
```

**Cách hoạt động:**

1. Bạn push code lên Git (GitHub/GitLab)
2. ArgoCD phát hiện thay đổi
3. ArgoCD tự động deploy lên K8s
4. Nếu có lỗi → rollback dễ dàng

**Trong dự án:**

```yaml
# argocd/application-prod.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: tiktok-clone-prod
spec:
  source:
    repoURL: https://github.com/betuanminh22032003/tiktok_nestjs
    path: helm/tiktok-clone
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated: # Tự động deploy!
      prune: true
      selfHeal: true
```

**Học ArgoCD:**

- 📖 https://argo-cd.readthedocs.io/
- 🎥 "ArgoCD Tutorial"
- 📝 Demo: https://cd.apps.argoproj.io/

---

### 🏗️ 10. Terraform - Infrastructure as Code

**Terraform là gì?**

- Viết **code** để tạo infrastructure (servers, networks...)
- Thay vì click-click trên AWS/GCP console
- **Reproducible** - chạy lại code → tạo lại infrastructure y hệt

**Tại sao cần Terraform?**

```
Without Terraform:
- Vào AWS console
- Click tạo EC2 instance
- Click tạo RDS database
- Click tạo Load Balancer
- ... 100 clicks
- Làm lại cho staging/prod → 200 clicks

With Terraform:
terraform apply
✅ Done! (cho tất cả environments)
```

**Ví dụ:**

```hcl
# terraform/main.tf
resource "aws_instance" "app_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "TikTok-App-Server"
  }
}

resource "aws_rds_instance" "postgres" {
  engine         = "postgres"
  instance_class = "db.t3.micro"
  # ...
}
```

**Học Terraform:**

- 📖 https://learn.hashicorp.com/terraform
- 🎥 "Terraform Course for Beginners"
- 📝 Cài Terraform: https://www.terraform.io/downloads

**Lệnh cơ bản:**

```bash
terraform init        # Khởi tạo
terraform plan        # Xem thay đổi
terraform apply       # Apply changes
terraform destroy     # Xóa tất cả
```

---

### 📊 11. Prometheus - Monitoring & Metrics

**Prometheus là gì?**

- Thu thập **metrics** từ ứng dụng
- Metrics = Số liệu (CPU, RAM, request count, response time...)
- Time-series database

**Tại sao cần monitoring?**

```
Production mà không có monitoring:
- App chạy chậm → Không biết tại sao
- Server crash → Không biết khi nào
- Bug → Phát hiện khi user complain

Với Prometheus:
- Real-time metrics → Biết ngay khi có vấn đề
- Alerts → Gửi notification khi có lỗi
- Historical data → Phân tích trends
```

**Metrics ví dụ:**

```
http_requests_total{method="GET", status="200"} 1000
http_request_duration_seconds{quantile="0.99"} 0.5
nodejs_memory_heap_used_bytes 50000000
```

**Trong dự án:**

```typescript
// NestJS với Prometheus
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [PrometheusModule.register()],
})
export class AppModule {}

// Metrics tự động được expose tại /metrics
```

**Học Prometheus:**

- 📖 https://prometheus.io/docs/introduction/overview/
- 🎥 "Prometheus Monitoring Tutorial"
- 📝 Try: `docker run -p 9090:9090 prom/prometheus`

---

### 📈 12. Grafana - Visualization & Dashboards

**Grafana là gì?**

- Biến metrics thành **dashboard đẹp**
- Connect với Prometheus, Loki...
- Alerting system

**Prometheus vs Grafana:**

- **Prometheus**: Thu thập và lưu data
- **Grafana**: Hiển thị data thành charts đẹp

**Dashboard ví dụ:**

```
┌─────────────────────────────────────┐
│  TikTok Clone - Production          │
├─────────────────────────────────────┤
│ 📊 Requests/sec:  1,234             │
│ 🕐 Avg Response:  45ms              │
│ ❌ Error Rate:    0.1%              │
│                                     │
│ [Chart: Request Timeline]           │
│ [Chart: Memory Usage]               │
│ [Chart: Top Endpoints]              │
└─────────────────────────────────────┘
```

**Học Grafana:**

- 📖 https://grafana.com/docs/
- 🎥 "Grafana Tutorial"
- 📝 Try: `docker run -p 3000:3000 grafana/grafana`

**Trong dự án:**

- Dashboard configs: `monitoring/grafana/dashboards/`
- Access: http://localhost:3001 (sau khi chạy monitoring)

---

### 📝 13. Loki - Log Aggregation

**Loki là gì?**

- Giống Prometheus nhưng cho **logs** (không phải metrics)
- Tập trung logs từ tất cả services vào 1 chỗ
- Query logs dễ dàng

**Tại sao cần Loki?**

```
Without Loki:
- Auth service logs → File A
- Video service logs → File B
- Gateway logs → File C
→ Phải mở 10 files để debug!

With Loki:
- All logs → Loki
- Query: {service="auth"} |= "error"
→ Thấy ngay tất cả errors!
```

**Query ví dụ:**

```
# Xem logs của auth-service
{service="auth-service"}

# Tìm errors
{service="auth-service"} |= "error"

# Logs trong 1h qua
{service="auth-service"}[1h]
```

**Học Loki:**

- 📖 https://grafana.com/docs/loki/
- 🎥 "Grafana Loki Tutorial"

---

### 🐛 14. Sentry - Error Tracking

**Sentry là gì?**

- Bắt **exceptions/errors** trong production
- Gửi thông báo ngay khi có lỗi
- UI đẹp để debug

**Tại sao cần Sentry?**

```
Without Sentry:
User: "App bị lỗi!"
Dev: "Lỗi gì? Khi nào? Làm sao reproduce?"
→ Không có info gì!

With Sentry:
- Error captured tự động
- Full stack trace
- User context, browser info
- Breadcrumbs (steps leading to error)
→ Debug dễ dàng!
```

**Trong dự án:**

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'your-sentry-dsn',
});

// Errors tự động được gửi lên Sentry
```

**Học Sentry:**

- 📖 https://docs.sentry.io/
- 🎥 "Sentry Crash Course"
- 📝 Tạo free account: https://sentry.io/signup/

---

### 🔍 15. ELK/ECK Stack - Logging

**ELK là gì?**

- **E**lasticsearch: Lưu logs
- **L**ogstash: Process logs
- **K**ibana: UI để xem logs

**ECK = Elastic Cloud on Kubernetes**

**Workflow:**

```
App → Logs → Logstash (transform) → Elasticsearch (store) → Kibana (visualize)
```

**So sánh với Loki:**

- **ELK**: Mạnh hơn, đầy đủ hơn, nặng hơn
- **Loki**: Nhẹ hơn, đơn giản hơn, đủ dùng

**Học ELK:**

- 📖 https://www.elastic.co/guide/
- 🎥 "ELK Stack Tutorial"

---

## 5. Kiến trúc dự án

### 🏗️ Kiến trúc Microservices

**Tại sao dùng Microservices?**

**Monolithic (cũ):**

```
┌─────────────────────────────┐
│   One Big Application       │
│  - Auth                     │
│  - Video                    │
│  - Notification             │
│  - Interaction              │
└─────────────────────────────┘
❌ 1 service crash → toàn bộ crash
❌ Scale 1 phần → phải scale tất cả
❌ Deploy → phải deploy tất cả
```

**Microservices (mới):**

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│   Auth   │  │  Video   │  │  Notif   │
└──────────┘  └──────────┘  └──────────┘
✅ Independent deploy
✅ Scale riêng từng service
✅ 1 service crash → others OK
```

### 🔄 Communication Flow

**User Upload Video:**

```
1. User → API Gateway → Video Service
                         ↓ (save to DB)
                         ↓ (upload to storage)
                         ↓ (emit Kafka event)

2. Kafka: "video.uploaded" event
                         ↓
         ┌───────────────┴────────────────┐
         ↓                                ↓
3. Notification Service           Interaction Service
   (notify followers)              (init counters)
```

### 📁 Project Structure

```
tiktok_nestjs/
│
├── apps/                          # Microservices
│   ├── api-gateway/               # Port 5555 - Entry point
│   │   ├── src/
│   │   │   ├── auth/              # Auth routes
│   │   │   ├── video/             # Video routes
│   │   │   ├── interaction/       # Like/Comment routes
│   │   │   └── main.ts            # Bootstrap
│   │   └── Dockerfile
│   │
│   ├── auth-service/              # Port 3001 - Authentication
│   │   ├── src/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── grpc.controller.ts # gRPC endpoints
│   │   └── Dockerfile
│   │
│   ├── video-service/             # Port 3002 - Video management
│   ├── interaction-service/       # Port 3003 - Likes/Comments
│   └── notification-service/      # Port 3004 - Real-time notifications
│
├── libs/                          # Shared libraries
│   ├── common/                    # Utils, guards, interceptors
│   ├── database/                  # TypeORM configs
│   ├── auth-db/                   # Auth service entities
│   ├── video-db/                  # Video service entities
│   ├── grpc/                      # gRPC client/server
│   ├── kafka/                     # Kafka producer/consumer
│   └── redis/                     # Redis service
│
├── proto/                         # gRPC Protocol Buffers
│   ├── auth.proto
│   ├── video.proto
│   └── ...
│
├── k8s/                           # Kubernetes manifests
│   ├── infrastructure/            # PostgreSQL, Redis, Kafka
│   ├── services/                  # Microservices deployments
│   └── monitoring/                # Prometheus, Grafana
│
├── helm/                          # Helm charts
│   └── tiktok-clone/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│
├── argocd/                        # ArgoCD configs
│   ├── application-dev.yaml
│   ├── application-staging.yaml
│   └── application-prod.yaml
│
├── terraform/                     # Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   └── environments.tf
│
├── monitoring/                    # Monitoring configs
│   ├── prometheus.yml
│   ├── alertmanager.yml
│   ├── grafana/dashboards/
│   └── loki-config.yml
│
├── tiktok-frontend/               # Next.js Frontend
│   ├── app/                       # App Router
│   ├── components/
│   ├── libs/
│   └── public/
│
├── docker-compose.yml             # Local development
└── package.json                   # Monorepo root
```

---

## 6. Cách build dự án

### 🚀 Bước 1: Chuẩn bị môi trường

**Cài đặt tools:**

```powershell
# 1. Node.js (v20+)
# Download: https://nodejs.org/

# 2. Docker Desktop
# Download: https://www.docker.com/products/docker-desktop/

# 3. Git
# Download: https://git-scm.com/

# Verify:
node --version    # v20.x.x
npm --version     # 10.x.x
docker --version  # 24.x.x
git --version     # 2.x.x
```

### 🚀 Bước 2: Clone & Setup

```powershell
# Clone repo
git clone https://github.com/betuanminh22032003/tiktok_nestjs.git
cd tiktok_nestjs

# Install dependencies (backend)
npm install

# Install frontend dependencies
cd tiktok-frontend
npm install
cd ..
```

### 🚀 Bước 3: Cấu hình Environment

```powershell
# Tạo .env file (hoặc chạy script tự động)
.\ensure-env.ps1

# Hoặc manual copy:
# cp .env.example .env
# Chỉnh sửa .env với thông tin của bạn
```

**File .env cơ bản:**

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=tiktok_clone

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Kafka
KAFKA_BROKERS=localhost:9092

# Sentry (optional)
SENTRY_DSN=your-sentry-dsn
```

### 🚀 Bước 4: Start Infrastructure

**Option 1: Docker Compose (Dễ nhất - Recommended)**

```powershell
# Start all infrastructure (PostgreSQL, Redis, Kafka...)
docker-compose up -d postgres redis kafka zookeeper

# Verify
docker ps
# Should see: postgres, redis, kafka, zookeeper running

# Check logs
docker logs tiktok_postgres
docker logs tiktok_redis
```

**Option 2: Manual Install**

```powershell
# PostgreSQL
# Download: https://www.postgresql.org/download/

# Redis
# Download: https://redis.io/download/

# Kafka (complicated, recommend Docker)
```

### 🚀 Bước 5: Database Setup

```powershell
# Run migrations
npm run migration:run

# Seed initial data
npm run seed:run

# Verify
# Connect to PostgreSQL và check tables:
# psql -U postgres -d tiktok_clone
# \dt (list tables)
```

### 🚀 Bước 6: Build Project

```powershell
# Build tất cả services
npm run build

# Build từng service
nest build auth-service
nest build video-service
# ...
```

### 🚀 Bước 7: Start Services

**Option 1: Development Mode (Hot Reload)**

```powershell
# Terminal 1 - API Gateway
npm run start:gateway

# Terminal 2 - Auth Service
npm run start:auth

# Terminal 3 - Video Service
npm run start:video

# Terminal 4 - Interaction Service
npm run start:interaction

# Terminal 5 - Notification Service
npm run start:notification

# Hoặc dùng VS Code Tasks (đã config sẵn)
# Ctrl+Shift+P → "Tasks: Run Task" → "Watch All Services"
```

**Option 2: Docker (Giống Production)**

```powershell
# Build images
docker-compose build

# Start all services
docker-compose up -d

# Verify
docker-compose ps

# Logs
docker-compose logs -f api-gateway
```

**Option 3: Script tự động**

```powershell
# All-in-one script
.\dev.ps1

# Hoặc riêng từng phần
.\dev.ps1 infra      # Chỉ infrastructure
.\dev.ps1 services   # Chỉ services
.\dev.ps1 stop       # Stop tất cả
.\dev.ps1 status     # Check status
```

### 🚀 Bước 8: Start Frontend

```powershell
# Terminal mới
cd tiktok-frontend
npm run dev

# Open: http://localhost:3000
```

### 🚀 Bước 9: Test API

```powershell
# Open Swagger UI
# http://localhost:5555/api/docs

# Hoặc dùng curl/Postman:

# Register
curl -X POST http://localhost:5555/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "username": "testuser",
    "password": "Test1234!"
  }'

# Login
curl -X POST http://localhost:5555/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test1234!"
  }'
```

### 🚀 Bước 10: Setup Monitoring (Optional)

```powershell
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access:
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3001 (admin/admin)
# - Loki: http://localhost:3100
```

---

## 7. Troubleshooting

### ❌ Common Errors

#### 1. "Cannot connect to PostgreSQL"

```powershell
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs tiktok_postgres

# Restart
docker restart tiktok_postgres

# Check connection
psql -U postgres -h localhost -p 5432
```

#### 2. "Port already in use"

```powershell
# Find process using port
netstat -ano | findstr :3001

# Kill process
taskkill /F /PID <PID>

# Or change port in .env
```

#### 3. "Module not found"

```powershell
# Clear cache
rm -rf node_modules
rm package-lock.json

# Reinstall
npm install

# Clear NestJS cache
npm run build -- --clean
```

#### 4. "gRPC connection failed"

```powershell
# Check if service is running
curl http://localhost:3001/health

# Check gRPC port
netstat -ano | findstr :50051

# Restart service
docker restart auth-service
```

#### 5. "Kafka connection timeout"

```powershell
# Check Kafka
docker ps | grep kafka

# Check Kafka logs
docker logs tiktok_kafka

# Restart Kafka
docker restart tiktok_kafka
docker restart tiktok_zookeeper
```

#### 6. "Database migration failed"

```powershell
# Check database connection
npm run typeorm -- query "SELECT 1"

# Drop all tables (⚠️ careful!)
npm run db:clear

# Re-run migrations
npm run migration:run
```

### 🔍 Debug Tips

**1. Check Service Health:**

```powershell
# All services should have /health endpoint
curl http://localhost:5555/health  # API Gateway
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Video Service
```

**2. Check Logs:**

```powershell
# Docker
docker logs -f <container-name>

# Local (check logs/ folder)
cat logs/error.log
cat logs/combined.log
```

**3. Check Environment:**

```powershell
# Verify .env exists
cat .env

# Check Node version
node --version  # Should be v20+

# Check dependencies
npm list
```

**4. Database Debugging:**

```powershell
# Connect to PostgreSQL
docker exec -it tiktok_postgres psql -U postgres -d tiktok_clone

# List tables
\dt

# Check users
SELECT * FROM users LIMIT 5;

# Check videos
SELECT * FROM videos LIMIT 5;
```

**5. Redis Debugging:**

```powershell
# Connect to Redis
docker exec -it tiktok_redis redis-cli

# Check keys
KEYS *

# Get value
GET key_name

# Check memory
INFO memory
```

---

## 🎓 Learning Path Summary

### Tuần 1-2: Backend Basics ✅

- [ ] NestJS fundamentals
- [ ] TypeScript advanced
- [ ] REST API design
- [ ] PostgreSQL + TypeORM
- [ ] Redis caching

### Tuần 3: Microservices ✅

- [ ] gRPC communication
- [ ] Kafka message queue
- [ ] Service-to-service auth
- [ ] API Gateway pattern

### Tuần 4: DevOps Basics ✅

- [ ] Docker basics
- [ ] Docker Compose
- [ ] Container networking
- [ ] Volume management

### Tuần 5: Frontend ✅

- [ ] Next.js + React
- [ ] State management
- [ ] API integration
- [ ] Real-time updates

### Tuần 6-7: Advanced DevOps ✅

- [ ] Kubernetes concepts
- [ ] Helm charts
- [ ] ArgoCD GitOps
- [ ] Terraform basics

### Tuần 8: Production ✅

- [ ] Prometheus monitoring
- [ ] Grafana dashboards
- [ ] Loki logging
- [ ] Sentry error tracking

---

## 📚 Resources

### Official Documentation

- [NestJS](https://docs.nestjs.com/)
- [Next.js](https://nextjs.org/docs)
- [gRPC](https://grpc.io/docs/)
- [Kafka](https://kafka.apache.org/documentation/)
- [Docker](https://docs.docker.com/)
- [Kubernetes](https://kubernetes.io/docs/)
- [Helm](https://helm.sh/docs/)
- [ArgoCD](https://argo-cd.readthedocs.io/)
- [Terraform](https://www.terraform.io/docs)
- [Prometheus](https://prometheus.io/docs/)
- [Grafana](https://grafana.com/docs/)

### YouTube Channels

- **TechWorld with Nana** - DevOps (K8s, Docker)
- **Traversy Media** - Web development
- **freeCodeCamp** - Full courses
- **Hussein Nasser** - Backend engineering
- **Fireship** - Quick tech overviews

### Books

- "Microservices Patterns" - Chris Richardson
- "Designing Data-Intensive Applications" - Martin Kleppmann
- "Kubernetes in Action" - Marko Luksa
- "Site Reliability Engineering" - Google

### Practice

- [Katacoda](https://www.katacoda.com/) - Interactive K8s labs
- [Play with Docker](https://labs.play-with-docker.com/)
- [Kubernetes Playground](https://www.katacoda.com/courses/kubernetes/playground)

---

## 🆘 Getting Help

### Trong dự án này:

```powershell
# Xem docs
cat docs/README.md
cat K8S_HELM_SETUP_SUMMARY.md
cat MONITORING_SETUP.md

# Quick commands
cat QUICK_COMMANDS.md
```

### Online Communities:

- **Stack Overflow** - Q&A
- **Reddit** - r/kubernetes, r/docker, r/node
- **Discord** - NestJS, Kubernetes servers
- **GitHub Issues** - Report bugs

### Contact:

- GitHub: [@betuanminh22032003](https://github.com/betuanminh22032003)
- Email: betuanminh22032003@gmail.com

---

## 🎯 Next Steps

1. **Start with basics**: Node.js + NestJS
2. **Build simple API**: CRUD với PostgreSQL
3. **Add Docker**: Containerize your app
4. **Learn gradually**: 1 tech mỗi tuần
5. **Practice**: Build small projects
6. **Clone this project**: Chạy local
7. **Modify**: Thêm features mới
8. **Deploy**: Push to production

---

**Good luck với learning journey! 🚀**

Remember: **Không ai biết hết tất cả, học dần dần là OK!**

_"The expert in anything was once a beginner."_
