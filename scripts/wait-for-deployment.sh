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

  # Get instance refresh details
  REFRESH_INFO=$(aws autoscaling describe-instance-refreshes \
    --auto-scaling-group-name "$ASG_NAME" \
    --max-records 1 \
    --output json)

  STATUS=$(echo "$REFRESH_INFO" | jq -r '.InstanceRefreshes[0].Status')
  PERCENTAGE=$(echo "$REFRESH_INFO" | jq -r '.InstanceRefreshes[0].PercentageComplete')
  STATUS_REASON=$(echo "$REFRESH_INFO" | jq -r '.InstanceRefreshes[0].StatusReason // "N/A"')

  echo "📊 Status: $STATUS | Progress: ${PERCENTAGE}%"
  
  if [ "$STATUS_REASON" != "N/A" ]; then
    echo "ℹ️  Reason: $STATUS_REASON"
  fi

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
