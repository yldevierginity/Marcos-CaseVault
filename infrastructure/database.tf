# Security Groups
resource "aws_security_group" "lambda" {
  name_prefix = "${var.project_name}-lambda-sg"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-lambda-sg"
  })
}

resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-rds-sg"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-rds-sg"
  })
}

# Database Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-db-subnet-group"
  })
}

# Database Credentials Secret
resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${var.project_name}-db-credentials-test1"
  description             = "Database credentials for Law Firm application"
  recovery_window_in_days = 0

  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = "lawfirmadmin"
    password = random_password.db_password.result
  })
}

resource "random_password" "db_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# RDS Aurora Cluster
resource "aws_rds_cluster" "main" {
  cluster_identifier           = "${var.project_name}-aurora-cluster"
  engine                       = "aurora-postgresql"
  engine_version               = "15.13"
  database_name                = "lawfirmdb"
  master_username              = jsondecode(aws_secretsmanager_secret_version.db_credentials.secret_string)["username"]
  master_password              = jsondecode(aws_secretsmanager_secret_version.db_credentials.secret_string)["password"]
  backup_retention_period      = 7
  preferred_backup_window      = "07:00-09:00"
  preferred_maintenance_window = "sun:09:00-sun:11:00"
  skip_final_snapshot          = true
  deletion_protection          = false
  vpc_security_group_ids       = [aws_security_group.rds.id]
  db_subnet_group_name         = aws_db_subnet_group.main.name

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-aurora-cluster"
  })
}

resource "aws_rds_cluster_instance" "main" {
  count              = 2
  identifier         = "${var.project_name}-aurora-instance-${count.index + 1}"
  cluster_identifier = aws_rds_cluster.main.id
  instance_class     = "db.t3.medium"
  engine             = aws_rds_cluster.main.engine
  engine_version     = aws_rds_cluster.main.engine_version

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-aurora-instance-${count.index + 1}"
  })
}
