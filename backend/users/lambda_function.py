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
    create_response, validate_email_domain
)

def lambda_handler(event: Dict[str, Any], context: LambdaContext) -> Dict[str, Any]:
    """Lambda handler for users CRUD operations"""
    
    try:
        # Initialize database connection
        db = DatabaseConnection()
        admin_logger = AdminLogger(db)
        
        # Get user from Cognito
        user = get_user_from_cognito(event)
        if not user:
            return create_response(401, {'error': 'Unauthorized'})
        
        # Get HTTP method and path parameters
        http_method = event['httpMethod']
        path_parameters = event.get('pathParameters') or {}
        user_id = path_parameters.get('user_id')
        
        # Get request body
        body = {}
        if event.get('body'):
            try:
                body = json.loads(event['body'])
            except json.JSONDecodeError:
                return create_response(400, {'error': 'Invalid JSON in request body'})
        
        # Route to appropriate handler
        if http_method == 'GET':
            if user_id:
                return get_user(db, admin_logger, user, user_id, event)
            else:
                return list_users(db, admin_logger, user, event)
        elif http_method == 'POST':
            return create_user(db, admin_logger, user, body, event)
        elif http_method == 'PUT':
            if not user_id:
                return create_response(400, {'error': 'User ID required for update'})
            return update_user(db, admin_logger, user, user_id, body, event)
        elif http_method == 'DELETE':
            if not user_id:
                return create_response(400, {'error': 'User ID required for deletion'})
            return delete_user(db, admin_logger, user, user_id, event)
        else:
            return create_response(405, {'error': 'Method not allowed'})
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})
    
    finally:
        if 'db' in locals():
            db.close_connection()

@tracer.capture_method
def get_user(db: DatabaseConnection, admin_logger: AdminLogger, 
             user: Dict[str, Any], user_id: str, event: Dict[str, Any]) -> Dict[str, Any]:
    """Get a specific user by ID"""
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT user_id, cognito_user_id, email, first_name, last_name,
                   role, phone_number, is_active, created_at, updated_at
            FROM users 
            WHERE user_id = %s
        """, (user_id,))
        
        result = cursor.fetchone()
        cursor.close()
        
        if not result:
            return create_response(404, {'error': 'User not found'})
        
        # Log admin action
        admin_logger.log_action(
            user['user_id'], 'READ', 'users', user_id,
            ip_address=event.get('requestContext', {}).get('identity', {}).get('sourceIp'),
            user_agent=event.get('headers', {}).get('User-Agent')
        )
        
        user_data = {
            'user_id': str(result[0]),
            'cognito_user_id': result[1],
            'email': result[2],
            'first_name': result[3],
            'last_name': result[4],
            'role': result[5],
            'phone_number': result[6],
            'is_active': result[7],
            'created_at': result[8].isoformat() if result[8] else None,
            'updated_at': result[9].isoformat() if result[9] else None
        }
        
        return create_response(200, user_data)
        
    except Exception as e:
        logger.error(f"Error getting user: {str(e)}")
        return create_response(500, {'error': 'Failed to retrieve user'})

@tracer.capture_method
def list_users(db: DatabaseConnection, admin_logger: AdminLogger, 
               user: Dict[str, Any], event: Dict[str, Any]) -> Dict[str, Any]:
    """List all users with pagination and filtering"""
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Get query parameters
        query_params = event.get('queryStringParameters') or {}
        page = int(query_params.get('page', 1))
        limit = min(int(query_params.get('limit', 20)), 100)
        role = query_params.get('role')
        is_active = query_params.get('is_active')
        search = query_params.get('search', '')
        
        # Build query
        base_query = """
            SELECT user_id, cognito_user_id, email, first_name, last_name,
                   role, phone_number, is_active, created_at, updated_at
            FROM users
        """
        
        params = []
        where_clauses = []
        
        if role:
            where_clauses.append("role = %s")
            params.append(role)
        
        if is_active is not None:
            where_clauses.append("is_active = %s")
            params.append(is_active.lower() == 'true')
        
        if search:
            where_clauses.append("""
                (first_name ILIKE %s OR last_name ILIKE %s OR email ILIKE %s)
            """)
            search_param = f"%{search}%"
            params.extend([search_param, search_param, search_param])
        
        if where_clauses:
            base_query += " WHERE " + " AND ".join(where_clauses)
        
        base_query += " ORDER BY created_at DESC"
        
        # Execute query
        cursor.execute(base_query, params)
        results = cursor.fetchall()
        
        # Apply pagination
        offset = (page - 1) * limit
        paginated_results = results[offset:offset + limit]
        
        # Format results
        users = []
        for result in paginated_results:
            users.append({
                'user_id': str(result[0]),
                'cognito_user_id': result[1],
                'email': result[2],
                'first_name': result[3],
                'last_name': result[4],
                'role': result[5],
                'phone_number': result[6],
                'is_active': result[7],
                'created_at': result[8].isoformat() if result[8] else None,
                'updated_at': result[9].isoformat() if result[9] else None
            })
        
        cursor.close()
        
        # Log admin action
        admin_logger.log_action(
            user['user_id'], 'LIST', 'users',
            ip_address=event.get('requestContext', {}).get('identity', {}).get('sourceIp'),
            user_agent=event.get('headers', {}).get('User-Agent')
        )
        
        response_data = {
            'users': users,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': len(results),
                'pages': (len(results) + limit - 1) // limit
            }
        }
        
        return create_response(200, response_data)
        
    except Exception as e:
        logger.error(f"Error listing users: {str(e)}")
        return create_response(500, {'error': 'Failed to retrieve users'})

@tracer.capture_method
def create_user(db: DatabaseConnection, admin_logger: AdminLogger, 
                user: Dict[str, Any], body: Dict[str, Any], 
                event: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new user (admin only)"""
    
    try:
        # Check if current user is admin
        if not is_admin_user(db, user['user_id']):
            return create_response(403, {'error': 'Admin access required'})
        
        # Validate required fields
        required_fields = ['cognito_user_id', 'email', 'first_name', 'last_name', 'role']
        for field in required_fields:
            if not body.get(field):
                return create_response(400, {'error': f'{field} is required'})
        
        # Validate email domain
        if not validate_email_domain(body['email']):
            return create_response(400, {'error': 'Only Gmail addresses are allowed'})
        
        # Validate role
        valid_roles = ['lawyer', 'secretary', 'admin']
        if body['role'] not in valid_roles:
            return create_response(400, {'error': f'Invalid role. Must be one of: {valid_roles}'})
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT user_id FROM users WHERE email = %s OR cognito_user_id = %s", 
                      (body['email'], body['cognito_user_id']))
        if cursor.fetchone():
            cursor.close()
            return create_response(400, {'error': 'User already exists'})
        
        # Insert new user
        cursor.execute("""
            INSERT INTO users (cognito_user_id, email, first_name, last_name,
                             role, phone_number, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING user_id
        """, (
            body['cognito_user_id'],
            body['email'],
            body['first_name'],
            body['last_name'],
            body['role'],
            body.get('phone_number'),
            body.get('is_active', True)
        ))
        
        new_user_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        
        # Log admin action
        admin_logger.log_action(
            user['user_id'], 'CREATE', 'users', str(new_user_id),
            new_values=body,
            ip_address=event.get('requestContext', {}).get('identity', {}).get('sourceIp'),
            user_agent=event.get('headers', {}).get('User-Agent')
        )
        
        return create_response(201, {
            'message': 'User created successfully',
            'user_id': str(new_user_id)
        })
        
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        return create_response(500, {'error': 'Failed to create user'})