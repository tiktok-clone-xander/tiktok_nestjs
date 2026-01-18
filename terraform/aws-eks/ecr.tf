# ECR Repositories (Optional - using GHCR by default)

resource "aws_ecr_repository" "services" {
  for_each = var.create_ecr && !var.use_ghcr ? toset(var.ecr_repositories) : []

  name                 = "${var.project_name}/${each.value}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name        = each.value
    Environment = var.environment
    Project     = var.project_name
  }
}

# ECR Lifecycle Policy - Keep only last 10 images to save storage costs
resource "aws_ecr_lifecycle_policy" "services" {
  for_each = var.create_ecr && !var.use_ghcr ? toset(var.ecr_repositories) : []

  repository = aws_ecr_repository.services[each.key].name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# Kubernetes Secret for GHCR (if using GitHub Container Registry)
resource "kubernetes_secret" "ghcr" {
  count = var.use_ghcr && var.ghcr_token != "" ? 1 : 0

  metadata {
    name      = "ghcr-secret"
    namespace = kubernetes_namespace.tiktok.metadata[0].name
  }

  type = "kubernetes.io/dockerconfigjson"

  data = {
    ".dockerconfigjson" = jsonencode({
      auths = {
        "ghcr.io" = {
          auth = base64encode("${var.ghcr_username}:${var.ghcr_token}")
        }
      }
    })
  }

  depends_on = [module.eks, kubernetes_namespace.tiktok]
}
