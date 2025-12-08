# Terraform outputs

output "kubernetes_namespace" {
  description = "Kubernetes namespace for TikTok Clone"
  value       = kubernetes_namespace.tiktok_clone.metadata[0].name
}

output "argocd_info" {
  description = "ArgoCD server information"
  value = {
    namespace = "argocd"
    release   = helm_release.argocd.status[0].values
  }
}

output "argocd_access_info" {
  description = "How to access ArgoCD"
  value = {
    service_type = var.argocd_service_type
    port_forward = var.argocd_service_type == "LoadBalancer" ? "kubectl port-forward svc/argocd-server 8080:443 -n argocd" : "N/A"
    login_user   = "admin"
    login_url    = "https://${var.argocd_domain}"
  }
}

output "application_info" {
  description = "TikTok Clone Application information"
  value = {
    name      = "tiktok-clone"
    namespace = var.namespace
    status    = "Synced by ArgoCD"
  }
}

output "infrastructure_status" {
  description = "Infrastructure deployment status"
  value = {
    postgresql = var.deploy_postgresql ? "Deployed" : "Not deployed"
    redis      = var.deploy_redis ? "Deployed" : "Not deployed"
    kafka      = var.deploy_kafka ? "Deployed" : "Not deployed"
  }
}

output "terraform_state" {
  description = "Location of Terraform state file"
  value       = "terraform.tfstate (local backend)"
}

output "next_steps" {
  description = "Next steps after Terraform deployment"
  value = [
    "1. Verify pods: kubectl get pods -n ${var.namespace}",
    "2. Check ArgoCD: kubectl get pods -n argocd",
    "3. Access ArgoCD: kubectl port-forward svc/argocd-server 8080:443 -n argocd",
    "4. View application sync status in ArgoCD dashboard",
    "5. Check Helm releases: helm list -n ${var.namespace}"
  ]
}
