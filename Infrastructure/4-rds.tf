resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "aws_secretsmanager_secret" "db_credentials" {
  name = "${var.project_name}-db-credentials"
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = "casevault_admin"
    password = random_password.db_password.result
    engine   = "postgres"
    host     = aws_db_instance.postgres.address
    port     = 5432
    dbname   = "casevault_db"
  })
}

resource "aws_db_subnet_group" "default" {
  name       = "${var.project_name}-sn-group"
  subnet_ids = [module.vpc.intra_subnets[0], module.vpc.intra_subnets[1]]

  tags = {
    Name = "${var.project_name}-sn-group"
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-sg-rds"
  vpc_id      = module.vpc.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg-rds"
  }
}

resource "aws_security_group_rule" "rds_from_web" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = aws_security_group.web.id
}

resource "aws_security_group_rule" "rds_from_bastion" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = aws_security_group.bastion.id
}

resource "aws_db_instance" "postgres" {
  identifier              = "${var.project_name}-db"
  allocated_storage       = 20
  storage_type            = "gp3"
  engine                  = "postgres"
  engine_version          = "16.11"
  instance_class          = "db.t3.micro"
  db_name                 = "casevault_db"
  username                = "casevault_admin"
  password                = random_password.db_password.result
  db_subnet_group_name    = aws_db_subnet_group.default.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  skip_final_snapshot     = true
  publicly_accessible     = false

  tags = {
    Name        = "${var.project_name}-db"
    Environment = "production"
  }
}

output "db_secret_arn" {
  value = aws_secretsmanager_secret.db_credentials.arn
}
