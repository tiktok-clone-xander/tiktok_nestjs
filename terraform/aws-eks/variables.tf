# Variables for AWS EKS Deployment
# Optimized for ~$199 budget

# ==================== AWS Configuration ====================
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1" # US East (N. Virginia) - default region
}

variable "aws_profile" {
  description = "AWS CLI profile"
  type        = string
  default     = "default"
}

# ==================== Project Configuration ====================
variable "project_name" {
  description = "Project name"
  type        = string
  default     = "tiktok-clone"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}

# ==================== VPC Configuration ====================
variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "private_subnets" {
  description = "Private subnet CIDRs"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "public_subnets" {
  description = "Public subnet CIDRs"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24"]
}

# ==================== EKS Configuration ====================
variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "tiktok-clone-eks"
}

variable "cluster_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.29"
}

# Node Groups - SPOT instances to save money!
variable "node_groups" {
  description = "EKS node groups configuration"
  type = map(object({
    instance_types = list(string)
    capacity_type  = string # ON_DEMAND or SPOT
    desired_size   = number
    min_size       = number
    max_size       = number
    disk_size      = number
    labels         = map(string)
  }))
  default = {
    # SPOT instances - ~70% cheaper than on-demand
    spot_general = {
      instance_types = ["t3.medium", "t3a.medium"] # 2 vCPU, 4GB RAM
      capacity_type  = "SPOT"
      desired_size   = 2
      min_size       = 1
      max_size       = 4
      disk_size      = 30
      labels = {
        "node-type" = "spot"
        "workload"  = "general"
      }
    }
    # Small on-demand for critical workloads (optional)
    # ondemand_critical = {
    #   instance_types = ["t3.small"]
    #   capacity_type  = "ON_DEMAND"
    #   desired_size   = 1
    #   min_size       = 1
    #   max_size       = 2
    #   disk_size      = 20
    #   labels = {
    #     "node-type" = "on-demand"
    #     "workload"  = "critical"
    #   }
    # }
  }
}

# ==================== Database Configuration ====================
# Using in-cluster PostgreSQL to save money (no RDS)
variable "use_rds" {
  description = "Use RDS instead of in-cluster PostgreSQL (more expensive)"
  type        = bool
  default     = false
}

variable "db_instance_class" {
  description = "RDS instance class (if use_rds = true)"
  type        = string
  default     = "db.t3.micro" # Free tier eligible
}

variable "db_allocated_storage" {
  description = "RDS storage size in GB"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "tiktok_clone"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "tiktok_admin"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# ==================== Redis Configuration ====================
# Using in-cluster Redis to save money (no ElastiCache)
variable "use_elasticache" {
  description = "Use ElastiCache instead of in-cluster Redis (more expensive)"
  type        = bool
  default     = false
}

variable "redis_node_type" {
  description = "ElastiCache node type (if use_elasticache = true)"
  type        = string
  default     = "cache.t3.micro" # ~$12/month
}

variable "redis_password" {
  description = "Redis password"
  type        = string
  sensitive   = true
}

# ==================== Container Registry ====================
variable "create_ecr" {
  description = "Create ECR repositories"
  type        = bool
  default     = true
}

variable "ecr_repositories" {
  description = "List of ECR repositories to create"
  type        = list(string)
  default = [
    "api-gateway",
    "auth-service",
    "video-service",
    "interaction-service",
    "notification-service"
  ]
}

# ==================== Domain & SSL ====================
variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = ""
}

variable "create_route53_zone" {
  description = "Create Route53 hosted zone"
  type        = bool
  default     = false
}

# ==================== Monitoring ====================
variable "enable_cloudwatch_logs" {
  description = "Enable CloudWatch logs for EKS"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7 # Shorter retention = lower cost
}

# ==================== GitHub Container Registry ====================
variable "use_ghcr" {
  description = "Use GitHub Container Registry instead of ECR"
  type        = bool
  default     = true # Your images are already on GHCR
}

variable "ghcr_username" {
  description = "GitHub Container Registry username"
  type        = string
  default     = "betuanminh22032003"
}

variable "ghcr_token" {
  description = "GitHub Container Registry token (PAT)"
  type        = string
  sensitive   = true
  default     = ""
}
