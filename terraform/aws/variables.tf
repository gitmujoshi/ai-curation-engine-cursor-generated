# ===============================================
# AI Curation Engine - AWS Variables
# ===============================================

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-west-2"
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
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# Compute
variable "instance_type" {
  description = "EC2 instance type for application servers"
  type        = string
  default     = "t3.large"
  
  validation {
    condition = contains([
      "t3.medium", "t3.large", "t3.xlarge", "t3.2xlarge",
      "c5.large", "c5.xlarge", "c5.2xlarge", "c5.4xlarge",
      "m5.large", "m5.xlarge", "m5.2xlarge", "m5.4xlarge",
      "r5.large", "r5.xlarge", "r5.2xlarge", "r5.4xlarge"
    ], var.instance_type)
    error_message = "Instance type must be a valid EC2 instance type suitable for AI workloads."
  }
}

variable "key_pair_name" {
  description = "Name of AWS Key Pair for EC2 access"
  type        = string
}

variable "min_instances" {
  description = "Minimum number of instances in auto scaling group"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum number of instances in auto scaling group"
  type        = number
  default     = 3
}

variable "desired_instances" {
  description = "Desired number of instances in auto scaling group"
  type        = number
  default     = 2
}

# Database
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
  
  validation {
    condition = contains([
      "db.t3.micro", "db.t3.small", "db.t3.medium", "db.t3.large",
      "db.r5.large", "db.r5.xlarge", "db.r5.2xlarge"
    ], var.db_instance_class)
    error_message = "Database instance class must be a valid RDS instance type."
  }
}

variable "db_allocated_storage" {
  description = "Initial allocated storage for RDS instance (GB)"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Maximum allocated storage for RDS instance (GB)"
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

variable "model_storage_size" {
  description = "Size of EBS volume for model storage (GB)"
  type        = number
  default     = 50
}

# Security
variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access the application"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "enable_https" {
  description = "Enable HTTPS with SSL certificate"
  type        = bool
  default     = true
}

# Monitoring
variable "enable_monitoring" {
  description = "Enable detailed monitoring and alerting"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 7
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
