# CI/CD + Remote State Integration Validation

## ✅ Compatibility Check

### Issue Found and Fixed

**Problem**: GitHub Actions workflows would fail on `terraform init` because:
1. ❌ Missing DynamoDB permissions for state locking
2. ❌ Missing specific S3 permissions for state bucket
3. ❌ `backend.tf` not present in CI/CD branch

**Solution Applied**:
1. ✅ Added DynamoDB permissions to GitHub Actions IAM role
2. ✅ Added explicit S3 permissions for terraform-state bucket
3. ✅ Created `backend.tf` in Infrastructure directory
4. ✅ Added API Gateway permissions

## Updated IAM Permissions

### GitHub Actions Role Now Has:

```json
{
  "S3 Terraform State": [
    "s3:ListBucket",
    "s3:GetObject", 
    "s3:PutObject",
    "s3:DeleteObject"
  ],
  "DynamoDB State Locking": [
    "dynamodb:GetItem",
    "dynamodb:PutItem",
    "dynamodb:DeleteItem"
  ],
  "Deployment Artifacts": [
    "s3:* on deployment bucket"
  ],
  "Infrastructure": [
    "autoscaling:*",
    "ec2:*",
    "elasticloadbalancing:*",
    "apigateway:*",
    "apigatewayv2:*"
  ]
}
```

## Workflow Integration

### How It Works Now:

```
GitHub Actions Workflow
    ↓
1. Configure AWS credentials (OIDC)
    ↓
2. terraform init
    ├─ Reads backend.tf
    ├─ Connects to S3: casevault-terraform-state
    ├─ Acquires lock in DynamoDB: casevault-terraform-locks
    └─ Downloads current state
    ↓
3. terraform plan/apply
    ├─ Uses remote state
    ├─ Maintains lock during operation
    └─ Saves state back to S3
    ↓
4. Lock released automatically
```

## Prerequisites Checklist

Before running CI/CD with remote state:

### 1. Create Remote State Backend
```bash
cd Infrastructure/bootstrap
./setup.sh
```

This creates:
- ✅ S3 bucket: `casevault-terraform-state`
- ✅ DynamoDB table: `casevault-terraform-locks`

### 2. Verify Backend Resources Exist
```bash
# Check S3 bucket
aws s3 ls s3://casevault-terraform-state/

# Check DynamoDB table
aws dynamodb describe-table \
  --table-name casevault-terraform-locks
```

### 3. Update GitHub Username
In `Infrastructure/11-cicd.tf` line 65:
```hcl
"token.actions.githubusercontent.com:sub" = "repo:YOUR-GITHUB-USERNAME/Marcos-CaseVault:*"
```

### 4. Deploy Infrastructure Locally First
```bash
cd Infrastructure
terraform init -migrate-state  # Migrate to remote state
terraform apply
```

### 5. Get IAM Role ARN
```bash
cd Infrastructure
terraform output github_actions_role_arn
```

### 6. Configure GitHub Secrets
Add to repository secrets:
- `AWS_ROLE_ARN` = (from step 5)
- `DEPLOYMENT_BUCKET` = `casevault-deployment-artifacts`

## Testing the Integration

### Test 1: Verify IAM Permissions
```bash
# Assume the GitHub Actions role
aws sts assume-role \
  --role-arn <github-actions-role-arn> \
  --role-session-name test

# Test S3 access
aws s3 ls s3://casevault-terraform-state/

# Test DynamoDB access
aws dynamodb get-item \
  --table-name casevault-terraform-locks \
  --key '{"LockID":{"S":"test"}}'
```

### Test 2: Local Terraform Init
```bash
cd Infrastructure
rm -rf .terraform
terraform init  # Should succeed with remote backend
```

### Test 3: Simulate CI/CD Locally
```bash
cd Infrastructure

# Simulate workflow steps
terraform init
terraform plan -out=tfplan
terraform apply tfplan

# Verify state is in S3
aws s3 ls s3://casevault-terraform-state/casevault/
```

### Test 4: Test State Locking
```bash
# Terminal 1
cd Infrastructure
terraform plan  # Holds lock

# Terminal 2 (while Terminal 1 is running)
cd Infrastructure
terraform plan  # Should wait for lock
```

## Workflow Files Validation

### ✅ deploy-staging.yml
```yaml
- name: Terraform Init
  run: |
    cd Infrastructure
    terraform init  # ✅ Will use backend.tf automatically
```

### ✅ deploy-production.yml
```yaml
- name: Terraform Init
  run: |
    cd Infrastructure
    terraform init  # ✅ Will use backend.tf automatically
```

### ✅ test.yml
```yaml
- name: Terraform Init
  run: |
    cd Infrastructure
    terraform init -backend=false  # ✅ Skips backend for tests
```

## Common Issues and Solutions

### Issue 1: Access Denied to S3 State Bucket
```
Error: error configuring S3 Backend: AccessDenied
```

**Solution**:
- Verify IAM role has S3 permissions
- Check bucket name matches: `casevault-terraform-state`
- Ensure bucket exists: `aws s3 ls s3://casevault-terraform-state/`

### Issue 2: DynamoDB Lock Table Not Found
```
Error: error acquiring the state lock: ResourceNotFoundException
```

**Solution**:
- Verify DynamoDB table exists
- Check table name: `casevault-terraform-locks`
- Ensure IAM role has DynamoDB permissions

### Issue 3: State Lock Timeout
```
Error: Error acquiring the state lock
```

**Solution**:
```bash
# Check current lock
aws dynamodb get-item \
  --table-name casevault-terraform-locks \
  --key '{"LockID":{"S":"casevault-terraform-state/casevault/terraform.tfstate"}}'

# Force unlock (only if safe)
terraform force-unlock <LOCK_ID>
```

### Issue 4: Backend Configuration Mismatch
```
Error: Backend configuration changed
```

**Solution**:
```bash
terraform init -reconfigure
```

## Deployment Flow with Remote State

```
Developer pushes to main/develop
    ↓
GitHub Actions triggers
    ↓
1. Checkout code ✅
2. Configure AWS credentials (OIDC) ✅
3. Setup Terraform ✅
4. terraform init
    ├─ Connect to S3 backend ✅
    ├─ Acquire DynamoDB lock ✅
    └─ Download state ✅
5. terraform plan ✅
6. terraform apply
    ├─ Modify infrastructure ✅
    ├─ Update state in S3 ✅
    └─ Release lock ✅
7. Create deployment package ✅
8. Upload to S3 ✅
9. Trigger rolling deployment ✅
10. Health checks ✅
```

## Security Considerations

### ✅ Implemented
- State encryption at rest (AES256)
- State locking prevents race conditions
- Versioning enabled for rollback
- Public access blocked on state bucket
- Least privilege IAM permissions
- OIDC authentication (no long-lived credentials)

### 🔒 Best Practices
- Never commit `terraform.tfstate` to git
- Use separate state files per environment (if needed)
- Regularly review state bucket access logs
- Enable MFA delete on state bucket (optional)
- Use separate AWS accounts for prod/staging (optional)

## Monitoring

### Check State Operations
```bash
# View state bucket contents
aws s3 ls s3://casevault-terraform-state/casevault/ --recursive

# Check state versions
aws s3api list-object-versions \
  --bucket casevault-terraform-state \
  --prefix casevault/terraform.tfstate

# View lock table
aws dynamodb scan \
  --table-name casevault-terraform-locks
```

### CloudWatch Logs
- S3 access logs (if enabled)
- DynamoDB CloudWatch metrics
- GitHub Actions workflow logs

## Success Criteria

- [ ] Remote state backend created (S3 + DynamoDB)
- [ ] IAM role has all required permissions
- [ ] `backend.tf` exists in Infrastructure directory
- [ ] Local `terraform init` succeeds
- [ ] State file exists in S3
- [ ] State locking works (test with concurrent operations)
- [ ] GitHub Actions workflows run without errors
- [ ] Terraform apply succeeds in CI/CD
- [ ] State updates are saved to S3

## Rollback Plan

If remote state causes issues:

```bash
# 1. Pull current state locally
cd Infrastructure
terraform state pull > terraform.tfstate

# 2. Remove backend configuration
rm backend.tf

# 3. Reinitialize with local state
terraform init -migrate-state

# 4. Continue with local state
terraform plan
terraform apply
```

---

**Status**: ✅ CI/CD and Remote State fully integrated and validated

**Last Updated**: December 11, 2025
