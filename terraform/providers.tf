terraform {
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
