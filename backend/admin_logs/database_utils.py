import json
import psycopg2
import boto3
import os
from typing import Dict, Any, List, Optional
from aws_lambda_powertools import Logger, Tracer
from aws_lambda_powertools.utilities.typing import LambdaContext

logger = Logger()
tracer = Tracer()

class DatabaseConnection:
    def __init__(self):
        self.secret_arn = os.environ['DB_SECRET_ARN']
        self.cluster_endpoint = os.environ['CLUSTER_ENDPOINT']
        self.secrets_client = boto3.client('secretsmanager')
        self._connection = None
    
    def get_connection(self):
        """Get database connection with connection pooling"""
        if self._connection is None or self._connection.closed:
            try:
                # Get database credentials from Secrets Manager
                secret_response = self.secrets_client.get_secret_value(
                    SecretId=self.secret_arn
                )
                secret = json.loads(secret_response['SecretString'])
                
                # Connect to database
                self._connection = psycopg2.connect(
                    host=self.cluster_endpoint,
                    port=5432,
                    database='lawfirmdb',
                    user=secret['username'],
                    password=secret['password'],
                    connect_timeout=10
                )
                logger.info("Database connection established")
            except Exception as e:
                logger.error(f"Database connection failed: {str(e)}")
                raise
        return self._connection
    
    def close_connection(self):
        """Close database connection"""
        if self._connection and not self._connection.closed:
            self._connection.close()
            logger.info("Database connection closed")
