# 🚀 Hướng dẫn Workspace & Docker Monorepo

## ✅ Kiến trúc đã Setup

Project sử dụng **Monorepo Architecture** với **npm workspaces** để chia sẻ `node_modules` cho:
- ✅ Tất cả microservices (apps/*)
- ✅ Tất cả shared libraries (libs/*)
- ✅ Frontend Next.js (tiktok-frontend)
- ✅ **Docker containers cũng dùng chung node_modules**

## 🎯 Lợi ích Kiến trúc Monorepo

### Development:
- **Tiết kiệm 75% dung lượng**: ~600MB thay vì ~2.4GB
- **Cài đặt nhanh hơn**: npm chỉ cài 1 lần
- **Version nhất quán**: Tất cả services dùng cùng version
- **Chia sẻ code dễ dàng**: Share types/utils giữa backend & frontend

### Docker Production:
- **Build nhanh hơn**: Tận dụng Docker layer caching
- **Image nhỏ hơn**: Chỉ copy 1 node_modules
- **Consistency**: Dev và Prod dùng cùng dependencies
- **Shared libs**: Tất cả services dùng chung libs/*

## 📦 Cấu trúc Project

```
tiktok_nestjs/
├── node_modules/              # ⭐ Shared cho TẤT CẢ
├── package.json               # Root workspace config
├── package-lock.json          # Lock file duy nhất
├── docker-compose.yml         # Orchestrate tất cả services
├── .dockerignore              # Optimize Docker build
│
├── apps/
│   ├── api-gateway/
│   │   └── Dockerfile         # Build từ root, dùng shared node_modules
│   ├── auth-service/
│   │   └── Dockerfile         # Build từ root, dùng shared node_modules
│   ├── video-service/
│   │   └── Dockerfile         # Build từ root, dùng shared node_modules
│   ├── interaction-service/
│   │   └── Dockerfile         # Build từ root, dùng shared node_modules
│   └── notification-service/
│       └── Dockerfile         # Build từ root, dùng shared node_modules
│
├── libs/                      # Shared libraries
│   ├── common/
│   ├── database/
│   ├── grpc/
│   ├── rabbitmq/
│   └── redis/
│
└── tiktok-frontend/
    ├── Dockerfile             # Build từ root, dùng shared node_modules
    └── package.json           # Chỉ khai báo dependencies
```

## 🚀 Development (Local)

### 1. Cài đặt lần đầu

```powershell
# Xóa tất cả node_modules cũ (nếu có)
Remove-Item -Recurse -Force node_modules, tiktok-frontend/node_modules -ErrorAction SilentlyContinue

# Xóa lock files cũ
Remove-Item package-lock.json, tiktok-frontend/package-lock.json -ErrorAction SilentlyContinue

# Cài đặt tất cả dependencies (chỉ 1 lần)
npm install
```

### 2. Chạy services riêng lẻ

```powershell
# Backend services
npm run start:gateway       # API Gateway (port 3000)
npm run start:auth          # Auth Service (port 3001)
npm run start:video         # Video Service (port 3002)
npm run start:interaction   # Interaction Service (port 3003)
npm run start:notification  # Notification Service (port 3004)

# Frontend
npm run dev:frontend        # Next.js (port 3000)
```

### 3. Quản lý packages

```powershell
# Thêm package cho backend (tất cả services)
npm install express --save

# Thêm package chỉ cho frontend
npm install axios --workspace=tiktok-frontend

# Cập nhật tất cả packages
npm update
```

## 🐳 Docker Production

### Kiến trúc Docker Monorepo

Tất cả Dockerfiles được thiết kế để:
1. **Build Stage**: Copy toàn bộ monorepo, install dependencies 1 lần
2. **Production Stage**: Copy shared node_modules từ build stage

#### Dockerfile Pattern (đã áp dụng cho tất cả services):

```dockerfile
# Build stage - Shared dependencies
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root workspace files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install all dependencies (chỉ 1 lần)
RUN npm ci && npm cache clean --force

# Copy shared libs and proto
COPY libs ./libs
COPY proto ./proto

# Copy specific service
COPY apps/[service-name] ./apps/[service-name]

# Build the service
RUN npm run build [service-name]

# Production stage
FROM node:20-alpine
WORKDIR /app

# Copy shared node_modules từ builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/proto ./proto

CMD ["node", "dist/apps/[service-name]/main.js"]
```

### Chạy với Docker Compose

```powershell
# Build và chạy TẤT CẢ services (backend + frontend)
docker compose up --build -d

# Chỉ chạy specific services
docker compose up -d postgres redis rabbitmq
docker compose up -d auth-service video-service
docker compose up -d api-gateway frontend

# Xem logs
docker compose logs -f api-gateway
docker compose logs -f frontend

# Stop tất cả
docker compose down

# Stop và xóa volumes
docker compose down -v
```

### Services & Ports

| Service | Host Port | Container Port | Description |
|---------|-----------|----------------|-------------|
| **Frontend** | 3000 | 3000 | Next.js UI |
| **API Gateway** | 4000 | 3000 | REST API endpoint |
| Auth Service | 3001 | 3001 | Authentication |
| Video Service | 3002 | 3002 | Video management |
| Interaction Service | 3003 | 3003 | Likes/Comments |
| Notification Service | 3004 | 3004 | Notifications |
| PostgreSQL | 5432 | 5432 | Database |
| Redis | 6379 | 6379 | Cache |
| RabbitMQ | 5672, 15672 | 5672, 15672 | Message Queue |
| Prometheus | 9090 | 9090 | Metrics |
| Grafana | 3005 | 3000 | Monitoring UI |

### Truy cập ứng dụng

```
Frontend:           http://localhost:3000
API Gateway:        http://localhost:4000
RabbitMQ Manager:   http://localhost:15672 (guest/guest)
Prometheus:         http://localhost:9090
Grafana:            http://localhost:3005 (admin/admin)
```

## 🎨 Chia sẻ Code giữa Backend & Frontend

### Tạo Shared Package

```powershell
# Tạo libs/shared
mkdir libs/shared/src -Force
```

**libs/shared/package.json**:
```json
{
  "name": "@tiktok/shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}
```

**libs/shared/tsconfig.lib.json**:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

**libs/shared/src/index.ts**:
```typescript
// Shared types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface Video {
  id: string;
  userId: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

// Shared constants
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  VIDEO: '/api/video',
  INTERACTION: '/api/interaction',
  NOTIFICATION: '/api/notification',
} as const;

export const VIDEO_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PUBLISHED: 'published',
  FAILED: 'failed',
} as const;

// Shared utilities
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
```

### Sử dụng Shared Package

**Backend (NestJS)**:
```typescript
// apps/video-service/src/video.service.ts
import { Video, VIDEO_STATUS, formatNumber } from '@tiktok/shared';

@Injectable()
export class VideoService {
  async getVideo(id: string): Promise<Video> {
    // Implementation
  }
}
```

**Frontend (Next.js)**:
```typescript
// tiktok-frontend/app/video/[id]/page.tsx
import { Video, formatDate, formatNumber } from '@tiktok/shared';

export default function VideoPage({ video }: { video: Video }) {
  return (
    <div>
      <h1>{video.title}</h1>
      <p>{formatNumber(video.likes)} likes</p>
      <p>{formatDate(video.createdAt)}</p>
    </div>
  );
}
```

## 📊 So sánh Dung lượng

### ❌ Trước (Không dùng workspace):
```
node_modules/              ~500MB
tiktok-frontend/
  node_modules/            ~400MB
apps/api-gateway/
  node_modules/            ~500MB
apps/auth-service/
  node_modules/            ~500MB
apps/video-service/
  node_modules/            ~500MB
apps/interaction-service/
  node_modules/            ~500MB
apps/notification-service/
  node_modules/            ~500MB
----------------------------------------
TỔNG: ~3.4GB 💀
```

### ✅ Sau (Dùng workspace):
```
node_modules/              ~600MB
----------------------------------------
TỔNG: ~600MB ⚡
TIẾT KIỆM: 82% (~2.8GB)
```

### Docker Images:

**Trước**: Mỗi service ~200MB → 5 services = ~1GB
**Sau**: Tận dụng shared layers → Total ~500MB

## 🔧 Alternative: pnpm (Tối ưu hơn nữa)

```powershell
# Cài pnpm
npm install -g pnpm

# Cấu hình workspace
# Tạo pnpm-workspace.yaml:
packages:
  - 'apps/*'
  - 'libs/*'
  - 'tiktok-frontend'

# Cài đặt
pnpm install

# Lợi ích: pnpm dùng symlinks, tiết kiệm 90% dung lượng
# ~200MB thay vì ~600MB
```

## ⚠️ Troubleshooting

### 1. Docker build fails

```powershell
# Xóa cache và rebuild
docker compose down -v
docker system prune -af
docker compose up --build -d
```

### 2. Port conflicts

```powershell
# Kiểm tra port đang dùng
netstat -ano | findstr :3000

# Dừng process
taskkill /PID <PID> /F

# Hoặc đổi port trong docker-compose.yml
```

### 3. node_modules sync issues

```powershell
# Xóa và cài lại
Remove-Item -Recurse -Force node_modules
npm install
```

### 4. TypeScript path issues

Đảm bảo `tsconfig.json` có:
```json
{
  "compilerOptions": {
    "paths": {
      "@tiktok/shared": ["libs/shared/src"],
      "@tiktok/common": ["libs/common/src"],
      "@tiktok/database": ["libs/database/src"]
    }
  }
}
```

## 📚 Best Practices

1. **Always install from root**: `npm install` ở root, không install trong từng folder
2. **Update once**: Cập nhật dependencies ở root package.json
3. **Share types**: Đặt types chung trong libs/shared
4. **Use Docker for production**: Đảm bảo dev và prod environment giống nhau
5. **Lock dependencies**: Commit package-lock.json
6. **Clean builds**: Xóa dist/ và .next/ trước khi build

## 🚀 Next Steps

1. ✅ Setup workspace (Done)
2. ✅ Chuẩn hóa tất cả Dockerfiles (Done)
3. ✅ Thêm frontend vào docker-compose (Done)
4. 📝 Tạo libs/shared cho types chung
5. 🧪 Viết tests cho shared utilities
6. 📊 Setup CI/CD pipeline

## 📖 Tài liệu tham khảo

- [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces)
- [NestJS Monorepo](https://docs.nestjs.com/cli/monorepo)
- [Next.js Docker](https://nextjs.org/docs/deployment#docker-image)
- [Docker multi-stage builds](https://docs.docker.com/develop/develop-images/multistage-build/)
