# Lambda Execution Role
resource "aws_iam_role" "lambda_execution" {
  name = "${var.project_name}-lambda-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

# Lambda Execution Policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Lambda Custom Policy
resource "aws_iam_role_policy" "lambda_custom" {
  name = "${var.project_name}-lambda-custom-policy"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = aws_secretsmanager_secret.db_credentials.arn
      },
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminGetUser",
          "cognito-idp:ListUsers"
        ]
        Resource = aws_cognito_user_pool.main.arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Lambda Functions
resource "aws_lambda_function" "clients" {
  filename      = "../backend/clients.zip"
  function_name = "${var.project_name}-clients"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.11"
  timeout       = 300
  memory_size   = 512

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_SECRET_ARN    = aws_secretsmanager_secret.db_credentials.arn
      USER_POOL_ID     = aws_cognito_user_pool.main.id
      CLUSTER_ENDPOINT = aws_rds_cluster.main.endpoint
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_cloudwatch_log_group.clients
  ]

  tags = local.common_tags
}

resource "aws_lambda_function" "cases" {
  filename      = "../backend/cases.zip"
  function_name = "${var.project_name}-cases"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.11"
  timeout       = 300
  memory_size   = 512

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_SECRET_ARN    = aws_secretsmanager_secret.db_credentials.arn
      USER_POOL_ID     = aws_cognito_user_pool.main.id
      CLUSTER_ENDPOINT = aws_rds_cluster.main.endpoint
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_cloudwatch_log_group.cases
  ]

  tags = local.common_tags
}

resource "aws_lambda_function" "hearings" {
  filename      = "../backend/hearings.zip"
  function_name = "${var.project_name}-hearings"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.11"
  timeout       = 300
  memory_size   = 512

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_SECRET_ARN    = aws_secretsmanager_secret.db_credentials.arn
      USER_POOL_ID     = aws_cognito_user_pool.main.id
      CLUSTER_ENDPOINT = aws_rds_cluster.main.endpoint
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_cloudwatch_log_group.hearings
  ]

  tags = local.common_tags
}

resource "aws_lambda_function" "users" {
  filename      = "../backend/users.zip"
  function_name = "${var.project_name}-users"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.11"
  timeout       = 300
  memory_size   = 512

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_SECRET_ARN    = aws_secretsmanager_secret.db_credentials.arn
      USER_POOL_ID     = aws_cognito_user_pool.main.id
      CLUSTER_ENDPOINT = aws_rds_cluster.main.endpoint
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_cloudwatch_log_group.users
  ]

  tags = local.common_tags
}

resource "aws_lambda_function" "search" {
  filename      = "../backend/search.zip"
  function_name = "${var.project_name}-search"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.11"
  timeout       = 300
  memory_size   = 512

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_SECRET_ARN    = aws_secretsmanager_secret.db_credentials.arn
      USER_POOL_ID     = aws_cognito_user_pool.main.id
      CLUSTER_ENDPOINT = aws_rds_cluster.main.endpoint
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_cloudwatch_log_group.search
  ]

  tags = local.common_tags
}

resource "aws_lambda_function" "notifications" {
  filename      = "../backend/notifications.zip"
  function_name = "${var.project_name}-notifications"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.11"
  timeout       = 300
  memory_size   = 512

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_SECRET_ARN    = aws_secretsmanager_secret.db_credentials.arn
      USER_POOL_ID     = aws_cognito_user_pool.main.id
      CLUSTER_ENDPOINT = aws_rds_cluster.main.endpoint
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_cloudwatch_log_group.notifications
  ]

  tags = local.common_tags
}

resource "aws_lambda_function" "admin_logs" {
  filename      = "../backend/admin_logs.zip"
  function_name = "${var.project_name}-admin-logs"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.11"
  timeout       = 300
  memory_size   = 512

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_SECRET_ARN    = aws_secretsmanager_secret.db_credentials.arn
      USER_POOL_ID     = aws_cognito_user_pool.main.id
      CLUSTER_ENDPOINT = aws_rds_cluster.main.endpoint
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_cloudwatch_log_group.admin_logs
  ]

  tags = local.common_tags
}
