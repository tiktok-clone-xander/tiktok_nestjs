# TikTok Clone - Terraform Main Configuration
# This file defines the main infrastructure components

terraform {
  required_version = ">= 1.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.10"
    }
  }

  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "kubernetes" {
  config_path = var.kubeconfig_path
  ctx         = var.kube_context
}

provider "helm" {
  kubernetes {
    config_path = var.kubeconfig_path
    ctx         = var.kube_context
  }
}

# Create namespace
resource "kubernetes_namespace" "tiktok_clone" {
  metadata {
    name = var.namespace
    labels = {
      environment = var.environment
      managed-by  = "terraform"
    }
  }

  depends_on = [var.namespace]
}

# Deploy ArgoCD
resource "helm_release" "argocd" {
  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  version    = var.argocd_version
  namespace  = "argocd"

  create_namespace = true

  values = [
    yamlencode({
      global = {
        domain = var.argocd_domain
      }
      configs = {
        secret = {
          argocdServerAdminPassword = base64encode(var.argocd_admin_password)
        }
      }
      server = {
        service = {
          type = var.argocd_service_type
        }
        ingress = {
          enabled = var.enable_ingress
        }
      }
      repoServer = {
        replicas = var.argocd_replicas
      }
    })
  ]

  depends_on = [kubernetes_namespace.tiktok_clone]
}

# Deploy ArgoCD AppProject for TikTok Clone
resource "kubernetes_manifest" "argocd_project" {
  manifest = {
    apiVersion = "argoproj.io/v1alpha1"
    kind       = "AppProject"
    metadata = {
      name      = "tiktok-clone"
      namespace = "argocd"
    }
    spec = {
      sourceRepos = ["*"]
      destinations = [
        {
          server    = "https://kubernetes.default.svc"
          namespace = var.namespace
        }
      ]
      clusterResourceWhitelist = [
        {
          group = "*"
          kind  = "*"
        }
      ]
    }
  }

  depends_on = [helm_release.argocd]
}

# Deploy ArgoCD Application
resource "kubernetes_manifest" "argocd_application" {
  manifest = {
    apiVersion = "argoproj.io/v1alpha1"
    kind       = "Application"
    metadata = {
      name      = "tiktok-clone"
      namespace = "argocd"
    }
    spec = {
      project = "tiktok-clone"
      source = {
        repoURL        = var.git_repo_url
        path           = "helm/tiktok-clone"
        targetRevision = var.git_branch
        helm = {
          values = file("${path.module}/../helm/tiktok-clone/values-${var.environment}.yaml")
        }
      }
      destination = {
        server    = "https://kubernetes.default.svc"
        namespace = var.namespace
      }
      syncPolicy = {
        automated = {
          prune       = true
          selfHeal    = true
          allowEmpty  = false
        }
        syncOptions = [
          "CreateNamespace=true"
        ]
        retry = {
          limit = 5
          backoff = {
            duration    = "5s"
            factor      = 2
            maxDuration = "3m"
          }
        }
      }
    }
  }

  depends_on = [kubernetes_manifest.argocd_project]
}

# Deploy PostgreSQL using Helm
resource "helm_release" "postgresql" {
  count      = var.deploy_postgresql ? 1 : 0
  name       = "postgresql"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "postgresql"
  version    = var.postgresql_version
  namespace  = var.namespace

  values = [
    yamlencode({
      auth = {
        username = var.db_username
        password = var.db_password
        database = var.db_name
      }
      primary = {
        persistence = {
          enabled = true
          size    = var.postgresql_storage_size
        }
        resources = {
          limits = {
            memory = var.postgresql_memory
            cpu    = var.postgresql_cpu
          }
          requests = {
            memory = var.postgresql_memory_request
            cpu    = var.postgresql_cpu_request
          }
        }
      }
    })
  ]

  depends_on = [kubernetes_namespace.tiktok_clone]
}

# Deploy Redis using Helm
resource "helm_release" "redis" {
  count      = var.deploy_redis ? 1 : 0
  name       = "redis"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "redis"
  version    = var.redis_version
  namespace  = var.namespace

  values = [
    yamlencode({
      auth = {
        enabled  = true
        password = var.redis_password
      }
      master = {
        persistence = {
          enabled = true
          size    = var.redis_storage_size
        }
        resources = {
          limits = {
            memory = var.redis_memory
            cpu    = var.redis_cpu
          }
          requests = {
            memory = var.redis_memory_request
            cpu    = var.redis_cpu_request
          }
        }
      }
    })
  ]

  depends_on = [kubernetes_namespace.tiktok_clone]
}

# Deploy Kafka using Helm
resource "helm_release" "kafka" {
  count      = var.deploy_kafka ? 1 : 0
  name       = "kafka"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "kafka"
  version    = var.kafka_version
  namespace  = var.namespace

  values = [
    yamlencode({
      auth = {
        clientProtocol = "SASL_PLAINTEXT"
        sasl = {
          mechanism = "PLAIN"
          username  = var.kafka_username
          password  = var.kafka_password
        }
      }
      broker = {
        persistence = {
          enabled = true
          size    = var.kafka_storage_size
        }
      }
    })
  ]

  depends_on = [kubernetes_namespace.tiktok_clone]
}

# Deploy Tiktok Clone via Helm (optional - can use ArgoCD instead)
resource "helm_release" "tiktok_clone" {
  count      = var.deploy_with_helm ? 1 : 0
  name       = "tiktok-clone"
  chart      = "${path.module}/../helm/tiktok-clone"
  namespace  = var.namespace

  values = [
    file("${path.module}/../helm/tiktok-clone/values-${var.environment}.yaml")
  ]

  depends_on = [
    kubernetes_namespace.tiktok_clone,
    helm_release.postgresql,
    helm_release.redis,
    helm_release.kafka
  ]
}

# Output values
output "argocd_password" {
  value       = var.argocd_admin_password
  sensitive   = true
  description = "ArgoCD admin password"
}

output "argocd_server" {
  value       = helm_release.argocd.status[0].notes
  description = "ArgoCD server access information"
}

output "namespace" {
  value       = kubernetes_namespace.tiktok_clone.metadata[0].name
  description = "Kubernetes namespace for TikTok Clone"
}

output "postgresql_password" {
  value       = var.db_password
  sensitive   = true
  description = "PostgreSQL password"
}

output "redis_password" {
  value       = var.redis_password
  sensitive   = true
  description = "Redis password"
}
