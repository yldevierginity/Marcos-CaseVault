#!/bin/bash

set -e

echo "=========================================="
echo "AWS Infrastructure Destroy Script"
echo "=========================================="
echo ""
echo "WARNING: This will destroy ALL AWS resources!"
echo "This includes:"
echo "  - VPC and networking"
echo "  - RDS database (data will be lost)"
echo "  - EC2 instances"
echo "  - S3 buckets (including static files)"
echo "  - Load balancers"
echo "  - Auto Scaling Groups"
echo "  - API Gateway"
echo "  - Secrets Manager secrets"
echo "  - IAM roles and policies"
echo "  - DynamoDB state lock table"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Destroy cancelled."
    exit 0
fi

echo ""
read -p "Type the project name 'casevault' to confirm: " project_confirm

if [ "$project_confirm" != "casevault" ]; then
    echo "Project name mismatch. Destroy cancelled."
    exit 0
fi

echo ""
echo "Starting destruction process..."
echo ""

# Navigate to Infrastructure directory
cd Infrastructure

# Step 1: Empty S3 buckets (required before deletion)
echo "Step 1: Emptying S3 buckets..."
STATIC_BUCKET=$(terraform output -raw static_bucket 2>/dev/null || echo "")
DEPLOYMENT_BUCKET=$(terraform output -raw deployment_bucket 2>/dev/null || echo "")

if [ -n "$STATIC_BUCKET" ]; then
    echo "  Emptying static bucket: $STATIC_BUCKET"
    aws s3 rm s3://$STATIC_BUCKET --recursive || true
fi

if [ -n "$DEPLOYMENT_BUCKET" ]; then
    echo "  Emptying deployment bucket: $DEPLOYMENT_BUCKET"
    aws s3 rm s3://$DEPLOYMENT_BUCKET --recursive || true
fi

# Step 2: Destroy Terraform resources
echo ""
echo "Step 2: Destroying Terraform resources..."
terraform destroy -auto-approve

# Step 3: Delete DynamoDB lock table
echo ""
echo "Step 3: Deleting DynamoDB state lock table..."
aws dynamodb delete-table \
    --table-name casevault-terraform-locks \
    --region ap-southeast-1 2>/dev/null || echo "  Table already deleted or doesn't exist"

# Step 4: Delete S3 state bucket
echo ""
echo "Step 4: Deleting Terraform state bucket..."
aws s3 rb s3://casevault-terraform-state --force --region ap-southeast-1 2>/dev/null || echo "  Bucket already deleted or doesn't exist"

echo ""
echo "=========================================="
echo "✅ Destruction complete!"
echo "=========================================="
echo ""
echo "All AWS resources have been destroyed."
echo "Your AWS account should now be clean."
