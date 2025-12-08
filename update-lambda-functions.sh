#!/bin/bash

# Update Lambda Functions with Database Integration
# This script packages and deploys the updated Lambda functions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to create Lambda package
create_lambda_package() {
    local function_name=$1
    print_status "Creating package for $function_name..."
    
    cd "backend/$function_name"
    
    # Clean up any existing packages
    rm -f *.zip
    
    # Install dependencies
    pip install -r requirements.txt -t . --quiet --upgrade
    
    # Copy shared utilities
    cp ../shared/database_utils.py .
    
    # Create zip package
    zip -r "../${function_name}.zip" . -x "*.pyc" "__pycache__/*" "*.git*" "*.dist-info/*" >/dev/null
    
    cd ../..
    print_success "Package created for $function_name"
}

# Function to update Lambda function
update_lambda_function() {
    local function_name=$1
    local zip_file="backend/${function_name}.zip"
    
    print_status "Updating Lambda function: casevault-$function_name"
    
    if [ ! -f "$zip_file" ]; then
        print_error "Package not found: $zip_file"
        return 1
    fi
    
    aws lambda update-function-code \
        --function-name "casevault-$function_name" \
        --zip-file "fileb://$zip_file" \
        --region ap-southeast-1 >/dev/null
    
    print_success "Updated Lambda function: casevault-$function_name"
}

# Main execution
main() {
    echo "🚀 Updating Lambda Functions with Database Integration"
    echo "===================================================="
    echo ""
    
    # Check if AWS CLI is configured
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        print_error "AWS CLI not configured or invalid credentials"
        exit 1
    fi
    
    print_status "AWS credentials validated"
    echo ""
    
    # Create packages for all functions
    for func in clients cases hearings users search notifications admin_logs; do
        if [ -d "backend/$func" ]; then
            create_lambda_package "$func"
        else
            print_warning "Function directory backend/$func not found, skipping..."
        fi
    done
    
    echo ""
    print_status "All packages created successfully!"
    echo ""
    
    # Update Lambda functions
    for func in clients cases hearings users search notifications admin_logs; do
        if [ -f "backend/${func}.zip" ]; then
            update_lambda_function "$func"
        else
            print_warning "Package backend/${func}.zip not found, skipping..."
        fi
    done
    
    echo ""
    print_success "🎉 All Lambda functions updated successfully!"
    echo ""
    print_status "Next steps:"
    echo "  1. Initialize the database schema by running the SQL script"
    echo "  2. Test the application by creating a new client or case"
    echo "  3. Check CloudWatch logs if you encounter any issues"
    echo ""
    print_warning "Note: Make sure your RDS database is running and accessible"
}

# Run main function
main "$@"
