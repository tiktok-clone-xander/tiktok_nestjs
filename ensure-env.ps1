#!/usr/bin/env pwsh
# Auto-generate .env file if not exists
# Run before docker-compose up

$envFile = ".env"
$envExample = ".env.example"

if (-not (Test-Path $envFile)) {
    Write-Host "📝 Creating .env file from .env.example..." -ForegroundColor Yellow
    
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        
        # Generate secure JWT secrets
        Write-Host "🔐 Generating secure JWT secrets..." -ForegroundColor Cyan
        
        $bytes = New-Object Byte[] 32
        $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::Create()
        
        $rng.GetBytes($bytes)
        $jwtAccessSecret = [Convert]::ToBase64String($bytes)
        
        $rng.GetBytes($bytes)
        $jwtRefreshSecret = [Convert]::ToBase64String($bytes)
        
        # Update .env file
        $content = Get-Content $envFile
        $content = $content -replace "JWT_ACCESS_SECRET=.*", "JWT_ACCESS_SECRET=$jwtAccessSecret"
        $content = $content -replace "JWT_REFRESH_SECRET=.*", "JWT_REFRESH_SECRET=$jwtRefreshSecret"
        $content | Set-Content $envFile
        
        Write-Host "✅ .env file created with secure secrets!" -ForegroundColor Green
    } else {
        Write-Host "❌ .env.example not found!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}
