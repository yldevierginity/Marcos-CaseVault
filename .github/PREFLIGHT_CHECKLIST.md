# CI/CD Pre-Flight Checklist

Complete these steps before running CI/CD pipelines.

## ✅ Prerequisites

### 1. Update GitHub Username
- [ ] Update `Infrastructure/11-cicd.tf` line 62:
  ```hcl
  "token.actions.githubusercontent.com:sub" = "repo:YOUR-GITHUB-USERNAME/Marcos-CaseVault:*"
  ```
- [ ] Update `Infrastructure/6-lt.tf` line 139:
  ```bash
  git clone https://github.com/YOUR-GITHUB-USERNAME/Marcos-CaseVault.git .
  ```

### 2. Deploy Infrastructure Locally First
```bash
cd Infrastructure
terraform init
terraform apply
```

### 3. Get Required Values
```bash
cd Infrastructure

# Get IAM role ARN
terraform output github_actions_role_arn

# Get deployment bucket
terraform output deployment_bucket

# Get ASG name (verify it exists)
terraform output asg_name
```

### 4. Configure GitHub Secrets

Go to: **Repository Settings → Secrets and variables → Actions**

Add these secrets:
- [ ] `AWS_ROLE_ARN` = (IAM role ARN from step 3)
- [ ] `DEPLOYMENT_BUCKET` = (bucket name from step 3)

### 5. Verify Terraform Outputs Work
```bash
cd Infrastructure

# All these should return values (not errors)
terraform output asg_name
terraform output api_gateway_url
terraform output static_bucket
terraform output alb_dns_name
```

### 6. Test Deployment Scripts Locally
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Test health check (should fail gracefully if no deployment)
./scripts/health-check.sh staging
```

### 7. Optional: Configure Terraform Backend

For team collaboration, set up remote state:

```bash
# Create S3 bucket
aws s3 mb s3://casevault-terraform-state --region ap-southeast-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket casevault-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-southeast-1

# Copy backend config
cp Infrastructure/backend.tf.example Infrastructure/backend.tf

# Edit backend.tf with your bucket name
# Then run:
cd Infrastructure
terraform init -migrate-state
```

### 8. Enable GitHub Actions

- [ ] Go to repository Settings → Actions → General
- [ ] Enable "Allow all actions and reusable workflows"
- [ ] Set workflow permissions to "Read and write permissions"
- [ ] Enable "Allow GitHub Actions to create and approve pull requests"

### 9. Test Workflows

Push to a test branch first:
```bash
git checkout -b test/cicd-validation
git push origin test/cicd-validation
```

Check GitHub Actions tab for any errors.

## 🔍 Validation Checks

### Verify Infrastructure
```bash
# Check ASG exists
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names casevault-asg

# Check deployment bucket exists
aws s3 ls s3://casevault-deployment-artifacts/

# Check IAM role exists
aws iam get-role --role-name casevault-github-actions-role
```

### Verify Permissions
```bash
# Test assuming the role (from GitHub Actions)
aws sts assume-role-with-web-identity \
  --role-arn <your-role-arn> \
  --role-session-name test \
  --web-identity-token <token>
```

## 🚨 Common Issues

### Issue: Terraform init fails
**Solution**: Check if backend.tf exists. For first run, use local state (no backend.tf).

### Issue: AWS credentials not working
**Solution**: 
- Verify IAM role ARN is correct in GitHub secrets
- Check trust policy in `11-cicd.tf` has correct GitHub username
- Ensure OIDC provider is created

### Issue: ASG not found
**Solution**: 
- Run `terraform apply` locally first
- Verify output `asg_name` returns a value
- Check ASG exists in AWS Console

### Issue: Deployment bucket access denied
**Solution**:
- Verify bucket name in GitHub secrets
- Check IAM role has S3 permissions
- Ensure bucket exists: `aws s3 ls s3://casevault-deployment-artifacts/`

### Issue: Health check fails
**Solution**:
- This is normal on first deployment
- Health check will pass after instances are running
- Check ALB target group health in AWS Console

## ✅ Ready to Deploy

Once all checks pass:

```bash
# Deploy to staging
git checkout develop
git push origin develop

# Watch deployment
# Go to GitHub → Actions tab

# Deploy to production
git checkout main
git merge develop
git push origin main
```

## 📊 Monitoring

### GitHub Actions
- Go to repository → Actions tab
- Click on running workflow
- View real-time logs

### AWS Console
- Auto Scaling Groups → casevault-asg
- EC2 → Load Balancers → casevault-alb
- S3 → casevault-deployment-artifacts
- CloudWatch → Log groups

### CLI Monitoring
```bash
# Watch instance refresh
aws autoscaling describe-instance-refreshes \
  --auto-scaling-group-name casevault-asg

# Check target health
aws elbv2 describe-target-health \
  --target-group-arn <your-tg-arn>

# View deployment artifacts
aws s3 ls s3://casevault-deployment-artifacts/production/ --recursive
```

## 🎯 Success Criteria

- [ ] GitHub Actions workflows run without errors
- [ ] Terraform apply succeeds
- [ ] Deployment package uploads to S3
- [ ] Instance refresh completes successfully
- [ ] Health checks pass
- [ ] Application is accessible via API Gateway URL
- [ ] No rollback triggered

---

**Last Updated**: December 10, 2025
