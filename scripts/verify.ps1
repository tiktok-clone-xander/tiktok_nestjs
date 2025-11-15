#!/usr/bin/env pwsh
# Verify all services are running correctly (ASCII-only)
# Run after: .\run.ps1 or .\run-clean.ps1

Write-Host "--- TikTok Clone - Services Verification ---" -ForegroundColor Cyan
Write-Host "" 

$allGood = $true

# Check Docker containers
Write-Host "Checking Docker containers..." -ForegroundColor Yellow
Write-Host ""

$containers = docker compose ps --format json | ConvertFrom-Json
$expectedServices = @(
    "postgres", "redis", "rabbitmq",
    "auth-service", "video-service", "interaction-service", "notification-service",
    "api-gateway", "frontend",
    "prometheus", "grafana"
)

foreach ($service in $expectedServices) {
    $container = $containers | Where-Object { $_.Service -eq $service }
    if ($container -and $container.State -eq "running") {
        Write-Host "  [OK] $service is running" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $service is NOT running" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

# Check endpoints
Write-Host "Checking HTTP endpoints..." -ForegroundColor Yellow
Write-Host ""

# Frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) { Write-Host "  [OK] Frontend (http://localhost:3000)" -ForegroundColor Green }
} catch { Write-Host "  [FAIL] Frontend (http://localhost:3000)" -ForegroundColor Red; $allGood = $false }

# API Gateway
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) { Write-Host "  [OK] API Gateway (http://localhost:4000)" -ForegroundColor Green }
} catch { Write-Host "  [FAIL] API Gateway (http://localhost:4000) - see: docker compose logs api-gateway" -ForegroundColor Red; $allGood = $false }

# Swagger
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/docs" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) { Write-Host "  [OK] Swagger Docs" -ForegroundColor Green }
} catch { Write-Host "  [WARN] Swagger Docs - Not available yet" -ForegroundColor Yellow }

# RabbitMQ
try {
    $response = Invoke-WebRequest -Uri "http://localhost:15672" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) { Write-Host "  [OK] RabbitMQ Management" -ForegroundColor Green }
} catch { Write-Host "  [WARN] RabbitMQ Management - Not available yet" -ForegroundColor Yellow }

# Prometheus
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9090" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) { Write-Host "  [OK] Prometheus" -ForegroundColor Green }
} catch { Write-Host "  [WARN] Prometheus - Not available yet" -ForegroundColor Yellow }

# Grafana
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3005" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) { Write-Host "  [OK] Grafana" -ForegroundColor Green }
} catch { Write-Host "  [WARN] Grafana - Not available yet" -ForegroundColor Yellow }

Write-Host ""

# Summary
if ($allGood) {
    Write-Host "ALL SERVICES ARE HEALTHY" -ForegroundColor Green
    Write-Host "Your TikTok Clone is ready to use." -ForegroundColor Cyan
    Write-Host "Next steps: Open Frontend http://localhost:3000 and API docs http://localhost:4000/api/docs" -ForegroundColor Yellow
} else {
    Write-Host "SOME SERVICES ARE NOT READY" -ForegroundColor Red
    Write-Host "Troubleshooting: 1) Wait 1-2 minutes; 2) Run: docker compose logs -f; 3) Run this script again" -ForegroundColor Yellow
}

Write-Host ""