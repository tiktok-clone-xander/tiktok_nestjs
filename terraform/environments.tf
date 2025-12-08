# Environment-specific Terraform configurations

# Development Environment
locals {
  dev = {
    environment              = "dev"
    argocd_service_type      = "LoadBalancer"
    argocd_replicas          = 1
    argocd_admin_password    = "admin123"

    db_password              = "dev_password_123"
    postgresql_storage_size  = "5Gi"
    postgresql_memory        = "256Mi"
    postgresql_cpu           = "250m"

    redis_password           = "dev_redis_123"
    redis_storage_size       = "2Gi"
    redis_memory             = "128Mi"
    redis_cpu                = "100m"

    kafka_password           = "dev_kafka_123"
    kafka_storage_size       = "5Gi"

    deploy_with_helm         = false
  }

  # Staging Environment
  staging = {
    environment              = "staging"
    argocd_service_type      = "LoadBalancer"
    argocd_replicas          = 2
    argocd_admin_password    = "staging_argocd_pwd"

    db_password              = "staging_db_password"
    postgresql_storage_size  = "20Gi"
    postgresql_memory        = "512Mi"
    postgresql_cpu           = "500m"

    redis_password           = "staging_redis_password"
    redis_storage_size       = "10Gi"
    redis_memory             = "256Mi"
    redis_cpu                = "200m"

    kafka_password           = "staging_kafka_password"
    kafka_storage_size       = "20Gi"

    deploy_with_helm         = false
  }

  # Production Environment
  prod = {
    environment              = "prod"
    argocd_service_type      = "LoadBalancer"
    argocd_replicas          = 3
    argocd_admin_password    = "CHANGE_ME_IN_PROD"

    db_password              = "CHANGE_ME_IN_PROD"
    postgresql_storage_size  = "100Gi"
    postgresql_memory        = "1Gi"
    postgresql_cpu           = "1000m"

    redis_password           = "CHANGE_ME_IN_PROD"
    redis_storage_size       = "50Gi"
    redis_memory             = "512Mi"
    redis_cpu                = "500m"

    kafka_password           = "CHANGE_ME_IN_PROD"
    kafka_storage_size       = "100Gi"

    deploy_with_helm         = false
  }

  environment_config = var.environment == "staging" ? local.staging : (var.environment == "prod" ? local.prod : local.dev)
}
