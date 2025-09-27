# ===============================================
# Security Module Outputs
# ===============================================

output "alb_security_group_id" {
  description = "Security group ID for Application Load Balancer"
  value       = aws_security_group.alb.id
}

output "app_security_group_id" {
  description = "Security group ID for application instances"
  value       = aws_security_group.app.id
}

output "db_security_group_id" {
  description = "Security group ID for database"
  value       = aws_security_group.db.id
}

output "ec2_instance_profile_name" {
  description = "Name of IAM instance profile for EC2"
  value       = aws_iam_instance_profile.ec2_profile.name
}

output "ec2_role_arn" {
  description = "ARN of IAM role for EC2"
  value       = aws_iam_role.ec2_role.arn
}

output "kms_key_id" {
  description = "KMS key ID"
  value       = aws_kms_key.main.key_id
}

output "kms_key_arn" {
  description = "KMS key ARN"
  value       = aws_kms_key.main.arn
}

output "waf_web_acl_arn" {
  description = "WAF Web ACL ARN (production only)"
  value       = var.environment == "production" ? aws_wafv2_web_acl.main[0].arn : null
}
