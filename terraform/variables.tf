# Terraform Variables for TikTok Clone

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "namespace" {
  description = "Kubernetes namespace for TikTok Clone"
  type        = string
  default     = "tiktok-clone"
}

variable "kubeconfig_path" {
  description = "Path to kubeconfig file"
  type        = string
  default     = "~/.kube/config"
}

variable "kube_context" {
  description = "Kubernetes context to use"
  type        = string
  default     = "docker-desktop"
}

# ArgoCD Variables
variable "argocd_version" {
  description = "ArgoCD Helm chart version"
  type        = string
  default     = "5.27.1"
}

variable "argocd_admin_password" {
  description = "ArgoCD admin password"
  type        = string
  sensitive   = true
}

variable "argocd_domain" {
  description = "ArgoCD domain"
  type        = string
  default     = "argocd.localhost"
}

variable "argocd_service_type" {
  description = "ArgoCD service type (LoadBalancer, NodePort, ClusterIP)"
  type        = string
  default     = "LoadBalancer"
}

variable "argocd_replicas" {
  description = "Number of ArgoCD replicas"
  type        = number
  default     = 1
}

variable "enable_ingress" {
  description = "Enable Ingress for ArgoCD"
  type        = bool
  default     = false
}

# Git Configuration
variable "git_repo_url" {
  description = "Git repository URL for Helm charts"
  type        = string
  default     = "https://github.com/betuanminh22032003/tiktok_nestjs.git"
}

variable "git_branch" {
  description = "Git branch for ArgoCD"
  type        = string
  default     = "main"
}

# Database Variables
variable "deploy_postgresql" {
  description = "Deploy PostgreSQL"
  type        = bool
  default     = true
}

variable "postgresql_version" {
  description = "PostgreSQL chart version"
  type        = string
  default     = "12.1.2"
}

variable "db_username" {
  description = "PostgreSQL username"
  type        = string
  default     = "tiktok"
}

variable "db_password" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "tiktok_db"
}

variable "postgresql_storage_size" {
  description = "PostgreSQL storage size"
  type        = string
  default     = "10Gi"
}

variable "postgresql_memory" {
  description = "PostgreSQL memory limit"
  type        = string
  default     = "512Mi"
}

variable "postgresql_cpu" {
  description = "PostgreSQL CPU limit"
  type        = string
  default     = "500m"
}

variable "postgresql_memory_request" {
  description = "PostgreSQL memory request"
  type        = string
  default     = "256Mi"
}

variable "postgresql_cpu_request" {
  description = "PostgreSQL CPU request"
  type        = string
  default     = "250m"
}

# Redis Variables
variable "deploy_redis" {
  description = "Deploy Redis"
  type        = bool
  default     = true
}

variable "redis_version" {
  description = "Redis chart version"
  type        = string
  default     = "17.3.4"
}

variable "redis_password" {
  description = "Redis password"
  type        = string
  sensitive   = true
}

variable "redis_storage_size" {
  description = "Redis storage size"
  type        = string
  default     = "5Gi"
}

variable "redis_memory" {
  description = "Redis memory limit"
  type        = string
  default     = "256Mi"
}

variable "redis_cpu" {
  description = "Redis CPU limit"
  type        = string
  default     = "200m"
}

variable "redis_memory_request" {
  description = "Redis memory request"
  type        = string
  default     = "128Mi"
}

variable "redis_cpu_request" {
  description = "Redis CPU request"
  type        = string
  default     = "100m"
}

# Kafka Variables
variable "deploy_kafka" {
  description = "Deploy Kafka"
  type        = bool
  default     = true
}

variable "kafka_version" {
  description = "Kafka chart version"
  type        = string
  default     = "21.4.3"
}

variable "kafka_username" {
  description = "Kafka SASL username"
  type        = string
  default     = "tiktok"
}

variable "kafka_password" {
  description = "Kafka SASL password"
  type        = string
  sensitive   = true
}

variable "kafka_storage_size" {
  description = "Kafka storage size"
  type        = string
  default     = "10Gi"
}

# Application Deployment
variable "deploy_with_helm" {
  description = "Deploy application with Helm (false = use ArgoCD)"
  type        = bool
  default     = false
}
