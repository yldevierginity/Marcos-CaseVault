resource "random_string" "bucket_suffix" {
  length  = 5
  upper   = false
  lower   = true
  numeric = true
  special = false
}

locals {
  static_bucket_name = "${var.project_name}-static-${random_string.bucket_suffix.result}"
}

resource "aws_s3_bucket" "static" {
  bucket = local.static_bucket_name

  tags = {
    Name        = local.static_bucket_name
    Environment = "production"
  }
}

resource "aws_s3_bucket_public_access_block" "static" {
  bucket = aws_s3_bucket.static.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "static" {
  bucket = aws_s3_bucket.static.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.static.arn}/*"
      }
    ]
  })
}

resource "aws_s3_bucket_cors_configuration" "static" {
  bucket = aws_s3_bucket.static.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

output "static_bucket_name" {
  value = local.static_bucket_name
}

output "static_bucket_arn" {
  value = aws_s3_bucket.static.arn
}
