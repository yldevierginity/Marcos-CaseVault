import json
import os
from database_utils import DatabaseConnection, AdminLogger, get_user_from_cognito

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
    
    db = DatabaseConnection()
    
    try:
        print(f"Event: {json.dumps(event)}")
        
        # Handle OPTIONS request
        if event.get('httpMethod') == 'OPTIONS':
            return create_cors_response(200, {'message': 'OK'})
        
        http_method = event.get('httpMethod', 'GET')
        path_parameters = event.get('pathParameters') or {}
        case_id = path_parameters.get('id')
        
        if http_method == 'GET':
            conn = db.get_connection()
            cursor = conn.cursor()
            
            if case_id:
                # Get specific case with client info
                cursor.execute("""
                    SELECT c.case_id, c.client_id, c.case_title, c.case_type, c.status,
                           c.description, c.priority, c.estimated_value, c.start_date, c.end_date,
                           c.lawyer_assigned, c.created_at, c.updated_at,
                           cl.first_name, cl.last_name, cl.email
                    FROM cases c
                    LEFT JOIN clients cl ON c.client_id = cl.client_id
                    WHERE c.case_id = %s
                """, (case_id,))
                
                row = cursor.fetchone()
                if not row:
                    return create_cors_response(404, {'error': 'Case not found'})
                
                case = {
                    'caseId': str(row[0]),
                    'clientId': str(row[1]) if row[1] else None,
                    'caseTitle': row[2],
                    'caseType': row[3],
                    'status': row[4],
                    'description': row[5],
                    'priority': row[6],
                    'estimatedValue': float(row[7]) if row[7] else None,
                    'startDate': row[8].isoformat() if row[8] else None,
                    'endDate': row[9].isoformat() if row[9] else None,
                    'lawyerAssigned': row[10],
                    'creationDate': row[11].isoformat() if row[11] else None,
                    'updatedAt': row[12].isoformat() if row[12] else None,
                    'client': {
                        'name': f"{row[13]} {row[14]}" if row[13] and row[14] else None,
                        'email': row[15]
                    } if row[13] else None,
                    'assigned_lawyer': {
                        'name': row[10]
                    } if row[10] else None
                }
                
                return create_cors_response(200, case)
            else:
                # Get all cases with pagination
                query_params = event.get('queryStringParameters') or {}
                page = int(query_params.get('page', 1))
                limit = int(query_params.get('limit', 100))
                offset = (page - 1) * limit
                
                cursor.execute("""
                    SELECT c.case_id, c.client_id, c.case_title, c.case_type, c.status,
                           c.description, c.priority, c.estimated_value, c.start_date, c.end_date,
                           c.lawyer_assigned, c.created_at, c.updated_at,
                           cl.first_name, cl.last_name, cl.email
                    FROM cases c
                    LEFT JOIN clients cl ON c.client_id = cl.client_id
                    ORDER BY c.created_at DESC LIMIT %s OFFSET %s
                """, (limit, offset))
                
                rows = cursor.fetchall()
                cases = []
                
                for row in rows:
                    cases.append({
                        'caseId': str(row[0]),
                        'clientId': str(row[1]) if row[1] else None,
                        'caseTitle': row[2],
                        'caseType': row[3],
                        'status': row[4],
                        'description': row[5],
                        'priority': row[6],
                        'estimatedValue': float(row[7]) if row[7] else None,
                        'startDate': row[8].isoformat() if row[8] else None,
                        'endDate': row[9].isoformat() if row[9] else None,
                        'lawyerAssigned': row[10],
                        'creationDate': row[11].isoformat() if row[11] else None,
                        'updatedAt': row[12].isoformat() if row[12] else None,
                        'client': {
                            'name': f"{row[13]} {row[14]}" if row[13] and row[14] else None,
                            'email': row[15]
                        } if row[13] else None,
                        'assigned_lawyer': {
                            'name': row[10]
                        } if row[10] else None
                    })
                
                # Get total count
                cursor.execute("SELECT COUNT(*) FROM cases")
                total = cursor.fetchone()[0]
                
                return create_cors_response(200, {
                    'cases': cases,
                    'pagination': {
                        'page': page,
                        'limit': limit,
                        'total': total
                    }
                })
        
        elif http_method == 'POST':
            # Handle case creation
            body = {}
            if event.get('body'):
                try:
                    body = json.loads(event['body'])
                except:
                    return create_cors_response(400, {'error': 'Invalid JSON body'})
            
            conn = db.get_connection()
            cursor = conn.cursor()
            
            # Insert new case
            cursor.execute("""
                INSERT INTO cases (client_id, case_title, case_type, status, description,
                                 priority, estimated_value, start_date, end_date, lawyer_assigned)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING case_id, created_at
            """, (
                body.get('clientId'),
                body.get('caseTitle'),
                body.get('caseType'),
                body.get('status', 'active'),
                body.get('description'),
                body.get('priority', 'medium'),
                body.get('estimatedValue'),
                body.get('startDate'),
                body.get('endDate'),
                body.get('lawyerAssigned')
            ))
            
            result = cursor.fetchone()
            case_id, created_at = result
            conn.commit()
            
            # Get client info for response
            client_info = None
            if body.get('clientId'):
                cursor.execute("""
                    SELECT first_name, last_name, email 
                    FROM clients WHERE client_id = %s
                """, (body.get('clientId'),))
                client_row = cursor.fetchone()
                if client_row:
                    client_info = {
                        'name': f"{client_row[0]} {client_row[1]}",
                        'email': client_row[2]
                    }
            
            new_case = {
                'caseId': str(case_id),
                'clientId': body.get('clientId'),
                'caseTitle': body.get('caseTitle'),
                'caseType': body.get('caseType'),
                'status': body.get('status', 'active'),
                'description': body.get('description'),
                'priority': body.get('priority', 'medium'),
                'estimatedValue': body.get('estimatedValue'),
                'startDate': body.get('startDate'),
                'endDate': body.get('endDate'),
                'lawyerAssigned': body.get('lawyerAssigned'),
                'creationDate': created_at.isoformat(),
                'updatedAt': created_at.isoformat(),
                'client': client_info,
                'assigned_lawyer': {
                    'name': body.get('lawyerAssigned')
                } if body.get('lawyerAssigned') else None
            }
            
            return create_cors_response(201, new_case)
        
        elif http_method == 'PUT':
            if not case_id:
                return create_cors_response(400, {'error': 'Case ID required'})
            
            body = {}
            if event.get('body'):
                try:
                    body = json.loads(event['body'])
                except:
                    return create_cors_response(400, {'error': 'Invalid JSON body'})
            
            conn = db.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE cases SET 
                    case_title = %s, case_type = %s, status = %s, description = %s,
                    priority = %s, estimated_value = %s, start_date = %s, end_date = %s,
                    lawyer_assigned = %s
                WHERE case_id = %s
                RETURNING updated_at
            """, (
                body.get('caseTitle'),
                body.get('caseType'),
                body.get('status'),
                body.get('description'),
                body.get('priority'),
                body.get('estimatedValue'),
                body.get('startDate'),
                body.get('endDate'),
                body.get('lawyerAssigned'),
                case_id
            ))
            
            result = cursor.fetchone()
            if not result:
                return create_cors_response(404, {'error': 'Case not found'})
            
            conn.commit()
            return create_cors_response(200, {'message': 'Case updated successfully'})
        
        elif http_method == 'DELETE':
            if not case_id:
                return create_cors_response(400, {'error': 'Case ID required'})
            
            conn = db.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("DELETE FROM cases WHERE case_id = %s", (case_id,))
            
            if cursor.rowcount == 0:
                return create_cors_response(404, {'error': 'Case not found'})
            
            conn.commit()
            return create_cors_response(200, {'message': 'Case deleted successfully'})
        
        else:
            return create_cors_response(405, {'error': 'Method not allowed'})
    
    except Exception as e:
        print(f"Lambda error: {str(e)}")
        return create_cors_response(500, {'error': 'Internal server error'})
    
    finally:
        db.close_connection()
