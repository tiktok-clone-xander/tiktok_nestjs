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

... (same content as original)
