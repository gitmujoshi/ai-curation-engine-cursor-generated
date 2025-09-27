# ===============================================
# AI Curation Engine - Abstract Application Module
# ===============================================
# This module provides a cloud-agnostic interface
# for deploying the AI Curation Engine

terraform {
  required_providers {
    # This module doesn't specify providers - 
    # they're inherited from the calling configuration
  }
}

# Variables that are common across all cloud providers
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "ai-curation-engine"
}

variable "environment" {
  description = "Environment (dev, staging, production)"
  type        = string
  
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "app_config" {
  description = "Application configuration"
  type = object({
    instance_count      = number
    instance_size       = string
    database_size       = string
    enable_auto_scaling = bool
    enable_monitoring   = bool
    domain_name         = string
  })
  
  default = {
    instance_count      = 2
    instance_size       = "medium"
    database_size       = "small"
    enable_auto_scaling = true
    enable_monitoring   = true
    domain_name         = ""
  }
}

# Cloud-specific implementations would be called here
# This is where you'd have conditional logic based on cloud provider

locals {
  # Common tags/labels for all resources
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    Application = "ai-curation-engine"
    ManagedBy   = "terraform"
  }
  
  # Standardized naming convention
  name_prefix = "${var.project_name}-${var.environment}"
  
  # Application ports (same across all clouds)
  app_port    = 5001
  ollama_port = 11434
  http_port   = 80
  https_port  = 443
}

# Outputs that are consistent across all cloud providers
output "application_url" {
  description = "URL to access the application"
  value       = var.app_config.domain_name != "" ? "https://${var.app_config.domain_name}" : "http://[LOAD_BALANCER_IP]"
}

output "content_tester_url" {
  description = "URL to access the content tester"
  value       = "${var.app_config.domain_name != "" ? "https://${var.app_config.domain_name}" : "http://[LOAD_BALANCER_IP]"}/content-test"
}

output "api_base_url" {
  description = "Base URL for API endpoints"
  value       = "${var.app_config.domain_name != "" ? "https://${var.app_config.domain_name}" : "http://[LOAD_BALANCER_IP]"}/api"
}

output "deployment_info" {
  description = "Deployment information"
  value = {
    project_name = var.project_name
    environment  = var.environment
    app_ports    = {
      application = local.app_port
      ollama      = local.ollama_port
      http        = local.http_port
      https       = local.https_port
    }
    next_steps = [
      "1. Access Content Tester: ${var.app_config.domain_name != "" ? "https://${var.app_config.domain_name}" : "http://[LOAD_BALANCER_IP]"}/content-test",
      "2. Check health: ${var.app_config.domain_name != "" ? "https://${var.app_config.domain_name}" : "http://[LOAD_BALANCER_IP]"}/health",
      "3. Test classification API: curl -X POST [URL]/api/classify",
      "4. Switch strategies: curl -X POST [URL]/api/strategy"
    ]
  }
}
