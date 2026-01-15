<#
.SYNOPSIS
    Build Docker images including migration image for TikTok Clone K8s deployment

.DESCRIPTION
    This script builds all necessary Docker images for K8s deployment,
    including the migration image that runs database migrations.

.PARAMETER Service
    Specific service to build: auth, video, interaction, notification, gateway, migration, all
    Default: all

.PARAMETER Tag
    Docker image tag. Default: latest

.PARAMETER Push
    Push images to registry after building

.EXAMPLE
    .\scripts\build-k8s-images.ps1
    .\scripts\build-k8s-images.ps1 -Service migration
    .\scripts\build-k8s-images.ps1 -Service all -Tag v1.0.0

#>

param(
    [ValidateSet('auth', 'video', 'interaction', 'notification', 'gateway', 'migration', 'all')]
    [string]$Service = 'all',

    [string]$Tag = 'latest',

    [switch]$Push
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "TikTok Clone - Docker Image Builder" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

# Service definitions
$Services = @{
    'auth' = @{
        Name = 'tiktok-auth-service'
        Dockerfile = 'apps/auth-service/Dockerfile'
    }
    'video' = @{
        Name = 'tiktok-video-service'
        Dockerfile = 'apps/video-service/Dockerfile'
    }
    'interaction' = @{
        Name = 'tiktok-interaction-service'
        Dockerfile = 'apps/interaction-service/Dockerfile'
    }
    'notification' = @{
        Name = 'tiktok-notification-service'
        Dockerfile = 'apps/notification-service/Dockerfile'
    }
    'gateway' = @{
        Name = 'tiktok-api-gateway'
        Dockerfile = 'apps/api-gateway/Dockerfile'
    }
    'migration' = @{
        Name = 'tiktok-migration'
        Dockerfile = 'docker/Dockerfile.migration'
    }
}

function Build-Image {
    param(
        [string]$ServiceKey,
        [hashtable]$Config
    )

    $imageName = "$($Config.Name):$Tag"
    $dockerfile = Join-Path $ProjectRoot $Config.Dockerfile

    Write-Host ""
    Write-Host "-----------------------------------------------------------" -ForegroundColor Yellow
    Write-Host "Building: $imageName" -ForegroundColor Yellow
    Write-Host "   Dockerfile: $($Config.Dockerfile)" -ForegroundColor Gray
    Write-Host "-----------------------------------------------------------" -ForegroundColor Yellow

    Push-Location $ProjectRoot
    try {
        docker build -t $imageName -f $dockerfile .

        if ($LASTEXITCODE -ne 0) {
            throw "Docker build failed for $imageName"
        }

        Write-Host "Successfully built: $imageName" -ForegroundColor Green

        if ($Push) {
            Write-Host "Pushing: $imageName" -ForegroundColor Cyan
            docker push $imageName
            if ($LASTEXITCODE -ne 0) {
                throw "Docker push failed for $imageName"
            }
            Write-Host "Successfully pushed: $imageName" -ForegroundColor Green
        }
    }
    finally {
        Pop-Location
    }
}

# Determine which services to build
$servicesToBuild = @()
if ($Service -eq 'all') {
    $servicesToBuild = $Services.Keys
} else {
    $servicesToBuild = @($Service)
}

Write-Host "Services to build: $($servicesToBuild -join ', ')" -ForegroundColor Cyan
Write-Host "Tag: $Tag" -ForegroundColor Cyan
Write-Host ""

# Build each service
$results = @()
foreach ($svc in $servicesToBuild) {
    try {
        Build-Image -ServiceKey $svc -Config $Services[$svc]
        $results += @{ Service = $svc; Success = $true }
    }
    catch {
        Write-Host "Failed to build $svc : $_" -ForegroundColor Red
        $results += @{ Service = $svc; Success = $false }
    }
}

# Print summary
Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "Build Summary" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan

$hasFailure = $false
foreach ($result in $results) {
    if ($result.Success) {
        Write-Host "  [OK] $($result.Service)" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $($result.Service)" -ForegroundColor Red
        $hasFailure = $true
    }
}

Write-Host ""
if ($hasFailure) {
    Write-Host "WARNING: Some builds failed!" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "All builds completed successfully!" -ForegroundColor Green
}
