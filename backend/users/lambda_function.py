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
    """Lambda handler for users CRUD operations"""
    
    try:
        # Handle OPTIONS request
        if event.get('httpMethod') == 'OPTIONS':
            return create_cors_response(200, {'message': 'OK'})
        
        http_method = event.get('httpMethod', 'GET')
        
        if http_method == 'GET':
            # Return mock user data
            mock_users = [
                {
                    'user_id': '1',
                    'first_name': 'Jane',
                    'last_name': 'Smith',
                    'email': 'jane@lawfirm.com',
                    'role': 'lawyer',
                    'is_active': True,
                    'created_at': '2024-01-01T00:00:00Z'
                },
                {
                    'user_id': '2',
                    'first_name': 'Bob',
                    'last_name': 'Wilson',
                    'email': 'bob@lawfirm.com',
                    'role': 'admin',
                    'is_active': True,
                    'created_at': '2024-01-02T00:00:00Z'
                }
            ]
            
            return create_cors_response(200, {
                'users': mock_users,
                'pagination': {
                    'page': 1,
                    'limit': 100,
                    'total': 2
                }
            })
        
        elif http_method == 'POST':
            # Handle user creation - return complete object
            body = {}
            if event.get('body'):
                try:
                    body = json.loads(event['body'])
                except:
                    pass
            
            new_user = {
                'user_id': '123',
                'first_name': body.get('first_name', ''),
                'last_name': body.get('last_name', ''),
                'email': body.get('email', ''),
                'role': body.get('role', 'lawyer'),
                'is_active': True,
                'created_at': '2024-12-08T00:00:00Z',
                'updated_at': '2024-12-08T00:00:00Z'
            }
            
            return create_cors_response(201, new_user)
        
        elif http_method == 'PUT':
            return create_cors_response(200, {
                'message': 'User updated successfully'
            })
        
        elif http_method == 'DELETE':
            return create_cors_response(200, {
                'message': 'User deleted successfully'
            })
        
        else:
            return create_cors_response(405, {'error': 'Method not allowed'})
    
    except Exception as e:
        return create_cors_response(500, {'error': str(e)})
