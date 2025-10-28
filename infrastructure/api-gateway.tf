# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "clients" {
  name              = "/aws/lambda/${var.project_name}-clients"
  retention_in_days = 7

  tags = local.common_tags
}

resource "aws_cloudwatch_log_group" "cases" {
  name              = "/aws/lambda/${var.project_name}-cases"
  retention_in_days = 7

  tags = local.common_tags
}

resource "aws_cloudwatch_log_group" "hearings" {
  name              = "/aws/lambda/${var.project_name}-hearings"
  retention_in_days = 7

  tags = local.common_tags
}

resource "aws_cloudwatch_log_group" "users" {
  name              = "/aws/lambda/${var.project_name}-users"
  retention_in_days = 7

  tags = local.common_tags
}

resource "aws_cloudwatch_log_group" "search" {
  name              = "/aws/lambda/${var.project_name}-search"
  retention_in_days = 7

  tags = local.common_tags
}

resource "aws_cloudwatch_log_group" "notifications" {
  name              = "/aws/lambda/${var.project_name}-notifications"
  retention_in_days = 7

  tags = local.common_tags
}

resource "aws_cloudwatch_log_group" "admin_logs" {
  name              = "/aws/lambda/${var.project_name}-admin-logs"
  retention_in_days = 7

  tags = local.common_tags
}

# API Gateway
resource "aws_api_gateway_rest_api" "main" {
  name        = "${var.project_name}-api"
  description = "API for Law Firm Client Database"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = local.common_tags
}

# Cognito Authorizer
resource "aws_api_gateway_authorizer" "cognito" {
  name                   = "CognitoAuthorizer"
  rest_api_id           = aws_api_gateway_rest_api.main.id
  type                  = "COGNITO_USER_POOLS"
  provider_arns         = [aws_cognito_user_pool.main.arn]
  authorizer_credentials = aws_iam_role.api_gateway_auth.arn
}

# API Gateway IAM Role
resource "aws_iam_role" "api_gateway_auth" {
  name = "${var.project_name}-api-gateway-auth-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "api_gateway_auth" {
  name = "${var.project_name}-api-gateway-auth-policy"
  role = aws_iam_role.api_gateway_auth.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminGetUser",
          "cognito-idp:ListUsers"
        ]
        Resource = aws_cognito_user_pool.main.arn
      }
    ]
  })
}

# CORS Configuration
resource "aws_api_gateway_method" "options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_rest_api.main.root_resource_id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_rest_api.main.root_resource_id
  http_method = aws_api_gateway_method.options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_rest_api.main.root_resource_id
  http_method = aws_api_gateway_method.options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_rest_api.main.root_resource_id
  http_method = aws_api_gateway_method.options.http_method
  status_code = aws_api_gateway_method_response.options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "main" {
  depends_on = [
    aws_api_gateway_integration_response.options,
    aws_api_gateway_integration.clients_get,
    aws_api_gateway_integration.clients_post,
    aws_api_gateway_integration.client_get,
    aws_api_gateway_integration.client_put,
    aws_api_gateway_integration.client_delete,
    aws_api_gateway_integration.cases_get,
    aws_api_gateway_integration.cases_post,
    aws_api_gateway_integration.case_get,
    aws_api_gateway_integration.case_put,
    aws_api_gateway_integration.case_delete,
    aws_api_gateway_integration.hearings_get,
    aws_api_gateway_integration.hearings_post,
    aws_api_gateway_integration.hearing_get,
    aws_api_gateway_integration.hearing_put,
    aws_api_gateway_integration.hearing_delete,
    aws_api_gateway_integration.users_get,
    aws_api_gateway_integration.users_post,
    aws_api_gateway_integration.user_get,
    aws_api_gateway_integration.user_put,
    aws_api_gateway_integration.user_delete,
    aws_api_gateway_integration.search_post,
    aws_api_gateway_integration.notifications_get,
    aws_api_gateway_integration.admin_logs_get,
  ]

  rest_api_id = aws_api_gateway_rest_api.main.id

  lifecycle {
    create_before_destroy = true
  }
}

# API Gateway Stage
resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = var.environment

  tags = local.common_tags
}
