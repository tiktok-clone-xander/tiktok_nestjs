#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Run TikTok Clone project with native microservices and Docker infrastructure
.DESCRIPTION
    This script starts infrastructure services (PostgreSQL, Redis, Kafka, Zookeeper) in Docker
    and runs all microservices (Auth, Video, Interaction, Notification, API Gateway) natively
    for easier debugging and development.
.EXAMPLE
    .\run-native.ps1
    Starts all infrastructure and microservices
.EXAMPLE
    .\run-native.ps1 -SkipInfra
    Only starts microservices (assumes infrastructure is already running)
.EXAMPLE
    .\run-native.ps1 -SkipFrontend
    Starts infrastructure and microservices but not the frontend
#>

param(
    [switch]$SkipInfra,
    [switch]$SkipFrontend,
    [switch]$StopOnly
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
    docker-compose down
    
    # Kill Node.js processes for microservices
    Write-Info "Stopping Node.js microservices..."
    Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
        $_.MainWindowTitle -match "nest|api-gateway|auth-service|video-service|interaction-service|notification-service"
    } | Stop-Process -Force
    
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
    
    # Create docker-compose.infra.yml for infrastructure only
    Write-Info "Creating infrastructure-only Docker Compose file..."
    
    $infraDockerCompose = @"
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: tiktok_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: tiktok_clone
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - tiktok_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis
  redis:
    image: redis:7-alpine
    container_name: tiktok_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - tiktok_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Zookeeper (Required for Kafka)
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: tiktok_zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"
    volumes:
      - zookeeper_data:/var/lib/zookeeper/data
      - zookeeper_logs:/var/lib/zookeeper/log
    networks:
      - tiktok_network
    healthcheck:
      test: ["CMD", "nc", "-z", "localhost", "2181"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Kafka
  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: tiktok_kafka
    depends_on:
      zookeeper:
        condition: service_healthy
    ports:
      - "9092:9092"
      - "9093:9093"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'
    volumes:
      - kafka_data:/var/lib/kafka/data
    networks:
      - tiktok_network
    healthcheck:
      test: ["CMD", "kafka-broker-api-versions", "--bootstrap-server", "localhost:9092"]
      interval: 10s
      timeout: 10s
      retries: 5
networks:
  tiktok_network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  zookeeper_data:
  zookeeper_logs:
  kafka_data:
  rabbitmq_data:
"@

    Set-Content -Path "docker-compose.infra.yml" -Value $infraDockerCompose
    Write-Success "Infrastructure Docker Compose file created"
    
    Write-Info "Starting infrastructure containers..."
    docker-compose -f docker-compose.infra.yml up -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to start infrastructure containers"
        exit 1
    }
    
    Write-Success "Infrastructure containers started"
    
    # Wait for services to be healthy
    Write-Info "Waiting for infrastructure services to be ready..."
    $maxAttempts = 30
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        $attempt++
        Write-Host "." -NoNewline
        
        $postgresHealthy = docker inspect --format='{{.State.Health.Status}}' tiktok_postgres 2>$null
        $redisHealthy = docker inspect --format='{{.State.Health.Status}}' tiktok_redis 2>$null
        $kafkaHealthy = docker inspect --format='{{.State.Health.Status}}' tiktok_kafka 2>$null
        
        if ($postgresHealthy -eq "healthy" -and $redisHealthy -eq "healthy" -and $kafkaHealthy -eq "healthy") {
            Write-Host ""
            Write-Success "All infrastructure services are healthy"
            break
        }
        
        if ($attempt -eq $maxAttempts) {
            Write-Host ""
            Write-Warning "Timeout waiting for services to be healthy, but continuing anyway..."
        }
        
        Start-Sleep -Seconds 2
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

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin@localhost:5672

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
AUTH_SERVICE_PORT=3001
VIDEO_SERVICE_PORT=3002
INTERACTION_SERVICE_PORT=3003
NOTIFICATION_SERVICE_PORT=3004
API_GATEWAY_PORT=3000

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

# Start microservices
Write-Header "Starting Microservices Natively"

$services = @(
    @{Name="Auth Service"; Command="npm run start:auth"; Title="AUTH-SERVICE"},
    @{Name="Video Service"; Command="npm run start:video"; Title="VIDEO-SERVICE"},
    @{Name="Interaction Service"; Command="npm run start:interaction"; Title="INTERACTION-SERVICE"},
    @{Name="Notification Service"; Command="npm run start:notification"; Title="NOTIFICATION-SERVICE"},
    @{Name="API Gateway"; Command="npm run start:gateway"; Title="API-GATEWAY"}
)

foreach ($service in $services) {
    Write-Info "Starting $($service.Name)..."
    
    # Start each service in a new PowerShell window
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = "powershell.exe"
    $startInfo.Arguments = "-NoExit -Command `"cd '$PWD'; $($service.Command)`""
    $startInfo.WorkingDirectory = $PWD
    $startInfo.UseShellExecute = $true
    $startInfo.CreateNoWindow = $false
    
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $startInfo
    $null = $process.Start()
    
    Write-Success "$($service.Name) started in new window"
    Start-Sleep -Seconds 2
}

# Start frontend if not skipped
if (-not $SkipFrontend) {
    Write-Header "Starting Frontend"
    
    if (Test-Path "tiktok-frontend") {
        Write-Info "Starting Next.js frontend..."
        
        $startInfo = New-Object System.Diagnostics.ProcessStartInfo
        $startInfo.FileName = "powershell.exe"
        $startInfo.Arguments = "-NoExit -Command `"cd '$PWD\tiktok-frontend'; npm run dev`""
        $startInfo.WorkingDirectory = "$PWD\tiktok-frontend"
        $startInfo.UseShellExecute = $true
        $startInfo.CreateNoWindow = $false
        
        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $startInfo
        $null = $process.Start()
        
        Write-Success "Frontend started in new window"
    } else {
        Write-Warning "Frontend directory not found, skipping..."
    }
}

Write-Header "All Services Started"

Write-Info "Infrastructure Services (Docker):"
Write-Host "  - PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "  - Redis: localhost:6379" -ForegroundColor White
Write-Host "  - Kafka: localhost:9092" -ForegroundColor White
Write-Host "  - Zookeeper: localhost:2181" -ForegroundColor White
Write-Host "  - RabbitMQ: localhost:5672 (Management: http://localhost:15672)" -ForegroundColor White

Write-Info "`nMicroservices (Native):"
Write-Host "  - Auth Service: http://localhost:3001 (gRPC: localhost:50051)" -ForegroundColor White
Write-Host "  - Video Service: http://localhost:3002 (gRPC: localhost:50052)" -ForegroundColor White
Write-Host "  - Interaction Service: http://localhost:3003 (gRPC: localhost:50053)" -ForegroundColor White
Write-Host "  - Notification Service: http://localhost:3004 (gRPC: localhost:50054)" -ForegroundColor White
Write-Host "  - API Gateway: http://localhost:3000" -ForegroundColor White

if (-not $SkipFrontend) {
    Write-Info "`nFrontend:"
    Write-Host "  - Next.js App: http://localhost:3001" -ForegroundColor White
}

Write-Info "`nTo stop all services, run: .\run-native.ps1 -StopOnly"
Write-Info "To view infrastructure logs: docker-compose -f docker-compose.infra.yml logs -f"
Write-Info "To stop infrastructure only: docker-compose -f docker-compose.infra.yml down"

Write-Success "`nAll services are running. Check individual windows for service logs."
Write-Warning "Press Ctrl+C in each service window to stop that service."
