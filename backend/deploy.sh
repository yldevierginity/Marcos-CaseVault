#!/bin/bash
set -e

echo "Starting Django deployment..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate --noinput

# Collect static files to S3
python manage.py collectstatic --noinput

# Create superuser if needed
python create_superuser.py

echo "Deployment completed successfully!"
