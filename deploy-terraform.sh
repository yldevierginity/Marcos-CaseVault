#!/bin/bash

# Law Firm Serverless Application - Terraform Deployment Script
# This script validates AWS credentials, allows region selection, and deploys infrastructure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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
        print_error "AWS CLI is not installed. Please install it first."
        print_status "Installation instructions:"
        print_status "  - macOS: brew install awscli"
        print_status "  - Ubuntu/Debian: sudo apt-get install awscli"
        print_status "  - CentOS/RHEL: sudo yum install awscli"
        print_status "  - Windows: Download from https://aws.amazon.com/cli/"
        exit 1
    fi
    
    # Check if AWS credentials are configured
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        print_error "AWS credentials not configured or invalid."
        print_status "Please configure your AWS credentials using one of these methods:"
        print_status "  1. Run: aws configure"
        print_status "  2. Set environment variables:"
        print_status "     export AWS_ACCESS_KEY_ID=your_access_key"
        print_status "     export AWS_SECRET_ACCESS_KEY=your_secret_key"
        print_status "     export AWS_SESSION_TOKEN=your_session_token (if using temporary credentials)"
        print_status "  3. Use IAM roles (if running on EC2)"
        exit 1
    fi
    
    # Get current AWS account info
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)
    AWS_USER=$(aws sts get-caller-identity --query Arn --output text 2>/dev/null)
    
    if [ -z "$AWS_ACCOUNT" ]; then
        print_error "Failed to retrieve AWS account information."
        exit 1
    fi
    
    print_success "AWS credentials validated successfully!"
    print_status "Account ID: $AWS_ACCOUNT"
    print_status "User/Role: $AWS_USER"
}

# Function to select AWS region with keyboard navigation
select_aws_region() {
    print_status "Selecting AWS region..."
    
    # Common regions with descriptions
    declare -A regions=(
        ["us-east-1"]="US East (N. Virginia) - Default"
        ["us-east-2"]="US East (Ohio)"
        ["us-west-1"]="US West (N. California)"
        ["us-west-2"]="US West (Oregon)"
        ["eu-west-1"]="Europe (Ireland)"
        ["eu-west-2"]="Europe (London)"
        ["eu-central-1"]="Europe (Frankfurt)"
        ["ap-southeast-1"]="Asia Pacific (Singapore)"
        ["ap-southeast-2"]="Asia Pacific (Sydney)"
        ["ap-northeast-1"]="Asia Pacific (Tokyo)"
        ["ca-central-1"]="Canada (Central)"
    )
    
    # Get current region
    CURRENT_REGION=$(aws configure get region 2>/dev/null || echo "ap-southeast-1")
    
    # Create array of regions for selection
    region_array=($(printf '%s\n' "${!regions[@]}" | sort))
    
    # Find current region index
    current_index=0
    for i in "${!region_array[@]}"; do
        if [[ "${region_array[$i]}" == "$CURRENT_REGION" ]]; then
            current_index=$i
            break
        fi
    done
    
    selected_index=$current_index
    
    # Function to display menu
    display_menu() {
        clear
        echo -e "${BLUE}🚀 Law Firm Serverless Application - Region Selection${NC}"
        echo -e "${BLUE}================================================${NC}"
        echo ""
        print_status "Select AWS region using arrow keys (↑/↓) and press Enter:"
        echo ""
        
        for i in "${!region_array[@]}"; do
            region="${region_array[$i]}"
            description="${regions[$region]}"
            
            if [[ $i -eq $selected_index ]]; then
                echo -e "  ${GREEN}▶ ${region} - ${description}${NC}"
            else
                echo -e "    ${region} - ${description}"
            fi
        done
        
        echo ""
        echo -e "${YELLOW}Use ↑/↓ arrow keys to navigate, Enter to select${NC}"
    }
    
    # Function to handle key input
    handle_key() {
        while true; do
            read -rsn1 key
            case $key in
                $'\x1b')  # ESC sequence
                    read -rsn2 key
                    case $key in
                        '[A')  # Up arrow
                            if [[ $selected_index -gt 0 ]]; then
                                ((selected_index--))
                            fi
                            display_menu
                            ;;
                        '[B')  # Down arrow
                            if [[ $selected_index -lt $((${#region_array[@]} - 1)) ]]; then
                                ((selected_index++))
                            fi
                            display_menu
                            ;;
                    esac
                    ;;
                '')  # Enter key
                    break
                    ;;
            esac
        done
    }
    
    # Display initial menu
    display_menu
    
    # Handle keyboard input
    handle_key
    
    # Get selected region
    SELECTED_REGION="${region_array[$selected_index]}"
    
    print_success "Selected region: $SELECTED_REGION"
    
    # Update AWS CLI region if different
    if [ "$SELECTED_REGION" != "$CURRENT_REGION" ]; then
        print_status "Updating AWS CLI region to $SELECTED_REGION..."
        aws configure set region "$SELECTED_REGION"
    fi
}

# Function to check Terraform installation
check_terraform() {
    print_status "Checking Terraform installation..."
    
    if ! command_exists terraform; then
        print_error "Terraform is not installed. Please install it first."
        print_status "Installation instructions:"
        print_status "  - macOS: brew install terraform"
        print_status "  - Ubuntu/Debian:"
        print_status "    wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg"
        print_status "    echo \"deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main\" | sudo tee /etc/apt/sources.list.d/hashicorp.list"
        print_status "    sudo apt update && sudo apt install terraform"
        print_status "  - CentOS/RHEL:"
        print_status "    sudo yum install -y yum-utils"
        print_status "    sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/RHEL/hashicorp.repo"
        print_status "    sudo yum -y install terraform"
        print_status "  - Windows: Download from https://www.terraform.io/downloads"
        exit 1
    fi
    
    TERRAFORM_VERSION=$(terraform version -json | jq -r '.terraform_version' 2>/dev/null || terraform version | head -n1)
    print_success "Terraform is installed: $TERRAFORM_VERSION"
}

# Function to create Lambda deployment packages
create_lambda_packages() {
    print_status "Creating Lambda deployment packages..."
    
    cd backend
    
    # Function to create Lambda package
    create_lambda_package() {
        local function_name=$1
        print_status "Creating package for $function_name..."
        
        cd "$function_name"
        
        # Install dependencies
        pip install -r requirements.txt -t . --quiet
        
        # Copy shared utilities
        cp ../shared/database_utils.py .
        
        # Create zip package
        zip -r "../${function_name}.zip" . -x "*.pyc" "__pycache__/*" "*.git*" "*.dist-info/*" >/dev/null
        
        cd ..
    }
    
    # Create packages for all functions
    for func in clients cases hearings users search notifications admin_logs; do
        if [ -d "$func" ]; then
            create_lambda_package "$func"
        else
            print_warning "Function directory $func not found, skipping..."
        fi
    done
    
    cd ..
    print_success "Lambda packages created successfully!"
}

# Function to deploy Terraform infrastructure
deploy_terraform() {
    print_status "Deploying Terraform infrastructure..."
    
    cd infrastructure
    
    # Initialize Terraform
    print_status "Initializing Terraform..."
    terraform init -backend-config=backend.hcl
    
    # Validate Terraform configuration
    print_status "Validating Terraform configuration..."
    terraform validate
    
    # Plan Terraform deployment
    print_status "Planning Terraform deployment..."
    terraform plan -out=tfplan -var="aws_region=$SELECTED_REGION"
    
    # Ask for confirmation
    echo ""
    print_warning "This will create AWS resources that may incur costs."
    read -p "Do you want to proceed with the deployment? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ] && [ "$confirm" != "y" ]; then
        print_status "Deployment cancelled by user."
        exit 0
    fi
    
    # Apply Terraform
    print_status "Applying Terraform configuration..."
    terraform apply tfplan
    
    cd ..
    print_success "Terraform deployment completed successfully!"
}

# Function to get Terraform outputs
get_terraform_outputs() {
    print_status "Retrieving Terraform outputs..."
    
    cd infrastructure
    
    API_ENDPOINT=$(terraform output -raw api_gateway_url 2>/dev/null)
    USER_POOL_ID=$(terraform output -raw user_pool_id 2>/dev/null)
    USER_POOL_CLIENT_ID=$(terraform output -raw user_pool_client_id 2>/dev/null)
    IDENTITY_POOL_ID=$(terraform output -raw identity_pool_id 2>/dev/null)
    DB_ENDPOINT=$(terraform output -raw database_endpoint 2>/dev/null)
    DB_SECRET_ARN=$(terraform output -raw database_secret_arn 2>/dev/null)
    
    cd ..
    
    if [ -n "$API_ENDPOINT" ]; then
        print_success "Infrastructure deployed successfully!"
        echo ""
        print_status "Stack Outputs:"
        echo "  API Endpoint: $API_ENDPOINT"
        echo "  User Pool ID: $USER_POOL_ID"
        echo "  User Pool Client ID: $USER_POOL_CLIENT_ID"
        echo "  Identity Pool ID: $IDENTITY_POOL_ID"
        echo "  Database Endpoint: $DB_ENDPOINT"
        echo ""
        
        # Save outputs to file
        cat > terraform-outputs.env << EOF
# Terraform Outputs - Generated on $(date)
AWS_REGION=$SELECTED_REGION
API_ENDPOINT=$API_ENDPOINT
USER_POOL_ID=$USER_POOL_ID
USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID
IDENTITY_POOL_ID=$IDENTITY_POOL_ID
DB_ENDPOINT=$DB_ENDPOINT
DB_SECRET_ARN=$DB_SECRET_ARN
EOF
        
        print_success "Outputs saved to terraform-outputs.env"
    else
        print_error "Failed to retrieve Terraform outputs."
        exit 1
    fi
}

# Function to initialize database
initialize_database() {
    print_status "Initializing database..."
    
    if [ -z "$DB_SECRET_ARN" ] || [ -z "$DB_ENDPOINT" ]; then
        print_error "Database information not available. Please check Terraform outputs."
        return 1
    fi
    
    # Get database credentials
    DB_CREDENTIALS=$(aws secretsmanager get-secret-value --secret-id "$DB_SECRET_ARN" --query SecretString --output text 2>/dev/null)
    
    if [ -z "$DB_CREDENTIALS" ]; then
        print_error "Failed to retrieve database credentials."
        return 1
    fi
    
    # Extract database credentials
    DB_USERNAME=$(echo "$DB_CREDENTIALS" | jq -r '.username')
    DB_PASSWORD=$(echo "$DB_CREDENTIALS" | jq -r '.password')
    
    # Check if PostgreSQL client is available
    if ! command_exists psql; then
        print_warning "PostgreSQL client (psql) not found."
        print_status "Please install PostgreSQL client:"
        print_status "  - macOS: brew install postgresql"
        print_status "  - Ubuntu/Debian: sudo apt-get install postgresql-client"
        print_status "  - CentOS/RHEL: sudo yum install postgresql"
        print_status "  - Windows: Download from https://www.postgresql.org/download/windows/"
        return 1
    fi
    
    # Run database schema
    print_status "Setting up database schema..."
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_ENDPOINT" -U "$DB_USERNAME" -d lawfirmdb -f ../database/schema.sql
    
    print_success "Database initialized successfully!"
}

# Function to build frontend
build_frontend() {
    print_status "Building frontend..."
    
    cd frontend
    
    # Create environment file
    cat > .env << EOF
VITE_AWS_REGION=$SELECTED_REGION
VITE_AWS_USER_POOL_ID=$USER_POOL_ID
VITE_AWS_USER_POOL_WEB_CLIENT_ID=$USER_POOL_CLIENT_ID
VITE_AWS_IDENTITY_POOL_ID=$IDENTITY_POOL_ID
VITE_AWS_API_GATEWAY_URL=$API_ENDPOINT
EOF
    
    # Install dependencies and build
    npm install --silent
    npm run build
    
    cd ..
    print_success "Frontend built successfully!"
}

# Function to display final instructions
display_final_instructions() {
    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    print_status "📝 Next Steps:"
    echo "  1. Create your first admin user in the Cognito User Pool"
    echo "  2. Upload the frontend build to S3 or deploy to your preferred hosting service"
    echo "  3. Test the application by visiting your frontend URL"
    echo ""
    print_status "🔗 Useful Commands:"
    echo "  • View Terraform state: terraform show"
    echo "  • Destroy infrastructure: terraform destroy"
    echo "  • View logs: aws logs describe-log-groups --log-group-name-prefix /aws/lambda/law-firm"
    echo ""
    print_status "📋 Environment Variables for Frontend:"
    echo "  REACT_APP_AWS_REGION=$SELECTED_REGION"
    echo "  REACT_APP_USER_POOL_ID=$USER_POOL_ID"
    echo "  REACT_APP_USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID"
    echo "  REACT_APP_IDENTITY_POOL_ID=$IDENTITY_POOL_ID"
    echo "  REACT_APP_API_ENDPOINT=$API_ENDPOINT"
    echo ""
    print_status "📁 Files created:"
    echo "  • terraform-outputs.env - Contains all Terraform outputs"
    echo "  • frontend/.env - Frontend environment configuration"
    echo "  • frontend/dist/ - Built frontend ready for deployment"
}

# Main execution
main() {
    echo "🚀 Law Firm Serverless Application - Terraform Deployment"
    echo "========================================================"
    echo ""
    
    # Validate AWS credentials
    validate_aws_credentials
    echo ""
    
    # Select AWS region
    select_aws_region
    echo ""
    
    # Check Terraform installation
    check_terraform
    echo ""
    
    # Create Lambda packages
    create_lambda_packages
    echo ""
    
    # Deploy Terraform infrastructure
    deploy_terraform
    echo ""
    
    # Get Terraform outputs
    get_terraform_outputs
    echo ""
    
    # Initialize database
    initialize_database
    echo ""
    
    # Build frontend
    build_frontend
    echo ""
    
    # Display final instructions
    display_final_instructions
}

# Run main function
main "$@"