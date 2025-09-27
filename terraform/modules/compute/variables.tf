# ===============================================
# Compute Module Variables
# ===============================================

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
}

variable "ami_id" {
  description = "AMI ID for instances"
  type        = string
}

variable "key_pair_name" {
  description = "Name of AWS Key Pair"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "security_group_ids" {
  description = "List of security group IDs for instances"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "Security group ID for ALB"
  type        = string
}

variable "iam_instance_profile_name" {
  description = "IAM instance profile name"
  type        = string
  default     = ""
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 3
}

variable "desired_instances" {
  description = "Desired number of instances"
  type        = number
  default     = 2
}

variable "model_storage_size" {
  description = "Size of EBS volume for models (GB)"
  type        = number
  default     = 50
}

variable "ssl_certificate_arn" {
  description = "ARN of SSL certificate"
  type        = string
  default     = null
}

# Database connection parameters
variable "db_endpoint" {
  description = "Database endpoint"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_username" {
  description = "Database username"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "model_bucket_name" {
  description = "S3 bucket name for models"
  type        = string
}
