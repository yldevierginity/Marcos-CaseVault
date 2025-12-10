#!/usr/bin/env python
import os
import sys
import django

# Backend directory to Python path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'casevault.settings')
django.setup()

from django.contrib.auth.models import User

if not User.objects.filter(username='admin@admin.com').exists():
    User.objects.create_superuser('admin@admin.com', 'admin@admin.com', 'admin123')
    print('Superuser created: admin@admin.com / admin123')
else:
    print('Superuser already exists')

# Create test user with email as username
if not User.objects.filter(username='test@example.com').exists():
    User.objects.create_user('test@example.com', 'test@example.com', 'testpass123')
    print('Test user created: test@example.com / testpass123')
else:
    print('Test user already exists')
