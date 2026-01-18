# EKS Cluster Configuration
# Using AWS EKS Module with SPOT instances for cost optimization

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.2"

  cluster_name    = var.cluster_name
  cluster_version = var.cluster_version

  # Networking
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # Cluster access
  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  # OIDC Provider for IAM Roles for Service Accounts (IRSA)
  enable_irsa = true

  # Cluster addons
  cluster_addons = {
    coredns = {
      most_recent = true
      configuration_values = jsonencode({
        computeType = "Fargate"
        resources = {
          limits = {
            cpu    = "0.25"
            memory = "256M"
          }
          requests = {
            cpu    = "0.25"
            memory = "256M"
          }
        }
      })
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent              = true
      before_compute           = true
      service_account_role_arn = module.vpc_cni_irsa.iam_role_arn
      configuration_values = jsonencode({
        env = {
          ENABLE_PREFIX_DELEGATION = "true"
          WARM_PREFIX_TARGET       = "1"
        }
      })
    }
    aws-ebs-csi-driver = {
      most_recent              = true
      service_account_role_arn = module.ebs_csi_irsa.iam_role_arn
    }
  }

  # EKS Managed Node Groups
  eks_managed_node_groups = {
    for name, config in var.node_groups : name => {
      name = "${var.project_name}-${name}"

      instance_types = config.instance_types
      capacity_type  = config.capacity_type

      min_size     = config.min_size
      max_size     = config.max_size
      desired_size = config.desired_size

      disk_size = config.disk_size

      labels = config.labels

      # Use spot instance interruption handler
      create_launch_template = true
      launch_template_name   = "${var.project_name}-${name}-lt"

      # Enable node termination handler for spot
      enable_bootstrap_user_data = true

      tags = {
        "k8s.io/cluster-autoscaler/enabled"             = "true"
        "k8s.io/cluster-autoscaler/${var.cluster_name}" = "owned"
      }
    }
  }

  # Cluster security group rules
  cluster_security_group_additional_rules = {
    ingress_nodes_ephemeral_ports_tcp = {
      description                = "Nodes on ephemeral ports"
      protocol                   = "tcp"
      from_port                  = 1025
      to_port                    = 65535
      type                       = "ingress"
      source_node_security_group = true
    }
  }

  # Node security group rules
  node_security_group_additional_rules = {
    ingress_self_all = {
      description = "Node to node all ports/protocols"
      protocol    = "-1"
      from_port   = 0
      to_port     = 0
      type        = "ingress"
      self        = true
    }
  }

  # Fargate profiles (optional - for serverless pods)
  # fargate_profiles = {
  #   default = {
  #     name = "default"
  #     selectors = [
  #       {
  #         namespace = "kube-system"
  #         labels = {
  #           k8s-app = "kube-dns"
  #         }
  #       }
  #     ]
  #   }
  # }

  # Access entries for admin
  enable_cluster_creator_admin_permissions = true

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# IAM Role for VPC CNI
module "vpc_cni_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.33"

  role_name             = "${var.project_name}-vpc-cni-irsa"
  attach_vpc_cni_policy = true
  vpc_cni_enable_ipv4   = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:aws-node"]
    }
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# IAM Role for EBS CSI Driver
module "ebs_csi_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.33"

  role_name             = "${var.project_name}-ebs-csi-irsa"
  attach_ebs_csi_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:ebs-csi-controller-sa"]
    }
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Cluster Autoscaler IAM Role
module "cluster_autoscaler_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.33"

  role_name                        = "${var.project_name}-cluster-autoscaler"
  attach_cluster_autoscaler_policy = true
  cluster_autoscaler_cluster_names = [module.eks.cluster_name]

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:cluster-autoscaler"]
    }
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# AWS Load Balancer Controller IAM Role
module "aws_lb_controller_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.33"

  role_name                              = "${var.project_name}-aws-lb-controller"
  attach_load_balancer_controller_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:aws-load-balancer-controller"]
    }
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}
