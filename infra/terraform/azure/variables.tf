# ===============================================
# AI Curation Engine - Azure Variables
# ===============================================

variable "azure_region" {
  description = "Azure region for deployment"
  type        = string
  default     = "East US"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production."
  }
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "ai-curation-engine"
}

variable "owner" {
  description = "Owner of the resources"
  type        = string
  default     = "ai-curation-team"
}

# Networking
variable "vnet_cidr" {
  description = "CIDR block for VNet"
  type        = string
  default     = "10.0.0.0/16"
}

# Compute
variable "vm_size" {
  description = "Azure VM size for application servers"
  type        = string
  default     = "Standard_D2s_v3"
  
  validation {
    condition = contains([
      "Standard_B2s", "Standard_B2ms", "Standard_D2s_v3", "Standard_D4s_v3",
      "Standard_E2s_v3", "Standard_E4s_v3", "Standard_F2s_v2", "Standard_F4s_v2"
    ], var.vm_size)
    error_message = "VM size must be a valid Azure VM size suitable for AI workloads."
  }
}

variable "vm_instances" {
  description = "Number of VM instances in scale set"
  type        = number
  default     = 2
}

variable "ssh_public_key" {
  description = "SSH public key for VM access"
  type        = string
}

# Database
variable "db_sku_name" {
  description = "PostgreSQL SKU name"
  type        = string
  default     = "B_Standard_B1ms"
  
  validation {
    condition = contains([
      "B_Standard_B1ms", "B_Standard_B2s", "GP_Standard_D2s_v3", "GP_Standard_D4s_v3",
      "MO_Standard_E2s_v3", "MO_Standard_E4s_v3"
    ], var.db_sku_name)
    error_message = "Database SKU must be a valid PostgreSQL Flexible Server SKU."
  }
}

variable "db_storage_mb" {
  description = "PostgreSQL storage in MB"
  type        = number
  default     = 32768
}

# Storage
variable "model_storage_size_gb" {
  description = "Size of data disk for model storage (GB)"
  type        = number
  default     = 128
}

# Domain and SSL
variable "domain_name" {
  description = "Domain name for the application (optional)"
  type        = string
  default     = ""
}

variable "enable_https" {
  description = "Enable HTTPS with Application Gateway"
  type        = bool
  default     = false
}

# Application Configuration
variable "app_config" {
  description = "Application configuration parameters"
  type = object({
    baml_log_level              = string
    boundary_telemetry_disabled = bool
    ollama_timeout_ms          = number
    enable_caching             = bool
    default_strategy           = string
  })
  default = {
    baml_log_level              = "ERROR"
    boundary_telemetry_disabled = true
    ollama_timeout_ms          = 60000
    enable_caching             = true
    default_strategy           = "hybrid"
  }
}

# Model Configuration
variable "ollama_models" {
  description = "List of Ollama models to download"
  type        = list(string)
  default     = ["llama3.2", "llama3.1"]
}

# Security
variable "allowed_ip_ranges" {
  description = "IP ranges allowed to access the application"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# Monitoring
variable "enable_monitoring" {
  description = "Enable Azure Monitor and Application Insights"
  type        = bool
  default     = true
}

# Backup
variable "backup_retention_days" {
  description = "Number of days to retain database backups"
  type        = number
  default     = 7
}

# Tags
variable "additional_tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
