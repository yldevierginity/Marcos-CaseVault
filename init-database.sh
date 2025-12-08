#!/bin/bash

# Initialize Database Schema
# This script connects to the RDS database and creates the required tables

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

# Configuration - Update these values based on your Terraform outputs
DB_SECRET_ARN="arn:aws:secretsmanager:ap-southeast-1:YOUR_ACCOUNT_ID:secret:casevault-db-credentials-XXXXXX"
DB_ENDPOINT="casevault-cluster.cluster-XXXXXXXXXX.ap-southeast-1.rds.amazonaws.com"
REGION="ap-southeast-1"

main() {
    echo "🗄️  Initializing Database Schema"
    echo "================================"
    echo ""
    
    # Check if AWS CLI is configured
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        print_error "AWS CLI not configured or invalid credentials"
        exit 1
    fi
    
    # Check if psql is available
    if ! command -v psql >/dev/null 2>&1; then
        print_error "PostgreSQL client (psql) not found."
        print_status "Please install PostgreSQL client:"
        print_status "  - Ubuntu/Debian: sudo apt-get install postgresql-client"
        print_status "  - macOS: brew install postgresql"
        print_status "  - CentOS/RHEL: sudo yum install postgresql"
        exit 1
    fi
    
    print_status "Getting database credentials from AWS Secrets Manager..."
    
    # Get database credentials
    DB_CREDENTIALS=$(aws secretsmanager get-secret-value \
        --secret-id "$DB_SECRET_ARN" \
        --region "$REGION" \
        --query SecretString \
        --output text 2>/dev/null)
    
    if [ -z "$DB_CREDENTIALS" ]; then
        print_error "Failed to retrieve database credentials."
        print_status "Please check your DB_SECRET_ARN and ensure you have access to the secret."
        exit 1
    fi
    
    # Extract database credentials using jq
    if ! command -v jq >/dev/null 2>&1; then
        print_error "jq is required to parse JSON. Please install jq:"
        print_status "  - Ubuntu/Debian: sudo apt-get install jq"
        print_status "  - macOS: brew install jq"
        print_status "  - CentOS/RHEL: sudo yum install jq"
        exit 1
    fi
    
    DB_USERNAME=$(echo "$DB_CREDENTIALS" | jq -r '.username')
    DB_PASSWORD=$(echo "$DB_CREDENTIALS" | jq -r '.password')
    
    if [ "$DB_USERNAME" = "null" ] || [ "$DB_PASSWORD" = "null" ]; then
        print_error "Failed to parse database credentials."
        exit 1
    fi
    
    print_success "Database credentials retrieved successfully!"
    print_status "Username: $DB_USERNAME"
    print_status "Endpoint: $DB_ENDPOINT"
    
    # Test database connection
    print_status "Testing database connection..."
    
    export PGPASSWORD="$DB_PASSWORD"
    
    if ! psql -h "$DB_ENDPOINT" -U "$DB_USERNAME" -d lawfirmdb -c "SELECT 1;" >/dev/null 2>&1; then
        print_error "Failed to connect to database."
        print_status "Please ensure:"
        print_status "  1. The RDS cluster is running"
        print_status "  2. Security groups allow connections from your IP"
        print_status "  3. The database endpoint is correct"
        exit 1
    fi
    
    print_success "Database connection successful!"
    
    # Run database schema
    print_status "Creating database schema..."
    
    if [ ! -f "database/schema.sql" ]; then
        print_error "Schema file not found: database/schema.sql"
        exit 1
    fi
    
    psql -h "$DB_ENDPOINT" -U "$DB_USERNAME" -d lawfirmdb -f database/schema.sql
    
    if [ $? -eq 0 ]; then
        print_success "Database schema created successfully!"
    else
        print_error "Failed to create database schema."
        exit 1
    fi
    
    # Verify tables were created
    print_status "Verifying tables were created..."
    
    TABLES=$(psql -h "$DB_ENDPOINT" -U "$DB_USERNAME" -d lawfirmdb -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ' | grep -v '^$')
    
    echo ""
    print_success "Database initialization completed!"
    print_status "Created tables:"
    echo "$TABLES" | while read table; do
        echo "  • $table"
    done
    
    echo ""
    print_status "You can now test the application by creating clients and cases."
    print_status "The data will now persist in the PostgreSQL database."
}

# Run main function
main "$@"
