#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'casevault.settings')
django.setup()

from django.contrib.auth.models import User

if not User.objects.filter(username='admin@nmmlaw.com').exists():
    User.objects.create_superuser('admin@nmmlaw.com', 'admin@nmmlaw.com', 'admin123')
    print('Superuser created: admin@nmmlaw.com / admin123')
else:
    print('Superuser already exists')

# Create test user with email as username
if not User.objects.filter(username='test@example.com').exists():
    User.objects.create_user('test@example.com', 'test@example.com', 'testpass123')
    print('Test user created: test@example.com / testpass123')
else:
    print('Test user already exists')
