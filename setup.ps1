# TikTok Clone - Setup Script for Windows
# Run with: .\setup.ps1

Write-Host "🚀 TikTok Clone - Setup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js 20.x or higher from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm -v
    Write-Host "✅ npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed" -ForegroundColor Red
    exit 1
}

# Check Docker
try {
    $dockerVersion = docker -v
    Write-Host "✅ Docker $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Docker is not installed (optional but recommended)" -ForegroundColor Yellow
    Write-Host "Install from https://www.docker.com/" -ForegroundColor Yellow
}

# Check Docker Compose
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is available" -ForegroundColor Green
} catch {
    try {
        docker compose version | Out-Null
        Write-Host "✅ Docker Compose is available" -ForegroundColor Green
    } catch {
        # Docker Compose not available
    }
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "🔧 Setting up environment..." -ForegroundColor Yellow

if (-not (Test-Path .env)) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    
    Write-Host ""
    Write-Host "🔐 Generating JWT secrets..." -ForegroundColor Yellow
    
    # Generate random secrets
    $bytes = New-Object Byte[] 32
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::Create()
    $rng.GetBytes($bytes)
    $jwtAccessSecret = [Convert]::ToBase64String($bytes)
    
    $rng.GetBytes($bytes)
    $jwtRefreshSecret = [Convert]::ToBase64String($bytes)
    
    # Update .env file
    (Get-Content .env) | ForEach-Object {
        $_ -replace "JWT_ACCESS_SECRET=.*", "JWT_ACCESS_SECRET=$jwtAccessSecret" `
           -replace "JWT_REFRESH_SECRET=.*", "JWT_REFRESH_SECRET=$jwtRefreshSecret"
    } | Set-Content .env
    
    Write-Host "✅ JWT secrets generated and saved to .env" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file already exists, skipping..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start infrastructure (PostgreSQL, Redis, RabbitMQ):" -ForegroundColor White
Write-Host "   docker-compose up -d postgres redis rabbitmq" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start services (in separate terminals):" -ForegroundColor White
Write-Host "   npm run start:auth" -ForegroundColor Gray
Write-Host "   npm run start:video" -ForegroundColor Gray
Write-Host "   npm run start:interaction" -ForegroundColor Gray
Write-Host "   npm run start:gateway" -ForegroundColor Gray
Write-Host ""
Write-Host "OR run everything with Docker:" -ForegroundColor White
Write-Host "   docker-compose up -d" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Check health:" -ForegroundColor White
Write-Host "   curl http://localhost:3000/health" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Access Swagger docs:" -ForegroundColor White
Write-Host "   http://localhost:3000/api/docs" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Cyan
