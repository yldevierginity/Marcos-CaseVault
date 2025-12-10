output "rds_endpoint" {
  value       = aws_db_instance.postgres.address
  description = "PostgreSQL RDS endpoint"
}

output "db_secret_name" {
  value       = aws_secretsmanager_secret.db_credentials.name
  description = "Database credentials secret name"
}

output "django_secret_name" {
  value       = aws_secretsmanager_secret.django_secret.name
  description = "Django secret key secret name"
}

output "static_bucket" {
  value       = local.static_bucket_name
  description = "S3 bucket for static files"
}

output "alb_endpoint" {
  value       = "http://${aws_lb.web.dns_name}"
  description = "Application Load Balancer endpoint"
}

output "api_gateway_url" {
  value       = "${aws_apigatewayv2_stage.prod.invoke_url}/api"
  description = "API Gateway endpoint for backend"
}
