#!/bin/bash
set -e

ASG_NAME=$1
MAX_WAIT=1800  # 30 minutes
INTERVAL=30

echo "⏳ Waiting for deployment to complete..."
echo "ASG: $ASG_NAME"

START_TIME=$(date +%s)

while true; do
  CURRENT_TIME=$(date +%s)
  ELAPSED=$((CURRENT_TIME - START_TIME))
  
  if [ $ELAPSED -gt $MAX_WAIT ]; then
    echo "❌ Deployment timeout after $MAX_WAIT seconds"
    exit 1
  fi

  # Get instance refresh status
  STATUS=$(aws autoscaling describe-instance-refreshes \
    --auto-scaling-group-name "$ASG_NAME" \
    --max-records 1 \
    --query 'InstanceRefreshes[0].Status' \
    --output text)

  PERCENTAGE=$(aws autoscaling describe-instance-refreshes \
    --auto-scaling-group-name "$ASG_NAME" \
    --max-records 1 \
    --query 'InstanceRefreshes[0].PercentageComplete' \
    --output text)

  echo "📊 Status: $STATUS | Progress: ${PERCENTAGE}%"

  case $STATUS in
    "Successful")
      echo "✅ Deployment completed successfully!"
      exit 0
      ;;
    "Failed"|"Cancelled")
      echo "❌ Deployment $STATUS"
      exit 1
      ;;
    "Pending"|"InProgress")
      echo "⏳ Deployment in progress... (${ELAPSED}s elapsed)"
      sleep $INTERVAL
      ;;
    *)
      echo "⚠️  Unknown status: $STATUS"
      sleep $INTERVAL
      ;;
  esac
done
