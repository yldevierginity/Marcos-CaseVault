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
    """Lambda handler for hearings CRUD operations"""
    
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
        hearing_id = path_parameters.get('hearing_id')
        
        # Get request body
        body = {}
        if event.get('body'):
            try:
                body = json.loads(event['body'])
            except json.JSONDecodeError:
                return create_response(400, {'error': 'Invalid JSON in request body'})
        
        # Route to appropriate handler
        if http_method == 'GET':
            if hearing_id:
                return get_hearing(db, admin_logger, user, hearing_id, event)
            else:
                return list_hearings(db, admin_logger, user, event)
        elif http_method == 'POST':
            return create_hearing(db, admin_logger, user, body, event)
        elif http_method == 'PUT':
            if not hearing_id:
                return create_response(400, {'error': 'Hearing ID required for update'})
            return update_hearing(db, admin_logger, user, hearing_id, body, event)
        elif http_method == 'DELETE':
            if not hearing_id:
                return create_response(400, {'error': 'Hearing ID required for deletion'})
            return delete_hearing(db, admin_logger, user, hearing_id, event)
        else:
            return create_response(405, {'error': 'Method not allowed'})
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})
    
    finally:
        if 'db' in locals():
            db.close_connection()

@tracer.capture_method
def get_hearing(db: DatabaseConnection, admin_logger: AdminLogger, 
                user: Dict[str, Any], hearing_id: str, event: Dict[str, Any]) -> Dict[str, Any]:
    """Get a specific hearing by ID"""
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT h.hearing_id, h.case_id, h.hearing_type, h.hearing_date,
                   h.location, h.judge_name, h.description, h.status, h.outcome,
                   h.notes, h.created_at, h.updated_at,
                   c.case_title, cl.first_name, cl.last_name
            FROM hearings h
            LEFT JOIN cases c ON h.case_id = c.case_id
            LEFT JOIN clients cl ON c.client_id = cl.client_id
            WHERE h.hearing_id = %s
        """, (hearing_id,))
        
        result = cursor.fetchone()
        cursor.close()
        
        if not result:
            return create_response(404, {'error': 'Hearing not found'})
        
        # Log admin action
        admin_logger.log_action(
            user['user_id'], 'READ', 'hearings', hearing_id,
            ip_address=event.get('requestContext', {}).get('identity', {}).get('sourceIp'),
            user_agent=event.get('headers', {}).get('User-Agent')
        )
        
        hearing_data = {
            'hearing_id': str(result[0]),
            'case_id': str(result[1]),
            'hearing_type': result[2],
            'hearing_date': result[3].isoformat() if result[3] else None,
            'location': result[4],
            'judge_name': result[5],
            'description': result[6],
            'status': result[7],
            'outcome': result[8],
            'notes': result[9],
            'created_at': result[10].isoformat() if result[10] else None,
            'updated_at': result[11].isoformat() if result[11] else None,
            'case': {
                'title': result[12],
                'client_name': f"{result[13]} {result[14]}" if result[13] and result[14] else None
            }
        }
        
        return create_response(200, hearing_data)
        
    except Exception as e:
        logger.error(f"Error getting hearing: {str(e)}")
        return create_response(500, {'error': 'Failed to retrieve hearing'})

@tracer.capture_method
def list_hearings(db: DatabaseConnection, admin_logger: AdminLogger, 
                  user: Dict[str, Any], event: Dict[str, Any]) -> Dict[str, Any]:
    """List all hearings with pagination and filtering"""
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Get query parameters
        query_params = event.get('queryStringParameters') or {}
        page = int(query_params.get('page', 1))
        limit = min(int(query_params.get('limit', 20)), 100)
        status = query_params.get('status')
        case_id = query_params.get('case_id')
        upcoming_only = query_params.get('upcoming_only', 'false').lower() == 'true'
        
        # Build query
        base_query = """
            SELECT h.hearing_id, h.case_id, h.hearing_type, h.hearing_date,
                   h.location, h.judge_name, h.description, h.status, h.outcome,
                   h.notes, h.created_at, h.updated_at,
                   c.case_title, cl.first_name, cl.last_name
            FROM hearings h
            LEFT JOIN cases c ON h.case_id = c.case_id
            LEFT JOIN clients cl ON c.client_id = cl.client_id
        """
        
        params = []
        where_clauses = []
        
        if status:
            where_clauses.append("h.status = %s")
            params.append(status)
        
        if case_id:
            where_clauses.append("h.case_id = %s")
            params.append(case_id)
        
        if upcoming_only:
            where_clauses.append("h.hearing_date >= CURRENT_TIMESTAMP")
        
        if where_clauses:
            base_query += " WHERE " + " AND ".join(where_clauses)
        
        base_query += " ORDER BY h.hearing_date ASC"
        
        # Execute query
        cursor.execute(base_query, params)
        results = cursor.fetchall()
        
        # Apply pagination
        offset = (page - 1) * limit
        paginated_results = results[offset:offset + limit]
        
        # Format results
        hearings = []
        for result in paginated_results:
            hearings.append({
                'hearing_id': str(result[0]),
                'case_id': str(result[1]),
                'hearing_type': result[2],
                'hearing_date': result[3].isoformat() if result[3] else None,
                'location': result[4],
                'judge_name': result[5],
                'description': result[6],
                'status': result[7],
                'outcome': result[8],
                'notes': result[9],
                'created_at': result[10].isoformat() if result[10] else None,
                'updated_at': result[11].isoformat() if result[11] else None,
                'case': {
                    'title': result[12],
                    'client_name': f"{result[13]} {result[14]}" if result[13] and result[14] else None
                }
            })
        
        cursor.close()
        
        # Log admin action
        admin_logger.log_action(
            user['user_id'], 'LIST', 'hearings',
            ip_address=event.get('requestContext', {}).get('identity', {}).get('sourceIp'),
            user_agent=event.get('headers', {}).get('User-Agent')
        )
        
        response_data = {
            'hearings': hearings,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': len(results),
                'pages': (len(results) + limit - 1) // limit
            }
        }
        
        return create_response(200, response_data)
        
    except Exception as e:
        logger.error(f"Error listing hearings: {str(e)}")
        return create_response(500, {'error': 'Failed to retrieve hearings'})

@tracer.capture_method
def create_hearing(db: DatabaseConnection, admin_logger: AdminLogger, 
                   user: Dict[str, Any], body: Dict[str, Any], 
                   event: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new hearing"""
    
    try:
        # Validate required fields
        required_fields = ['case_id', 'hearing_type', 'hearing_date']
        for field in required_fields:
            if not body.get(field):
                return create_response(400, {'error': f'{field} is required'})
        
        # Validate status
        valid_statuses = ['scheduled', 'completed', 'cancelled', 'postponed']
        if body.get('status') and body['status'] not in valid_statuses:
            return create_response(400, {'error': f'Invalid status. Must be one of: {valid_statuses}'})
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Verify case exists
        cursor.execute("SELECT case_id FROM cases WHERE case_id = %s", (body['case_id'],))
        if not cursor.fetchone():
            cursor.close()
            return create_response(400, {'error': 'Case not found'})
        
        # Insert new hearing
        cursor.execute("""
            INSERT INTO hearings (case_id, hearing_type, hearing_date, location,
                                judge_name, description, status, outcome, notes, created_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING hearing_id
        """, (
            body['case_id'],
            body['hearing_type'],
            body['hearing_date'],
            body.get('location'),
            body.get('judge_name'),
            body.get('description'),
            body.get('status', 'scheduled'),
            body.get('outcome'),
            body.get('notes'),
            user['user_id']
        ))
        
        hearing_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        
        # Log admin action
        admin_logger.log_action(
            user['user_id'], 'CREATE', 'hearings', str(hearing_id),
            new_values=body,
            ip_address=event.get('requestContext', {}).get('identity', {}).get('sourceIp'),
            user_agent=event.get('headers', {}).get('User-Agent')
        )
        
        return create_response(201, {
            'message': 'Hearing created successfully',
            'hearing_id': str(hearing_id)
        })
        
    except Exception as e:
        logger.error(f"Error creating hearing: {str(e)}")
        return create_response(500, {'error': 'Failed to create hearing'})

@tracer.capture_method
def update_hearing(db: DatabaseConnection, admin_logger: AdminLogger, 
                   user: Dict[str, Any], hearing_id: str, body: Dict[str, Any],
                   event: Dict[str, Any]) -> Dict[str, Any]:
    """Update an existing hearing"""
    
    try:
        # Validate status if provided
        valid_statuses = ['scheduled', 'completed', 'cancelled', 'postponed']
        if body.get('status') and body['status'] not in valid_statuses:
            return create_response(400, {'error': f'Invalid status. Must be one of: {valid_statuses}'})
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Get current values for logging
        cursor.execute("""
            SELECT case_id, hearing_type, hearing_date, location, judge_name,
                   description, status, outcome, notes
            FROM hearings WHERE hearing_id = %s
        """, (hearing_id,))
        
        current_values = cursor.fetchone()
        if not current_values:
            cursor.close()
            return create_response(404, {'error': 'Hearing not found'})
        
        # Update hearing
        cursor.execute("""
            UPDATE hearings SET
                hearing_type = %s, hearing_date = %s, location = %s,
                judge_name = %s, description = %s, status = %s, outcome = %s, notes = %s
            WHERE hearing_id = %s
        """, (
            body.get('hearing_type', current_values[1]),
            body.get('hearing_date', current_values[2]),
            body.get('location', current_values[3]),
            body.get('judge_name', current_values[4]),
            body.get('description', current_values[5]),
            body.get('status', current_values[6]),
            body.get('outcome', current_values[7]),
            body.get('notes', current_values[8]),
            hearing_id
        ))
        
        conn.commit()
        cursor.close()
        
        # Log admin action
        old_values = {
            'hearing_type': current_values[1],
            'hearing_date': current_values[2].isoformat() if current_values[2] else None,
            'location': current_values[3],
            'judge_name': current_values[4],
            'description': current_values[5],
            'status': current_values[6],
            'outcome': current_values[7],
            'notes': current_values[8]
        }
        
        admin_logger.log_action(
            user['user_id'], 'UPDATE', 'hearings', hearing_id,
            old_values=old_values, new_values=body,
            ip_address=event.get('requestContext', {}).get('identity', {}).get('sourceIp'),
            user_agent=event.get('headers', {}).get('User-Agent')
        )
        
        return create_response(200, {'message': 'Hearing updated successfully'})
        
    except Exception as e:
        logger.error(f"Error updating hearing: {str(e)}")
        return create_response(500, {'error': 'Failed to update hearing'})

@tracer.capture_method
def delete_hearing(db: DatabaseConnection, admin_logger: AdminLogger, 
                   user: Dict[str, Any], hearing_id: str, 
                   event: Dict[str, Any]) -> Dict[str, Any]:
    """Delete a hearing"""
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Check if hearing exists and get current values for logging
        cursor.execute("""
            SELECT case_id, hearing_type, hearing_date, location, judge_name,
                   description, status, outcome, notes
            FROM hearings WHERE hearing_id = %s
        """, (hearing_id,))
        
        current_values = cursor.fetchone()
        if not current_values:
            cursor.close()
            return create_response(404, {'error': 'Hearing not found'})
        
        # Delete hearing
        cursor.execute("DELETE FROM hearings WHERE hearing_id = %s", (hearing_id,))
        conn.commit()
        cursor.close()
        
        # Log admin action
        old_values = {
            'hearing_type': current_values[1],
            'hearing_date': current_values[2].isoformat() if current_values[2] else None,
            'location': current_values[3],
            'judge_name': current_values[4],
            'description': current_values[5],
            'status': current_values[6],
            'outcome': current_values[7],
            'notes': current_values[8]
        }
        
        admin_logger.log_action(
            user['user_id'], 'DELETE', 'hearings', hearing_id,
            old_values=old_values,
            ip_address=event.get('requestContext', {}).get('identity', {}).get('sourceIp'),
            user_agent=event.get('headers', {}).get('User-Agent')
        )
        
        return create_response(200, {'message': 'Hearing deleted successfully'})
        
    except Exception as e:
        logger.error(f"Error deleting hearing: {str(e)}")
        return create_response(500, {'error': 'Failed to delete hearing'})
