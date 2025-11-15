# Quick Start Guide

## 🚀 Cách Nhanh Nhất để Chạy Project

### Option 1: Chạy với Docker (Khuyến nghị) ⭐

```bash
# 1. Clone và setup
git clone https://github.com/betuanminh22032003/tiktok_nestjs.git
cd tiktok_nestjs
.\setup.ps1  # Windows
# hoặc
./setup.sh   # Linux/Mac

# 2. Chạy tất cả services
docker-compose up -d

# 3. Kiểm tra logs
docker-compose logs -f

# 4. Truy cập
# - API Gateway: http://localhost:3000
# - Swagger Docs: http://localhost:3000/api/docs
# - RabbitMQ UI: http://localhost:15672 (guest/guest)
```

### Option 2: Chạy Local Development

```bash
# 1. Setup
.\setup.ps1  # Windows

# 2. Chạy infrastructure
docker-compose up -d postgres redis rabbitmq

# 3. Mở 4 terminal và chạy:

# Terminal 1 - Auth Service
npm run start:auth

# Terminal 2 - Video Service
npm run start:video

# Terminal 3 - Interaction Service
npm run start:interaction

# Terminal 4 - API Gateway
npm run start:gateway
```

## 📝 Test API

### 1. Đăng ký User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123!",
    "fullName": "Test User"
  }'
```

### 2. Đăng nhập

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "emailOrUsername": "test@example.com",
    "password": "Password123!"
  }'
```

### 3. Get Current User

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### 4. Upload Video

```bash
curl -X POST http://localhost:3000/api/videos \
  -b cookies.txt \
  -F "video=@/path/to/video.mp4" \
  -F "title=My Video" \
  -F "description=This is my video"
```

### 5. Get Video Feed

```bash
curl -X GET "http://localhost:3000/api/videos?page=1&limit=10" \
  -b cookies.txt
```

### 6. Like Video

```bash
curl -X POST http://localhost:3000/api/interactions/like \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "video-id-here"
  }'
```

### 7. Add Comment

```bash
curl -X POST http://localhost:3000/api/interactions/comment \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "video-id-here",
    "content": "Great video!"
  }'
```

## 🔍 Kiểm tra Services

```bash
# Health checks
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Video Service
curl http://localhost:3003/health  # Interaction Service

# Check PostgreSQL
docker-compose exec postgres psql -U postgres -d tiktok_clone -c "\dt"

# Check Redis
docker-compose exec redis redis-cli KEYS "*"

# Check RabbitMQ
docker-compose exec rabbitmq rabbitmqctl list_queues
```

## 📊 Monitoring

```bash
# Prometheus
http://localhost:9090

# Grafana
http://localhost:3001
Username: admin
Password: admin
```

## 🛑 Stop Services

```bash
# Stop all
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## ⚠️ Common Issues

### Issue 1: Port đã được sử dụng

```bash
# Kiểm tra port đang dùng
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# Thay đổi port trong .env
PORT=3001
```

### Issue 2: Database connection error

```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Issue 3: Cannot find module

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation Links

- **Swagger API**: http://localhost:3000/api/docs
- **Full README**: [README.md](./README.md)
- **Development Guide**: [DEVELOPMENT.md](./DEVELOPMENT.md)

## 🆘 Need Help?

1. Check logs: `docker-compose logs -f [service-name]`
2. Check health endpoints
3. Review [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed guides
4. Open an issue on GitHub

## ✅ Checklist

- [ ] Node.js 20+ installed
- [ ] Docker installed
- [ ] Dependencies installed (`npm install`)
- [ ] Environment configured (`.env`)
- [ ] Services running
- [ ] Can access Swagger docs
- [ ] Can register/login user

Happy coding! 🚀
