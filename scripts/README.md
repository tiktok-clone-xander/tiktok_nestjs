# 🚀 TikTok Clone - Scripts Documentation

This directory contains all development and utility scripts for the TikTok Clone project. Use this guide to understand what each script does and how to use them.

## 📋 Quick Reference

### Main Development Scripts (Root Directory)

#### `dev.ps1` - Main Development Tool 🎯

**Primary development script with simple commands**

```powershell
# Start everything (infrastructure + all services + frontend with hot reload)
.\dev.ps1

# Start only infrastructure (Docker containers)
.\dev.ps1 infra

# Start only services (skip infrastructure - assumes it's running)
.\dev.ps1 services

# Start backend only (no frontend)
.\dev.ps1 backend

# Stop everything
.\dev.ps1 stop

# Check status
.\dev.ps1 status

# Show help
.\dev.ps1 help
```

#### `ensure-env.ps1` - Environment Setup 🔧

**Automatically creates .env file from .env.example with secure JWT secrets**

```powershell
# Create .env file if it doesn't exist
.\ensure-env.ps1
```

### Advanced Scripts (scripts/ Directory)

#### `run-native.ps1` - Detailed Native Development 🔥

**Advanced script for native development with hot reload**

```powershell
# Full development environment
.\scripts\run-native.ps1

# Infrastructure only
.\scripts\run-native.ps1 -InfraOnly

# Services only (skip infrastructure)
.\scripts\run-native.ps1 -SkipInfra

# Backend only (no frontend)
.\scripts\run-native.ps1 -SkipFrontend

# Stop everything
.\scripts\run-native.ps1 -StopOnly
```

**What it does:**

- ✅ Starts PostgreSQL, Redis, Kafka in Docker containers
- ✅ Runs all microservices natively with hot reload
- ✅ Each service in separate PowerShell window
- ✅ Smart health checks and waiting
- ✅ Automatic environment variable loading
- ✅ Management UIs (Kafka UI, Redis Commander, pgAdmin)

#### `status-native.ps1` - Service Status Checker 📊

**Comprehensive status check for all services**

```powershell
# Check status of all services
.\scripts\status-native.ps1
```

**What it checks:**

- 🐳 Docker containers (PostgreSQL, Redis, Kafka, etc.)
- 🚀 Node.js services (Auth, Video, Interaction, etc.)
- 🌐 Port accessibility
- 🖥️ Management UIs
- 📋 Quick links and management commands

#### `docker-helper.ps1` - Docker Utilities 🐳

**Quick helper for Docker operations**

```powershell
# Start all Docker services
.\scripts\docker-helper.ps1 start

# Stop all Docker services
.\scripts\docker-helper.ps1 stop

# Restart all Docker services
.\scripts\docker-helper.ps1 restart

# View logs
.\scripts\docker-helper.ps1 logs

# View logs for specific service
.\scripts\docker-helper.ps1 logs -Service postgres

# Clean up containers and volumes
.\scripts\docker-helper.ps1 clean

# Check status
.\scripts\docker-helper.ps1 status

# Build all images
.\scripts\docker-helper.ps1 build
```

## 🎯 Recommended Development Workflow

### 1. First Time Setup

```powershell
# Clone and install dependencies
git clone <repo>
cd tiktok_nestjs
npm install

# Set up environment
.\ensure-env.ps1

# Start infrastructure only first time
.\dev.ps1 infra
```

### 2. Daily Development

```powershell
# Start everything (hot reload enabled)
.\dev.ps1

# Your services are now running with hot reload!
# Just save your code files and services restart automatically
```

### 3. Check Status

```powershell
# Quick status check
.\dev.ps1 status

# Detailed status check
.\scripts\status-native.ps1
```

### 4. End of Day

```powershell
# Stop everything
.\dev.ps1 stop
```

## 🌐 Service URLs

### Development Services

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:5555
- **Auth Service**: http://localhost:4001 (gRPC: 50051)
- **Video Service**: http://localhost:4002 (gRPC: 50052)
- **Interaction Service**: http://localhost:4003 (gRPC: 50053)
- **Notification Service**: http://localhost:4004 (gRPC: 50054)

### Infrastructure

- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Kafka**: localhost:9092
- **Zookeeper**: localhost:2181

### Management UIs

- **Kafka UI**: http://localhost:9000
- **Redis Commander**: http://localhost:8081
- **pgAdmin**: http://localhost:5050 (admin@admin.com / admin)

## 💡 Tips

### Hot Reload Development

- All services run with `--watch` flag
- Save any TypeScript file and the service restarts automatically
- Each service runs in its own PowerShell window for easy debugging
- Frontend uses Next.js hot reload

### Debugging

- Each service window shows its own logs
- Use VS Code debugger with services running natively
- Check individual service windows for error messages
- Use `.\dev.ps1 status` to see what's running

### Performance

- Infrastructure runs in Docker for consistency
- Services run natively for faster hot reload
- Smart startup (reuses running infrastructure)
- Graceful shutdown of all processes

## 🔧 Troubleshooting

### Common Issues

**Services won't start:**

```powershell
# Stop everything and restart
.\dev.ps1 stop
.\dev.ps1
```

**Docker issues:**

```powershell
# Check Docker is running
docker ps

# Restart Docker containers
.\scripts\docker-helper.ps1 restart
```

**Port conflicts:**

```powershell
# Check what's using ports
netstat -an | findstr ":5555"

# Stop all Node processes
Get-Process node | Stop-Process
```

**Environment issues:**

```powershell
# Recreate .env file
Remove-Item .env
.\ensure-env.ps1
```

### Getting Help

- Use `.\dev.ps1 help` for quick reference
- Check individual script headers for detailed parameter options
- Use `.\scripts\status-native.ps1` for detailed status information

## 📁 Script Organization

```
/
├── dev.ps1                    # 🎯 Main development tool (USE THIS)
├── ensure-env.ps1             # 🔧 Environment setup
└── scripts/
    ├── run-native.ps1         # 🔥 Advanced native development
    ├── status-native.ps1      # 📊 Comprehensive status checker
    └── docker-helper.ps1      # 🐳 Docker utilities
```

**Use `dev.ps1` for 95% of development tasks. Other scripts provide advanced features when needed.**
