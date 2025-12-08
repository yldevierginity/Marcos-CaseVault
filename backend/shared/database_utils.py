import json
import psycopg2
import psycopg2.extras
import boto3
import os
from typing import Dict, Any, List, Optional

class DatabaseConnection:
    def __init__(self):
        self.secret_arn = os.environ.get('DB_SECRET_ARN')
        self.cluster_endpoint = os.environ.get('CLUSTER_ENDPOINT')
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
                    connect_timeout=10,
                    cursor_factory=psycopg2.extras.RealDictCursor
                )
                self._connection.autocommit = False
                print("Database connection established")
            except Exception as e:
                print(f"Database connection failed: {str(e)}")
                raise
        return self._connection
    
    def close_connection(self):
        """Close database connection"""
        if self._connection and not self._connection.closed:
            self._connection.close()
            print("Database connection closed")

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
            print(f"Admin action logged: {action} on {table_name}")
        except Exception as e:
            print(f"Failed to log admin action: {str(e)}")

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
        print(f"Failed to extract user from Cognito: {str(e)}")
        return None
