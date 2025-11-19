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
    """Lambda handler for search operations"""
    
    try:
        # Initialize database connection
        db = DatabaseConnection()
        admin_logger = AdminLogger(db)
        
        # Get user from Cognito
        user = get_user_from_cognito(event)
        if not user:
            return create_response(401, {'error': 'Unauthorized'})
        
        # Get request body
        body = {}
        if event.get('body'):
            try:
                body = json.loads(event['body'])
            except json.JSONDecodeError:
                return create_response(400, {'error': 'Invalid JSON in request body'})
        
        search_query = body.get('query', '').strip()
        search_type = body.get('type', 'all')  # all, clients, cases, hearings
        page = int(body.get('page', 1))
        limit = min(int(body.get('limit', 20)), 100)
        
        if not search_query:
            return create_response(400, {'error': 'Search query is required'})
        
        # Perform search based on type
        if search_type == 'clients':
            return search_clients(db, admin_logger, user, search_query, page, limit, event)
        
        return create_response(200, {'message': 'Search handler initialized'})
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})
    
    finally:
        if 'db' in locals():
            db.close_connection()

@tracer.capture_method
def search_clients(db: DatabaseConnection, admin_logger: AdminLogger, 
                  user: Dict[str, Any], query: str, page: int, limit: int,
                  event: Dict[str, Any]) -> Dict[str, Any]:
    """Search clients by name, email, or other fields"""
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Calculate offset for pagination
        offset = (page - 1) * limit
        
        # Search query with full-text search capabilities
        search_sql = """
            SELECT 
                c.client_id,
                c.first_name,
                c.last_name,
                c.email,
                c.phone,
                c.address,
                c.date_of_birth,
                c.created_at,
                c.updated_at,
                COUNT(*) OVER() as total_count
            FROM clients c
            WHERE 
                c.first_name ILIKE %s OR
                c.last_name ILIKE %s OR
                c.email ILIKE %s OR
                c.phone ILIKE %s OR
                c.address ILIKE %s OR
                CONCAT(c.first_name, ' ', c.last_name) ILIKE %s
            ORDER BY 
                CASE 
                    WHEN c.first_name ILIKE %s OR c.last_name ILIKE %s THEN 1
                    WHEN c.email ILIKE %s THEN 2
                    ELSE 3
                END,
                c.last_name, c.first_name
            LIMIT %s OFFSET %s
        """
        
        search_pattern = f"%{query}%"
        cursor.execute(search_sql, (
            search_pattern, search_pattern, search_pattern, search_pattern, 
            search_pattern, search_pattern, search_pattern, search_pattern,
            search_pattern, limit, offset
        ))
        
        results = cursor.fetchall()
        
        if not results:
            # Log the search attempt
            admin_logger.log_action(
                user['user_id'], 'SEARCH_CLIENTS', 
                f"No results found for query: {query}", event
            )
            
            return create_response(200, {
                'clients': [],
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'total': 0,
                    'total_pages': 0
                },
                'query': query
            })
        
        # Format results
        clients = []
        total_count = results[0][9] if results else 0
        
        for row in results:
            client = {
                'client_id': row[0],
                'first_name': row[1],
                'last_name': row[2],
                'email': row[3],
                'phone': row[4],
                'address': row[5],
                'date_of_birth': row[6].isoformat() if row[6] else None,
                'created_at': row[7].isoformat() if row[7] else None,
                'updated_at': row[8].isoformat() if row[8] else None
            }
            clients.append(client)
        
        # Calculate pagination info
        total_pages = (total_count + limit - 1) // limit
        
        # Log successful search
        admin_logger.log_action(
            user['user_id'], 'SEARCH_CLIENTS', 
            f"Found {len(clients)} clients for query: {query}", event
        )
        
        return create_response(200, {
            'clients': clients,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'total_pages': total_pages
            },
            'query': query
        })
        
    except Exception as e:
        logger.error(f"Error searching clients: {str(e)}")
        admin_logger.log_action(
            user['user_id'], 'SEARCH_CLIENTS_ERROR', 
            f"Error searching clients: {str(e)}", event
        )
        return create_response(500, {'error': 'Failed to search clients'})
