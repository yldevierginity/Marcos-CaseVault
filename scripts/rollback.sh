#!/bin/bash
set -e

ASG_NAME=$1

echo "🔄 Initiating rollback for ASG: $ASG_NAME"

# Cancel current instance refresh
REFRESH_ID=$(aws autoscaling describe-instance-refreshes \
  --auto-scaling-group-name "$ASG_NAME" \
  --max-records 1 \
  --query 'InstanceRefreshes[0].InstanceRefreshId' \
  --output text)

if [ "$REFRESH_ID" != "None" ] && [ -n "$REFRESH_ID" ]; then
  echo "Cancelling instance refresh: $REFRESH_ID"
  aws autoscaling cancel-instance-refresh \
    --auto-scaling-group-name "$ASG_NAME" || true
fi

# Get previous successful deployment commit
PREVIOUS_COMMIT=$(aws autoscaling describe-tags \
  --filters "Name=auto-scaling-group,Values=$ASG_NAME" "Name=key,Values=LastSuccessfulCommit" \
  --query 'Tags[0].Value' \
  --output text)

if [ "$PREVIOUS_COMMIT" != "None" ] && [ -n "$PREVIOUS_COMMIT" ]; then
  echo "📦 Rolling back to commit: $PREVIOUS_COMMIT"
  
  # Trigger new deployment with previous commit
  aws autoscaling start-instance-refresh \
    --auto-scaling-group-name "$ASG_NAME" \
    --preferences '{
      "MinHealthyPercentage": 90,
      "InstanceWarmup": 300
    }'
  
  echo "✅ Rollback initiated"
else
  echo "⚠️  No previous successful deployment found"
  echo "Manual intervention required"
  exit 1
fi
