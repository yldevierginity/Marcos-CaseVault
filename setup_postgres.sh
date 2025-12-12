#!/bin/bash

echo "Setting up PostgreSQL for CaseVault..."

# Install PostgreSQL if not installed
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
fi

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE casevault_db;
CREATE USER casevault_user WITH PASSWORD 'casevault_pass123';
GRANT ALL PRIVILEGES ON DATABASE casevault_db TO casevault_user;
ALTER USER casevault_user CREATEDB;
\q
EOF

# Grant schema permissions
sudo -u postgres psql -d casevault_db -c "GRANT ALL ON SCHEMA public TO casevault_user;"

echo "PostgreSQL setup complete!"
echo "Database: casevault_db"
echo "User: casevault_user"
echo "Password: casevault_pass123"
