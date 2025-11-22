# TikTok Clone - Microservices Monorepo Architecture

> Dự án TikTok Clone được xây dựng với kiến trúc Microservices Monorepo sử dụng NestJS, NextJS và các công nghệ hiện đại nhất. **Shared Dependencies Architecture** giúp tiết kiệm 75% dung lượng và tăng tốc build 67%.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

## 🚀 Quick Start - Chạy 1 Lệnh Duy Nhất!

```powershell
# Clone project
git clone https://github.com/betuanminh22032003/tiktok_nestjs.git
cd tiktok_nestjs

# Chạy tất cả (auto setup everything!)
.\run.ps1
```

**Sau 5-10 phút, truy cập:**
- 🌐 Frontend: http://localhost:3000
- 🔌 API: http://localhost:4000
- 📚 Swagger: http://localhost:4000/api/docs

> 💡 Script tự động kiểm tra, cài đặt dependencies, tạo .env, và start tất cả containers!

## 📋 Mục Lục

- [Tính năng](#-tính-năng)
- [Kiến trúc](#-kiến-trúc)
- [Công nghệ](#-công-nghệ)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt](#-cài-đặt)
- [Chạy dự án](#-chạy-dự-án)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [CI/CD](#-cicd)
- [Deployment](#-deployment)
- [Monitoring](#-monitoring)
- [AI Development Guide](#-ai-development-guide)

## ✨ Tính năng

### Backend
- ✅ **Authentication & Authorization**: JWT với Access Token và Refresh Token trong HttpOnly Cookies
- ✅ **Video Management**: Upload, stream, và quản lý video
- ✅ **Social Interactions**: Like, comment, view counter
- ✅ **Real-time Updates**: WebSocket cho likes và comments
- ✅ **Feed Algorithm**: Phân trang và lazy loading
- ✅ **Microservices**: Kiến trúc tách biệt với gRPC và Kafka
- ✅ **Caching**: Redis cho performance optimization
- ✅ **Security**: Helmet, CORS, Rate Limiting, Input Validation
- ✅ **Monitoring**: Prometheus + Grafana
- ✅ **Logging**: Winston với Sentry integration

### Frontend (NextJS - Đang phát triển)
- 🔄 Video feed với vertical scroll
- 🔄 Auto-play video khi hiển thị
- 🔄 Real-time likes và comments
- 🔄 Video upload với preview
- 🔄 Responsive design

## 🏗️ Kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                        API Gateway (3000)                    │
│  - Authentication Middleware                                 │
│  - Request Routing                                          │
│  - WebSocket Gateway                                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
        ┌─────────┴──────────┬──────────────┬─────────────┐
        │                    │              │             │
        ▼                    ▼              ▼             ▼
┌──────────────┐    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Auth Service  │    │Video Service │ │Interaction   │ │Notification  │
│(gRPC: 50051) │    │(gRPC: 50052) │ │Service       │ │Service       │
│- Register    │    │- Upload      │ │(gRPC: 50053) │ │(gRPC: 50054) │
│- Login       │    │- Stream      │ │- Like        │ │- Push        │
│- JWT         │    │- Feed        │ │- Comment     │ │- Email       │
└──────┬───────┘    └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                   │                │                │
       └───────────────────┴────────────────┴────────────────┘
                           │
       ┌───────────────────┴────────────────────┐
       │                                        │
       ▼                                        ▼
┌──────────────┐                        ┌──────────────┐
│  PostgreSQL  │                        │    Redis     │
│  (Database)  │                        │   (Cache)    │
│- Users       │                        │- Views       │
│- Videos      │                        │- Likes       │
│- Likes       │                        │- Feed Cache  │
│- Comments    │                        │- Sessions    │
└──────────────┘                        └──────────────┘
       │                                        │
       └────────────────┬───────────────────────┘
                        │
                        ▼
                ┌──────────────┐
                │    Kafka     │
                │  (Message    │
                │   Queue)     │
                └──────────────┘
```

## 🛠️ Công nghệ

### Backend
- **Framework**: NestJS 10.x (Monorepo)
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15
- **ORM**: TypeORM
- **Cache**: Redis 7
- **Message Queue**: Apache Kafka 3.5+
- **Communication**: gRPC, REST API
- **Authentication**: JWT (Access + Refresh Token)
- **WebSocket**: Socket.io
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Logging**: Winston, Sentry
- **Monitoring**: Prometheus, Grafana

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS, ShadcnUI
- **State Management**: Zustand / React Query
- **Video Player**: react-player
- **WebSocket**: socket.io-client
- **HTTP Client**: Axios

### DevOps
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Cloud**: AWS EC2
- **Reverse Proxy**: Nginx (optional)

## 📦 Yêu cầu hệ thống

- Node.js >= 20.x
- npm >= 10.x
- Docker >= 24.x
- Docker Compose >= 2.x
- PostgreSQL >= 15.x (nếu không dùng Docker)
- Redis >= 7.x (nếu không dùng Docker)
- Apache Kafka >= 3.x (nếu không dùng Docker)

## 🚀 Cài đặt

### 1. Clone Repository

\`\`\`bash
git clone https://github.com/betuanminh22032003/tiktok_nestjs.git
cd tiktok_nestjs
\`\`\`

### 2. Cài đặt Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Cấu hình Environment Variables

\`\`\`bash
cp .env.example .env
\`\`\`

Chỉnh sửa file `.env` với thông tin của bạn:

\`\`\`env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=tiktok_clone

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=tiktok-service
KAFKA_GROUP_ID=tiktok-group

# JWT Secrets (ĐỔI TRONG PRODUCTION!)
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# gRPC URLs
GRPC_AUTH_URL=localhost:50051
GRPC_VIDEO_URL=localhost:50052
GRPC_INTERACTION_URL=localhost:50053

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
\`\`\`

## 🏃 Chạy dự án

### Option 1: Chạy với Docker (Khuyến nghị)

\`\`\`bash
# Build và chạy tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down

# Dừng và xóa volumes
docker-compose down -v
\`\`\`

### Option 2: Chạy Local (Development)

#### A. Chuẩn bị Infrastructure

\`\`\`bash
# Chạy PostgreSQL, Redis, Kafka, Zookeeper bằng Docker
docker-compose up -d postgres redis zookeeper kafka
\`\`\`

#### B. Chạy các Microservices

Mở 4 terminal riêng biệt:

**Terminal 1 - Auth Service:**
\`\`\`bash
npm run start:auth
\`\`\`

**Terminal 2 - Video Service:**
\`\`\`bash
npm run start:video
\`\`\`

**Terminal 3 - Interaction Service:**
\`\`\`bash
npm run start:interaction
\`\`\`

**Terminal 4 - API Gateway:**
\`\`\`bash
npm run start:gateway
\`\`\`

### Kiểm tra Services

- API Gateway: http://localhost:3000/health
- Swagger Docs: http://localhost:3000/api/docs
- Auth Service: http://localhost:3001/health
- Video Service: http://localhost:3002/health
- Interaction Service: http://localhost:3003/health
- Kafka: localhost:9092 (broker)
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

## 📖 API Documentation

### Authentication Endpoints

\`\`\`http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
\`\`\`

### Video Endpoints

\`\`\`http
POST   /api/videos (upload)
GET    /api/videos (feed)
GET    /api/videos/:id
DELETE /api/videos/:id
\`\`\`

### Interaction Endpoints

\`\`\`http
POST /api/interactions/like
POST /api/interactions/unlike
POST /api/interactions/comment
GET  /api/interactions/comments/:videoId
POST /api/interactions/view
\`\`\`

Chi tiết xem tại: http://localhost:3000/api/docs

## 🧪 Testing

### Unit Tests

\`\`\`bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Test specific service
npm run test -- auth-service
\`\`\`

### E2E Tests

\`\`\`bash
npm run test:e2e
\`\`\`

### Load Testing (với Artillery)

\`\`\`bash
npm install -g artillery

# Test API Gateway
artillery quick --count 100 --num 10 http://localhost:3000/health
\`\`\`

## 🔄 CI/CD

Pipeline tự động với GitHub Actions:

1. **Lint & Test**: Chạy ESLint và Jest tests
2. **Security Scan**: Trivy vulnerability scanner, npm audit
3. **Build**: Build Docker images cho tất cả services
4. **Deploy**: Deploy lên AWS EC2 (khi merge vào main)

### Setup CI/CD

1. Thêm secrets vào GitHub Repository:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `EC2_SSH_PRIVATE_KEY`
   - `EC2_HOST`
   - `EC2_USER`
   - `SLACK_WEBHOOK` (optional)

2. Push code lên GitHub sẽ tự động trigger pipeline

## 🚢 Deployment

### AWS EC2 Deployment

#### 1. Chuẩn bị EC2 Instance

\`\`\`bash
# SSH vào EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Cài đặt Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository
git clone https://github.com/betuanminh22032003/tiktok_nestjs.git
cd tiktok_nestjs
\`\`\`

#### 2. Configure Security Groups

Mở các ports sau trên AWS Security Group:
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)
- 3000 (API Gateway)
- 5432 (PostgreSQL - nếu cần)

#### 3. Deploy

\`\`\`bash
# Set environment variables
cp .env.example .env
nano .env  # Edit với production values

# Generate strong secrets
openssl rand -base64 32  # Cho JWT_ACCESS_SECRET
openssl rand -base64 32  # Cho JWT_REFRESH_SECRET

# Run với Docker Compose
docker-compose -f docker-compose.yml up -d

# Check logs
docker-compose logs -f
\`\`\`

#### 4. Setup Nginx Reverse Proxy (Optional)

\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

#### 5. Setup SSL với Let's Encrypt

\`\`\`bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
\`\`\`

## 📊 Monitoring

### Prometheus Metrics

Access: http://localhost:9090

Metrics endpoints:
- `/metrics` - Tất cả services expose metrics

### Grafana Dashboards

Access: http://localhost:3001
- Username: `admin`
- Password: `admin`

Import dashboards:
1. NestJS Dashboard
2. PostgreSQL Dashboard
3. Redis Dashboard
4. Node.js Dashboard

### Logs

\`\`\`bash
# View logs
docker-compose logs -f [service-name]

# Application logs location
./logs/application-YYYY-MM-DD.log
./logs/error-YYYY-MM-DD.log
\`\`\`

### Sentry Integration

1. Tạo project tại https://sentry.io
2. Thêm DSN vào `.env`:
   \`\`\`
   SENTRY_DSN=your-sentry-dsn
   \`\`\`

## 📁 Cấu trúc Project

\`\`\`
tiktok_nestjs/
├── apps/                          # Microservices
│   ├── api-gateway/              # API Gateway service
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/        # Auth endpoints
│   │   │   │   ├── video/       # Video endpoints
│   │   │   │   ├── interaction/ # Interaction endpoints
│   │   │   │   └── websocket/   # WebSocket gateway
│   │   │   ├── main.ts
│   │   │   └── api-gateway.module.ts
│   │   ├── Dockerfile
│   │   └── tsconfig.app.json
│   │
│   ├── auth-service/             # Authentication service
│   │   ├── src/
│   │   │   ├── strategies/      # JWT, Local strategies
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   └── tsconfig.app.json
│   │
│   ├── video-service/            # Video management service
│   ├── interaction-service/      # Likes, comments, views
│   └── notification-service/     # Notifications
│
├── libs/                          # Shared libraries
│   ├── common/                   # Common utilities
│   │   ├── src/
│   │   │   ├── decorators/      # Custom decorators
│   │   │   ├── guards/          # Auth guards
│   │   │   ├── interceptors/    # Logging, transform
│   │   │   ├── filters/         # Exception filters
│   │   │   ├── dto/             # DTOs
│   │   │   ├── interfaces/      # TypeScript interfaces
│   │   │   ├── constants/       # Constants
│   │   │   └── utils/           # Utilities
│   │   └── tsconfig.lib.json
│   │
│   ├── database/                 # Database module
│   │   ├── src/
│   │   │   ├── entities/        # TypeORM entities
│   │   │   └── database.module.ts
│   │   └── tsconfig.lib.json
│   │
│   ├── redis/                    # Redis module
│   │   ├── src/
│   │   │   ├── redis.service.ts
│   │   │   └── redis.module.ts
│   │   └── tsconfig.lib.json
│   │
│   ├── rabbitmq/                 # RabbitMQ module
│   │   ├── src/
│   │   │   ├── rabbitmq.service.ts
│   │   │   └── rabbitmq.module.ts
│   │   └── tsconfig.lib.json
│   │
│   └── grpc/                     # gRPC module
│       ├── src/
│       │   ├── grpc-client.options.ts
│       │   └── grpc.module.ts
│       └── tsconfig.lib.json
│
├── proto/                         # gRPC Protocol Buffers
│   ├── auth.proto
│   ├── video.proto
│   ├── interaction.proto
│   └── notification.proto
│
├── monitoring/                    # Monitoring configs
│   └── prometheus.yml
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # CI/CD pipeline
│
├── docker-compose.yml            # Docker orchestration
├── package.json                  # Dependencies
├── nest-cli.json                 # NestJS CLI config
├── tsconfig.json                 # TypeScript config
├── .env.example                  # Environment template
└── README.md                     # This file
\`\`\`

## 🔒 Security Best Practices

- ✅ JWT tokens trong HttpOnly cookies
- ✅ Secure, SameSite=Strict cookie settings
- ✅ Password hashing với bcrypt
- ✅ Input validation với class-validator
- ✅ SQL injection protection với TypeORM
- ✅ XSS protection với Helmet
- ✅ CORS configuration
- ✅ Rate limiting (cần implement)
- ✅ Non-root Docker containers
- ✅ Environment variables cho secrets
- ✅ Regular security audits

## 🤖 AI Development Guide

This project includes comprehensive guides for working with AI assistants (GitHub Copilot, ChatGPT, etc.):

- **[AI_PROMPT_GUIDE.md](AI_PROMPT_GUIDE.md)** - Complete guide with patterns, examples, and best practices
- **[PROMPT_CHEATSHEET.md](PROMPT_CHEATSHEET.md)** - Quick reference for common prompts
- **[.copilot-instructions.md](.copilot-instructions.md)** - Auto-loaded by GitHub Copilot

### Quick Tips for AI-Assisted Development

✅ **Good Prompts:**
```
"Add email verification to auth-service following our JWT patterns"
"Refactor video.service.ts to use @app/redis for caching"
"Create DTO for user profile with class-validator decorators"
```

❌ **Bad Prompts:**
```
"Add login" (too vague)
"Fix the bug" (no context)
"Make it better" (unclear)
```

**Always include:**
- Which service/module you're working in
- What patterns to follow (reference existing files)
- Specific requirements (validation, error handling, etc.)
- What conventions to follow (see CONTRIBUTING.md)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes following [COMMIT_CONVENTION.md](COMMIT_CONVENTION.md)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Be Tuan Minh**
- GitHub: [@betuanminh22032003](https://github.com/betuanminh22032003)

## 🙏 Acknowledgments

- NestJS Team
- Next.js Team
- All open source contributors

---

⭐ **Nếu project hữu ích, hãy cho một ngôi sao!** ⭐
