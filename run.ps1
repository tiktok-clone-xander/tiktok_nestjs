#!/usr/bin/env pwsh
# One-command setup and run (ASCII-only)
# Usage: .\run.ps1

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  TikTok Clone - One Command Setup & Run      " -ForegroundColor Cyan
Write-Host "  Monorepo with Shared Dependencies           " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check prerequisites
Write-Host "[Step 1/5] Checking prerequisites..." -ForegroundColor Yellow

$allGood = $true

try {
    $nodeVersion = node -v
    Write-Host "  [OK] Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Node.js not found. Install from https://nodejs.org/" -ForegroundColor Red
    $allGood = $false
}

try {
    $npmVersion = npm -v
    Write-Host "  [OK] npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] npm not found" -ForegroundColor Red
    $allGood = $false
}

try {
    docker info > $null 2>&1
    Write-Host "  [OK] Docker is running" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Docker not running. Start Docker Desktop!" -ForegroundColor Red
    $allGood = $false
}

if (-not $allGood) {
    Write-Host ""
    Write-Host "Prerequisites check failed. Please fix the issues above." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Install dependencies (only if node_modules doesn't exist)
if (-not (Test-Path "node_modules")) {
    Write-Host "[Step 2/5] Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "npm install failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[Step 2/5] Dependencies already installed (skip)" -ForegroundColor Green
}

Write-Host ""

# Step 3: Setup environment
Write-Host "[Step 3/5] Setting up environment..." -ForegroundColor Yellow
& .\scripts\ensure-env.ps1
Write-Host ""

# Step 4: Build and start Docker containers
Write-Host "[Step 4/5] Building and starting Docker containers..." -ForegroundColor Yellow
Write-Host "  (This may take 5-10 minutes on first build)" -ForegroundColor Gray
Write-Host ""

docker compose up --build -d

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Docker compose failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try these troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "  1. Check if Docker Desktop is running" -ForegroundColor Gray
    Write-Host "  2. Run: docker system prune -af" -ForegroundColor Gray
    Write-Host "  3. Run: .\run.ps1 again" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Step 5: Verify services
Write-Host "[Step 5/5] Verifying services (waiting 15 seconds for startup)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
docker compose ps

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "              BUILD COMPLETE!                 " -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""

Write-Host "Running health checks..." -ForegroundColor Cyan
Write-Host ""
& .\scripts\verify.ps1

Write-Host ""

Write-Host "Access your application:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend:       http://localhost:3000" -ForegroundColor White
Write-Host "  API Gateway:    http://localhost:4000" -ForegroundColor White
Write-Host "  Swagger Docs:   http://localhost:4000/api/docs" -ForegroundColor White
Write-Host ""
Write-Host "  RabbitMQ:       http://localhost:15672 (guest/guest)" -ForegroundColor Gray
Write-Host "  Prometheus:     http://localhost:9090" -ForegroundColor Gray
Write-Host "  Grafana:        http://localhost:3005 (admin/admin)" -ForegroundColor Gray
Write-Host ""

Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  View logs:      docker compose logs -f" -ForegroundColor Gray
Write-Host "  Stop all:       docker compose down" -ForegroundColor Gray
Write-Host "  Restart:        docker compose restart" -ForegroundColor Gray
Write-Host "  Rebuild:        .\scripts.ps1 docker-rebuild" -ForegroundColor Gray
Write-Host ""
#!/usr/bin/env pwsh
# One-command setup and run
# Usage: .\run.ps1

Write-Host "â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—" -ForegroundColor Cyan
Write-Host "â•‘   TikTok Clone - One Command Setup & Run            â•‘" -ForegroundColor Cyan
Write-Host "â•‘   Monorepo with Shared Dependencies                  â•‘" -ForegroundColor Cyan
Write-Host "â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check prerequisites
Write-Host "ðŸ“‹ Step 1/5: Checking prerequisites..." -ForegroundColor Yellow

$allGood = $true

try {
    $nodeVersion = node -v
    Write-Host "  âœ… Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  âŒ Node.js not found. Install from https://nodejs.org/" -ForegroundColor Red
    $allGood = $false
}

try {
    $npmVersion = npm -v
    Write-Host "  âœ… npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  âŒ npm not found" -ForegroundColor Red
    $allGood = $false
}

try {
    docker info > $null 2>&1
    Write-Host "  âœ… Docker is running" -ForegroundColor Green
} catch {
    Write-Host "  âŒ Docker not running. Start Docker Desktop!" -ForegroundColor Red
    $allGood = $false
}

if (-not $allGood) {
    Write-Host ""
    Write-Host "âŒ Prerequisites check failed. Please fix the issues above." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Install dependencies (only if node_modules doesn't exist)
if (-not (Test-Path "node_modules")) {
    Write-Host "ðŸ“¦ Step 2/5: Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "âŒ npm install failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "  âœ… Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "ðŸ“¦ Step 2/5: Dependencies already installed (skip)" -ForegroundColor Green
}

Write-Host ""

# Step 3: Setup environment
Write-Host "ðŸ”§ Step 3/5: Setting up environment..." -ForegroundColor Yellow
& .\scripts\ensure-env.ps1
Write-Host ""

# Step 4: Build and start Docker containers
Write-Host "ðŸ³ Step 4/5: Building and starting Docker containers..." -ForegroundColor Yellow
Write-Host "  (This may take 5-10 minutes on first build)" -ForegroundColor Gray
Write-Host ""

docker compose up --build -d

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "âŒ Docker compose failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try these troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "  1. Check if Docker Desktop is running" -ForegroundColor Gray
    Write-Host "  2. Run: docker system prune -af" -ForegroundColor Gray
    Write-Host "  3. Run: .\run.ps1 again" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Step 5: Verify services
Write-Host "ðŸ” Step 5/5: Verifying services (waiting 15 seconds for startup)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
docker compose ps

Write-Host ""
Write-Host "â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—" -ForegroundColor Green
Write-Host "â•‘              ðŸŽ‰ BUILD COMPLETE! ðŸŽ‰                   â•‘" -ForegroundColor Green
Write-Host "â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•" -ForegroundColor Green
Write-Host ""

Write-Host "Running health checks..." -ForegroundColor Cyan
Write-Host ""
& .\scripts\verify.ps1

Write-Host ""

Write-Host "ðŸŒ Access your application:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend:       http://localhost:3000" -ForegroundColor White
Write-Host "  API Gateway:    http://localhost:4000" -ForegroundColor White
Write-Host "  Swagger Docs:   http://localhost:4000/api/docs" -ForegroundColor White
Write-Host ""
Write-Host "  RabbitMQ:       http://localhost:15672 (guest/guest)" -ForegroundColor Gray
Write-Host "  Prometheus:     http://localhost:9090" -ForegroundColor Gray
Write-Host "  Grafana:        http://localhost:3005 (admin/admin)" -ForegroundColor Gray
Write-Host ""

Write-Host "ðŸ“ Useful commands:" -ForegroundColor Cyan
Write-Host "  View logs:      docker compose logs -f" -ForegroundColor Gray
Write-Host "  Stop all:       docker compose down" -ForegroundColor Gray
Write-Host "  Restart:        docker compose restart" -ForegroundColor Gray
Write-Host "  Rebuild:        .\scripts.ps1 docker-rebuild" -ForegroundColor Gray
Write-Host ""

