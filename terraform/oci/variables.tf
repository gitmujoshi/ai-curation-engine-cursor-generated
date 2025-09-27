# ===============================================
# AI Curation Engine - OCI Variables
# ===============================================

# OCI Provider Configuration
variable "tenancy_ocid" {
  description = "OCID of the tenancy"
  type        = string
}

variable "user_ocid" {
  description = "OCID of the user"
  type        = string
}

variable "fingerprint" {
  description = "Fingerprint of the public key"
  type        = string
}

variable "private_key_path" {
  description = "Path to the private key file"
  type        = string
}

variable "compartment_id" {
  description = "OCID of the compartment"
  type        = string
}

variable "oci_region" {
  description = "OCI region for deployment"
  type        = string
  default     = "us-ashburn-1"
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
variable "vcn_cidr" {
  description = "CIDR block for VCN"
  type        = string
  default     = "10.0.0.0/16"
}

# Compute
variable "instance_shape" {
  description = "OCI instance shape for application servers"
  type        = string
  default     = "VM.Standard.E4.Flex"
  
  validation {
    condition = contains([
      "VM.Standard.E4.Flex", "VM.Standard.E3.Flex", "VM.Standard.A1.Flex",
      "VM.Standard2.1", "VM.Standard2.2", "VM.Standard2.4"
    ], var.instance_shape)
    error_message = "Instance shape must be a valid OCI compute shape suitable for AI workloads."
  }
}

variable "instance_ocpus" {
  description = "Number of OCPUs for flexible shapes"
  type        = number
  default     = 2
}

variable "instance_memory_gb" {
  description = "Memory in GB for flexible shapes"
  type        = number
  default     = 16
}

variable "instance_pool_size" {
  description = "Number of instances in the instance pool"
  type        = number
  default     = 2
}

variable "ssh_public_key" {
  description = "SSH public key for instance access"
  type        = string
}

# Database
variable "use_mysql" {
  description = "Use OCI MySQL Database Service (true) or local database (false)"
  type        = bool
  default     = true
}

variable "mysql_shape" {
  description = "MySQL Database System shape"
  type        = string
  default     = "MySQL.VM.Standard.E3.1.8GB"
  
  validation {
    condition = contains([
      "MySQL.VM.Standard.E3.1.8GB", "MySQL.VM.Standard.E3.1.16GB",
      "MySQL.VM.Standard.E3.2.32GB", "MySQL.VM.Standard.E3.4.64GB"
    ], var.mysql_shape)
    error_message = "MySQL shape must be a valid OCI MySQL Database System shape."
  }
}

variable "mysql_storage_gb" {
  description = "MySQL storage in GB"
  type        = number
  default     = 50
}

# Load Balancer
variable "load_balancer_shape" {
  description = "Load balancer shape"
  type        = string
  default     = "flexible"
  
  validation {
    condition     = contains(["flexible", "100Mbps", "400Mbps", "8000Mbps"], var.load_balancer_shape)
    error_message = "Load balancer shape must be one of: flexible, 100Mbps, 400Mbps, 8000Mbps."
  }
}

variable "load_balancer_min_bandwidth" {
  description = "Minimum bandwidth for flexible load balancer (Mbps)"
  type        = number
  default     = 10
}

variable "load_balancer_max_bandwidth" {
  description = "Maximum bandwidth for flexible load balancer (Mbps)"
  type        = number
  default     = 100
}

# Storage
variable "model_storage_size_gb" {
  description = "Size of block volume for model storage (GB)"
  type        = number
  default     = 100
}

# Domain and SSL
variable "domain_name" {
  description = "Domain name for the application (optional)"
  type        = string
  default     = ""
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
variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access the application"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# Monitoring
variable "enable_monitoring" {
  description = "Enable OCI Monitoring and Logging"
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
  description = "Additional freeform tags to apply to all resources"
  type        = map(string)
  default     = {}
}
