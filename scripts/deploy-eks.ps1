# TikTok Clone - AWS EKS Deployment Script
# Quick deployment script for AWS EKS

param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "deploy",  # deploy, destroy, status, logs

    [Parameter(Mandatory=$false)]
    [string]$Region = "ap-southeast-1",

    [Parameter(Mandatory=$false)]
    [string]$ClusterName = "tiktok-clone-eks",

    [Parameter(Mandatory=$false)]
    [switch]$SkipTerraform,

    [Parameter(Mandatory=$false)]
    [switch]$AutoApprove
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TerraformDir = Join-Path $ScriptDir "..\terraform\aws-eks"
$HelmDir = Join-Path $ScriptDir "..\helm\tiktok-clone"

# Colors
function Write-Title { Write-Host "`n=== $args ===" -ForegroundColor Cyan }
function Write-Step { Write-Host ">> $args" -ForegroundColor Yellow }
function Write-Success { Write-Host "✓ $args" -ForegroundColor Green }
function Write-Error { Write-Host "✗ $args" -ForegroundColor Red }

# Check prerequisites
function Test-Prerequisites {
    Write-Title "Checking Prerequisites"

    $missing = @()

    if (-not (Get-Command "aws" -ErrorAction SilentlyContinue)) { $missing += "aws" }
    if (-not (Get-Command "terraform" -ErrorAction SilentlyContinue)) { $missing += "terraform" }
    if (-not (Get-Command "kubectl" -ErrorAction SilentlyContinue)) { $missing += "kubectl" }
    if (-not (Get-Command "helm" -ErrorAction SilentlyContinue)) { $missing += "helm" }

    if ($missing.Count -gt 0) {
        Write-Error "Missing required tools: $($missing -join ', ')"
        Write-Host @"

Install instructions:
  - AWS CLI: https://aws.amazon.com/cli/
  - Terraform: choco install terraform
  - kubectl: choco install kubernetes-cli
  - Helm: choco install kubernetes-helm
"@
        exit 1
    }

    # Check AWS credentials
    $awsId = aws sts get-caller-identity --query "Account" --output text 2>$null
    if (-not $awsId) {
        Write-Error "AWS credentials not configured. Run: aws configure"
        exit 1
    }
    Write-Success "AWS Account: $awsId"

    Write-Success "All prerequisites met"
}

# Deploy infrastructure
function Deploy-Infrastructure {
    Write-Title "Deploying AWS EKS Infrastructure"

    Push-Location $TerraformDir

    try {
        # Check if terraform.tfvars exists
        if (-not (Test-Path "terraform.tfvars")) {
            Write-Step "Creating terraform.tfvars from example..."
            Copy-Item "terraform.tfvars.example" "terraform.tfvars"
            Write-Host @"

⚠️  IMPORTANT: Please edit terraform.tfvars with your values:
    - db_password
    - redis_password
    - ghcr_token (GitHub PAT with read:packages scope)

Then run this script again.
"@ -ForegroundColor Yellow
            notepad terraform.tfvars
            exit 0
        }

        # Initialize Terraform
        Write-Step "Initializing Terraform..."
        terraform init

        # Plan
        Write-Step "Planning infrastructure..."
        terraform plan -out=tfplan

        # Apply
        if ($AutoApprove) {
            Write-Step "Applying infrastructure (auto-approved)..."
            terraform apply -auto-approve tfplan
        } else {
            Write-Step "Applying infrastructure..."
            terraform apply tfplan
        }

        Write-Success "Infrastructure deployed successfully!"

    } finally {
        Pop-Location
    }
}

# Configure kubectl
function Configure-Kubectl {
    Write-Title "Configuring kubectl"

    Write-Step "Updating kubeconfig..."
    aws eks update-kubeconfig --region $Region --name $ClusterName

    Write-Step "Testing connection..."
    kubectl get nodes

    Write-Success "kubectl configured"
}

# Show status
function Show-Status {
    Write-Title "Cluster Status"

    Write-Step "Nodes:"
    kubectl get nodes

    Write-Step "Pods:"
    kubectl get pods -n tiktok-clone-prod

    Write-Step "Services:"
    kubectl get svc -n tiktok-clone-prod

    Write-Step "Ingress (ALB URL):"
    kubectl get ingress -n tiktok-clone-prod

    Write-Step "HPA Status:"
    kubectl get hpa -n tiktok-clone-prod
}

# Show logs
function Show-Logs {
    param([string]$Service = "api-gateway")

    Write-Title "Logs for $Service"
    kubectl logs -f deployment/$Service -n tiktok-clone-prod --tail=100
}

# Destroy infrastructure
function Destroy-Infrastructure {
    Write-Title "Destroying AWS EKS Infrastructure"

    Write-Host @"

⚠️  WARNING: This will destroy ALL resources including:
    - EKS Cluster
    - VPC and networking
    - All data in databases

"@ -ForegroundColor Red

    if (-not $AutoApprove) {
        $confirm = Read-Host "Type 'yes' to confirm destruction"
        if ($confirm -ne "yes") {
            Write-Host "Aborted."
            exit 0
        }
    }

    Push-Location $TerraformDir

    try {
        Write-Step "Destroying infrastructure..."
        if ($AutoApprove) {
            terraform destroy -auto-approve
        } else {
            terraform destroy
        }

        Write-Success "Infrastructure destroyed"
    } finally {
        Pop-Location
    }
}

# Show cost estimate
function Show-CostEstimate {
    Write-Title "Estimated Monthly Cost (USD)"

    Write-Host @"

╔════════════════════════════════════════╗
║        AWS EKS Cost Breakdown          ║
╠════════════════════════════════════════╣
║ EKS Cluster              ~$72/month    ║
║ 2x t3.medium SPOT        ~$18/month    ║
║ NAT Gateway (1 AZ)       ~$32/month    ║
║ EBS Storage (35GB)       ~$3.50/month  ║
║ Data Transfer            ~$5-10/month  ║
╠════════════════════════════════════════╣
║ TOTAL ESTIMATE          ~$130-140/mo   ║
╠════════════════════════════════════════╣
║ Your Budget: $199                       ║
║ Buffer: ~$60 for spikes                ║
╚════════════════════════════════════════╝

💡 Cost Saving Tips:
  - Scale down nodes during off-hours
  - Use Reserved Instances for production
  - Enable EBS snapshot lifecycle policies
  - Monitor with AWS Cost Explorer

"@ -ForegroundColor Cyan
}

# Main
switch ($Action.ToLower()) {
    "deploy" {
        Test-Prerequisites
        Show-CostEstimate

        if (-not $SkipTerraform) {
            Deploy-Infrastructure
        }

        Configure-Kubectl
        Show-Status

        Write-Host @"

🚀 Deployment Complete!

Next steps:
1. Wait for pods to be ready: kubectl get pods -n tiktok-clone-prod -w
2. Get ALB URL: kubectl get ingress -n tiktok-clone-prod
3. Test API: curl http://<ALB_URL>/health

"@ -ForegroundColor Green
    }

    "destroy" {
        Destroy-Infrastructure
    }

    "status" {
        Configure-Kubectl
        Show-Status
    }

    "logs" {
        Show-Logs
    }

    "cost" {
        Show-CostEstimate
    }

    default {
        Write-Host @"
Usage: .\deploy-eks.ps1 -Action <action> [options]

Actions:
  deploy   - Deploy EKS cluster and application
  destroy  - Destroy all resources
  status   - Show cluster status
  logs     - Show application logs
  cost     - Show cost estimate

Options:
  -Region <region>      AWS region (default: ap-southeast-1)
  -ClusterName <name>   EKS cluster name (default: tiktok-clone-eks)
  -SkipTerraform        Skip Terraform deployment
  -AutoApprove          Auto-approve Terraform changes

Examples:
  .\deploy-eks.ps1 -Action deploy
  .\deploy-eks.ps1 -Action deploy -AutoApprove
  .\deploy-eks.ps1 -Action status
  .\deploy-eks.ps1 -Action destroy
"@
    }
}
