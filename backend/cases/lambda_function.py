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
    """Lambda handler for cases CRUD operations"""
    
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
        case_id = path_parameters.get('case_id')
        
        # Get request body
        body = {}
        if event.get('body'):
            try:
                body = json.loads(event['body'])
            except json.JSONDecodeError:
                return create_response(400, {'error': 'Invalid JSON in request body'})
        
        # Route to appropriate handler
        if http_method == 'GET':
            if case_id:
                return get_case(db, admin_logger, user, case_id, event)
            else:
                return list_cases(db, admin_logger, user, event)
        elif http_method == 'POST':
            return create_case(db, admin_logger, user, body, event)
        elif http_method == 'PUT':
            if not case_id:
                return create_response(400, {'error': 'Case ID required for update'})
            return update_case(db, admin_logger, user, case_id, body, event)
        elif http_method == 'DELETE':
            if not case_id:
                return create_response(400, {'error': 'Case ID required for deletion'})
            return delete_case(db, admin_logger, user, case_id, event)
        else:
            return create_response(405, {'error': 'Method not allowed'})
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})
    
    finally:
        if 'db' in locals():
            db.close_connection()

@tracer.capture_method
def get_case(db: DatabaseConnection, admin_logger: AdminLogger, 
             user: Dict[str, Any], case_id: str, event: Dict[str, Any]) -> Dict[str, Any]:
    """Get a specific case by ID"""
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT c.case_id, c.client_id, c.assigned_lawyer_id, c.case_title,
                   c.case_type, c.status, c.description, c.priority, c.estimated_value,
                   c.start_date, c.end_date, c.created_at, c.updated_at,
                   cl.first_name, cl.last_name, cl.email,
                   u.first_name as lawyer_first_name, u.last_name as lawyer_last_name
            FROM cases c
            LEFT JOIN clients cl ON c.client_id = cl.client_id
            LEFT JOIN users u ON c.assigned_lawyer_id = u.user_id
            WHERE c.case_id = %s
        """, (case_id,))
        
        result = cursor.fetchone()
        cursor.close()
        
        if not result:
            return create_response(404, {'error': 'Case not found'})
        
        # Log admin action
        admin_logger.log_action(
            user['user_id'], 'READ', 'cases', case_id,
            ip_address=event.get('requestContext', {}).get('identity', {}).get('sourceIp'),
            user_agent=event.get('headers', {}).get('User-Agent')
        )
        
        case_data = {
            'case_id': str(result[0]),
            'client_id': str(result[1]),
            'assigned_lawyer_id': str(result[2]) if result[2] else None,
            'case_title': result[3],
            'case_type': result[4],
            'status': result[5],
            'description': result[6],
            'priority': result[7],
            'estimated_value': float(result[8]) if result[8] else None,
            'start_date': result[9].isoformat() if result[9] else None,
            'end_date': result[10].isoformat() if result[10] else None,
            'created_at': result[11].isoformat() if result[11] else None,
            'updated_at': result[12].isoformat() if result[12] else None,
            'client': {
                'name': f"{result[13]} {result[14]}" if result[13] and result[14] else None,
                'email': result[15]
            },
            'assigned_lawyer': {
                'name': f"{result[16]} {result[17]}" if result[16] and result[17] else None
            }
        }
        
        return create_response(200, case_data)
        
    except Exception as e:
        logger.error(f"Error getting case: {str(e)}")
        return create_response(500, {'error': 'Failed to retrieve case'})

@tracer.capture_method
def list_cases(db: DatabaseConnection, admin_logger: AdminLogger, 
              user: Dict[str, Any], event: Dict[str, Any]) -> Dict[str, Any]:
    """List all cases with pagination and filtering"""
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Get query parameters
        query_params = event.get('queryStringParameters') or {}
        page = int(query_params.get('page', 1))
        limit = min(int(query_params.get('limit', 20)), 100)
        status = query_params.get('status')
        case_type = query_params.get('case_type')
        lawyer_id = query_params.get('lawyer_id')
        search = query_params.get('search', '')
        
        # Build query
        base_query = """
            SELECT c.case_id, c.client_id, c.assigned_lawyer_id, c.case_title,
                   c.case_type, c.status, c.description, c.priority, c.estimated_value,
                   c.start_date, c.end_date, c.created_at, c.updated_at,
                   cl.first_name, cl.last_name, cl.email,
                   u.first_name as lawyer_first_name, u.last_name as lawyer_last_name
            FROM cases c
            LEFT JOIN clients cl ON c.client_id = cl.client_id
            LEFT JOIN users u ON c.assigned_lawyer_id = u.user_id
        """
        
        params = []
        where_clauses = []
        
        if status:
            where_clauses.append("c.status = %s")
            params.append(status)
        
        if case_type:
            where_clauses.append("c.case_type = %s")
            params.append(case_type)
        
        if lawyer_id:
            where_clauses.append("c.assigned_lawyer_id = %s")
            params.append(lawyer_id)
        
        if search:
            where_clauses.append("""
                (c.case_title ILIKE %s OR c.description ILIKE %s OR 
                 cl.first_name ILIKE %s OR cl.last_name ILIKE %s)
            """)
            search_param = f"%{search}%"
            params.extend([search_param, search_param, search_param, search_param])
        
        if where_clauses:
            base_query += " WHERE " + " AND ".join(where_clauses)
        
        base_query += " ORDER BY c.created_at DESC"
        
        # Execute query
        cursor.execute(base_query, params)
        results = cursor.fetchall()
        
        # Apply pagination
        offset = (page - 1) * limit
        paginated_results = results[offset:offset + limit]
        
        # Format results
        cases = []
        for result in paginated_results:
            cases.append({
                'case_id': str(result[0]),
                'client_id': str(result[1]),
                'assigned_lawyer_id': str(result[2]) if result[2] else None,
                'case_title': result[3],
                'case_type': result[4],
                'status': result[5],
                'description': result[6],
                'priority': result[7],
                'estimated_value': float(result[8]) if result[8] else None,
                'start_date': result[9].isoformat() if result[9] else None,
                'end_date': result[10].isoformat() if result[10] else None,
                'created_at': result[11].isoformat() if result[11] else None,
                'updated_at': result[12].isoformat() if result[12] else None,
                'client': {
                    'name': f"{result[13]} {result[14]}" if result[13] and result[14] else None,
                    'email': result[15]
                },
                'assigned_lawyer': {
                    'name': f"{result[16]} {result[17]}" if result[16] and result[17] else None
                }
            })
        
        cursor.close()
        
        # Log admin action
        admin_logger.log_action(
            user['user_id'], 'LIST', 'cases',
            ip_address=event.get('requestContext', {}).get('identity', {}).get('sourceIp'),
            user_agent=event.get('headers', {}).get('User-Agent')
        )
        
        response_data = {
            'cases': cases,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': len(results),
                'pages': (len(results) + limit - 1) // limit
            }
        }
        
        return create_response(200, response_data)
        
    except Exception as e:
        logger.error(f"Error listing cases: {str(e)}")
        return create_response(500, {'error': 'Failed to retrieve cases'})

@tracer.capture_method
def create_case(db: DatabaseConnection, admin_logger: AdminLogger, 
                user: Dict[str, Any], body: Dict[str, Any], 
                event: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new case"""
    
    try:
        # Validate required fields
        required_fields = ['client_id', 'case_title', 'case_type']
        for field in required_fields:
            if not body.get(field):
                return create_response(400, {'error': f'{field} is required'})
        
        # Validate status and priority
        valid_statuses = ['active', 'pending', 'closed']
        valid_priorities = ['low', 'medium', 'high', 'urgent']
        
        if body.get('status') and body['status'] not in valid_statuses:
            return create_response(400, {'error': f'Invalid status. Must be one of: {valid_statuses}'})
        
        if body.get('priority') and body['priority'] not in valid_priorities:
            return create_response(400, {'error': f'Invalid priority. Must be one of: {valid_priorities}'})
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Verify client exists
        cursor.execute("SELECT client_id FROM clients WHERE client_id = %s", (body['client_id'],))
        if not cursor.fetchone():
            cursor.close()
            return create_response(400, {'error': 'Client not found'})
        
        # Verify lawyer exists if assigned
        if body.get('assigned_lawyer_id'):
            cursor.execute("""
                SELECT user_id FROM users 
                WHERE user_id = %s AND role = 'lawyer' AND is_active = TRUE
            """, (body['assigned_lawyer_id'],))
            if not cursor.fetchone():
                cursor.close()
                return create_response(400, {'error': 'Assigned lawyer not found or inactive'})
        
        # Insert new case
        cursor.execute("""
            INSERT INTO cases (client_id, assigned_lawyer_id, case_title, case_type,
                             status, description, priority, estimated_value, start_date,
                             end_date, created_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING case_id
        """, (
            body['client_id'],
            body.get('assigned_lawyer_id'),
            body['case_title'],
            body['case_type'],
            body.get('status', 'active'),
            body.get('description'),
            body.get('priority', 'medium'),
            body.get('estimated_value'),
            body.get('start_date'),
            body.get('end_date'),
            user['user_id']
        ))
        
        case_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        
        # Log admin action
        admin_logger.log_action(
            user['user_id'], 'CREATE', 'cases', str(case_id),
            new_values=body,
            ip_address=event.get('requestContext', {}).get('identity', {}).get('sourceIp'),
            user_agent=event.get('headers', {}).get('User-Agent')
        )
        
        return create_response(201, {
            'message': 'Case created successfully',
            'case_id': str(case_id)
        })
        
    except Exception as e:
        logger.error(f"Error creating case: {str(e)}")
        return create_response(500, {'error': 'Failed to create case'})

@tracer.capture_method
def update_case(db: DatabaseConnection, admin_logger: AdminLogger, 
                user: Dict[str, Any], case_id: str, body: Dict[str, Any],
                event: Dict[str, Any]) -> Dict[str, Any]:
    """Update an existing case"""
    
    try:
        # Validate status and priority if provided
        valid_statuses = ['active', 'pending', 'closed']
        valid_priorities = ['low', 'medium', 'high', 'urgent']
        
        if body.get('status') and body['status'] not in valid_statuses:
            return create_response(400, {'error': f'Invalid status. Must be one of: {valid_statuses}'})
        
        if body.get('priority') and body['priority'] not in valid_priorities:
            return create_response(400, {'error': f'Invalid priority. Must be one of: {valid_priorities}'})
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Get current values for logging
        cursor.execute("""
            SELECT client_id, assigned_lawyer_id, case_title, case_type,
                   status, description, priority, estimated_value, start_date, end_date
            FROM cases WHERE case_id = %s
        """, (case_id,))
        
        current_values = cursor.fetchone()
        if not current_values:
            cursor.close()
            return create_response(404, {'error': 'Case not found'})
        
        # Verify lawyer exists if being assigned
        if body.get('assigned_lawyer_id'):
            cursor.execute("""
                SELECT user_id FROM users 
                WHERE user_id = %s AND role = 'lawyer' AND is_active = TRUE
            """, (body['assigned_lawyer_id'],))
            if not cursor.fetchone():
                cursor.close()
                return create_response(400, {'error': 'Assigned lawyer not found or inactive'})
        
        # Update case
        cursor.execute("""
            UPDATE cases SET
                assigned_lawyer_id = %s, case_title = %s, case_type = %s,
                status = %s, description = %s, priority = %s, estimated_value = %s,
                start_date = %s, end_date = %s
            WHERE case_id = %s
        """, (
            body.get('assigned_lawyer_id', current_values[1]),
            body.get('case_title', current_values[2]),
            body.get('case_type', current_values[3]),
            body.get('status', current_values[4]),
            body.get('description', current_values[5]),
            body.get('priority', current_values[6]),
            body.get('estimated_value', current_values[7]),
            body.get('start_date', current_values[8]),
            body.get('end_date', current_values[9]),
            case_id
        ))
        
        conn.commit()
        cursor.close()
        
        # Log admin action
        old_values = {
            'assigned_lawyer_id': str(current_values[1]) if current_values[1] else None,
            'case_title': current_values[2],
            'case_type': current_values[3],
            'status': current_values[4],
            'description': current_values[5],
            'priority': current_values[6],
            'estimated_value': float(current_values[7]) if current_values[7] else None,
            'start_date': current_values[8].isoformat() if current_values[8] else None,
            'end_date': current_values[9].isoformat() if current_values[9] else None
        }
        
        admin_logger.log_action(
            user['user_id'], 'UPDATE', 'cases', case_id,
            old_values=old_values, new_values=body,
            ip_address=event.get('requestContext', {}).get('identity', {}).get('sourceIp'),
            user_agent=event.get('headers', {}).get('User-Agent')
        )
        
        return create_response(200, {'message': 'Case updated successfully'})
        
    except Exception as e:
        logger.error(f"Error updating case: {str(e)}")
        return create_response(500, {'error': 'Failed to update case'})

@tracer.capture_method
def delete_case(db: DatabaseConnection, admin_logger: AdminLogger, 
                user: Dict[str, Any], case_id: str, 
                event: Dict[str, Any]) -> Dict[str, Any]:
    """Delete a case"""
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Check if case exists and get current values for logging
        cursor.execute("""
            SELECT client_id, assigned_lawyer_id, case_title, case_type,
                   status, description, priority, estimated_value, start_date, end_date
            FROM cases WHERE case_id = %s
        """, (case_id,))
        
        current_values = cursor.fetchone()
        if not current_values:
            cursor.close()
            return create_response(404, {'error': 'Case not found'})
        
        # Delete case (cascade will handle related records)
        cursor.execute("DELETE FROM cases WHERE case_id = %s", (case_id,))
        conn.commit()
        cursor.close()
        
        # Log admin action
        old_values = {
            'assigned_lawyer_id': str(current_values[1]) if current_values[1] else None,
            'case_title': current_values[2],
            'case_type': current_values[3],
            'status': current_values[4],
            'description': current_values[5],
            'priority': current_values[6],
            'estimated_value': float(current_values[7]) if current_values[7] else None,
            'start_date': current_values[8].isoformat() if current_values[8] else None,
            'end_date': current_values[9].isoformat() if current_values[9] else None
        }
        
        admin_logger.log_action(
            user['user_id'], 'DELETE', 'cases', case_id,
            old_values=old_values,
            ip_address=event.get('requestContext', {}).get('identity', {}).get('sourceIp'),
            user_agent=event.get('headers', {}).get('User-Agent')
        )
        
        return create_response(200, {'message': 'Case deleted successfully'})
        
    except Exception as e:
        logger.error(f"Error deleting case: {str(e)}")
        return create_response(500, {'error': 'Failed to delete case'})
