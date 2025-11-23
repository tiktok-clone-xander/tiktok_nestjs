#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Quick helper script for common Docker operations
.EXAMPLE
    .\docker-helper.ps1 start
    .\docker-helper.ps1 stop
    .\docker-helper.ps1 restart
    .\docker-helper.ps1 logs
    .\docker-helper.ps1 clean
#>

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'restart', 'logs', 'clean', 'status', 'build')]
    [string]$Action = 'status',
    
    [string]$Service
)

function Write-Info {
    Write-Host "[INFO] $args" -ForegroundColor Cyan
}

function Write-Success {
    Write-Host "[OK] $args" -ForegroundColor Green
}

switch ($Action) {
    'start' {
        Write-Info "Starting all services..."
        docker compose up -d
    }
    'stop' {
        Write-Info "Stopping all services..."
        docker compose down
    }
    'restart' {
        Write-Info "Restarting services..."
        docker compose restart $Service
    }
    'logs' {
        if ($Service) {
            docker compose logs -f $Service
        } else {
            docker compose logs -f
        }
    }
    'clean' {
        Write-Info "Cleaning up (removing containers and volumes)..."
        docker compose down -v
        Write-Success "Cleanup complete"
    }
    'build' {
        Write-Info "Building and starting services..."
        docker compose up --build -d
    }
    'status' {
        Write-Info "Service status:"
        docker compose ps
    }
}
