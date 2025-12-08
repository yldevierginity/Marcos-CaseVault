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
    """Lambda handler for hearings CRUD operations"""
    
    try:
        # Handle OPTIONS request
        if event.get('httpMethod') == 'OPTIONS':
            return create_cors_response(200, {'message': 'OK'})
        
        http_method = event.get('httpMethod', 'GET')
        
        if http_method == 'GET':
            # Return mock hearing data
            mock_hearings = [
                {
                    'hearing_id': '1',
                    'case_id': '1',
                    'hearing_date': '2024-12-15T10:00:00Z',
                    'location': 'Courtroom A',
                    'hearing_type': 'Initial Hearing',
                    'status': 'scheduled',
                    'notes': 'Initial case review',
                    'created_at': '2024-01-01T00:00:00Z'
                }
            ]
            
            return create_cors_response(200, {
                'hearings': mock_hearings,
                'pagination': {
                    'page': 1,
                    'limit': 100,
                    'total': 1
                }
            })
        
        elif http_method == 'POST':
            # Handle hearing creation - return complete object
            body = {}
            if event.get('body'):
                try:
                    body = json.loads(event['body'])
                except:
                    pass
            
            new_hearing = {
                'hearing_id': '123',
                'case_id': body.get('case_id', ''),
                'hearing_date': body.get('hearing_date', ''),
                'location': body.get('location', ''),
                'hearing_type': body.get('hearing_type', ''),
                'status': body.get('status', 'scheduled'),
                'notes': body.get('notes', ''),
                'created_at': '2024-12-08T00:00:00Z',
                'updated_at': '2024-12-08T00:00:00Z'
            }
            
            return create_cors_response(201, new_hearing)
        
        elif http_method == 'PUT':
            return create_cors_response(200, {
                'message': 'Hearing updated successfully'
            })
        
        elif http_method == 'DELETE':
            return create_cors_response(200, {
                'message': 'Hearing deleted successfully'
            })
        
        else:
            return create_cors_response(405, {'error': 'Method not allowed'})
    
    except Exception as e:
        return create_cors_response(500, {'error': str(e)})
