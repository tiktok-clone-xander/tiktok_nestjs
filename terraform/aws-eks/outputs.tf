# Outputs for AWS EKS Deployment

# ==================== EKS Cluster ====================
output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "cluster_certificate_authority_data" {
  description = "EKS cluster CA certificate"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "cluster_oidc_provider_arn" {
  description = "OIDC provider ARN for IRSA"
  value       = module.eks.oidc_provider_arn
}

# ==================== VPC ====================
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "private_subnets" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnets
}

output "public_subnets" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnets
}

# ==================== ECR ====================
output "ecr_repository_urls" {
  description = "ECR repository URLs"
  value = var.create_ecr && !var.use_ghcr ? {
    for name, repo in aws_ecr_repository.services : name => repo.repository_url
  } : {}
}

# ==================== Kubernetes ====================
output "namespace" {
  description = "Kubernetes namespace"
  value       = kubernetes_namespace.tiktok.metadata[0].name
}

# ==================== Connection Commands ====================
output "configure_kubectl" {
  description = "Command to configure kubectl"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}

output "get_pods" {
  description = "Command to get pods"
  value       = "kubectl get pods -n ${kubernetes_namespace.tiktok.metadata[0].name}"
}

output "get_services" {
  description = "Command to get services"
  value       = "kubectl get svc -n ${kubernetes_namespace.tiktok.metadata[0].name}"
}

output "get_ingress" {
  description = "Command to get ingress"
  value       = "kubectl get ingress -n ${kubernetes_namespace.tiktok.metadata[0].name}"
}

# ==================== Cost Estimation ====================
output "estimated_monthly_cost" {
  description = "Estimated monthly cost breakdown (USD)"
  value = <<-EOT

    ========================================
    ESTIMATED MONTHLY COST (USD)
    ========================================

    EKS Cluster:              ~$72/month (fixed)

    Node Group (2x t3.medium SPOT):
      - On-demand: ~$60/month
      - With SPOT (~70% off): ~$18/month

    NAT Gateway:              ~$32/month (1 NAT)

    EBS Storage (35GB):       ~$3.50/month

    Data Transfer:            ~$5-10/month

    ----------------------------------------
    TOTAL ESTIMATE:           ~$130-140/month
    ----------------------------------------

    💡 TIPS TO SAVE MORE:
    - Use Fargate for small workloads
    - Reduce node count during off-hours
    - Use Reserved Instances for production
    - Clean up unused resources regularly

    ⚠️  Actual costs may vary based on usage

  EOT
}
