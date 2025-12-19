#!/usr/bin/env pwsh

# TikTok Clone K8s Deployment Script
# Environments: dev, staging, prod
# Usage: .\deploy.ps1 -Environment dev -Action install

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev",

    [Parameter(Mandatory=$false)]
    [ValidateSet("install", "upgrade", "uninstall")]
    [string]$Action = "install"
)

$namespace = "tiktok-clone"
$releaseName = "tiktok-clone"
$chartPath = "./helm/tiktok-clone"

Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    TikTok Clone K8s Deployment Script            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Environment: $Environment" -ForegroundColor Green
Write-Host "Action:      $Action" -ForegroundColor Green
Write-Host "Namespace:   $namespace" -ForegroundColor Green
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

$tools = @("kubectl", "helm", "docker")
foreach ($tool in $tools) {
    if (Get-Command $tool -ErrorAction SilentlyContinue) {
        $version = & $tool version 2>&1 | Select-Object -First 1
        Write-Host "  ✅ $tool installed" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $tool NOT installed" -ForegroundColor Red
        exit 1
    }
}

# Create namespace if doesn't exist
Write-Host "`n📦 Setting up namespace..." -ForegroundColor Yellow
kubectl get namespace $namespace -ErrorAction SilentlyContinue | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Creating namespace: $namespace" -ForegroundColor Cyan
    kubectl create namespace $namespace
} else {
    Write-Host "  Namespace already exists: $namespace" -ForegroundColor Green
}

# Build Docker images
Write-Host "`n🐳 Checking Docker images..." -ForegroundColor Yellow

$images = @(
    @{tag="tiktok-auth-service:latest"; dockerfile="apps/auth-service/Dockerfile"},
    @{tag="tiktok-video-service:latest"; dockerfile="apps/video-service/Dockerfile"},
    @{tag="tiktok-interaction-service:latest"; dockerfile="apps/interaction-service/Dockerfile"},
    @{tag="tiktok-notification-service:latest"; dockerfile="apps/notification-service/Dockerfile"},
    @{tag="tiktok-api-gateway:latest"; dockerfile="apps/api-gateway/Dockerfile"}
)

foreach ($image in $images) {
    $result = docker images --quiet $image.tag
    if ($result) {
        Write-Host "  ✅ $($image.tag)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $($image.tag) not found, building..." -ForegroundColor Yellow
        $context = if ($image.context) { $image.context } else { "." }
        docker build -t $image.tag -f $image.dockerfile $context
    }
}

# Helm operations
Write-Host "`n🎁 Executing Helm $Action..." -ForegroundColor Yellow

$valuesFile = "helm/tiktok-clone/values-$Environment.yaml"

if (Test-Path $valuesFile) {
    Write-Host "  Using values: $valuesFile" -ForegroundColor Cyan
} else {
    Write-Host "  ⚠️  Values file not found: $valuesFile" -ForegroundColor Red
    exit 1
}

switch ($Action) {
    "install" {
        Write-Host "  Installing release: $releaseName" -ForegroundColor Cyan
        helm install $releaseName $chartPath `
            -f helm/tiktok-clone/values.yaml `
            -f $valuesFile `
            -n $namespace
    }
    "upgrade" {
        Write-Host "  Upgrading release: $releaseName" -ForegroundColor Cyan
        helm upgrade $releaseName $chartPath `
            -f helm/tiktok-clone/values.yaml `
            -f $valuesFile `
            -n $namespace
    }
    "uninstall" {
        Write-Host "  Uninstalling release: $releaseName" -ForegroundColor Cyan
        helm uninstall $releaseName -n $namespace
    }
}

if ($Action -ne "uninstall") {
    Write-Host "`n⏳ Waiting for pods to start (30 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5

    Write-Host "`n📊 Pod Status:" -ForegroundColor Green
    kubectl get pods -n $namespace

    Write-Host "`n🔗 Services:" -ForegroundColor Green
    kubectl get svc -n $namespace

    Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Watch pods: kubectl get pods -n $namespace -w" -ForegroundColor White
    Write-Host "  2. View logs: kubectl logs -n $namespace -l app=auth-service -f" -ForegroundColor White
    Write-Host "  3. Port forward: kubectl port-forward -n $namespace svc/api-gateway 4000:4000" -ForegroundColor White
    Write-Host "  4. Port forward: kubectl port-forward -n $namespace svc/frontend 3000:3000" -ForegroundColor White
}

Write-Host "`n✅ Done!" -ForegroundColor Green
Write-Host ""
