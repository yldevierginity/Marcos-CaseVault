#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'casevault.settings')
django.setup()

from django.contrib.auth.models import User

def create_lawyer(email, password, first_name='', last_name=''):
    if User.objects.filter(username=email).exists():
        print(f'Error: User with email {email} already exists')
        return False
    
    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )
    print(f'Lawyer user created successfully:')
    print(f'  Email: {email}')
    print(f'  Name: {first_name} {last_name}')
    return True

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('Usage: python create_lawyer.py <email> <password> [first_name] [last_name]')
        print('Example: python create_lawyer.py lawyer@firm.com SecurePass123 John Smith')
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    first_name = sys.argv[3] if len(sys.argv) > 3 else ''
    last_name = sys.argv[4] if len(sys.argv) > 4 else ''
    
    create_lawyer(email, password, first_name, last_name)
