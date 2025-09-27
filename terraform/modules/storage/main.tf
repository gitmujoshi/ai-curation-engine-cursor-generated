# ===============================================
# Storage Module - S3, EBS, EFS
# ===============================================

# S3 Bucket for model storage
resource "aws_s3_bucket" "models" {
  bucket = "${var.project_name}-${var.environment}-models-${random_string.bucket_suffix.result}"
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

# S3 Bucket versioning
resource "aws_s3_bucket_versioning" "models" {
  bucket = aws_s3_bucket.models.id
  versioning_configuration {
    status = var.environment == "production" ? "Enabled" : "Suspended"
  }
}

# S3 Bucket encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "models" {
  bucket = aws_s3_bucket.models.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 Bucket public access block
resource "aws_s3_bucket_public_access_block" "models" {
  bucket = aws_s3_bucket.models.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket lifecycle configuration
resource "aws_s3_bucket_lifecycle_configuration" "models" {
  count  = var.environment == "production" ? 1 : 0
  bucket = aws_s3_bucket.models.id

  rule {
    id     = "model_lifecycle"
    status = "Enabled"

    expiration {
      days = 365
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# S3 Bucket for application logs (backup)
resource "aws_s3_bucket" "logs" {
  bucket = "${var.project_name}-${var.environment}-logs-${random_string.bucket_suffix.result}"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "logs" {
  bucket = aws_s3_bucket.logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket for application backups
resource "aws_s3_bucket" "backups" {
  count  = var.environment == "production" ? 1 : 0
  bucket = "${var.project_name}-${var.environment}-backups-${random_string.bucket_suffix.result}"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "backups" {
  count  = var.environment == "production" ? 1 : 0
  bucket = aws_s3_bucket.backups[0].id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "backups" {
  count  = var.environment == "production" ? 1 : 0
  bucket = aws_s3_bucket.backups[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
