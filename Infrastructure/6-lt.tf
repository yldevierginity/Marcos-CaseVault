resource "random_password" "django_secret" {
  length  = 50
  special = true
}

resource "aws_secretsmanager_secret" "django_secret" {
  name = "${var.project_name}-django-secret"
}

resource "aws_secretsmanager_secret_version" "django_secret" {
  secret_id = aws_secretsmanager_secret.django_secret.id
  secret_string = jsonencode({
    secret_key = random_password.django_secret.result
  })
}

resource "aws_security_group" "web" {
  name   = "${var.project_name}-sg-asg"
  vpc_id = module.vpc.vpc_id

  ingress {
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    from_port       = "8000"
    to_port         = "8000"
  }

  egress {
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "80"
    to_port     = "80"
  }

  egress {
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "443"
    to_port     = "443"
  }

  lifecycle {
    ignore_changes = [
      ingress,
      egress
    ]
  }
}

resource "aws_security_group_rule" "web_to_rds" {
  type                     = "egress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.web.id
  source_security_group_id = aws_security_group.rds.id
}

resource "aws_iam_role" "django_app" {
  name = "${var.project_name}-role-django"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "django_app" {
  name = "${var.project_name}-policy-django"
  role = aws_iam_role.django_app.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.static.arn,
          "${aws_s3_bucket.static.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.db_credentials.arn,
          aws_secretsmanager_secret.django_secret.arn
        ]
      }
    ]
  })
}

resource "aws_iam_instance_profile" "django_app" {
  name = "${var.project_name}-profile-django"
  role = aws_iam_role.django_app.name
}

resource "aws_launch_template" "web" {
  name_prefix   = "${var.project_name}-lt-"
  image_id      = data.aws_ami.al2023.id
  instance_type = "t3.micro"

  vpc_security_group_ids = [aws_security_group.web.id]

  user_data = base64encode(<<-EOF
#!/bin/bash
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "Starting Django setup..."

# Install dependencies
yum update -y
yum install -y python3.11 python3.11-pip git postgresql15 unzip

# Get secrets from Secrets Manager
DB_SECRET=$(aws secretsmanager get-secret-value --secret-id ${aws_secretsmanager_secret.db_credentials.name} --region ${var.region} --query SecretString --output text)
DJANGO_SECRET=$(aws secretsmanager get-secret-value --secret-id ${aws_secretsmanager_secret.django_secret.name} --region ${var.region} --query SecretString --output text)

# Parse secrets
DB_HOST=$(echo $DB_SECRET | python3 -c "import sys, json; print(json.load(sys.stdin)['host'])")
DB_USER=$(echo $DB_SECRET | python3 -c "import sys, json; print(json.load(sys.stdin)['username'])")
DB_PASS=$(echo $DB_SECRET | python3 -c "import sys, json; print(json.load(sys.stdin)['password'])")
DB_NAME=$(echo $DB_SECRET | python3 -c "import sys, json; print(json.load(sys.stdin)['dbname'])")
SECRET_KEY=$(echo $DJANGO_SECRET | python3 -c "import sys, json; print(json.load(sys.stdin)['secret_key'])")

# Create app directory
mkdir -p /opt/casevault
cd /opt/casevault

# Check for deployment package from CI/CD
DEPLOYMENT_BUCKET="${var.project_name}-deployment-artifacts"
LATEST_DEPLOYMENT=$(aws s3 ls s3://$DEPLOYMENT_BUCKET/ --recursive 2>/dev/null | grep "\.zip$" | sort | tail -n 1 | awk '{print $4}')

if [ -n "$LATEST_DEPLOYMENT" ]; then
  echo "📦 Downloading deployment from S3: $LATEST_DEPLOYMENT"
  aws s3 cp s3://$DEPLOYMENT_BUCKET/$LATEST_DEPLOYMENT deployment.zip
  unzip -q deployment.zip
else
  echo "📦 Cloning from Git repository"
  git clone https://github.com/yldevierginity/Marcos-CaseVault.git .
fi

cd backend

# Install Python dependencies
pip3.11 install --upgrade pip
pip3.11 install -r requirements.txt gunicorn

# Create environment file
cat > .env <<EOT
DEBUG=False
SECRET_KEY=$SECRET_KEY
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
DB_NAME=$DB_NAME
DB_PORT=5432
USE_S3=True
AWS_STORAGE_BUCKET_NAME=${local.static_bucket_name}
AWS_S3_REGION_NAME=${var.region}
ALLOWED_HOSTS=${aws_lb.web.dns_name},localhost
CORS_ALLOWED_ORIGINS=${aws_apigatewayv2_stage.prod.invoke_url}
EOT

# Run Django setup
python3.11 manage.py migrate --noinput
python3.11 manage.py collectstatic --noinput
python3.11 create_superuser.py || true

# Create systemd service for Gunicorn
cat > /etc/systemd/system/gunicorn.service <<EOT
[Unit]
Description=Gunicorn daemon for CaseVault Django
After=network.target

[Service]
User=root
Group=root
WorkingDirectory=/opt/casevault/backend
EnvironmentFile=/opt/casevault/backend/.env
ExecStart=/usr/local/bin/gunicorn --workers 3 --bind 0.0.0.0:8000 casevault.wsgi:application
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOT

# Start Gunicorn service
systemctl daemon-reload
systemctl enable gunicorn
systemctl start gunicorn

# Wait for service to be ready
sleep 10

echo "✅ Django setup completed successfully!"
EOF
  )

  iam_instance_profile {
    name = aws_iam_instance_profile.django_app.name
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.project_name}-django-app"
    }
  }
}
