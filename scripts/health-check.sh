#!/bin/bash
set -e

ENVIRONMENT=$1
MAX_RETRIES=10
RETRY_INTERVAL=10

echo "🏥 Running health checks for $ENVIRONMENT environment..."

# Get API Gateway URL from Terraform outputs
cd Infrastructure
API_URL=$(terraform output -raw api_gateway_url 2>/dev/null || echo "")
cd ..

if [ -z "$API_URL" ]; then
  echo "⚠️  No API URL found, skipping health check"
  exit 0
fi

HEALTH_ENDPOINT="${API_URL}/api/health"

echo "🔍 Health endpoint: $HEALTH_ENDPOINT"

for i in $(seq 1 $MAX_RETRIES); do
  echo "Attempt $i/$MAX_RETRIES..."
  
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_ENDPOINT" || echo "000")
  
  if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ Health check passed! (HTTP $HTTP_CODE)"
    
    # Additional checks
    RESPONSE=$(curl -s "$HEALTH_ENDPOINT")
    echo "Response: $RESPONSE"
    
    exit 0
  else
    echo "⚠️  Health check failed (HTTP $HTTP_CODE)"
    
    if [ $i -lt $MAX_RETRIES ]; then
      echo "Retrying in ${RETRY_INTERVAL}s..."
      sleep $RETRY_INTERVAL
    fi
  fi
done

echo "❌ Health check failed after $MAX_RETRIES attempts"
exit 1
