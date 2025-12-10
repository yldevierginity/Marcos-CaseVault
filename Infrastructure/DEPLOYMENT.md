# CaseVault Infrastructure Deployment Guide

## Overview
This infrastructure deploys a production-ready Django backend with:
- PostgreSQL 16.3 RDS database
- Django app on EC2 with Auto Scaling
- Internet-facing Application Load Balancer
- API Gateway for routing
- S3 for static files storage
- Secrets Manager for credentials

## Prerequisites
- AWS CLI configured
- Terraform installed
- Appropriate AWS permissions

## Deployment Steps

### 1. Initialize Terraform
```bash
cd Infrastructure
terraform init
```

### 2. Review and Apply Infrastructure
```bash
terraform plan
terraform apply
```

### 3. Retrieve Outputs
```bash
terraform output
```

Note the following outputs:
- `db_secret_name` - Database credentials in Secrets Manager
- `django_secret_name` - Django secret key in Secrets Manager
- `static_bucket` - S3 bucket name for static files
- `api_gateway_url` - API endpoint URL
- `alb_endpoint` - Load balancer endpoint

### 4. Configure Django Backend

#### Fetch Secrets and Create .env
```bash
cd ../backend
python get_secrets.py --region ap-southeast-1
```

#### Update .env with Additional Values
Add these to your `.env` file:
```bash
AWS_STORAGE_BUCKET_NAME=<static_bucket from terraform output>
ALLOWED_HOSTS=<alb_dns_name>,<api_gateway_domain>
CORS_ALLOWED_ORIGINS=https://your-cloudfront-domain.cloudfront.net
```

#### Deploy Django Application
```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files to S3
python manage.py collectstatic --noinput

# Create superuser
python create_superuser.py
```

### 5. Update Launch Template (Optional)
If you need to update the EC2 instances with your application code:
1. Upload your code to S3 or use a git repository
2. Update the user_data in `6-lt.tf` to clone your repository
3. Run `terraform apply` to update the launch template

## Architecture Components

### Database (RDS PostgreSQL)
- Engine: PostgreSQL 16.3
- Instance: db.t3.micro
- Storage: 20GB gp3
- Located in protected subnets
- Credentials stored in Secrets Manager

### Application Servers (EC2 Auto Scaling)
- Instance Type: t3.micro
- Min: 2, Max: 5, Desired: 2
- Django on port 8000
- Gunicorn WSGI server
- Auto-scaling based on CPU utilization

### Load Balancer (ALB)
- Internet-facing
- HTTP on port 80 (HTTPS can be added)
- Health checks on `/api/health/`
- Routes traffic to Django instances

### API Gateway
- HTTP API Gateway
- VPC Link to ALB
- CORS enabled
- Routes: `/api/{proxy+}` and `/api/health`

### Static Files (S3)
- Public read access
- CORS configured
- Django collectstatic integration

### Security
- RDS: Only accessible from web servers and bastion
- Web servers: Only accessible from ALB
- ALB: Internet-facing on ports 80/443
- Secrets: Stored in AWS Secrets Manager
- IAM: Least privilege roles for EC2 instances

## Security Groups

### RDS Security Group
- Inbound: Port 5432 from web servers and bastion only
- No public access

### Web Server Security Group
- Inbound: Port 8000 from ALB only
- Outbound: HTTPS (443), HTTP (80), PostgreSQL (5432)

### ALB Security Group
- Inbound: Ports 80, 443 from 0.0.0.0/0
- Outbound: All traffic

### Bastion Security Group
- Inbound: Port 22 from your IP only
- Outbound: HTTPS, HTTP, PostgreSQL

## Environment Variables

Required environment variables for Django:
```
DEBUG=False
SECRET_KEY=<from-secrets-manager>
DB_HOST=<rds-endpoint>
DB_NAME=casevault_db
DB_USER=casevault_admin
DB_PASSWORD=<from-secrets-manager>
DB_PORT=5432
USE_S3=True
AWS_STORAGE_BUCKET_NAME=<s3-bucket-name>
AWS_S3_REGION_NAME=ap-southeast-1
ALLOWED_HOSTS=<alb-dns>,<api-gateway-domain>
CORS_ALLOWED_ORIGINS=<cloudfront-url>
```

## Frontend Configuration

Update your frontend `.env` file:
```
VITE_API_BASE_URL=<api_gateway_url from terraform output>
```

## Monitoring

CloudWatch Logs are configured for:
- API Gateway access logs: `/aws/apigateway/casevault`
- VPC Flow Logs: Automatically created

## Cleanup

To destroy all resources:
```bash
cd Infrastructure
terraform destroy
```

**Warning:** This will delete all data including the database.

## Troubleshooting

### Database Connection Issues
1. Check security group rules
2. Verify credentials in Secrets Manager
3. Ensure EC2 instances have proper IAM role

### Static Files Not Loading
1. Verify S3 bucket name in environment variables
2. Check IAM permissions for S3 access
3. Run `python manage.py collectstatic` again

### Health Check Failing
1. Ensure Django is running on port 8000
2. Verify `/api/health/` endpoint exists
3. Check security group allows ALB to reach port 8000

## Next Steps

1. Configure HTTPS with ACM certificate
2. Set up CloudFront for frontend distribution
3. Configure custom domain names
4. Set up monitoring and alerting
5. Implement backup strategy for RDS
