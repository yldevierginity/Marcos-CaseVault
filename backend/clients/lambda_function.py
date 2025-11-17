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

logger = Logger()
tracer = Tracer()

def lambda_handler(event: Dict[str, Any], context: LambdaContext) -> Dict[str, Any]:
    """Lambda handler for clients CRUD operations"""
    
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
        client_id = path_parameters.get('client_id')
        
        # Get request body
        body = {}
        if event.get('body'):
            try:
                body = json.loads(event['body'])
            except json.JSONDecodeError:
                return create_response(400, {'error': 'Invalid JSON in request body'})
        
        # Route to appropriate handler
        if http_method == 'GET':
            if client_id:
                return get_client(db, admin_logger, user, client_id, event)
            else:
                return list_clients(db, admin_logger, user, event)
        elif http_method == 'POST':
            return create_client(db, admin_logger, user, body, event)
        elif http_method == 'PUT':
            if not client_id:
                return create_response(400, {'error': 'Client ID required for update'})
            return update_client(db, admin_logger, user, client_id, body, event)
        elif http_method == 'DELETE':
            if not client_id:
                return create_response(400, {'error': 'Client ID required for deletion'})
            return delete_client(db, admin_logger, user, client_id, event)
        else:
            return create_response(405, {'error': 'Method not allowed'})
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})
    
    finally:
        if 'db' in locals():
            db.close_connection()

@tracer.capture_method
def get_client(db: DatabaseConnection, admin_logger: AdminLogger, 
               user: Dict[str, Any], client_id: str, event: Dict[str, Any]) -> Dict[str, Any]:
    """Get a specific client by ID"""
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT client_id, first_name, middle_name, last_name, date_of_birth,
                   civil_status, phone_number, email, street_address, city, state,
                   zip_code, opposing_parties, notes, created_at, updated_at
            FROM clients 
            WHERE client_id = %s
        """, (client_id,))
        
        result = cursor.fetchone()
        cursor.close()
        
        if not result:
            return create_response(404, {'error': 'Client not found'})
        
        # Log admin action
        admin_logger.log_action(
            user['user_id'], 'READ', 'clients', client_id,
            ip_address=event.get('requestContext', {}).get('identity', {}).get('sourceIp'),
            user_agent=event.get('headers', {}).get('User-Agent')
        )
        
        client_data = {
            'client_id': str(result[0]),
            'first_name': result[1],
            'middle_name': result[2],
            'last_name': result[3],
            'date_of_birth': result[4].isoformat() if result[4] else None,
            'civil_status': result[5],
            'phone_number': result[6],
            'email': result[7],
            'address': {
                'street': result[8],
                'city': result[9],
                'state': result[10],
                'zip': result[11]
            },
            'opposing_parties': result[12],
            'notes': result[13],
            'created_at': result[14].isoformat() if result[14] else None,
            'updated_at': result[15].isoformat() if result[15] else None
        }
        
        return create_response(200, client_data)
        
    except Exception as e:
        logger.error(f"Error getting client: {str(e)}")
        return create_response(500, {'error': 'Failed to retrieve client'})

@tracer.capture_method
def list_clients(db: DatabaseConnection, admin_logger: AdminLogger, 
                user: Dict[str, Any], event: Dict[str, Any]) -> Dict[str, Any]:
    """List all clients with pagination and filtering"""
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Get query parameters
        query_params = event.get('queryStringParameters') or {}
        page = int(query_params.get('page', 1))
        limit = min(int(query_params.get('limit', 20)), 100)  # Max 100 per page
        search = query_params.get('search', '')
        
        # Build query
        base_query = """
            SELECT client_id, first_name, middle_name, last_name, date_of_birth,
                   civil_status, phone_number, email, street_address, city, state,
                   zip_code, opposing_parties, notes, created_at, updated_at
            FROM clients
        """
        
        params = []
        where_clauses = []
        
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
        clients = []
        for result in paginated_results:
            clients.append({
                'client_id': str(result[0]),
                'first_name': result[1],
                'middle_name': result[2],
                'last_name': result[3],
                'date_of_birth': result[4].isoformat() if result[4] else None,
                'civil_status': result[5],
                'phone_number': result[6],
                'email': result[7],
                'address': {
                    'street': result[8],
                    'city': result[9],
                    'state': result[10],
                    'zip': result[11]
                },
                'opposing_parties': result[12],
                'notes': result[13],
                'created_at': result[14].isoformat() if result[14] else None,
                'updated_at': result[15].isoformat() if result[15] else None
            })
        
        cursor.close()
        
        # Log admin action
        admin_logger.log_action(
            user['user_id'], 'LIST', 'clients',
            ip_address=event.get('requestContext', {}).get('identity', {}).get('sourceIp'),
            user_agent=event.get('headers', {}).get('User-Agent')
        )
        
        response_data = {
            'clients': clients,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': len(results),
                'pages': (len(results) + limit - 1) // limit
            }
        }
        
        return create_response(200, response_data)
        
    except Exception as e:
        logger.error(f"Error listing clients: {str(e)}")
        return create_response(500, {'error': 'Failed to retrieve clients'})

@tracer.capture_method
def create_client(db: DatabaseConnection, admin_logger: AdminLogger, 
                 user: Dict[str, Any], body: Dict[str, Any], 
                 event: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new client"""
    
    try:
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'date_of_birth']
        for field in required_fields:
            if not body.get(field):
                return create_response(400, {'error': f'{field} is required'})
        
        # Validate email domain if provided
        if body.get('email') and not validate_email_domain(body['email']):
            return create_response(400, {'error': 'Only Gmail addresses are allowed'})
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Insert new client
        cursor.execute("""
            INSERT INTO clients (first_name, middle_name, last_name, date_of_birth,
                               civil_status, phone_number, email, street_address, city,
                               state, zip_code, opposing_parties, notes, created_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING client_id
        """, (
            body['first_name'],
            body.get('middle_name'),
            body['last_name'],
            body['date_of_birth'],
            body.get('civil_status'),
            body.get('phone_number'),
            body.get('email'),
            body.get('address', {}).get('street'),
            body.get('address', {}).get('city'),
            body.get('address', {}).get('state'),
            body.get('address', {}).get('zip'),
            body.get('opposing_parties'),
            body.get('notes'),
            user['user_id']
        ))
        
        client_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        
        # Log admin action
        admin_logger.log_action(
            user['user_id'], 'CREATE', 'clients', str(client_id),
            new_values=body,
            ip_address=event.get('requestContext', {}).get('identity', {}).get('sourceIp'),
            user_agent=event.get('headers', {}).get('User-Agent')
        )
        
        return create_response(201, {
            'message': 'Client created successfully',
            'client_id': str(client_id)
        })
        
    except Exception as e:
        logger.error(f"Error creating client: {str(e)}")
        return create_response(500, {'error': 'Failed to create client'})

@tracer.capture_method
def update_client(db: DatabaseConnection, admin_logger: AdminLogger, 
                 user: Dict[str, Any], client_id: str, body: Dict[str, Any],
                 event: Dict[str, Any]) -> Dict[str, Any]:
    """Update an existing client"""
    
    try:
        # Validate email domain if provided
        if body.get('email') and not validate_email_domain(body['email']):
            return create_response(400, {'error': 'Only Gmail addresses are allowed'})
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Get current values for logging
        cursor.execute("""
            SELECT first_name, middle_name, last_name, date_of_birth,
                   civil_status, phone_number, email, street_address, city,
                   state, zip_code, opposing_parties, notes
            FROM clients WHERE client_id = %s
        """, (client_id,))
        
        current_values = cursor.fetchone()
        if not current_values:
            cursor.close()
            return create_response(404, {'error': 'Client not found'})
        
        # Update client
        cursor.execute("""
            UPDATE clients SET
                first_name = %s, middle_name = %s, last_name = %s, date_of_birth = %s,
                civil_status = %s, phone_number = %s, email = %s, street_address = %s,
                city = %s, state = %s, zip_code = %s, opposing_parties = %s, notes = %s
            WHERE client_id = %s
        """, (
            body.get('first_name', current_values[0]),
            body.get('middle_name', current_values[1]),
            body.get('last_name', current_values[2]),
            body.get('date_of_birth', current_values[3]),
            body.get('civil_status', current_values[4]),
            body.get('phone_number', current_values[5]),
            body.get('email', current_values[6]),
            body.get('address', {}).get('street', current_values[7]),
            body.get('address', {}).get('city', current_values[8]),
            body.get('address', {}).get('state', current_values[9]),
            body.get('address', {}).get('zip', current_values[10]),
            body.get('opposing_parties', current_values[11]),
            body.get('notes', current_values[12]),
            client_id
        ))
        
        conn.commit()
        cursor.close()
        
        # Log admin action
        old_values = {
            'first_name': current_values[0],
            'middle_name': current_values[1],
            'last_name': current_values[2],
            'date_of_birth': current_values[3].isoformat() if current_values[3] else None,
            'civil_status': current_values[4],
            'phone_number': current_values[5],
            'email': current_values[6],
            'address': {
                'street': current_values[7],
                'city': current_values[8],
                'state': current_values[9],
                'zip': current_values[10]
            },
            'opposing_parties': current_values[11],
            'notes': current_values[12]
        }
        
        admin_logger.log_action(
            user['user_id'], 'UPDATE', 'clients', client_id,
            old_values=old_values, new_values=body,
            ip_address=event.get('requestContext', {}).get('identity', {}).get('sourceIp'),
            user_agent=event.get('headers', {}).get('User-Agent')
        )
        
        return create_response(200, {'message': 'Client updated successfully'})
        
    except Exception as e:
        logger.error(f"Error updating client: {str(e)}")
        return create_response(500, {'error': 'Failed to update client'})

@tracer.capture_method
def delete_client(db: DatabaseConnection, admin_logger: AdminLogger, 
                 user: Dict[str, Any], client_id: str, 
                 event: Dict[str, Any]) -> Dict[str, Any]:
    """Delete a client"""
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Check if client exists and get current values for logging
        cursor.execute("""
            SELECT first_name, middle_name, last_name, date_of_birth,
                   civil_status, phone_number, email, street_address, city,
                   state, zip_code, opposing_parties, notes
            FROM clients WHERE client_id = %s
        """, (client_id,))
        
        current_values = cursor.fetchone()
        if not current_values:
            cursor.close()
            return create_response(404, {'error': 'Client not found'})
        
        # Delete client (cascade will handle related records)
        cursor.execute("DELETE FROM clients WHERE client_id = %s", (client_id,))
        conn.commit()
        cursor.close()
        
        # Log admin action
        old_values = {
            'first_name': current_values[0],
            'middle_name': current_values[1],
            'last_name': current_values[2],
            'date_of_birth': current_values[3].isoformat() if current_values[3] else None,
            'civil_status': current_values[4],
            'phone_number': current_values[5],
            'email': current_values[6],
            'address': {
                'street': current_values[7],
                'city': current_values[8],
                'state': current_values[9],
                'zip': current_values[10]
            },
            'opposing_parties': current_values[11],
            'notes': current_values[12]
        }
        
        admin_logger.log_action(
            user['user_id'], 'DELETE', 'clients', client_id,
            old_values=old_values,
            ip_address=event.get('requestContext', {}).get('identity', {}).get('sourceIp'),
            user_agent=event.get('headers', {}).get('User-Agent')
        )
        
        return create_response(200, {'message': 'Client deleted successfully'})
        
    except Exception as e:
        logger.error(f"Error deleting client: {str(e)}")
        return create_response(500, {'error': 'Failed to delete client'})
