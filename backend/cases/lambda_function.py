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
        case_id = path_parameters.get('id')
        
        if http_method == 'GET':
            if case_id:
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
                    'clientId': str(row[1]) if row[1] else '',
                    'caseTitle': row[2] or '',
                    'caseType': row[3] or '',
                    'status': row[4] or 'active',
                    'description': row[5] or '',
                    'priority': row[6] or 'medium',
                    'estimatedValue': float(row[7]) if row[7] else 0,
                    'startDate': row[8].isoformat() if row[8] else '',
                    'endDate': row[9].isoformat() if row[9] else '',
                    'lawyerAssigned': row[10] or '',
                    'creationDate': row[11].isoformat() if row[11] else '',
                    'updatedAt': row[12].isoformat() if row[12] else '',
                    'client': {
                        'name': f"{row[13]} {row[14]}" if row[13] and row[14] else '',
                        'email': row[15] or ''
                    },
                    'assigned_lawyer': {
                        'name': row[10] or ''
                    }
                }
                return create_cors_response(200, case)
            else:
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
                        'clientId': str(row[1]) if row[1] else '',
                        'caseTitle': row[2] or '',
                        'caseType': row[3] or '',
                        'status': row[4] or 'active',
                        'description': row[5] or '',
                        'priority': row[6] or 'medium',
                        'estimatedValue': float(row[7]) if row[7] else 0,
                        'startDate': row[8].isoformat() if row[8] else '',
                        'endDate': row[9].isoformat() if row[9] else '',
                        'lawyerAssigned': row[10] or '',
                        'creationDate': row[11].isoformat() if row[11] else '',
                        'updatedAt': row[12].isoformat() if row[12] else '',
                        'client': {
                            'name': f"{row[13]} {row[14]}" if row[13] and row[14] else '',
                            'email': row[15] or ''
                        },
                        'assigned_lawyer': {
                            'name': row[10] or ''
                        }
                    })
                
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
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute("""
                INSERT INTO cases (client_id, case_title, case_type, status, description,
                                 priority, estimated_value, start_date, end_date, lawyer_assigned)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING case_id, created_at
            """, (
                body.get('clientId') or None,
                body.get('caseTitle', ''),
                body.get('caseType', ''),
                body.get('status', 'active'),
                body.get('description', ''),
                body.get('priority', 'medium'),
                body.get('estimatedValue') or None,
                body.get('startDate') or None,
                body.get('endDate') or None,
                body.get('lawyerAssigned', '')
            ))
            
            result = cursor.fetchone()
            case_id, created_at = result
            conn.commit()
            
            # Get client info for response
            client_info = {'name': '', 'email': ''}
            if body.get('clientId'):
                cursor.execute("""
                    SELECT first_name, last_name, email 
                    FROM clients WHERE client_id = %s
                """, (body.get('clientId'),))
                client_row = cursor.fetchone()
                if client_row:
                    client_info = {
                        'name': f"{client_row[0]} {client_row[1]}",
                        'email': client_row[2] or ''
                    }
            
            new_case = {
                'caseId': str(case_id),
                'clientId': body.get('clientId', ''),
                'caseTitle': body.get('caseTitle', ''),
                'caseType': body.get('caseType', ''),
                'status': body.get('status', 'active'),
                'description': body.get('description', ''),
                'priority': body.get('priority', 'medium'),
                'estimatedValue': body.get('estimatedValue', 0),
                'startDate': body.get('startDate', ''),
                'endDate': body.get('endDate', ''),
                'lawyerAssigned': body.get('lawyerAssigned', ''),
                'creationDate': created_at.isoformat(),
                'updatedAt': created_at.isoformat(),
                'client': client_info,
                'assigned_lawyer': {
                    'name': body.get('lawyerAssigned', '')
                }
            }
            
            return create_cors_response(201, new_case)
        
        elif http_method == 'PUT':
            if not case_id:
                return create_cors_response(400, {'error': 'Case ID required'})
            
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute("""
                UPDATE cases SET 
                    case_title = %s, case_type = %s, status = %s, description = %s,
                    priority = %s, estimated_value = %s, start_date = %s, end_date = %s,
                    lawyer_assigned = %s
                WHERE case_id = %s
                RETURNING updated_at
            """, (
                body.get('caseTitle', ''),
                body.get('caseType', ''),
                body.get('status', 'active'),
                body.get('description', ''),
                body.get('priority', 'medium'),
                body.get('estimatedValue') or None,
                body.get('startDate') or None,
                body.get('endDate') or None,
                body.get('lawyerAssigned', ''),
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
