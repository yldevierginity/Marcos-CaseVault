import json
import sys
import os
from typing import Dict, Any
from aws_lambda_powertools import Logger, Tracer
from aws_lambda_powertools.utilities.typing import LambdaContext

# Add shared directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))

from database_utils import (
    DatabaseConnection, AdminLogger, get_user_from_cognito, 
    create_response
)

logger = Logger()
tracer = Tracer()

def lambda_handler(event: Dict[str, Any], context: LambdaContext) -> Dict[str, Any]:
    """Lambda handler for admin logs operations"""
    
    try:
        # Initialize database connection
        db = DatabaseConnection()
        admin_logger = AdminLogger(db)
        
        # Get user from Cognito
        user = get_user_from_cognito(event)
        if not user:
            return create_response(401, {'error': 'Unauthorized'})
        
        # Check if user is admin
        if not is_admin_user(db, user['user_id']):
            return create_response(403, {'error': 'Admin access required'})
        
        # Get HTTP method
        http_method = event['httpMethod']
        
        if http_method == 'GET':
            return get_admin_logs(db, admin_logger, user, event)
        else:
            return create_response(405, {'error': 'Method not allowed'})
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})
    
    finally:
        if 'db' in locals():
            db.close_connection()

def is_admin_user(db: DatabaseConnection, user_id: str) -> bool:
    """Check if user has admin role"""
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT role FROM users WHERE user_id = %s AND is_active = TRUE
        """, (user_id,))
        
        result = cursor.fetchone()
        cursor.close()
        
        return result and result[0] == 'admin'
        
    except Exception as e:
        logger.error(f"Error checking admin status: {str(e)}")
        return False
