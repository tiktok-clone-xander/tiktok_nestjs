#!/usr/bin/env pwsh
# Clean one-command setup and run (ASCII-only)
# Usage: .\run-clean.ps1

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  TikTok Clone - One Command Setup & Run     " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

Write-Host "[Step 1/4] Checking prerequisites..." -ForegroundColor Yellow

$allGood = $true

try { node -v; Write-Host "  [OK] node available" -ForegroundColor Green } catch { Write-Host "  [ERROR] node not found" -ForegroundColor Red; $allGood = $false }
try { npm -v; Write-Host "  [OK] npm available" -ForegroundColor Green } catch { Write-Host "  [ERROR] npm not found" -ForegroundColor Red; $allGood = $false }
try { docker info > $null 2>&1; Write-Host "  [OK] Docker is running" -ForegroundColor Green } catch { Write-Host "  [ERROR] Docker not running" -ForegroundColor Red; $allGood = $false }

if (-not $allGood) { Write-Host "Prerequisites missing; please install/start required tools." -ForegroundColor Red; exit 1 }

Write-Host "[Step 2/4] Installing dependencies (if needed)..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) { npm install; if ($LASTEXITCODE -ne 0) { Write-Host "npm install failed" -ForegroundColor Red; exit 1 } }
Write-Host "[OK] Dependencies present" -ForegroundColor Green

Write-Host "[Step 3/4] Ensuring environment..." -ForegroundColor Yellow
& .\scripts\ensure-env.ps1

Write-Host "[Step 4/4] Starting services via Docker Compose..." -ForegroundColor Yellow
docker compose up --build -d
if ($LASTEXITCODE -ne 0) { Write-Host "Docker compose failed. Run: docker compose logs -f" -ForegroundColor Red; exit 1 }

Write-Host ""
docker compose ps

Write-Host "Done. Access frontend at http://localhost:3000 and API at http://localhost:4000" -ForegroundColor Cyan
