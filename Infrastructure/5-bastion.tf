resource "aws_security_group" "bastion" {
  name   = "${var.project_name}-sg-bastion"
  vpc_id = module.vpc.vpc_id

  ingress {
    protocol    = "tcp"
    cidr_blocks = ["${chomp(data.http.myip.response_body)}/32"]
    from_port   = "22"
    to_port     = "22"
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

  egress {
    protocol        = "tcp"
    security_groups = [aws_security_group.rds.id]
    from_port       = "5432"
    to_port         = "5432"
  }

  lifecycle {
    ignore_changes = [
      ingress,
      egress
    ]
  }
}

data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
  filter {
    name   = "name"
    values = ["al2023-ami-2023*"]
  }
}

resource "aws_iam_role" "bastion" {
  name = "${var.project_name}-role-bastion"

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

resource "aws_iam_role_policy" "bastion" {
  name = "${var.project_name}-policy-bastion"
  role = aws_iam_role.bastion.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.db_credentials.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:StartSession"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "bastion" {
  name = "${var.project_name}-profile-bastion"
  role = aws_iam_role.bastion.name
}

resource "aws_instance" "bastion" {
  subnet_id            = module.vpc.public_subnets[0]
  security_groups      = [aws_security_group.bastion.id]
  ami                  = data.aws_ami.al2023.id
  iam_instance_profile = aws_iam_instance_profile.bastion.name
  instance_type        = "t3.micro"

  user_data = <<-EOF
#!/bin/bash
yum update -y
yum install -y postgresql15
EOF

  tags = {
    Name = "${var.project_name}-bastion"
  }

  lifecycle {
    ignore_changes = [security_groups]
  }
}

resource "aws_eip" "bastion" {
  instance = aws_instance.bastion.id
}

output "bastion_ip" {
  value = aws_eip.bastion.address
}
