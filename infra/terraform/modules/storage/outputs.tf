# ===============================================
# Storage Module Outputs
# ===============================================

output "model_bucket_name" {
  description = "Name of S3 bucket for models"
  value       = aws_s3_bucket.models.bucket
}

output "model_bucket_arn" {
  description = "ARN of S3 bucket for models"
  value       = aws_s3_bucket.models.arn
}

output "logs_bucket_name" {
  description = "Name of S3 bucket for logs"
  value       = aws_s3_bucket.logs.bucket
}

output "logs_bucket_arn" {
  description = "ARN of S3 bucket for logs"
  value       = aws_s3_bucket.logs.arn
}

output "backup_bucket_name" {
  description = "Name of S3 bucket for backups (production only)"
  value       = var.environment == "production" ? aws_s3_bucket.backups[0].bucket : null
}

output "backup_bucket_arn" {
  description = "ARN of S3 bucket for backups (production only)"
  value       = var.environment == "production" ? aws_s3_bucket.backups[0].arn : null
}
