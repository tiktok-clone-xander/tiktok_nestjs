# TikTok Clone - Development Helper Scripts (Windows)
# Run with: .\scripts.ps1 [command]
# Monorepo Architecture with Shared node_modules

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$Service = ""
)

function Start-Infrastructure {
    Write-Host "🚀 Starting infrastructure (PostgreSQL, Redis, RabbitMQ)..." -ForegroundColor Cyan
    docker-compose up -d postgres redis rabbitmq
    Write-Host "✅ Infrastructure started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services:" -ForegroundColor Yellow
    Write-Host "  - PostgreSQL: localhost:5432" -ForegroundColor Gray
    Write-Host "  - Redis: localhost:6379" -ForegroundColor Gray
    Write-Host "  - RabbitMQ: localhost:5672" -ForegroundColor Gray
    Write-Host "  - RabbitMQ Management: http://localhost:15672" -ForegroundColor Gray
}

function Stop-Infrastructure {
    Write-Host "🛑 Stopping infrastructure..." -ForegroundColor Yellow
    docker-compose stop postgres redis rabbitmq
    Write-Host "✅ Infrastructure stopped!" -ForegroundColor Green
}

function Clean-Project {
    Write-Host "🧹 Cleaning up..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue dist
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue node_modules
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue uploads
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue logs
    Write-Host "✅ Clean completed!" -ForegroundColor Green
}

# Generate a cryptographically secure secret
function New-Secret {
    $bytes = New-Object 'System.Byte[]' 32
    (New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
    # base64 and remove problematic chars for env files
    # Use URL-safe Base64 encoding: replace '+' with '-', '/' with '_', and trim '=' padding
    ([Convert]::ToBase64String($bytes) -replace '\+', '-' -replace '/', '_' -replace '=+$', '')
}

# Ensure .env exists with sensible defaults (development)
function Ensure-EnvFile {
    param([switch]$Force)
    $root = $PSScriptRoot
    $envPath = Join-Path $root ".env"
    if ((-not (Test-Path $envPath)) -or $Force) {
        Write-Host "Creating .env file at $envPath" -ForegroundColor Cyan
        $access = New-Secret
        $refresh = New-Secret
        $content = @"
# Auto-generated .env (development)
NODE_ENV=development
PORT=3000
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=tiktok_clone
# Redis
REDIS_HOST=redis
REDIS_PORT=6379
# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
# JWT
JWT_ACCESS_SECRET=$access
JWT_REFRESH_SECRET=$refresh
# gRPC (local compose)
GRPC_AUTH_URL=auth-service:50051
GRPC_VIDEO_URL=video-service:50052
GRPC_INTERACTION_URL=interaction-service:50053
GRPC_NOTIFICATION_URL=notification-service:50054
# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
"@
        $content | Out-File -Encoding UTF8 -FilePath $envPath -Force
        Write-Host "✅ .env created" -ForegroundColor Green
    } else {
        Write-Host ".env already exists at $envPath" -ForegroundColor Yellow
    }
}

# Determine docker-compose command available on the machine
function Get-ComposeCmd {
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) { return 'docker-compose' }
    return 'docker compose'
}

# Start entire project: infra via docker-compose and optional frontend
function Start-All {
    param(
        [switch]$StartFrontend,
        [switch]$SkipPull,
        [switch]$ForceEnv
    )

    Ensure-EnvFile -Force:$ForceEnv

    # Check Docker
        docker info
    } catch {
        Write-Error "Docker does not appear to be available. Start Docker Desktop and retry.`nError details: $($_.Exception.Message)"
        Write-Error "Docker does not appear to be available. Start Docker Desktop and retry."
        return
    }

    $compose = Get-ComposeCmd
    Write-Host "Using compose command: $compose" -ForegroundColor Cyan

    if (-not $SkipPull) {
        Write-Host "Attempting to pull images (this may fail if network/registry blocked)" -ForegroundColor Cyan
        try {
            & $compose pull
        } catch {
            Write-Warning "Pull failed: $_. Continuing to attempt build/up. If you have network issues, see Docker settings or try pulling images manually."
        }
    }

    Write-Host "Bringing up services (build if necessary)..." -ForegroundColor Cyan
    try {
        & $compose up --build -d
    } catch {
        Write-Error "Compose up failed: $_"
        return
    }

    Write-Host "✅ Services started (or are starting). Showing status:" -ForegroundColor Green
    & $compose ps

    if ($StartFrontend) {
        # try to find frontend
        $root = $PSScriptRoot
        $candidates = @('tiktok-frontend','frontend','apps/frontend','apps/web','web')
        $found = $null
        foreach ($d in $candidates) {
            $p = Join-Path $root $d
            if (Test-Path (Join-Path $p 'package.json')) { $found = $p; break }
        }
        if ($null -eq $found) {
            Write-Warning "No frontend folder found in common locations. Start frontend manually."
        } else {
            Write-Host "Starting frontend at: $found" -ForegroundColor Cyan
            $pkg = Get-Content (Join-Path $found 'package.json') -Raw | ConvertFrom-Json
            if ($pkg.scripts.'dev') { $script = 'dev' }
            elseif ($pkg.scripts.'start:dev') { $script = 'start:dev' }
            elseif ($pkg.scripts.'start') { $script = 'start' }
            else { $script = $null }
            $runCmd = if ($script) { "npm run $script" } else { "npm start" }
            $cmd = "cd `"$found`"; npm install; $runCmd"
            $cmd = "cd `"$found`"; npm install; " + (if ($script) { "npm run $script" } else { "npm start" })
            Start-Process -FilePath 'powershell' -ArgumentList ('-NoExit','-Command',$cmd)
            Write-Host "Frontend started in new PowerShell window." -ForegroundColor Green
        }
    }

    Write-Host "To tail logs: $compose logs -f" -ForegroundColor Yellow
}

function Reset-Database {
    Write-Host "⚠️  WARNING: This will delete all data!" -ForegroundColor Red
    $confirm = Read-Host "Are you sure? (yes/no)"
    if ($confirm -eq "yes") {
        docker-compose down -v
        docker-compose up -d postgres redis rabbitmq
        Write-Host "✅ Database reset completed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Cancelled" -ForegroundColor Red
    }
}

function Show-Logs {
    param([string]$ServiceName)
    
    if ([string]::IsNullOrEmpty($ServiceName)) {
        docker-compose logs -f
    } else {
        docker-compose logs -f $ServiceName
    }
}

function Test-Health {
    Write-Host "🏥 Checking service health..." -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "API Gateway:" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
        Write-Host ($response | ConvertTo-Json) -ForegroundColor Green
    } catch {
        Write-Host "❌ Not running" -ForegroundColor Red
    }
    Write-Host ""
    
    Write-Host "Auth Service:" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get
        Write-Host ($response | ConvertTo-Json) -ForegroundColor Green
    } catch {
        Write-Host "❌ Not running" -ForegroundColor Red
    }
    Write-Host ""
    
    Write-Host "PostgreSQL:" -ForegroundColor Yellow
    try {
        docker-compose exec postgres pg_isready -U postgres
    } catch {
        Write-Host "❌ Not running" -ForegroundColor Red
    }
    Write-Host ""
    
    Write-Host "Redis:" -ForegroundColor Yellow
    try {
        docker-compose exec redis redis-cli ping
    } catch {
        Write-Host "❌ Not running" -ForegroundColor Red
    }
}

function Test-API {
    Write-Host "🧪 Testing API..." -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "1. Register user..." -ForegroundColor Yellow
    $registerBody = @{
        email = "test@example.com"
        username = "testuser"
        password = "Password123!"
        fullName = "Test User"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
            -Method Post `
            -ContentType "application/json" `
            -Body $registerBody `
            -SessionVariable session
        Write-Host ($response | ConvertTo-Json) -ForegroundColor Green
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "2. Login..." -ForegroundColor Yellow
    $loginBody = @{
        emailOrUsername = "test@example.com"
        password = "Password123!"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
            -Method Post `
            -ContentType "application/json" `
            -Body $loginBody `
            -WebSession $session
        Write-Host ($response | ConvertTo-Json) -ForegroundColor Green
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "3. Get current user..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" `
            -Method Get `
            -WebSession $session
        Write-Host ($response | ConvertTo-Json) -ForegroundColor Green
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
}

function Start-Docker {
    Write-Host "🐳 Starting ALL services with Docker (Monorepo)..." -ForegroundColor Cyan
    Write-Host ""
    
    # Ensure .env exists
    if (-not (Test-Path ".env")) {
        Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
        & .\ensure-env.ps1
    } else {
        Write-Host "✅ .env file exists" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "🔨 Building and starting containers..." -ForegroundColor Cyan
    docker compose up --build -d
    
    Write-Host ""
    Write-Host "✅ All services started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services running:" -ForegroundColor Yellow
    docker compose ps
    Write-Host ""
    Write-Host "Access:" -ForegroundColor Cyan
    Write-Host "  Frontend:         http://localhost:3000" -ForegroundColor Green
    Write-Host "  API Gateway:      http://localhost:4000" -ForegroundColor Green
    Write-Host "  Swagger Docs:     http://localhost:4000/api/docs" -ForegroundColor Green
    Write-Host "  RabbitMQ Manager: http://localhost:15672 (guest/guest)" -ForegroundColor Gray
    Write-Host "  Prometheus:       http://localhost:9090" -ForegroundColor Gray
    Write-Host "  Grafana:          http://localhost:3005 (admin/admin)" -ForegroundColor Gray
}

function Stop-Docker {
    Write-Host "🛑 Stopping all Docker services..." -ForegroundColor Yellow
    docker compose down
    Write-Host "✅ All services stopped!" -ForegroundColor Green
}

function Rebuild-Docker {
    param([string]$ServiceName = "")
    
    if ($ServiceName) {
        Write-Host "🔨 Rebuilding $ServiceName..." -ForegroundColor Cyan
        docker compose up --build -d $ServiceName
    } else {
        Write-Host "🔨 Rebuilding ALL services..." -ForegroundColor Cyan
        docker compose down
        docker compose up --build -d
    }
    Write-Host "✅ Rebuild complete!" -ForegroundColor Green
}

function Clean-Docker {
    Write-Host "🧹 Cleaning Docker resources..." -ForegroundColor Yellow
    Write-Host "Stopping containers..." -ForegroundColor Gray
    docker compose down -v
    Write-Host "Removing unused images..." -ForegroundColor Gray
    docker system prune -f
    Write-Host "✅ Docker cleanup complete!" -ForegroundColor Green
}

function Show-Help {
    Write-Host "TikTok Clone - Development Helper (Monorepo)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\scripts.ps1 [command] [service]" -ForegroundColor White
    Write-Host ""
    Write-Host "🐳 Docker Commands (Production-like):" -ForegroundColor Yellow
    Write-Host "  docker-up       Start ALL services with Docker Compose" -ForegroundColor White
    Write-Host "  docker-down     Stop all Docker services" -ForegroundColor White
    Write-Host "  docker-rebuild [service]  Rebuild and restart (all or specific)" -ForegroundColor White
    Write-Host "  docker-clean    Clean Docker resources (volumes, images)" -ForegroundColor White
    Write-Host ""
    Write-Host "💻 Development Commands (Local):" -ForegroundColor Yellow
    Write-Host "  start-infra    Start infrastructure only (DB, Redis, RabbitMQ)" -ForegroundColor White
    Write-Host "  stop-infra     Stop infrastructure services" -ForegroundColor White
    Write-Host "  clean          Clean build artifacts (dist, node_modules)" -ForegroundColor White
    Write-Host "  reset-db       Reset database (WARNING: deletes all data)" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Monitoring & Testing:" -ForegroundColor Yellow
    Write-Host "  logs [service] Show logs (all or specific service)" -ForegroundColor White
    Write-Host "  health         Check all services health" -ForegroundColor White
    Write-Host "  test-api       Test API endpoints" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Quick Start:" -ForegroundColor Yellow
    Write-Host "  run-all [flags] Start backend (docker-compose) and optional frontend" -ForegroundColor White
    Write-Host "                 Flags: frontend,skip-pull,force-env  (comma separated)" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\scripts.ps1 docker-up              # Start everything with Docker" -ForegroundColor Gray
    Write-Host "  .\scripts.ps1 docker-rebuild frontend # Rebuild only frontend" -ForegroundColor Gray
    Write-Host "  .\scripts.ps1 logs api-gateway       # Show API Gateway logs" -ForegroundColor Gray
    Write-Host "  .\scripts.ps1 health                 # Check all services" -ForegroundColor Gray
    Write-Host "  .\scripts.ps1 docker-clean           # Clean up Docker" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📚 More info: See WORKSPACE_SETUP.md" -ForegroundColor Cyan
}

# Main switch
switch ($Command.ToLower()) {
    # Docker commands
    "docker-up" { Start-Docker }
    "docker-down" { Stop-Docker }
    "docker-rebuild" { Rebuild-Docker -ServiceName $Service }
    "docker-clean" { Clean-Docker }
    
    # Development commands
    "start-infra" { Start-Infrastructure }
    "stop-infra" { Stop-Infrastructure }
    "clean" { Clean-Project }
    "reset-db" { Reset-Database }
    
    # Monitoring & Testing
    "logs" { Show-Logs -ServiceName $Service }
    "health" { Test-Health }
    "test-api" { Test-API }
    
    # Legacy command
    "run-all" {
        # Service parameter can be comma-separated flags: frontend,skip-pull,force-env
        $startFrontend = $false
        $skipPull = $false
        $forceEnv = $false
        if ($Service) {
            foreach ($f in $Service.Split(',')) {
                switch ($f.Trim().ToLower()) {
                    'frontend' { $startFrontend = $true }
                    'skip-pull' { $skipPull = $true }
                    'force-env' { $forceEnv = $true }
                }
            }
        }
        Start-All -StartFrontend:$startFrontend -SkipPull:$skipPull -ForceEnv:$forceEnv
    }
    
    default { Show-Help }
}
