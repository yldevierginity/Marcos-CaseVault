#!/usr/bin/env python3
"""
Fetch secrets from AWS Secrets Manager and create .env file
Usage: python get_secrets.py --region ap-southeast-1
"""
import boto3
import json
import argparse

def get_secret(secret_name, region_name):
    client = boto3.client('secretsmanager', region_name=region_name)
    try:
        response = client.get_secret_value(SecretId=secret_name)
        return json.loads(response['SecretString'])
    except Exception as e:
        print(f"Error retrieving {secret_name}: {e}")
        return None

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--region', default='ap-southeast-1')
    parser.add_argument('--db-secret', default='casevault-db-credentials')
    parser.add_argument('--django-secret', default='casevault-django-secret')
    args = parser.parse_args()

    db_creds = get_secret(args.db_secret, args.region)
    django_secret = get_secret(args.django_secret, args.region)

    if db_creds and django_secret:
        env_content = f"""DEBUG=False
SECRET_KEY={django_secret['secret_key']}
DB_HOST={db_creds['host']}
DB_NAME={db_creds['dbname']}
DB_USER={db_creds['username']}
DB_PASSWORD={db_creds['password']}
DB_PORT={db_creds['port']}
USE_S3=True
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME={args.region}
"""
        with open('.env', 'w') as f:
            f.write(env_content)
        print("✓ .env file created successfully")
    else:
        print("✗ Failed to retrieve secrets")

if __name__ == '__main__':
    main()
