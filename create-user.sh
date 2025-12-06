#!/bin/bash

# Script to create a user in AWS Cognito User Pool

USER_POOL_ID="ap-southeast-1_eNvnJJNiG"
USERNAME="INSERT USER NAME HERE"
EMAIL="INSERT EMAIL"
FIRST_NAME="INSERT FIRST NAME"
LAST_NAME="INSERT LAST NAME"
PHONE_NUMBER="INSERT PHONE NUMBER"
TEMP_PASSWORD="TempPass123!"
REGION="ap-southeast-1"

echo "Creating user: $FIRST_NAME $LAST_NAME"
echo "Username: $USERNAME"
echo "Email: $EMAIL"

# Create user with complete attributes
aws cognito-idp admin-create-user \
    --user-pool-id "$USER_POOL_ID" \
    --username "$USERNAME" \
    --user-attributes \
        Name=email,Value="$EMAIL" \
        Name=email_verified,Value=true \
        Name=given_name,Value="$FIRST_NAME" \
        Name=family_name,Value="$LAST_NAME" \
        Name=phone_number,Value="$PHONE_NUMBER" \
        Name=phone_number_verified,Value=true \
    --temporary-password "$TEMP_PASSWORD" \
    --message-action SUPPRESS \
    --region "$REGION"

echo ""
echo "User created successfully!"
echo "Email: $EMAIL"
echo "Username: $USERNAME"
echo "Phone: $PHONE_NUMBER"
echo "Temporary Password: $TEMP_PASSWORD"
echo ""
echo "You'll need to change the password on first login."
echo "Login with either username or email address."
