# ===============================================
# AI Curation Engine - AWS Outputs
# ===============================================

# Application URLs
output "application_url" {
  description = "URL to access the AI Curation Engine"
  value = var.domain_name != "" ? (
    var.enable_https ? 
      "https://${var.environment == "production" ? var.domain_name : "${var.environment}.${var.domain_name}"}" :
      "http://${var.environment == "production" ? var.domain_name : "${var.environment}.${var.domain_name}"}"
  ) : (
    var.enable_https ?
      "https://${module.compute.alb_dns_name}" :
      "http://${module.compute.alb_dns_name}"
  )
}

output "content_tester_url" {
  description = "URL to access the Content Tester interface"
  value = var.domain_name != "" ? (
    var.enable_https ? 
      "https://${var.environment == "production" ? var.domain_name : "${var.environment}.${var.domain_name}"}/content-test" :
      "http://${var.environment == "production" ? var.domain_name : "${var.environment}.${var.domain_name}"}/content-test"
  ) : (
    var.enable_https ?
      "https://${module.compute.alb_dns_name}/content-test" :
      "http://${module.compute.alb_dns_name}/content-test"
  )
}

output "health_check_url" {
  description = "URL for health check endpoint"
  value = var.domain_name != "" ? (
    var.enable_https ? 
      "https://${var.environment == "production" ? var.domain_name : "${var.environment}.${var.domain_name}"}/health" :
      "http://${var.environment == "production" ? var.domain_name : "${var.environment}.${var.domain_name}"}/health"
  ) : (
    var.enable_https ?
      "https://${module.compute.alb_dns_name}/health" :
      "http://${module.compute.alb_dns_name}/health"
  )
}

output "api_base_url" {
  description = "Base URL for API endpoints"
  value = var.domain_name != "" ? (
    var.enable_https ? 
      "https://${var.environment == "production" ? var.domain_name : "${var.environment}.${var.domain_name}"}/api" :
      "http://${var.environment == "production" ? var.domain_name : "${var.environment}.${var.domain_name}"}/api"
  ) : (
    var.enable_https ?
      "https://${module.compute.alb_dns_name}/api" :
      "http://${module.compute.alb_dns_name}/api"
  )
}

# Infrastructure Details
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.vpc.private_subnet_ids
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.compute.alb_dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer"
  value       = module.compute.alb_zone_id
}

# Database Information
output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "database_name" {
  description = "Database name"
  value       = aws_db_instance.main.db_name
}

output "database_username" {
  description = "Database username"
  value       = aws_db_instance.main.username
  sensitive   = true
}

# Storage Information
output "model_bucket_name" {
  description = "S3 bucket name for model storage"
  value       = module.storage.model_bucket_name
}

output "model_bucket_arn" {
  description = "S3 bucket ARN for model storage"
  value       = module.storage.model_bucket_arn
}

# Security Groups
output "app_security_group_id" {
  description = "Security group ID for application instances"
  value       = module.security.app_security_group_id
}

output "alb_security_group_id" {
  description = "Security group ID for Application Load Balancer"
  value       = module.security.alb_security_group_id
}

output "db_security_group_id" {
  description = "Security group ID for database"
  value       = module.security.db_security_group_id
}

# Auto Scaling Group
output "auto_scaling_group_name" {
  description = "Name of the Auto Scaling Group"
  value       = module.compute.auto_scaling_group_name
}

output "launch_template_id" {
  description = "ID of the Launch Template"
  value       = module.compute.launch_template_id
}

# CloudWatch
output "log_group_name" {
  description = "CloudWatch Log Group name"
  value       = aws_cloudwatch_log_group.app_logs.name
}

# DNS (if configured)
output "route53_zone_id" {
  description = "Route53 hosted zone ID"
  value       = var.domain_name != "" ? aws_route53_zone.main[0].zone_id : null
}

output "ssl_certificate_arn" {
  description = "ACM certificate ARN"
  value       = var.domain_name != "" ? aws_acm_certificate.main[0].arn : null
}

# Testing Commands
output "test_commands" {
  description = "Commands to test the deployment"
  value = {
    health_check = "curl -s ${var.domain_name != "" ? (var.enable_https ? "https://${var.environment == "production" ? var.domain_name : "${var.environment}.${var.domain_name}"}" : "http://${var.environment == "production" ? var.domain_name : "${var.environment}.${var.domain_name}"}") : (var.enable_https ? "https://${module.compute.alb_dns_name}" : "http://${module.compute.alb_dns_name}")}/health | jq"
    
    classify_content = "curl -X POST ${var.domain_name != "" ? (var.enable_https ? "https://${var.environment == "production" ? var.domain_name : "${var.environment}.${var.domain_name}"}" : "http://${var.environment == "production" ? var.domain_name : "${var.environment}.${var.domain_name}"}") : (var.enable_https ? "https://${module.compute.alb_dns_name}" : "http://${module.compute.alb_dns_name}")}/api/classify -H 'Content-Type: application/json' -d '{\"content\": \"Test educational content\", \"childId\": \"child_1\"}' | jq"
    
    switch_strategy = "curl -X POST ${var.domain_name != "" ? (var.enable_https ? "https://${var.environment == "production" ? var.domain_name : "${var.environment}.${var.domain_name}"}" : "http://${var.environment == "production" ? var.domain_name : "${var.environment}.${var.domain_name}"}") : (var.enable_https ? "https://${module.compute.alb_dns_name}" : "http://${module.compute.alb_dns_name}")}/api/strategy -H 'Content-Type: application/json' -d '{\"strategy\": \"multi_layer\"}' | jq"
  }
}

# Environment Information
output "deployment_info" {
  description = "Deployment information and next steps"
  value = {
    environment = var.environment
    region      = var.aws_region
    instance_type = var.instance_type
    database_class = var.db_instance_class
    
    next_steps = [
      "1. Access the Content Tester: ${var.domain_name != "" ? (var.enable_https ? "https://${var.environment == "production" ? var.domain_name : "${var.environment}.${var.domain_name}"}" : "http://${var.environment == "production" ? var.domain_name : "${var.environment}.${var.domain_name}"}") : (var.enable_https ? "https://${module.compute.alb_dns_name}" : "http://${module.compute.alb_dns_name}")}/content-test",
      "2. Check health status: ${var.domain_name != "" ? (var.enable_https ? "https://${var.environment == "production" ? var.domain_name : "${var.environment}.${var.domain_name}"}" : "http://${var.environment == "production" ? var.domain_name : "${var.environment}.${var.domain_name}"}") : (var.enable_https ? "https://${module.compute.alb_dns_name}" : "http://${module.compute.alb_dns_name}")}/health",
      "3. View CloudWatch logs: aws logs tail ${aws_cloudwatch_log_group.app_logs.name} --follow",
      "4. SSH to instances: aws ec2-instance-connect ssh --instance-id <instance-id>",
      "5. Monitor auto scaling: aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names ${module.compute.auto_scaling_group_name}"
    ]
  }
}
