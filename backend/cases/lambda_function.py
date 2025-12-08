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
    """Lambda handler for cases CRUD operations"""
    
    try:
        print(f"Event: {json.dumps(event)}")
        
        # Handle OPTIONS request
        if event.get('httpMethod') == 'OPTIONS':
            return create_cors_response(200, {'message': 'OK'})
        
        # Get HTTP method
        http_method = event.get('httpMethod', 'GET')
        
        if http_method == 'GET':
            # Return mock data for testing
            mock_cases = [
                {
                    'case_id': '1',
                    'case_title': 'Test Case 1',
                    'case_type': 'Civil',
                    'status': 'active',
                    'created_at': '2024-01-01T00:00:00Z'
                },
                {
                    'case_id': '2', 
                    'case_title': 'Test Case 2',
                    'case_type': 'Criminal',
                    'status': 'pending',
                    'created_at': '2024-01-02T00:00:00Z'
                }
            ]
            
            response_data = {
                'cases': mock_cases,
                'pagination': {
                    'page': 1,
                    'limit': 100,
                    'total': 2
                }
            }
            
            return create_cors_response(200, response_data)
        
        else:
            return create_cors_response(405, {'error': 'Method not allowed'})
    
    except Exception as e:
        print(f"Lambda error: {str(e)}")
        return create_cors_response(500, {'error': 'Internal server error', 'details': str(e)})
