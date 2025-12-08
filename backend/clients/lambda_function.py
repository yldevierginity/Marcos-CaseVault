import json
import os
from database_utils import DatabaseConnection

def create_cors_response(status_code: int, body: dict) -> dict:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Credentials': 'true'
        },
        'body': json.dumps(body)
    }

def lambda_handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return create_cors_response(200, {'message': 'OK'})
    
    db = DatabaseConnection()
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        http_method = event.get('httpMethod', 'GET')
        path_parameters = event.get('pathParameters') or {}
        client_id = path_parameters.get('id')
        
        if http_method == 'GET':
            if client_id:
                cursor.execute("""
                    SELECT client_id, first_name, middle_name, last_name, date_of_birth,
                           civil_status, phone_number, email, street, city, state, zip_code,
                           opposing_parties, notes, created_at, updated_at
                    FROM clients WHERE client_id = %s
                """, (client_id,))
                
                row = cursor.fetchone()
                if not row:
                    return create_cors_response(404, {'error': 'Client not found'})
                
                client = {
                    'clientId': str(row[0]),
                    'firstName': row[1] or '',
                    'middleName': row[2] or '',
                    'lastName': row[3] or '',
                    'dateOfBirth': row[4].isoformat() if row[4] else '',
                    'civilStatus': row[5] or '',
                    'phoneNumber': row[6] or '',
                    'email': row[7] or '',
                    'address': {
                        'street': row[8] or '',
                        'city': row[9] or '',
                        'state': row[10] or '',
                        'zip': row[11] or ''
                    },
                    'opposingParties': row[12] or '',
                    'notes': row[13] or '',
                    'dateAdded': row[14].isoformat() if row[14] else '',
                    'updatedAt': row[15].isoformat() if row[15] else ''
                }
                return create_cors_response(200, client)
            else:
                query_params = event.get('queryStringParameters') or {}
                page = int(query_params.get('page', 1))
                limit = int(query_params.get('limit', 100))
                offset = (page - 1) * limit
                
                cursor.execute("""
                    SELECT client_id, first_name, middle_name, last_name, date_of_birth,
                           civil_status, phone_number, email, street, city, state, zip_code,
                           opposing_parties, notes, created_at, updated_at
                    FROM clients ORDER BY created_at DESC LIMIT %s OFFSET %s
                """, (limit, offset))
                
                rows = cursor.fetchall()
                clients = []
                
                for row in rows:
                    clients.append({
                        'clientId': str(row[0]),
                        'firstName': row[1] or '',
                        'middleName': row[2] or '',
                        'lastName': row[3] or '',
                        'dateOfBirth': row[4].isoformat() if row[4] else '',
                        'civilStatus': row[5] or '',
                        'phoneNumber': row[6] or '',
                        'email': row[7] or '',
                        'address': {
                            'street': row[8] or '',
                            'city': row[9] or '',
                            'state': row[10] or '',
                            'zip': row[11] or ''
                        },
                        'opposingParties': row[12] or '',
                        'notes': row[13] or '',
                        'dateAdded': row[14].isoformat() if row[14] else '',
                        'updatedAt': row[15].isoformat() if row[15] else ''
                    })
                
                cursor.execute("SELECT COUNT(*) FROM clients")
                total = cursor.fetchone()[0]
                
                return create_cors_response(200, {
                    'clients': clients,
                    'pagination': {
                        'page': page,
                        'limit': limit,
                        'total': total
                    }
                })
        
        elif http_method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute("""
                INSERT INTO clients (first_name, middle_name, last_name, date_of_birth,
                                   civil_status, phone_number, email, street, city, state, 
                                   zip_code, opposing_parties, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING client_id, created_at
            """, (
                body.get('firstName', ''),
                body.get('middleName', ''),
                body.get('lastName', ''),
                body.get('dateOfBirth') or None,
                body.get('civilStatus', ''),
                body.get('phoneNumber', ''),
                body.get('email', ''),
                body.get('address', {}).get('street', ''),
                body.get('address', {}).get('city', ''),
                body.get('address', {}).get('state', ''),
                body.get('address', {}).get('zip', ''),
                body.get('opposingParties', ''),
                body.get('notes', '')
            ))
            
            result = cursor.fetchone()
            client_id, created_at = result
            conn.commit()
            
            new_client = {
                'clientId': str(client_id),
                'firstName': body.get('firstName', ''),
                'middleName': body.get('middleName', ''),
                'lastName': body.get('lastName', ''),
                'dateOfBirth': body.get('dateOfBirth', ''),
                'civilStatus': body.get('civilStatus', ''),
                'phoneNumber': body.get('phoneNumber', ''),
                'email': body.get('email', ''),
                'address': body.get('address', {}),
                'opposingParties': body.get('opposingParties', ''),
                'notes': body.get('notes', ''),
                'dateAdded': created_at.isoformat(),
                'updatedAt': created_at.isoformat()
            }
            
            return create_cors_response(201, new_client)
        
        elif http_method == 'PUT':
            if not client_id:
                return create_cors_response(400, {'error': 'Client ID required'})
            
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute("""
                UPDATE clients SET 
                    first_name = %s, middle_name = %s, last_name = %s, date_of_birth = %s,
                    civil_status = %s, phone_number = %s, email = %s, street = %s,
                    city = %s, state = %s, zip_code = %s, opposing_parties = %s, notes = %s
                WHERE client_id = %s
                RETURNING updated_at
            """, (
                body.get('firstName', ''),
                body.get('middleName', ''),
                body.get('lastName', ''),
                body.get('dateOfBirth') or None,
                body.get('civilStatus', ''),
                body.get('phoneNumber', ''),
                body.get('email', ''),
                body.get('address', {}).get('street', ''),
                body.get('address', {}).get('city', ''),
                body.get('address', {}).get('state', ''),
                body.get('address', {}).get('zip', ''),
                body.get('opposingParties', ''),
                body.get('notes', ''),
                client_id
            ))
            
            result = cursor.fetchone()
            if not result:
                return create_cors_response(404, {'error': 'Client not found'})
            
            conn.commit()
            return create_cors_response(200, {'message': 'Client updated successfully'})
        
        elif http_method == 'DELETE':
            if not client_id:
                return create_cors_response(400, {'error': 'Client ID required'})
            
            cursor.execute("DELETE FROM clients WHERE client_id = %s", (client_id,))
            
            if cursor.rowcount == 0:
                return create_cors_response(404, {'error': 'Client not found'})
            
            conn.commit()
            return create_cors_response(200, {'message': 'Client deleted successfully'})
        
        else:
            return create_cors_response(405, {'error': 'Method not allowed'})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_cors_response(500, {'error': 'Internal server error'})
    
    finally:
        db.close_connection()
