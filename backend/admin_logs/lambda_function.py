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

@tracer.capture_method
def get_admin_logs(db: DatabaseConnection, admin_logger: AdminLogger, 
                   user: Dict[str, Any], event: Dict[str, Any]) -> Dict[str, Any]:
    """Get admin logs with filtering and pagination"""
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Get query parameters
        query_params = event.get('queryStringParameters') or {}
        page = int(query_params.get('page', 1))
        limit = min(int(query_params.get('limit', 50)), 100)
        user_id_filter = query_params.get('user_id')
        action_filter = query_params.get('action')
        table_filter = query_params.get('table')
        start_date = query_params.get('start_date')
        end_date = query_params.get('end_date')
        
        # Build query
        base_query = """
            SELECT al.log_id, al.user_id, al.action, al.table_name, al.record_id,
                   al.old_values, al.new_values, al.ip_address, al.user_agent,
                   al.created_at, u.first_name, u.last_name, u.email
            FROM admin_logs al
            LEFT JOIN users u ON al.user_id = u.user_id
        """
        
        params = []
        where_clauses = []
        
        if user_id_filter:
            where_clauses.append("al.user_id = %s")
            params.append(user_id_filter)
        
        if action_filter:
            where_clauses.append("al.action = %s")
            params.append(action_filter)
        
        if table_filter:
            where_clauses.append("al.table_name = %s")
            params.append(table_filter)
        
        if start_date:
            where_clauses.append("al.created_at >= %s")
            params.append(start_date)
        
        if end_date:
            where_clauses.append("al.created_at <= %s")
            params.append(end_date)
        
        if where_clauses:
            base_query += " WHERE " + " AND ".join(where_clauses)
        
        base_query += " ORDER BY al.created_at DESC"
        
        # Execute query
        cursor.execute(base_query, params)
        results = cursor.fetchall()
        
        # Apply pagination
        offset = (page - 1) * limit
        paginated_results = results[offset:offset + limit]
        
        # Format results
        logs = []
        for result in paginated_results:
            logs.append({
                'log_id': str(result[0]),
                'user_id': str(result[1]),
                'action': result[2],
                'table_name': result[3],
                'record_id': str(result[4]) if result[4] else None,
                'old_values': json.loads(result[5]) if result[5] else None,
                'new_values': json.loads(result[6]) if result[6] else None,
                'ip_address': result[7],
                'user_agent': result[8],
                'created_at': result[9].isoformat() if result[9] else None,
                'user': {
                    'name': f"{result[10]} {result[11]}" if result[10] and result[11] else None,
                    'email': result[12]
                }
            })
        
        cursor.close()
        
        # Log admin action
        admin_logger.log_action(
            user['user_id'], 'READ', 'admin_logs',
            ip_address=event.get('requestContext', {}).get('identity', {}).get('sourceIp'),
            user_agent=event.get('headers', {}).get('User-Agent')
        )
        
        response_data = {
            'logs': logs,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': len(results),
                'pages': (len(results) + limit - 1) // limit
            }
        }
        
        return create_response(200, response_data)
        
    except Exception as e:
        logger.error(f"Error getting admin logs: {str(e)}")
        return create_response(500, {'error': 'Failed to retrieve admin logs'})
