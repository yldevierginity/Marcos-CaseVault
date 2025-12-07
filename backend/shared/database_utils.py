import json
import psycopg2
import boto3
import os
from typing import Dict, Any, List, Optional
from aws_lambda_powertools import Logger, Tracer

logger = Logger()
tracer = Tracer()

class DatabaseConnection:
    def __init__(self):
        self.secret_arn = os.environ['DB_SECRET_ARN']
        self.cluster_endpoint = os.environ['CLUSTER_ENDPOINT']
        self.secrets_client = boto3.client('secretsmanager')
        self._connection = None
    
    def get_connection(self):
        """Get database connection with connection pooling"""
        if self._connection is None or self._connection.closed:
            try:
                # Get database credentials from Secrets Manager
                secret_response = self.secrets_client.get_secret_value(
                    SecretId=self.secret_arn
                )
                secret = json.loads(secret_response['SecretString'])
                
                # Connect to database
                self._connection = psycopg2.connect(
                    host=self.cluster_endpoint,
                    port=5432,
                    database='lawfirmdb',
                    user=secret['username'],
                    password=secret['password'],
                    connect_timeout=10
                )
                logger.info("Database connection established")
            except Exception as e:
                logger.error(f"Database connection failed: {str(e)}")
                raise
        return self._connection
    
    def close_connection(self):
        """Close database connection"""
        if self._connection and not self._connection.closed:
            self._connection.close()
            logger.info("Database connection closed")

class AdminLogger:
    def __init__(self, db_connection: DatabaseConnection):
        self.db = db_connection
    
    def log_action(self, user_id: str, action: str, table_name: str, 
                   record_id: str = None, old_values: Dict = None, 
                   new_values: Dict = None, ip_address: str = None, 
                   user_agent: str = None):
        """Log admin action to database"""
        try:
            conn = self.db.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO admin_logs (user_id, action, table_name, record_id, 
                                      old_values, new_values, ip_address, user_agent)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (user_id, action, table_name, record_id, 
                  json.dumps(old_values) if old_values else None,
                  json.dumps(new_values) if new_values else None,
                  ip_address, user_agent))
            
            conn.commit()
            cursor.close()
            logger.info(f"Admin action logged: {action} on {table_name}")
        except Exception as e:
            logger.error(f"Failed to log admin action: {str(e)}")

def get_user_from_cognito(event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Extract user information from Cognito JWT token"""
    try:
        # Get user info from Cognito authorizer context
        request_context = event.get('requestContext', {})
        authorizer = request_context.get('authorizer', {})
        claims = authorizer.get('claims', {})
        
        if not claims:
            return None
            
        return {
            'user_id': claims.get('sub'),
            'email': claims.get('email'),
            'first_name': claims.get('given_name'),
            'last_name': claims.get('family_name')
        }
    except Exception as e:
        logger.error(f"Failed to extract user from Cognito: {str(e)}")
        return None

def create_response(status_code: int, body: Dict[str, Any], 
                   headers: Dict[str, str] = None) -> Dict[str, Any]:
    """Create standardized API Gateway response"""
    default_headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }
    
    if headers:
        default_headers.update(headers)
    
    return {
        'statusCode': status_code,
        'headers': default_headers,
        'body': json.dumps(body)
    }

def validate_email_domain(email: str) -> bool:
    """Validate that email is from Gmail domain only"""
    if not email or '@' not in email:
        return False
    
    domain = email.split('@')[1].lower()
    return domain == 'gmail.com'

def paginate_results(cursor, page: int = 1, limit: int = 20) -> Dict[str, Any]:
    """Paginate database results"""
    offset = (page - 1) * limit
    
    # Get total count
    cursor.execute("SELECT COUNT(*) FROM ({}) as count_query".format(
        cursor.query.decode() if hasattr(cursor.query, 'decode') else str(cursor.query)
    ))
    total_count = cursor.fetchone()[0]
    
    # Get paginated results
    cursor.execute(f"{cursor.query} LIMIT %s OFFSET %s", (limit, offset))
    results = cursor.fetchall()
    
    return {
        'data': results,
        'pagination': {
            'page': page,
            'limit': limit,
            'total': total_count,
            'pages': (total_count + limit - 1) // limit
        }
    }
