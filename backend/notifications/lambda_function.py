import json
import sys
import os
from datetime import datetime, timedelta
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
    """Lambda handler for notifications operations"""
    
    try:
        # Initialize database connection
        db = DatabaseConnection()
        admin_logger = AdminLogger(db)
        
        # Get user from Cognito
        user = get_user_from_cognito(event)
        if not user:
            return create_response(401, {'error': 'Unauthorized'})
        
        # Get HTTP method
        http_method = event['httpMethod']
        
        if http_method == 'GET':
            return get_notifications(db, admin_logger, user, event)
        else:
            return create_response(405, {'error': 'Method not allowed'})
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})
    
    finally:
        if 'db' in locals():
            db.close_connection()

@tracer.capture_method
def get_notifications(db: DatabaseConnection, admin_logger: AdminLogger, 
                      user: Dict[str, Any], event: Dict[str, Any]) -> Dict[str, Any]:
    """Get notifications for the user"""
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Get query parameters
        query_params = event.get('queryStringParameters') or {}
        unread_only = query_params.get('unread_only', 'false').lower() == 'true'
        notification_type = query_params.get('type')
        
        # Build query
        base_query = """
            SELECT notification_id, title, message, notification_type, is_read,
                   related_entity_type, related_entity_id, created_at
            FROM notifications
            WHERE user_id = %s
        """
        
        params = [user['user_id']]
        
        if unread_only:
            base_query += " AND is_read = FALSE"
        
        if notification_type:
            base_query += " AND notification_type = %s"
            params.append(notification_type)
        
        base_query += " ORDER BY created_at DESC"
        
        # Execute query
        cursor.execute(base_query, params)
        results = cursor.fetchall()
        
        # Format results
        notifications = []
        for result in results:
            notifications.append({
                'notification_id': str(result[0]),
                'title': result[1],
                'message': result[2],
                'notification_type': result[3],
                'is_read': result[4],
                'related_entity_type': result[5],
                'related_entity_id': str(result[6]) if result[6] else None,
                'created_at': result[7].isoformat() if result[7] else None
            })
        
        cursor.close()
        
        # Log admin action
        admin_logger.log_action(
            user['user_id'], 'READ', 'notifications',
            ip_address=event.get('requestContext', {}).get('identity', {}).get('sourceIp'),
            user_agent=event.get('headers', {}).get('User-Agent')
        )
        
        return create_response(200, {
            'notifications': notifications,
            'unread_count': len([n for n in notifications if not n['is_read']])
        })
        
    except Exception as e:
        logger.error(f"Error getting notifications: {str(e)}")
        return create_response(500, {'error': 'Failed to retrieve notifications'})

def create_upcoming_hearing_notifications(db: DatabaseConnection):
    """Create notifications for upcoming hearings (called by scheduled Lambda)"""
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Get hearings in the next 7 days
        seven_days_from_now = datetime.now() + timedelta(days=7)
        
        cursor.execute("""
            SELECT h.hearing_id, h.hearing_date, h.hearing_type, h.location,
                   c.case_title, cl.first_name, cl.last_name,
                   u.user_id, u.email, u.first_name as lawyer_first_name, u.last_name as lawyer_last_name
            FROM hearings h
            LEFT JOIN cases c ON h.case_id = c.case_id
            LEFT JOIN clients cl ON c.client_id = cl.client_id
            LEFT JOIN users u ON c.assigned_lawyer_id = u.user_id
            WHERE h.hearing_date BETWEEN CURRENT_TIMESTAMP AND %s
            AND h.status = 'scheduled'
        """, (seven_days_from_now,))
        
        hearings = cursor.fetchall()
        
        notifications_created = 0
        
        for hearing in hearings:
            hearing_id, hearing_date, hearing_type, location, case_title, client_first_name, client_last_name, lawyer_id, lawyer_email, lawyer_first_name, lawyer_last_name = hearing
            
            # Create notification for assigned lawyer
            if lawyer_id:
                cursor.execute("""
                    INSERT INTO notifications (user_id, title, message, notification_type,
                                            related_entity_type, related_entity_id)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT DO NOTHING
                """, (
                    lawyer_id,
                    f"Upcoming Hearing: {hearing_type}",
                    f"You have a {hearing_type} scheduled for {hearing_date.strftime('%B %d, %Y at %I:%M %p')} at {location or 'TBD'}. Case: {case_title}",
                    'hearing_reminder',
                    'hearing',
                    hearing_id
                ))
                notifications_created += 1
        
        conn.commit()
        cursor.close()
        
        logger.info(f"Created {notifications_created} hearing reminder notifications")
        
    except Exception as e:
        logger.error(f"Error creating hearing notifications: {str(e)}")
        raise
