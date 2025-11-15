# TikTok Clone - Development Helper Scripts (Windows)
# Run with: .\scripts.ps1 [command]

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

function Show-Help {
    Write-Host "TikTok Clone - Development Helper" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\scripts.ps1 [command] [service]" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  start-infra    Start infrastructure services" -ForegroundColor White
    Write-Host "  stop-infra     Stop infrastructure services" -ForegroundColor White
    Write-Host "  clean          Clean build artifacts" -ForegroundColor White
    Write-Host "  reset-db       Reset database (WARNING: deletes all data)" -ForegroundColor White
    Write-Host "  logs [service] Show logs (all or specific service)" -ForegroundColor White
    Write-Host "  health         Check service health" -ForegroundColor White
    Write-Host "  test-api       Test API endpoints" -ForegroundColor White
    Write-Host "  help           Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\scripts.ps1 start-infra" -ForegroundColor Gray
    Write-Host "  .\scripts.ps1 logs api-gateway" -ForegroundColor Gray
    Write-Host "  .\scripts.ps1 health" -ForegroundColor Gray
}

# Main switch
switch ($Command.ToLower()) {
    "start-infra" { Start-Infrastructure }
    "stop-infra" { Stop-Infrastructure }
    "clean" { Clean-Project }
    "reset-db" { Reset-Database }
    "logs" { Show-Logs -ServiceName $Service }
    "health" { Test-Health }
    "test-api" { Test-API }
    default { Show-Help }
}
