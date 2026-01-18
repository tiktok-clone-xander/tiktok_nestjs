# Kubernetes Resources and Helm Charts Deployment

# Namespace for TikTok Clone
resource "kubernetes_namespace" "tiktok" {
  metadata {
    name = "${var.project_name}-${var.environment}"
    labels = {
      environment = var.environment
      project     = var.project_name
    }
  }

  depends_on = [module.eks]
}

# ==================== AWS Load Balancer Controller ====================
resource "helm_release" "aws_lb_controller" {
  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  version    = "1.6.2"
  namespace  = "kube-system"

  set {
    name  = "clusterName"
    value = module.eks.cluster_name
  }

  set {
    name  = "serviceAccount.create"
    value = "true"
  }

  set {
    name  = "serviceAccount.name"
    value = "aws-load-balancer-controller"
  }

  set {
    name  = "serviceAccount.annotations.eks\\.amazonaws\\.com/role-arn"
    value = module.aws_lb_controller_irsa.iam_role_arn
  }

  set {
    name  = "region"
    value = var.aws_region
  }

  set {
    name  = "vpcId"
    value = module.vpc.vpc_id
  }

  depends_on = [module.eks]
}

# ==================== Cluster Autoscaler ====================
resource "helm_release" "cluster_autoscaler" {
  name       = "cluster-autoscaler"
  repository = "https://kubernetes.github.io/autoscaler"
  chart      = "cluster-autoscaler"
  version    = "9.34.1"
  namespace  = "kube-system"

  set {
    name  = "autoDiscovery.clusterName"
    value = module.eks.cluster_name
  }

  set {
    name  = "awsRegion"
    value = var.aws_region
  }

  set {
    name  = "rbac.serviceAccount.name"
    value = "cluster-autoscaler"
  }

  set {
    name  = "rbac.serviceAccount.annotations.eks\\.amazonaws\\.com/role-arn"
    value = module.cluster_autoscaler_irsa.iam_role_arn
  }

  # Spot instance handling
  set {
    name  = "extraArgs.balance-similar-node-groups"
    value = "true"
  }

  set {
    name  = "extraArgs.skip-nodes-with-system-pods"
    value = "false"
  }

  depends_on = [module.eks]
}

# ==================== Metrics Server ====================
resource "helm_release" "metrics_server" {
  name       = "metrics-server"
  repository = "https://kubernetes-sigs.github.io/metrics-server/"
  chart      = "metrics-server"
  version    = "3.11.0"
  namespace  = "kube-system"

  set {
    name  = "args[0]"
    value = "--kubelet-preferred-address-types=InternalIP"
  }

  depends_on = [module.eks]
}

# ==================== In-Cluster PostgreSQL ====================
resource "helm_release" "postgresql" {
  count = var.use_rds ? 0 : 1

  name       = "postgresql"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "postgresql"
  version    = "13.4.4"
  namespace  = kubernetes_namespace.tiktok.metadata[0].name

  values = [
    yamlencode({
      auth = {
        username = var.db_username
        password = var.db_password
        database = var.db_name
      }
      primary = {
        persistence = {
          enabled      = true
          storageClass = "gp2"
          size         = "20Gi"
        }
        resources = {
          requests = {
            memory = "256Mi"
            cpu    = "250m"
          }
          limits = {
            memory = "512Mi"
            cpu    = "500m"
          }
        }
      }
      metrics = {
        enabled = true
      }
    })
  ]

  depends_on = [module.eks, kubernetes_namespace.tiktok]
}

# ==================== In-Cluster Redis ====================
resource "helm_release" "redis" {
  count = var.use_elasticache ? 0 : 1

  name       = "redis"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "redis"
  version    = "18.6.4"
  namespace  = kubernetes_namespace.tiktok.metadata[0].name

  values = [
    yamlencode({
      auth = {
        enabled  = true
        password = var.redis_password
      }
      master = {
        persistence = {
          enabled      = true
          storageClass = "gp2"
          size         = "5Gi"
        }
        resources = {
          requests = {
            memory = "128Mi"
            cpu    = "100m"
          }
          limits = {
            memory = "256Mi"
            cpu    = "250m"
          }
        }
      }
      replica = {
        replicaCount = 0 # Disable replicas to save cost
      }
      metrics = {
        enabled = true
      }
    })
  ]

  depends_on = [module.eks, kubernetes_namespace.tiktok]
}

# ==================== In-Cluster Kafka ====================
resource "helm_release" "kafka" {
  name       = "kafka"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "kafka"
  version    = "26.8.5"
  namespace  = kubernetes_namespace.tiktok.metadata[0].name

  values = [
    yamlencode({
      controller = {
        replicaCount = 1 # Single broker to save cost
        persistence = {
          enabled      = true
          storageClass = "gp2"
          size         = "10Gi"
        }
        resources = {
          requests = {
            memory = "512Mi"
            cpu    = "250m"
          }
          limits = {
            memory = "1Gi"
            cpu    = "500m"
          }
        }
      }
      listeners = {
        client = {
          protocol = "PLAINTEXT"
        }
      }
      metrics = {
        kafka = {
          enabled = true
        }
      }
    })
  ]

  depends_on = [module.eks, kubernetes_namespace.tiktok]
}

# ==================== TikTok Clone Application ====================
resource "helm_release" "tiktok_clone" {
  name      = "tiktok-clone"
  chart     = "${path.module}/../../helm/tiktok-clone"
  namespace = kubernetes_namespace.tiktok.metadata[0].name

  values = [
    file("${path.module}/../../helm/tiktok-clone/values.yaml"),
    yamlencode({
      global = {
        environment     = var.environment
        imagePullPolicy = "Always"
        imagePullSecrets = var.use_ghcr && var.ghcr_token != "" ? [{ name = "ghcr-secret" }] : []
      }

      # Database connection
      postgresql = {
        enabled = false # Using separate helm release
        host    = var.use_rds ? "" : "postgresql.${kubernetes_namespace.tiktok.metadata[0].name}.svc.cluster.local"
      }

      # Redis connection
      redis = {
        enabled = false # Using separate helm release
        host    = var.use_elasticache ? "" : "redis-master.${kubernetes_namespace.tiktok.metadata[0].name}.svc.cluster.local"
      }

      # Kafka connection
      kafka = {
        enabled = false # Using separate helm release
        brokers = "kafka.${kubernetes_namespace.tiktok.metadata[0].name}.svc.cluster.local:9092"
      }

      # Services with GHCR images
      services = {
        api_gateway = {
          image = {
            repository = "ghcr.io/${var.ghcr_username}/tiktok_nestjs/api-gateway"
            tag        = "latest"
          }
          replicas = 2
        }
        auth_service = {
          image = {
            repository = "ghcr.io/${var.ghcr_username}/tiktok_nestjs/auth-service"
            tag        = "latest"
          }
          replicas = 2
        }
        video_service = {
          image = {
            repository = "ghcr.io/${var.ghcr_username}/tiktok_nestjs/video-service"
            tag        = "latest"
          }
          replicas = 2
        }
        interaction_service = {
          image = {
            repository = "ghcr.io/${var.ghcr_username}/tiktok_nestjs/interaction-service"
            tag        = "latest"
          }
          replicas = 2
        }
        notification_service = {
          image = {
            repository = "ghcr.io/${var.ghcr_username}/tiktok_nestjs/notification-service"
            tag        = "latest"
          }
          replicas = 2
        }
      }

      # Ingress with AWS ALB
      ingress = {
        enabled = true
        annotations = {
          "kubernetes.io/ingress.class"               = "alb"
          "alb.ingress.kubernetes.io/scheme"          = "internet-facing"
          "alb.ingress.kubernetes.io/target-type"     = "ip"
          "alb.ingress.kubernetes.io/healthcheck-path" = "/health"
        }
      }
    })
  ]

  depends_on = [
    module.eks,
    kubernetes_namespace.tiktok,
    helm_release.postgresql,
    helm_release.redis,
    helm_release.kafka,
    helm_release.aws_lb_controller,
    kubernetes_secret.ghcr
  ]
}
