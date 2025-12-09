#!/bin/bash
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python create_superuser.py
python manage.py runserver 8000
