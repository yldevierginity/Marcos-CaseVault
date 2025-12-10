# CI/CD Quick Start

## 🚀 Setup in 5 Minutes

### Step 1: Deploy Infrastructure
```bash
cd Infrastructure

# Update GitHub username in 11-cicd.tf and 6-lt.tf
# Replace YOUR-GITHUB-USERNAME with your actual username

terraform init
terraform apply
```

### Step 2: Get Terraform Outputs
```bash
terraform output github_actions_role_arn
terraform output deployment_bucket
```

### Step 3: Add GitHub Secrets

Go to: **Repository Settings → Secrets and variables → Actions**

Add these secrets:
- `AWS_ROLE_ARN_STAGING` = (role ARN from step 2)
- `AWS_ROLE_ARN_PRODUCTION` = (role ARN from step 2)
- `DEPLOYMENT_BUCKET` = (bucket name from step 2)

### Step 4: Push Code

```bash
git add .
git commit -m "feat: add CI/CD pipeline"
git push origin develop  # Deploys to staging
git push origin main     # Deploys to production
```

## ✅ That's It!

Your deployments are now fully automated:
- Push to `develop` → Auto-deploy to staging
- Push to `main` → Auto-deploy to production
- Failed deployments → Automatic rollback

## 📊 Monitor Deployments

Watch in real-time: **GitHub → Actions tab**

## 🔄 Deployment Flow

```
Code Push → Tests → Build → Deploy → Health Check → ✅ Success
                                              ↓
                                         ❌ Failure → Rollback
```

## 📖 Full Documentation

See [CICD_SETUP.md](./CICD_SETUP.md) for detailed documentation.
