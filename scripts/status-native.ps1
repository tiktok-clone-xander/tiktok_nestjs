#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Check the status of TikTok Clone services
.DESCRIPTION
    This script checks the status of all infrastructure and application services
#>

# Color output functions
function Write-Status-Info {
    param([string]$Message)
    Write-Host "[STATUS] $Message" -ForegroundColor Cyan
}

function Write-Status-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Status-Warning {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Status-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

Write-Host @"

################################################################
#                    Service Status Check                     #
################################################################

"@ -ForegroundColor Magenta

# Check Docker
Write-Status-Info "Checking Docker services..."

$dockerRunning = $false
try {
    $null = docker ps 2>&1
    $dockerRunning = $true
    Write-Status-Success "Docker is running"
} catch {
    Write-Status-Error "Docker is not running"
}

if ($dockerRunning) {
    # Check infrastructure containers
    Write-Host "`nInfrastructure Containers:" -ForegroundColor Yellow
    $infraServices = @("tiktok_postgres", "tiktok_redis", "tiktok_kafka", "tiktok_zookeeper")

    foreach ($service in $infraServices) {
        $status = docker inspect --format='{{.State.Status}}' $service 2>$null
        $health = docker inspect --format='{{.State.Health.Status}}' $service 2>$null

        if ($status -eq "running") {
            if ($health -eq "healthy" -or $health -eq "<no value>") {
                Write-Status-Success "$service is running and healthy"
            } else {
                Write-Status-Warning "$service is running but health status: $health"
            }
        } elseif ($status) {
            Write-Status-Warning "$service status: $status"
        } else {
            Write-Status-Error "$service is not running"
        }
    }

    # Check management UIs
    Write-Host "`nManagement UIs:" -ForegroundColor Yellow
    $uiServices = @("tiktok_kafka_ui", "tiktok_redis_ui", "tiktok_pgadmin")

    foreach ($service in $uiServices) {
        $status = docker inspect --format='{{.State.Status}}' $service 2>$null

        if ($status -eq "running") {
            Write-Status-Success "$service is running"
        } elseif ($status) {
            Write-Status-Warning "$service status: $status"
        } else {
            Write-Status-Warning "$service is not running"
        }
    }
}

# Check Node.js services
Write-Host "`nNode.js Services:" -ForegroundColor Yellow

$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
$serviceProcesses = @()

if ($nodeProcesses) {
    foreach ($process in $nodeProcesses) {
        try {
            $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($process.Id)" -Property CommandLine).CommandLine
            if ($cmdLine -match "nest.*start:(\w+)") {
                $serviceType = $matches[1]
                $serviceProcesses += @{Process = $process; Service = $serviceType; CommandLine = $cmdLine}
            } elseif ($cmdLine -match "next.*dev") {
                $serviceProcesses += @{Process = $process; Service = "frontend"; CommandLine = $cmdLine}
            }
        } catch {
            # Ignore errors when getting command line
        }
    }
}

$expectedServices = @("auth", "video", "interaction", "notification", "gateway")

foreach ($service in $expectedServices) {
    $found = $serviceProcesses | Where-Object { $_.Service -eq $service }
    if ($found) {
        Write-Status-Success "$service service is running (PID: $($found.Process.Id))"
    } else {
        Write-Status-Error "$service service is not running"
    }
}

# Check frontend
$frontendProcess = $serviceProcesses | Where-Object { $_.Service -eq "frontend" }
if ($frontendProcess) {
    Write-Status-Success "Frontend is running (PID: $($frontendProcess.Process.Id))"
} else {
    Write-Status-Warning "Frontend is not running"
}

# Check ports
Write-Host "`nPort Status:" -ForegroundColor Yellow

$ports = @(
    @{Port = 5432; Service = "PostgreSQL"},
    @{Port = 6379; Service = "Redis"},
    @{Port = 9092; Service = "Kafka"},
    @{Port = 2181; Service = "Zookeeper"},
    @{Port = 9000; Service = "Kafka UI"},
    @{Port = 8081; Service = "Redis UI"},
    @{Port = 5050; Service = "pgAdmin"},
    @{Port = 5555; Service = "API Gateway"},
    @{Port = 4001; Service = "Auth Service"},
    @{Port = 4002; Service = "Video Service"},
    @{Port = 4003; Service = "Interaction Service"},
    @{Port = 4004; Service = "Notification Service"},
    @{Port = 3000; Service = "Frontend"}
)

foreach ($portInfo in $ports) {
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $portInfo.Port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Status-Success "$($portInfo.Service) (port $($portInfo.Port)) is accessible"
        } else {
            Write-Status-Error "$($portInfo.Service) (port $($portInfo.Port)) is not accessible"
        }
    } catch {
        Write-Status-Error "$($portInfo.Service) (port $($portInfo.Port)) - connection test failed"
    }
}

# Summary
Write-Host "`nQuick Links:" -ForegroundColor Yellow
Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  - API Gateway: http://localhost:5555" -ForegroundColor Cyan
Write-Host "  - Kafka UI: http://localhost:9000" -ForegroundColor Cyan
Write-Host "  - Redis UI: http://localhost:8081" -ForegroundColor Cyan
Write-Host "  - pgAdmin: http://localhost:5050" -ForegroundColor Cyan

Write-Host "`nManagement Commands:" -ForegroundColor Yellow
Write-Host "  - Start all: .\dev.ps1" -ForegroundColor Gray
Write-Host "  - Stop all: .\dev.ps1 stop" -ForegroundColor Gray
Write-Host "  - Infrastructure only: .\dev.ps1 infra" -ForegroundColor Gray
