# ✅ Pre-Flight Checklist

## Trước khi chạy `.\run.ps1`, kiểm tra:

### 1. Prerequisites
- [ ] Node.js >= 20.x đã cài (`node -v`)
- [ ] npm >= 9.x đã cài (`npm -v`)
- [ ] Docker Desktop đã cài và đang chạy (`docker info`)
- [ ] Git đã cài (`git --version`)

### 2. Ports Available (không bị chiếm)
- [ ] Port 3000 (Frontend)
- [ ] Port 4000 (API Gateway) 
- [ ] Port 3001 (Auth Service)
- [ ] Port 3002 (Video Service)
- [ ] Port 3003 (Interaction Service)
- [ ] Port 3004 (Notification Service)
- [ ] Port 5432 (PostgreSQL)
- [ ] Port 6379 (Redis)
- [ ] Port 5672 (RabbitMQ)
- [ ] Port 15672 (RabbitMQ Management)

Check ports:
```powershell
netstat -ano | findstr "3000 4000 5432 6379 5672"
```

### 3. System Resources
- [ ] RAM >= 8GB (khuyến nghị 16GB)
- [ ] Disk space >= 10GB available
- [ ] Docker có đủ RAM (Settings → Resources → Memory >= 4GB)

### 4. Network
- [ ] Internet connection (để pull Docker images lần đầu)
- [ ] Không có firewall/proxy block Docker registry
- [ ] WSL2 enabled (Windows) nếu dùng Docker Desktop

## Chạy Project

### Option 1: One-Command (Khuyến nghị)
```powershell
.\run.ps1
```

### Option 2: Manual Steps
```powershell
# 1. Install dependencies
npm install

# 2. Setup environment
.\ensure-env.ps1

# 3. Start Docker
.\scripts.ps1 docker-up
```

## Verify Services Running

### Check containers status:
```powershell
docker compose ps
```

All services should show "Up" or "healthy"

### Check logs:
```powershell
# All services
docker compose logs -f

# Specific service
docker compose logs -f api-gateway
docker compose logs -f frontend
```

### Test endpoints:
```powershell
# Frontend
curl http://localhost:3000

# API Gateway Health
curl http://localhost:4000/health

# Swagger
Start-Process http://localhost:4000/api/docs
```

## Common Issues & Solutions

### ❌ Port already in use
```powershell
# Find process using port
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F
```

### ❌ Docker build fails
```powershell
# Clean Docker cache
docker system prune -af
docker compose down -v

# Rebuild
.\scripts.ps1 docker-up
```

### ❌ npm install fails
```powershell
# Clear cache
npm cache clean --force
Remove-Item -Recurse -Force node_modules

# Reinstall
npm install
```

### ❌ Permission denied (Windows)
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### ❌ WSL2 error (Windows Docker)
```powershell
# Install WSL2
wsl --install

# Set WSL2 as default
wsl --set-default-version 2
```

## Success Indicators

✅ All 11 containers running:
- postgres
- redis
- rabbitmq
- auth-service
- video-service
- interaction-service
- notification-service
- api-gateway
- frontend
- prometheus
- grafana

✅ Can access:
- Frontend UI at http://localhost:3000
- API at http://localhost:4000
- Swagger docs at http://localhost:4000/api/docs

✅ No errors in logs:
```powershell
docker compose logs --tail=50
```

## Next Steps After Success

1. **Test API**: Open Swagger at http://localhost:4000/api/docs
2. **Test Frontend**: Visit http://localhost:3000
3. **Register User**: Use the API or Frontend
4. **Upload Video**: Test video upload functionality
5. **Check Monitoring**: Grafana at http://localhost:3005

## Development Workflow

### Start developing:
```powershell
# Stop Docker services
.\scripts.ps1 docker-down

# Start only infrastructure
.\scripts.ps1 start-infra

# Run services locally (hot reload)
npm run start:gateway
npm run dev:frontend
```

### View logs:
```powershell
.\scripts.ps1 logs api-gateway
```

### Rebuild specific service:
```powershell
.\scripts.ps1 docker-rebuild frontend
```

## 📚 Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [WORKSPACE_SETUP.md](./WORKSPACE_SETUP.md) - Workspace & Docker details
- [MONOREPO_ARCHITECTURE.md](./MONOREPO_ARCHITECTURE.md) - Architecture overview
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guidelines

## 🆘 Need Help?

1. Check logs: `docker compose logs -f`
2. Review [WORKSPACE_SETUP.md](./WORKSPACE_SETUP.md) troubleshooting section
3. Ensure all prerequisites are met
4. Try clean rebuild: `.\scripts.ps1 docker-clean` then `.\scripts.ps1 docker-up`
