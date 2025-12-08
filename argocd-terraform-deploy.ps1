#!/usr/bin/env pwsh
<#
.SYNOPSIS
    ArgoCD + Terraform deployment automation script

.DESCRIPTION
    Automates Terraform and ArgoCD setup for TikTok Clone microservices

.PARAMETER Environment
    Target environment: dev, staging, prod (default: dev)

.PARAMETER Action
    Action to perform: init, plan, apply, destroy, argocd (default: plan)

.PARAMETER AutoApprove
    Skip approval prompt (default: false)

.EXAMPLE
    .\argocd-terraform-deploy.ps1 -Environment dev -Action apply -AutoApprove
    .\argocd-terraform-deploy.ps1 -Environment prod -Action plan
    .\argocd-terraform-deploy.ps1 -Environment dev -Action destroy
#>

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev",

    [Parameter(Mandatory = $false)]
    [ValidateSet("init", "plan", "apply", "destroy", "argocd", "status")]
    [string]$Action = "plan",

    [Parameter(Mandatory = $false)]
    [switch]$AutoApprove = $false
)

# Colors for output
$colors = @{
    Success = "Green"
    Error   = "Red"
    Warning = "Yellow"
    Info    = "Cyan"
}

function Write-Status {
    param(
        [string]$Message,
        [string]$Type = "Info"
    )
    $color = $colors[$Type]
    Write-Host "[$Type] $Message" -ForegroundColor $color
}

function Test-Prerequisites {
    Write-Status "Checking prerequisites..." "Info"

    $tools = @{
        "terraform" = "Terraform"
        "kubectl"   = "Kubernetes CLI"
        "helm"      = "Helm"
        "git"       = "Git"
    }

    foreach ($tool in $tools.GetEnumerator()) {
        $installed = $null -ne (Get-Command $tool.Name -ErrorAction SilentlyContinue)
        if ($installed) {
            $version = & $tool.Name --version
            Write-Status "$($tool.Value): ✓ Installed" "Success"
        }
        else {
            Write-Status "$($tool.Value): ✗ NOT FOUND" "Error"
            return $false
        }
    }

    return $true
}

function Initialize-Terraform {
    Write-Status "Initializing Terraform..." "Info"

    Push-Location terraform
    try {
        terraform init -input=false
        Write-Status "Terraform initialized successfully" "Success"
    }
    catch {
        Write-Status "Terraform init failed: $_" "Error"
        return $false
    }
    finally {
        Pop-Location
    }

    return $true
}

function Validate-Terraform {
    Write-Status "Validating Terraform configuration..." "Info"

    Push-Location terraform
    try {
        terraform validate -json | Out-Null
        Write-Status "Terraform validation passed" "Success"
    }
    catch {
        Write-Status "Terraform validation failed: $_" "Error"
        return $false
    }
    finally {
        Pop-Location
    }

    return $true
}

function Plan-Terraform {
    Write-Status "Planning Terraform changes for $Environment environment..." "Info"

    $varFile = "terraform/environments.tf"
    if (-not (Test-Path $varFile)) {
        Write-Status "Variables file not found: $varFile" "Error"
        return $false
    }

    Push-Location terraform
    try {
        $planFile = "$Environment.tfplan"
        terraform plan `
            -var="environment=$Environment" `
            -out=$planFile `
            -input=false

        Write-Status "Plan saved to $planFile" "Success"
        Write-Status "" "Info"
        Write-Status "Resources to be created/modified:" "Info"
        terraform show -json $planFile | ConvertFrom-Json |
            Select-Object -ExpandProperty resource_changes |
            ForEach-Object { Write-Host "  - $($_.type): $($_.address)" }
    }
    catch {
        Write-Status "Terraform plan failed: $_" "Error"
        return $false
    }
    finally {
        Pop-Location
    }

    return $true
}

function Apply-Terraform {
    param(
        [switch]$SkipApproval = $false
    )

    $planFile = "terraform/$Environment.tfplan"

    if (-not (Test-Path $planFile)) {
        Write-Status "Plan file not found. Running plan first..." "Warning"
        if (-not (Plan-Terraform)) {
            return $false
        }
    }

    if (-not $SkipApproval) {
        Write-Host ""
        $response = Read-Host "Apply changes to $Environment environment? (yes/no)"
        if ($response -ne "yes") {
            Write-Status "Apply cancelled" "Warning"
            return $true
        }
    }

    Write-Status "Applying Terraform configuration..." "Info"

    Push-Location terraform
    try {
        terraform apply `
            -input=false `
            -auto-approve `
            $planFile

        Write-Status "Terraform apply completed successfully" "Success"

        # Save outputs
        Write-Status "Saving outputs..." "Info"
        terraform output -json | Out-File "outputs-$Environment.json"
        Write-Status "Outputs saved to outputs-$Environment.json" "Success"
    }
    catch {
        Write-Status "Terraform apply failed: $_" "Error"
        return $false
    }
    finally {
        Pop-Location
    }

    return $true
}

function Destroy-Infrastructure {
    param(
        [switch]$SkipApproval = $false
    )

    Write-Status "" "Warning"
    Write-Status "⚠️  WARNING: This will destroy all infrastructure for $Environment" "Warning"
    Write-Status "" "Warning"

    if (-not $SkipApproval) {
        $response = Read-Host "Type '$Environment-destroy' to confirm: "
        if ($response -ne "$Environment-destroy") {
            Write-Status "Destroy cancelled" "Info"
            return $true
        }
    }

    Write-Status "Destroying infrastructure..." "Warning"

    Push-Location terraform
    try {
        terraform destroy `
            -var="environment=$Environment" `
            -auto-approve `
            -input=false

        Write-Status "Infrastructure destroyed successfully" "Success"
    }
    catch {
        Write-Status "Terraform destroy failed: $_" "Error"
        return $false
    }
    finally {
        Pop-Location
    }

    return $true
}

function Deploy-ArgoCD {
    Write-Status "Setting up ArgoCD..." "Info"

    # Create argocd namespace
    Write-Status "Creating ArgoCD namespace..." "Info"
    kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

    # Apply ArgoCD configurations
    Write-Status "Applying ArgoCD AppProject..." "Info"
    kubectl apply -f argocd/appproject.yaml

    Write-Status "Applying ArgoCD ConfigMaps..." "Info"
    kubectl apply -f argocd/argocd-cm.yaml
    kubectl apply -f argocd/argocd-rbac-cm.yaml

    Write-Status "Applying ArgoCD Application ($Environment)..." "Info"
    kubectl apply -f "argocd/application-$Environment.yaml"

    # Port forward instructions
    Write-Status "" "Success"
    Write-Status "✓ ArgoCD setup completed!" "Success"
    Write-Status "" "Info"
    Write-Status "Access ArgoCD dashboard:" "Info"
    Write-Status "  kubectl port-forward svc/argocd-server -n argocd 8080:443" "Info"
    Write-Status "  Then open: https://localhost:8080" "Info"
    Write-Status "" "Info"
    Write-Status "Get admin password:" "Info"
    Write-Status "  kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d" "Info"

    return $true
}

function Show-Status {
    Write-Status "Checking infrastructure status..." "Info"

    Write-Status "" "Info"
    Write-Status "Kubernetes Namespaces:" "Info"
    kubectl get ns | Select-Object -First 5

    Write-Status "" "Info"
    Write-Status "ArgoCD Status:" "Info"
    kubectl get pods -n argocd 2>/dev/null || Write-Status "  ArgoCD not deployed yet" "Warning"

    Write-Status "" "Info"
    Write-Status "TikTok Clone Services:" "Info"
    kubectl get pods -n tiktok-clone 2>/dev/null || Write-Status "  TikTok Clone not deployed yet" "Warning"

    Write-Status "" "Info"
    Write-Status "ArgoCD Applications:" "Info"
    kubectl get apps -n argocd 2>/dev/null || Write-Status "  Applications not found" "Warning"

    Write-Status "" "Info"
    Write-Status "Terraform State:" "Info"
    if (Test-Path "terraform/terraform.tfstate") {
        Write-Status "  State file exists ✓" "Success"
    }
    else {
        Write-Status "  No state file found" "Warning"
    }
}

# Main execution
function Main {
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║     ArgoCD + Terraform Deployment Script                  ║" -ForegroundColor Cyan
    Write-Host "║     TikTok Clone - NestJS Microservices                   ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""

    Write-Status "Environment: $Environment" "Info"
    Write-Status "Action: $Action" "Info"
    Write-Status ""

    # Test prerequisites
    if (-not (Test-Prerequisites)) {
        Write-Status "Prerequisites check failed. Please install missing tools." "Error"
        exit 1
    }

    # Execute action
    switch ($Action) {
        "init" {
            if (-not (Initialize-Terraform)) { exit 1 }
            if (-not (Validate-Terraform)) { exit 1 }
        }

        "plan" {
            if (-not (Initialize-Terraform)) { exit 1 }
            if (-not (Validate-Terraform)) { exit 1 }
            if (-not (Plan-Terraform)) { exit 1 }
        }

        "apply" {
            if (-not (Initialize-Terraform)) { exit 1 }
            if (-not (Validate-Terraform)) { exit 1 }
            if (-not (Plan-Terraform)) { exit 1 }
            if (-not (Apply-Terraform -SkipApproval:$AutoApprove)) { exit 1 }

            Write-Status "" "Success"
            Write-Status "Next step: Deploy ArgoCD with -Action argocd" "Info"
        }

        "argocd" {
            if (-not (Deploy-ArgoCD)) { exit 1 }
        }

        "destroy" {
            if (-not (Destroy-Infrastructure -SkipApproval:$AutoApprove)) { exit 1 }
        }

        "status" {
            Show-Status
        }
    }

    Write-Status "" "Success"
    Write-Status "✓ Completed successfully!" "Success"
    Write-Status "" "Info"
}

Main
