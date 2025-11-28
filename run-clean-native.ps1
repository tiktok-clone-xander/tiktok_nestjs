#!/usr/bin/env pwsh
# Clean one-command setup and run (Native Development - ASCII-only)
# Usage: .\run-clean-native.ps1

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  TikTok Clone - Native Development Setup    " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

Write-Host "[Step 1/5] Checking prerequisites..." -ForegroundColor Yellow

$allGood = $true

try { node -v; Write-Host "  [OK] node available" -ForegroundColor Green } catch { Write-Host "  [ERROR] node not found" -ForegroundColor Red; $allGood = $false }
try { npm -v; Write-Host "  [OK] npm available" -ForegroundColor Green } catch { Write-Host "  [ERROR] npm not found" -ForegroundColor Red; $allGood = $false }
try { docker info > $null 2>&1; Write-Host "  [OK] Docker is running" -ForegroundColor Green } catch { Write-Host "  [ERROR] Docker not running" -ForegroundColor Red; $allGood = $false }

if (-not $allGood) { Write-Host "Prerequisites missing; please install/start required tools." -ForegroundColor Red; exit 1 }

Write-Host "[Step 2/5] Installing dependencies (if needed)..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) { npm install; if ($LASTEXITCODE -ne 0) { Write-Host "npm install failed" -ForegroundColor Red; exit 1 } }
Write-Host "[OK] Dependencies present" -ForegroundColor Green

Write-Host "[Step 3/5] Ensuring environment..." -ForegroundColor Yellow
& .\scripts\ensure-env.ps1

Write-Host "[Step 4/5] Starting infrastructure via Docker..." -ForegroundColor Yellow
docker compose -f docker-compose.infra.yml up -d --remove-orphans
if ($LASTEXITCODE -ne 0) { Write-Host "Infrastructure startup failed" -ForegroundColor Red; exit 1 }

Write-Host "[Step 5/5] Building and starting services natively..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "Infrastructure is ready! You can now start services individually:" -ForegroundColor Cyan
Write-Host "  npm run start:auth      - Auth Service (port 3001)" -ForegroundColor White
Write-Host "  npm run start:video     - Video Service (port 3002)" -ForegroundColor White
Write-Host "  npm run start:interaction - Interaction Service (port 3003)" -ForegroundColor White
Write-Host "  npm run start:notification - Notification Service (port 3004)" -ForegroundColor White
Write-Host "  npm run start:gateway   - API Gateway (port 4000)" -ForegroundColor White
Write-Host ""
Write-Host "Or start all services with: npm run start:dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Infrastructure Services:" -ForegroundColor Yellow
docker compose -f docker-compose.infra.yml ps

Write-Host ""
Write-Host "Access Points:" -ForegroundColor Cyan
Write-Host "  API Gateway: http://localhost:4000" -ForegroundColor White
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  PgAdmin: http://localhost:5050" -ForegroundColor White
Write-Host "  Redis UI: http://localhost:8081" -ForegroundColor White
Write-Host "  Kafka UI: http://localhost:9000" -ForegroundColor White
