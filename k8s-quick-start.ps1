#!/usr/bin/env pwsh

# TikTok Clone K8s Health Check & Port Forward Script
# Usage: .\k8s-quick-start.ps1

$namespace = "tiktok-clone"

Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    TikTok Clone K8s Quick Start                 ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Check cluster
Write-Host "`n🔍 Cluster Status:" -ForegroundColor Yellow
kubectl cluster-info 2>&1 | Select-Object -First 1

# Check namespace
Write-Host "`n📦 Namespace: $namespace" -ForegroundColor Yellow
kubectl get ns $namespace -o name 2>&1

# Check pods
Write-Host "`n🐳 Pod Status:" -ForegroundColor Yellow
kubectl get pods -n $namespace -o wide

# Count running pods
$runningPods = kubectl get pods -n $namespace -o jsonpath='{.items[?(@.status.phase=="Running")].metadata.name}' | Measure-Object -Word
$totalPods = kubectl get pods -n $namespace -o jsonpath='{.items[*].metadata.name}' | Measure-Object -Word

Write-Host "`n  Running: $($runningPods.Words) / $($totalPods.Words)" -ForegroundColor Green

# Check services
Write-Host "`n🔗 Services:" -ForegroundColor Yellow
kubectl get svc -n $namespace

# Wait for ready
Write-Host "`n⏳ Checking pod readiness..." -ForegroundColor Yellow
$ready = kubectl get pods -n $namespace -o jsonpath='{.items[?(@.status.conditions[?(@.type=="Ready")].status=="True")].metadata.name}' | Measure-Object -Word
Write-Host "  Ready pods: $($ready.Words)" -ForegroundColor Green

# Port forwarding info
Write-Host "`n🚀 To access services, run in separate terminals:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  # API Gateway (Backend)" -ForegroundColor White
Write-Host "  kubectl port-forward -n $namespace svc/api-gateway 4000:4000" -ForegroundColor Green
Write-Host ""
Write-Host "  # Frontend (Next.js)" -ForegroundColor White
Write-Host "  kubectl port-forward -n $namespace svc/frontend 3000:3000" -ForegroundColor Green
Write-Host ""
Write-Host "  # Database (Optional)" -ForegroundColor White
Write-Host "  kubectl port-forward -n $namespace svc/postgres 5432:5432" -ForegroundColor Green
Write-Host ""
Write-Host "  # Redis (Optional)" -ForegroundColor White
Write-Host "  kubectl port-forward -n $namespace svc/redis 6379:6379" -ForegroundColor Green
Write-Host ""

# Useful commands
Write-Host "`n📚 Useful Commands:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  # Watch pods in real-time" -ForegroundColor White
Write-Host "  kubectl get pods -n $namespace -w" -ForegroundColor Gray
Write-Host ""
Write-Host "  # View logs" -ForegroundColor White
Write-Host "  kubectl logs -n $namespace -l app=auth-service -f" -ForegroundColor Gray
Write-Host ""
Write-Host "  # Get into pod (debug)" -ForegroundColor White
Write-Host "  kubectl exec -it {pod-name} -n $namespace -- bash" -ForegroundColor Gray
Write-Host ""
Write-Host "  # View all resources" -ForegroundColor White
Write-Host "  kubectl get all -n $namespace" -ForegroundColor Gray
Write-Host ""
Write-Host "  # View events" -ForegroundColor White
Write-Host "  kubectl get events -n $namespace --sort-by='.lastTimestamp'" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Ready to go! Open browser and navigate to http://localhost:3000" -ForegroundColor Green
Write-Host ""
