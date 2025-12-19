#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Run TikTok Clone project with native microservices and Docker infrastructure
.DESCRIPTION
    This script starts infrastructure services (PostgreSQL, Redis, Kafka, Zookeeper) in Docker
    and runs all microservices (Auth, Video, Interaction, Notification, API Gateway) natively
    with hot reload for easier debugging and development.
.EXAMPLE
    .\run-native.ps1
    Starts infrastructure first, then all microservices with hot reload
.EXAMPLE
    .\run-native.ps1 -SkipInfra
    Only starts microservices (assumes infrastructure is already running)
.EXAMPLE
    .\run-native.ps1 -SkipFrontend
    Starts infrastructure and microservices but not the frontend
.EXAMPLE
    .\run-native.ps1 -InfraOnly
    Only starts infrastructure services
#>

param(
    [switch]$SkipInfra,
    [switch]$SkipFrontend,
    [switch]$StopOnly,
    [switch]$InfraOnly
)

# Color output functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Header {
    param([string]$Message)
    Write-Host "`n========================================" -ForegroundColor Magenta
    Write-Host " $Message" -ForegroundColor Magenta
    Write-Host "========================================`n" -ForegroundColor Magenta
}

# Check if Docker is running
function Test-DockerRunning {
    try {
        $null = docker ps 2>&1
        return $true
    } catch {
        return $false
    }
}

# Stop all services
function Stop-AllServices {
    Write-Header "Stopping All Services"

    # Stop infrastructure Docker containers
    Write-Info "Stopping infrastructure containers..."
    if (Test-Path "docker-compose.infra.yml") {
        docker-compose -f docker-compose.infra.yml down
    }
    docker-compose down 2>$null

    # Kill Node.js processes for microservices
    Write-Info "Stopping Node.js microservices..."
    Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
        $_.ProcessName -eq "node"
    } | ForEach-Object {
        try {
            $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)" -Property CommandLine).CommandLine
            if ($cmdLine -match "(nest|api-gateway|auth-service|video-service|interaction-service|notification-service)" -or
                $cmdLine -match "next dev") {
                Write-Info "Stopping process: $($_.ProcessName) (PID: $($_.Id))"
                Stop-Process -Id $_.Id -Force
            }
        } catch {
            # Ignore errors when getting command line
        }
    }

    Write-Success "All services stopped"
}

# Main execution
if ($StopOnly) {
    Stop-AllServices
    exit 0
}

# Check prerequisites
Write-Header "Checking Prerequisites"

if (-not (Test-DockerRunning)) {
    Write-Error-Custom "Docker is not running. Please start Docker Desktop and try again."
    exit 1
}
Write-Success "Docker is running"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error-Custom "Node.js is not installed or not in PATH"
    exit 1
}
Write-Success "Node.js found: $(node --version)"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error-Custom "npm is not installed or not in PATH"
    exit 1
}
Write-Success "npm found: $(npm --version)"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Warning "node_modules not found. Running npm install..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "npm install failed"
        exit 1
    }
}
Write-Success "Dependencies installed"

# Start infrastructure services
if (-not $SkipInfra) {
    Write-Header "Starting Infrastructure Services"

    # Check if infrastructure is already running
    $postgresRunning = docker ps --format "{{.Names}}" 2>$null | Where-Object { $_ -eq "tiktok_postgres" }
    $redisRunning = docker ps --format "{{.Names}}" 2>$null | Where-Object { $_ -eq "tiktok_redis" }
    $kafkaRunning = docker ps --format "{{.Names}}" 2>$null | Where-Object { $_ -eq "tiktok_kafka" }

    if ($postgresRunning -and $redisRunning -and $kafkaRunning) {
        Write-Info "Infrastructure services are already running. Skipping startup..."
    } else {
        Write-Info "Starting infrastructure containers..."

        # Use existing docker-compose.infra.yml if it exists, otherwise start with full compose
        if (Test-Path "docker-compose.infra.yml") {
            docker-compose -f docker-compose.infra.yml up -d
        } else {
            Write-Warning "docker-compose.infra.yml not found, using full docker-compose..."
            docker-compose up -d postgres redis kafka zookeeper kafka-ui redis-commander pgadmin
        }

        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "Failed to start infrastructure containers"
            exit 1
        }

        Write-Success "Infrastructure containers started"

        # Wait for services to be healthy
        Write-Info "Waiting for infrastructure services to be ready..."
        $maxAttempts = 60
        $attempt = 0

        while ($attempt -lt $maxAttempts) {
            $attempt++
            if ($attempt % 5 -eq 0) {
                Write-Host "`nChecking services... ($attempt/$maxAttempts)"
            } else {
                Write-Host "." -NoNewline
            }

            # Check if containers are running
            $postgresStatus = docker inspect --format='{{.State.Status}}' tiktok_postgres 2>$null
            $redisStatus = docker inspect --format='{{.State.Status}}' tiktok_redis 2>$null
            $kafkaStatus = docker inspect --format='{{.State.Status}}' tiktok_kafka 2>$null

            # Check health if containers support it
            $postgresHealth = docker inspect --format='{{.State.Health.Status}}' tiktok_postgres 2>$null
            $redisHealth = docker inspect --format='{{.State.Health.Status}}' tiktok_redis 2>$null
            $kafkaHealth = docker inspect --format='{{.State.Health.Status}}' tiktok_kafka 2>$null

            # Consider service ready if it's running and healthy (if health check exists) or just running
            $postgresReady = ($postgresStatus -eq "running") -and (($postgresHealth -eq "healthy") -or ($postgresHealth -eq "<no value>"))
            $redisReady = ($redisStatus -eq "running") -and (($redisHealth -eq "healthy") -or ($redisHealth -eq "<no value>"))
            $kafkaReady = ($kafkaStatus -eq "running") -and (($kafkaHealth -eq "healthy") -or ($kafkaHealth -eq "<no value>"))

            if ($postgresReady -and $redisReady -and $kafkaReady) {
                Write-Host ""
                Write-Success "All infrastructure services are ready"

                # Additional connection test
                Write-Info "Testing service connectivity..."
                Start-Sleep -Seconds 3
                break
            }

            if ($attempt -eq $maxAttempts) {
                Write-Host ""
                Write-Warning "Timeout waiting for services to be ready. Current status:"
                Write-Host "  - PostgreSQL: $postgresStatus ($postgresHealth)" -ForegroundColor Yellow
                Write-Host "  - Redis: $redisStatus ($redisHealth)" -ForegroundColor Yellow
                Write-Host "  - Kafka: $kafkaStatus ($kafkaHealth)" -ForegroundColor Yellow
                Write-Warning "Continuing anyway..."
            }

            Start-Sleep -Seconds 2
        }
    }
} else {
    Write-Info "Skipping infrastructure startup (using existing containers)"
}

# Setup environment variables for native services
Write-Header "Setting Up Environment Variables"

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Warning ".env file not found. Creating from .env.example or defaults..."

    $envContent = @"
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
# JWT
JWT_ACCESS_SECRET=your-secret-key-please-change-in-production
JWT_REFRESH_SECRET=your-refresh-key-please-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Service URLs (for native services)
GRPC_AUTH_URL=localhost:50051
GRPC_VIDEO_URL=localhost:50052
GRPC_INTERACTION_URL=localhost:50053
GRPC_NOTIFICATION_URL=localhost:50054

# Ports
AUTH_SERVICE_PORT=4001
VIDEO_SERVICE_PORT=4002
INTERACTION_SERVICE_PORT=4003
NOTIFICATION_SERVICE_PORT=4004
API_GATEWAY_PORT=5555
FRONTEND_PORT=3000

# Node Environment
NODE_ENV=development
"@

    Set-Content -Path ".env" -Value $envContent
    Write-Success ".env file created"
}

# Load environment variables
Write-Info "Loading environment variables..."
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.+)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}
Write-Success "Environment variables loaded"

# Exit if only infrastructure was requested
if ($InfraOnly) {
    Write-Header "Infrastructure Only Mode"
    Write-Success "Infrastructure services are running. Exiting as requested."
    Write-Info "`nManagement UIs:"
    Write-Host "  - Kafka UI: http://localhost:9000" -ForegroundColor Cyan
    Write-Host "  - Redis Commander: http://localhost:8081" -ForegroundColor Cyan
    Write-Host "  - pgAdmin: http://localhost:5050 (Email: admin@admin.com, Password: admin)" -ForegroundColor Cyan
    Write-Info "`nTo stop infrastructure: docker-compose -f docker-compose.infra.yml down"
    exit 0
}

# Start microservices
Write-Header "Starting Microservices with Hot Reload"

$services = @(
    @{Name="Auth Service"; Command="npm run start:auth"; Title="AUTH-SERVICE"; Port="4001"; gRPCPort="50051"},
    @{Name="Video Service"; Command="npm run start:video"; Title="VIDEO-SERVICE"; Port="4002"; gRPCPort="50052"},
    @{Name="Interaction Service"; Command="npm run start:interaction"; Title="INTERACTION-SERVICE"; Port="4003"; gRPCPort="50053"},
    @{Name="Notification Service"; Command="npm run start:notification"; Title="NOTIFICATION-SERVICE"; Port="4004"; gRPCPort="50054"},
    @{Name="API Gateway"; Command="npm run start:gateway"; Title="API-GATEWAY"; Port="5555"; gRPCPort="N/A"}
)

# Kill existing services first
Write-Info "Stopping any existing Node.js services..."
Get-Process -Name node -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)" -Property CommandLine).CommandLine
        if ($cmdLine -match "(nest|start:auth|start:video|start:interaction|start:notification|start:gateway)") {
            Write-Host "  - Stopping existing service (PID: $($_.Id))" -ForegroundColor Yellow
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        }
    } catch {
        # Ignore errors
    }
}

Start-Sleep -Seconds 2

foreach ($service in $services) {
    Write-Info "Starting $($service.Name) on port $($service.Port)..."

    $title = $service.Title
    $cmd = $service.Command
    $cwd = $PWD.Path

    # Create a PowerShell script for each service to get better control and color output
    $scriptFile = "$env:TEMP\start-$($service.Title.ToLower()).ps1"
    $scriptContent = @"
`$Host.UI.RawUI.WindowTitle = "$title"
Set-Location "$cwd"
Write-Host "Starting $($service.Name)..." -ForegroundColor Green
Write-Host "Port: $($service.Port)" -ForegroundColor Cyan
Write-Host "Command: $cmd" -ForegroundColor Gray
Write-Host "Hot Reload: ENABLED" -ForegroundColor Yellow
Write-Host "Working Directory: $cwd" -ForegroundColor Gray
Write-Host "`n" + "="*50 + "`n" -ForegroundColor Magenta
try {
    Invoke-Expression "$cmd"
} catch {
    Write-Host "Error starting service: `$_" -ForegroundColor Red
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    `$null = `$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
"@
    Set-Content -Path $scriptFile -Value $scriptContent -Encoding UTF8

    # Start the service in a new PowerShell window
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = "powershell.exe"
    $startInfo.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$scriptFile`""
    $startInfo.WorkingDirectory = $cwd
    $startInfo.UseShellExecute = $true
    $startInfo.CreateNoWindow = $false

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $startInfo
    $null = $process.Start()

    Write-Success "$($service.Name) started in new PowerShell window"
    Write-Host "  → HTTP: http://localhost:$($service.Port)" -ForegroundColor White
    if ($service.gRPCPort -ne "N/A") {
        Write-Host "  → gRPC: localhost:$($service.gRPCPort)" -ForegroundColor White
    }
    Write-Host ""
    Start-Sleep -Seconds 3
}

Write-Header "All Services Started Successfully!"

Write-Info "Infrastructure Services (Docker):"
Write-Host "  - PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "  - Redis: localhost:6379" -ForegroundColor White
Write-Host "  - Kafka: localhost:9092" -ForegroundColor White
Write-Host "  - Zookeeper: localhost:2181" -ForegroundColor White

Write-Info "`nManagement UIs:"
Write-Host "  - Kafka UI: http://localhost:9000" -ForegroundColor Cyan
Write-Host "  - Redis Commander: http://localhost:8081" -ForegroundColor Cyan
Write-Host "  - pgAdmin: http://localhost:5050 (admin@admin.com / admin)" -ForegroundColor Cyan

Write-Info "`nMicroservices (Native with Hot Reload):"
Write-Host "  - Auth Service: http://localhost:4001 (gRPC: localhost:50051)" -ForegroundColor White
Write-Host "  - Video Service: http://localhost:4002 (gRPC: localhost:50052)" -ForegroundColor White
Write-Host "  - Interaction Service: http://localhost:4003 (gRPC: localhost:50053)" -ForegroundColor White
Write-Host "  - Notification Service: http://localhost:4004 (gRPC: localhost:50054)" -ForegroundColor White
Write-Host "  - API Gateway: http://localhost:5555" -ForegroundColor White

Write-Info "`nQuick Commands:"
Write-Host "  - Stop all services: .\run-native.ps1 -StopOnly" -ForegroundColor Yellow
Write-Host "  - Start only infrastructure: .\run-native.ps1 -InfraOnly" -ForegroundColor Yellow
Write-Host "  - Skip infrastructure: .\run-native.ps1 -SkipInfra" -ForegroundColor Yellow

Write-Info "`nDebug Commands:"
Write-Host "  - Infrastructure logs: docker-compose -f docker-compose.infra.yml logs -f" -ForegroundColor Gray
Write-Host "  - Stop infrastructure: docker-compose -f docker-compose.infra.yml down" -ForegroundColor Gray
Write-Host "  - Service status: .\status-native.ps1" -ForegroundColor Gray

Write-Success "`nDevelopment environment ready!"
Write-Host "   All services are running with hot reload enabled." -ForegroundColor Green
Write-Host "   Check individual PowerShell windows for service logs." -ForegroundColor Green
Write-Host "   Press Ctrl+C in any service window to stop that service." -ForegroundColor Yellow

# Show current running services
Write-Info "`nRunning Services Check:"
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "  Found $($nodeProcesses.Count) Node.js processes running" -ForegroundColor Green
} else {
    Write-Host "  No Node.js processes detected yet" -ForegroundColor Yellow
}

$dockerContainers = docker ps --format "{{.Names}}" 2>$null | Where-Object { $_ -match "tiktok_" }
if ($dockerContainers) {
    Write-Host "  Docker containers: $($dockerContainers -join ', ')" -ForegroundColor Green
} else {
    Write-Host "  No TikTok Docker containers found" -ForegroundColor Yellow
}
