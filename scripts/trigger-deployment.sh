#!/bin/bash
set -e

ASG_NAME=$1
COMMIT_SHA=$2
ENVIRONMENT=$3

echo "🚀 Triggering deployment for ASG: $ASG_NAME"
echo "📦 Commit: $COMMIT_SHA"
echo "🌍 Environment: $ENVIRONMENT"

# Start instance refresh for rolling deployment
REFRESH_ID=$(aws autoscaling start-instance-refresh \
  --auto-scaling-group-name "$ASG_NAME" \
  --preferences '{
    "MinHealthyPercentage": 90,
    "InstanceWarmup": 300,
    "CheckpointPercentages": [50, 100],
    "CheckpointDelay": 300
  }' \
  --desired-configuration '{
    "LaunchTemplate": {
      "LaunchTemplateName": "'"$ASG_NAME"'-lt",
      "Version": "$Latest"
    }
  }' \
  --query 'InstanceRefreshId' \
  --output text)

echo "✅ Instance refresh started: $REFRESH_ID"
echo "REFRESH_ID=$REFRESH_ID" >> $GITHUB_OUTPUT

# Tag instances with deployment info
aws autoscaling create-or-update-tags \
  --tags \
    "ResourceId=$ASG_NAME,ResourceType=auto-scaling-group,Key=DeploymentCommit,Value=$COMMIT_SHA,PropagateAtLaunch=true" \
    "ResourceId=$ASG_NAME,ResourceType=auto-scaling-group,Key=DeploymentTime,Value=$(date -u +%Y-%m-%dT%H:%M:%SZ),PropagateAtLaunch=true" \
    "ResourceId=$ASG_NAME,ResourceType=auto-scaling-group,Key=Environment,Value=$ENVIRONMENT,PropagateAtLaunch=true"

echo "🏷️  Tagged ASG with deployment metadata"
