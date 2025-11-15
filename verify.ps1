#!/usr/bin/env pwsh
# Verify all services are running correctly
# Run after: .\run.ps1

Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     TikTok Clone - Services Verification            ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Docker containers
Write-Host "🐳 Checking Docker containers..." -ForegroundColor Yellow
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
        Write-Host "  ✅ $service is running" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $service is NOT running" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

# Check endpoints
Write-Host "🌐 Checking endpoints..." -ForegroundColor Yellow
Write-Host ""

# Frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Frontend (http://localhost:3000) - OK" -ForegroundColor Green
    }
} catch {
    Write-Host "  ❌ Frontend (http://localhost:3000) - FAILED" -ForegroundColor Red
    $allGood = $false
}

# API Gateway
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ API Gateway (http://localhost:4000) - OK" -ForegroundColor Green
    }
} catch {
    Write-Host "  ❌ API Gateway (http://localhost:4000) - FAILED" -ForegroundColor Red
    Write-Host "     Try: docker compose logs api-gateway" -ForegroundColor Gray
    $allGood = $false
}

# Swagger
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/docs" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Swagger Docs (http://localhost:4000/api/docs) - OK" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️  Swagger Docs - Not available yet" -ForegroundColor Yellow
}

# RabbitMQ
try {
    $response = Invoke-WebRequest -Uri "http://localhost:15672" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ RabbitMQ Management (http://localhost:15672) - OK" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️  RabbitMQ Management - Not available yet" -ForegroundColor Yellow
}

# Prometheus
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9090" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Prometheus (http://localhost:9090) - OK" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️  Prometheus - Not available yet" -ForegroundColor Yellow
}

# Grafana
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3005" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Grafana (http://localhost:3005) - OK" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️  Grafana - Not available yet" -ForegroundColor Yellow
}

Write-Host ""

# Summary
if ($allGood) {
    Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║           ✅ ALL SERVICES ARE HEALTHY! ✅            ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Your TikTok Clone is ready to use!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Open Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "  2. Check API docs: http://localhost:4000/api/docs" -ForegroundColor White
    Write-Host "  3. Start developing! See DEVELOPMENT.md" -ForegroundColor White
} else {
    Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║        ⚠️  SOME SERVICES ARE NOT READY YET ⚠️        ║" -ForegroundColor Red
    Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Wait 1-2 minutes for services to fully start" -ForegroundColor White
    Write-Host "  2. Check logs: docker compose logs -f" -ForegroundColor White
    Write-Host "  3. Run this script again: .\verify.ps1" -ForegroundColor White
    Write-Host "  4. See PREFLIGHT_CHECKLIST.md for common issues" -ForegroundColor White
}

Write-Host ""
