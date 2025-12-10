# CI/CD Setup Guide

## Overview

This project uses GitHub Actions for automated testing and deployment with AWS infrastructure.

## Workflow Structure

```
.github/workflows/
├── test.yml                # Run tests on all PRs
├── deploy-staging.yml      # Auto-deploy develop branch
└── deploy-production.yml   # Auto-deploy main branch
```

## Prerequisites

### 1. AWS Infrastructure Setup

Deploy the Terraform infrastructure first:

```bash
cd Infrastructure
terraform init
terraform apply
```

Note the outputs:
- `github_actions_role_arn` - IAM role for GitHub Actions
- `deployment_bucket` - S3 bucket for deployment artifacts

### 2. GitHub Repository Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

**Required Secrets:**
- `AWS_ROLE_ARN_STAGING` - IAM role ARN for staging deployments
- `AWS_ROLE_ARN_PRODUCTION` - IAM role ARN for production deployments
- `DEPLOYMENT_BUCKET` - S3 bucket name for deployment artifacts

**How to add secrets:**
```bash
# Get the role ARN from Terraform
cd Infrastructure
terraform output github_actions_role_arn
terraform output deployment_bucket
```

Then add to GitHub:
1. Go to repository Settings
2. Navigate to Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret

### 3. Update GitHub Repository URL

Update the OIDC trust policy in `Infrastructure/11-cicd.tf`:

```hcl
"token.actions.githubusercontent.com:sub" = "repo:YOUR-GITHUB-USERNAME/Marcos-CaseVault:*"
```

Replace `YOUR-GITHUB-USERNAME` with your actual GitHub username.

Also update in `Infrastructure/6-lt.tf`:
```bash
git clone https://github.com/YOUR-GITHUB-USERNAME/Marcos-CaseVault.git .
```

### 4. Enable GitHub Actions

1. Go to repository Settings → Actions → General
2. Enable "Allow all actions and reusable workflows"
3. Set workflow permissions to "Read and write permissions"

## Deployment Flow

### Staging Deployment (Automatic)

```
Push to develop branch
    ↓
GitHub Actions triggers
    ↓
1. Run tests
2. Terraform apply (if infrastructure changed)
3. Create deployment package
4. Upload to S3
5. Trigger instance refresh (rolling update)
6. Wait for deployment completion
7. Run health checks
```

### Production Deployment (Automatic with Protection)

```
Push to main branch
    ↓
GitHub Actions triggers
    ↓
(Optional: Manual approval if configured)
    ↓
1. Run tests
2. Terraform apply
3. Create deployment package
4. Upload to S3
5. Trigger instance refresh
6. Wait for deployment
7. Health checks
8. Create GitHub release
    ↓
If failure: Automatic rollback
```

## Deployment Scripts

### trigger-deployment.sh
Starts AWS Auto Scaling Group instance refresh for rolling deployment.

### wait-for-deployment.sh
Monitors deployment progress and waits for completion (max 30 minutes).

### health-check.sh
Verifies the application is responding correctly after deployment.

### rollback.sh
Automatically rolls back to the previous successful deployment on failure.

## Manual Deployment

You can manually trigger deployments:

1. Go to Actions tab in GitHub
2. Select the workflow (Deploy to Staging/Production)
3. Click "Run workflow"
4. Select the branch
5. Click "Run workflow"

## Monitoring Deployments

### View Deployment Status

1. Go to Actions tab in GitHub
2. Click on the running workflow
3. View real-time logs

### Check AWS Resources

```bash
# Check Auto Scaling Group status
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names casevault-asg

# Check instance refresh status
aws autoscaling describe-instance-refreshes \
  --auto-scaling-group-name casevault-asg

# View deployment artifacts
aws s3 ls s3://casevault-deployment-artifacts/production/
```

## Rollback

### Automatic Rollback
If health checks fail, the workflow automatically rolls back to the previous deployment.

### Manual Rollback

```bash
# From your local machine
cd scripts
./rollback.sh casevault-asg
```

Or trigger a new deployment with a previous commit:
```bash
git revert HEAD
git push origin main
```

## Environment Configuration

### Staging Environment
- Branch: `develop`
- Auto-deploy: Yes
- Manual approval: No
- Rollback: Automatic

### Production Environment
- Branch: `main`
- Auto-deploy: Yes
- Manual approval: Optional (configure in GitHub)
- Rollback: Automatic
- Creates GitHub releases

## Troubleshooting

### Deployment Fails at Instance Refresh

Check Auto Scaling Group events:
```bash
aws autoscaling describe-scaling-activities \
  --auto-scaling-group-name casevault-asg \
  --max-records 10
```

### Health Check Fails

1. Check ALB target health:
```bash
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn>
```

2. SSH to instance and check logs:
```bash
ssh ec2-user@<instance-ip>
sudo journalctl -u gunicorn -f
tail -f /var/log/user-data.log
```

### Terraform Apply Fails

1. Check Terraform state lock
2. Review error in GitHub Actions logs
3. Manually run terraform plan locally

### Permission Errors

Verify IAM role has correct permissions:
```bash
aws iam get-role --role-name casevault-github-actions-role
aws iam list-role-policies --role-name casevault-github-actions-role
```

## Best Practices

1. **Always test in staging first** - Push to `develop` before `main`
2. **Use feature branches** - Create PRs for code review
3. **Monitor deployments** - Watch GitHub Actions logs
4. **Keep secrets secure** - Never commit secrets to repository
5. **Tag releases** - Production deployments auto-create tags
6. **Review rollbacks** - Investigate why rollback was needed

## Security Notes

- GitHub Actions uses OIDC (no long-lived credentials)
- IAM roles have least privilege permissions
- Secrets stored in AWS Secrets Manager
- Deployment artifacts encrypted in S3
- All traffic over HTTPS

## Cost Optimization

- Deployment artifacts auto-delete after 30 days
- Old versions deleted after 7 days
- Use spot instances for staging (optional)
- Monitor CloudWatch costs

## Next Steps

1. Configure GitHub environment protection rules
2. Add Slack/email notifications
3. Implement blue/green deployments
4. Add performance testing to pipeline
5. Set up monitoring dashboards
