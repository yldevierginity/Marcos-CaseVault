import json

def create_cors_response(status_code: int, body: dict) -> dict:
    """Create response with CORS headers"""
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
    """Lambda handler for clients CRUD operations"""
    
    try:
        # Handle OPTIONS request
        if event.get('httpMethod') == 'OPTIONS':
            return create_cors_response(200, {'message': 'OK'})
        
        http_method = event.get('httpMethod', 'GET')
        
        if http_method == 'GET':
            # Return mock client data with proper structure
            mock_clients = [
                {
                    'client_id': '1',
                    'first_name': 'John',
                    'last_name': 'Doe',
                    'email': 'john@example.com',
                    'phone_number': '+1234567890',
                    'address': '123 Main St',
                    'city': 'New York',
                    'state': 'NY',
                    'zip_code': '10001',
                    'created_at': '2024-01-01T00:00:00Z'
                },
                {
                    'client_id': '2',
                    'first_name': 'Alice',
                    'last_name': 'Johnson',
                    'email': 'alice@example.com',
                    'phone_number': '+1234567891',
                    'address': '456 Oak Ave',
                    'city': 'Los Angeles',
                    'state': 'CA',
                    'zip_code': '90210',
                    'created_at': '2024-01-02T00:00:00Z'
                }
            ]
            
            return create_cors_response(200, {
                'clients': mock_clients,
                'pagination': {
                    'page': 1,
                    'limit': 100,
                    'total': 2
                }
            })
        
        elif http_method == 'POST':
            # Handle client creation - return complete object
            body = {}
            if event.get('body'):
                try:
                    body = json.loads(event['body'])
                except:
                    pass
            
            new_client = {
                'client_id': '123',
                'first_name': body.get('first_name', ''),
                'last_name': body.get('last_name', ''),
                'email': body.get('email', ''),
                'phone_number': body.get('phone_number', ''),
                'address': body.get('address', ''),
                'city': body.get('city', ''),
                'state': body.get('state', ''),
                'zip_code': body.get('zip_code', ''),
                'created_at': '2024-12-08T00:00:00Z',
                'updated_at': '2024-12-08T00:00:00Z'
            }
            
            return create_cors_response(201, new_client)
        
        elif http_method == 'PUT':
            return create_cors_response(200, {
                'message': 'Client updated successfully'
            })
        
        elif http_method == 'DELETE':
            return create_cors_response(200, {
                'message': 'Client deleted successfully'
            })
        
        else:
            return create_cors_response(405, {'error': 'Method not allowed'})
    
    except Exception as e:
        return create_cors_response(500, {'error': str(e)})
