#!/bin/bash

# Law Firm Serverless Application - Terraform Destroy Script
# This script safely destroys all AWS infrastructure

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate AWS credentials
validate_aws_credentials() {
    print_status "Validating AWS credentials..."
    
    if ! command_exists aws; then
        print_error "AWS CLI is not installed."
        exit 1
    fi
    
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        print_error "AWS credentials not configured or invalid."
        exit 1
    fi
    
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)
    AWS_USER=$(aws sts get-caller-identity --query Arn --output text 2>/dev/null)
    
    print_success "AWS credentials validated!"
    print_status "Account ID: $AWS_ACCOUNT"
    print_status "User/Role: $AWS_USER"
}

# Function to check Terraform installation
check_terraform() {
    print_status "Checking Terraform installation..."
    
    if ! command_exists terraform; then
        print_error "Terraform is not installed."
        exit 1
    fi
    
    TERRAFORM_VERSION=$(terraform version -json | jq -r '.terraform_version' 2>/dev/null || terraform version | head -n1)
    print_success "Terraform is installed: $TERRAFORM_VERSION"
}

# Function to destroy infrastructure
destroy_infrastructure() {
    print_status "Destroying Terraform infrastructure..."
    
    cd infrastructure
    
    # Check if terraform state exists
    if [ ! -f "terraform.tfstate" ]; then
        print_warning "No terraform.tfstate found. Nothing to destroy."
        cd ..
        return 0
    fi
    
    # Initialize Terraform
    print_status "Initializing Terraform..."
    terraform init
    
    # Show what will be destroyed
    print_status "Planning destruction..."
    terraform plan -destroy
    
    echo ""
    print_warning "⚠️  DANGER: This will permanently delete ALL AWS resources!"
    print_warning "This includes:"
    echo "  • Lambda functions"
    echo "  • API Gateway"
    echo "  • RDS Database (with all data)"
    echo "  • Cognito User Pool (with all users)"
    echo "  • VPC and networking"
    echo "  • S3 buckets (if any)"
    echo ""
    
    read -p "Are you absolutely sure you want to destroy everything? Type 'yes' to confirm: " confirm
    
    if [ "$confirm" != "yes" ]; then
        print_status "Destruction cancelled by user."
        cd ..
        exit 0
    fi
    
    # Final confirmation
    read -p "Last chance! Type 'DESTROY' to proceed: " final_confirm
    
    if [ "$final_confirm" != "DESTROY" ]; then
        print_status "Destruction cancelled by user."
        cd ..
        exit 0
    fi
    
    # Destroy infrastructure
    print_status "Destroying infrastructure..."
    terraform destroy -auto-approve
    
    cd ..
    print_success "Infrastructure destroyed successfully!"
}

# Function to clean up local files
cleanup_local_files() {
    print_status "Cleaning up local files..."
    
    # Remove Terraform state files
    if [ -f "infrastructure/terraform.tfstate" ]; then
        rm -f infrastructure/terraform.tfstate
        print_status "Removed terraform.tfstate"
    fi
    
    if [ -f "infrastructure/terraform.tfstate.backup" ]; then
        rm -f infrastructure/terraform.tfstate.backup
        print_status "Removed terraform.tfstate.backup"
    fi
    
    # Remove Terraform plan files
    if [ -f "infrastructure/tfplan" ]; then
        rm -f infrastructure/tfplan
        print_status "Removed tfplan"
    fi
    
    # Remove .terraform directory
    if [ -d "infrastructure/.terraform" ]; then
        rm -rf infrastructure/.terraform
        print_status "Removed .terraform directory"
    fi
    
    # Remove outputs file
    if [ -f "terraform-outputs.env" ]; then
        rm -f terraform-outputs.env
        print_status "Removed terraform-outputs.env"
    fi
    
    # Remove Lambda packages
    for zip_file in backend/*.zip; do
        if [ -f "$zip_file" ]; then
            rm -f "$zip_file"
            print_status "Removed $(basename "$zip_file")"
        fi
    done
    
    # Remove Python dependencies from Lambda directories
    for dir in backend/*/; do
        if [ -d "$dir" ]; then
            cd "$dir"
            # Remove installed packages (keep only source files)
            find . -name "*.dist-info" -type d -exec rm -rf {} + 2>/dev/null || true
            find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
            find . -name "*.pyc" -delete 2>/dev/null || true
            
            # Remove specific package directories (keep lambda_function.py and requirements.txt)
            for pkg in boto3 botocore aws_lambda_powertools psycopg2 dateutil jmespath s3transfer six typing_extensions urllib3 bin; do
                if [ -d "$pkg" ] || [ -f "$pkg.py" ]; then
                    rm -rf "$pkg" "$pkg.py" 2>/dev/null || true
                fi
            done
            
            cd - > /dev/null
        fi
    done
    
    print_success "Local cleanup completed!"
}

# Main execution
main() {
    echo "🔥 Law Firm Serverless Application - Infrastructure Destroyer"
    echo "============================================================"
    echo ""
    
    # Validate AWS credentials
    validate_aws_credentials
    echo ""
    
    # Check Terraform installation
    check_terraform
    echo ""
    
    # Destroy infrastructure
    destroy_infrastructure
    echo ""
    
    # Clean up local files
    cleanup_local_files
    echo ""
    
    print_success "🎉 Destruction completed successfully!"
    echo ""
    print_status "All AWS resources have been destroyed."
    print_status "Local files have been cleaned up."
    print_warning "Remember to remove any manual AWS resources if created outside Terraform."
}

# Run main function
main "$@"
