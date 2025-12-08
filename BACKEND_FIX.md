# Backend Database Integration Fix

## Problem
The backend Lambda functions were only returning mock data and not persisting data to the PostgreSQL database. When you refresh the website after submitting clients or cases, the entries disappear because they were only stored in the frontend's local state.

## Solution
Updated the backend to properly integrate with the PostgreSQL database and configured GitHub Actions for automated deployment.

### 1. Database Schema
Created `database/schema.sql` with proper PostgreSQL tables for:
- `clients` - Client information
- `cases` - Case management  
- `users` - User management
- `hearings` - Court hearings
- `notifications` - System notifications
- `admin_logs` - Audit trail

### 2. Updated Lambda Functions
- **clients Lambda**: Now performs actual CRUD operations on the `clients` table
- **cases Lambda**: Now performs actual CRUD operations on the `cases` table
- **Database utilities**: Fixed PostgreSQL connection and query handling

### 3. GitHub Actions Integration
Updated workflows to automatically:
- Package Lambda functions with database utilities
- Deploy updated functions
- Initialize database schema
- Handle environment variables

## Deployment via GitHub Actions

### Required GitHub Secrets
Add these secrets to your repository:
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
DB_SECRET_ARN=arn:aws:secretsmanager:region:account:secret:name (optional for update-lambda workflow)
DB_ENDPOINT=your-rds-endpoint.region.rds.amazonaws.com (optional for update-lambda workflow)
```

### Automatic Deployment
The fix will be deployed automatically when you:

1. **Push to main/develop branch** - Triggers full deployment including database initialization
2. **Push backend changes** - Triggers Lambda function updates only
3. **Manual workflow dispatch** - Can be triggered manually from GitHub Actions tab

### Manual Deployment (if needed)
If you need to deploy manually:

```bash
# Update Lambda functions only
./update-lambda-functions.sh

# Initialize database schema only  
./init-database.sh
```

## Key Changes Made

### Database Connection (`backend/shared/database_utils.py`)
- Fixed PostgreSQL connection with proper cursor factory
- Added proper error handling and connection pooling
- Implemented admin logging functionality

### Lambda Functions
- **GET**: Retrieves data from database with pagination
- **POST**: Inserts new records into database
- **PUT**: Updates existing records
- **DELETE**: Removes records from database
- Returns proper data structure matching frontend expectations

### GitHub Actions Workflows
- **deploy.yml**: Full infrastructure deployment with database initialization
- **update-lambda.yml**: Lambda function updates with optional database schema updates

## Testing the Fix

1. **Commit and push your changes** to trigger GitHub Actions
2. **Monitor the workflow** in the Actions tab
3. **Test the application**:
   - Create a new client
   - Refresh the page - the client should persist
   - Create a case for the client  
   - Refresh again - both should remain

## Troubleshooting

### If GitHub Actions fail:
1. Check workflow logs in the Actions tab
2. Verify AWS credentials are correctly set in secrets
3. Ensure RDS cluster is running and accessible

### If data still doesn't persist:
1. Check CloudWatch logs for Lambda function errors
2. Verify database connection in Lambda environment variables
3. Test database connectivity manually

### Workflow Monitoring:
- **deploy.yml** runs on pushes to main/develop
- **update-lambda.yml** runs on backend/ or database/ changes
- Both can be triggered manually via workflow_dispatch

The backend will now properly persist data to PostgreSQL via automated GitHub Actions deployment!
