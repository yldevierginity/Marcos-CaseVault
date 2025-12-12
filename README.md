# CaseVault - Complete User & Technical Manual

**Version:** 1.0.0  
**Last Updated:** December 12, 2025  
**Law Firm:** Neyra Marcos Mendez & Jungco Law Office

---

## 📑 Table of Contents

1. [System Overview](#system-overview)
2. [System Requirements](#system-requirements)
3. [Installation Guide](#installation-guide)
4. [Configuration Guide](#configuration-guide)
5. [User Guide](#user-guide)
6. [Administrator Guide](#administrator-guide)
7. [API Reference](#api-reference)
8. [Database Schema](#database-schema)
9. [Security & Authentication](#security--authentication)
10. [Troubleshooting](#troubleshooting)
11. [Maintenance & Backup](#maintenance--backup)
12. [Development Guide](#development-guide)

---

## 1. System Overview

### 1.1 Introduction

CaseVault is a comprehensive case management system specifically designed for law firms to efficiently manage clients, cases, hearings, and legal documentation. The system provides a modern, user-friendly interface with robust backend capabilities.

### 1.2 Key Features

#### Client Management
- **Complete Client Profiles**: Store comprehensive client information including personal details, contact information, and address
- **Client Search**: Real-time search functionality by name, email, phone, or client ID
- **Client History**: Track all cases associated with each client
- **CRUD Operations**: Full Create, Read, Update, Delete capabilities
- **Data Validation**: Automatic validation of email addresses and required fields

#### Case Management
- **Case Tracking**: Monitor case status (Active, Pending, Closed)
- **Case Types**: Categorize cases by type (Contract Dispute, Personal Injury, etc.)
- **Lawyer Assignment**: Assign cases to specific lawyers
- **Case Priority**: Set priority levels (Low, Medium, High)
- **Case Timeline**: Track start and end dates
- **Financial Tracking**: Record estimated case values
- **Case Descriptions**: Detailed notes and descriptions for each case

#### Dashboard & Analytics
- **Real-time Statistics**: View total clients, active cases, pending cases, and closed cases
- **Quick Actions**: Fast access to add clients and cases
- **Search Functionality**: Global search across clients and cases
- **Status Filtering**: Filter cases by status using tabs

#### Authentication & Security
- **JWT-based Authentication**: Secure token-based authentication system
- **Email-based Login**: Login using email addresses
- **Session Management**: Automatic token refresh and session handling
- **Password Security**: Secure password hashing and validation
- **Protected Routes**: Frontend and backend route protection
- **CORS Security**: Configured cross-origin resource sharing

### 1.3 Technology Stack

#### Frontend Technologies
- **React 18.3.1**: Modern JavaScript library for building user interfaces
- **TypeScript**: Type-safe JavaScript for better code quality
- **Vite 6.4.1**: Next-generation frontend build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component library
- **React Router DOM 7.10.1**: Client-side routing
- **Lucide React**: Icon library
- **Sonner**: Toast notification system
- **React Hook Form**: Form validation and management

#### Backend Technologies
- **Django 4.2+**: High-level Python web framework
- **Django REST Framework**: Powerful toolkit for building Web APIs
- **djangorestframework-simplejwt**: JWT authentication for Django REST Framework
- **django-cors-headers**: Handle Cross-Origin Resource Sharing
- **Python 3.9+**: Programming language
- **psycopg2-binary**: PostgreSQL adapter for Python

#### Database
- **PostgreSQL 12+**: Advanced open-source relational database
- **Structured Schema**: Well-designed database with proper relationships
- **Auto-timestamps**: Automatic created_at and updated_at fields
- **Foreign Key Constraints**: Data integrity through relationships

#### Development Tools
- **Git**: Version control system
- **npm**: Package manager for JavaScript
- **pip**: Package manager for Python
- **Virtual Environment**: Isolated Python environment

### 1.4 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│                    (React + TypeScript)                      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
                         │ Port 5173 (Dev)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Server                          │
│                    Vite Dev Server                           │
│              (http://localhost:5173)                         │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API Calls
                         │ JWT Authentication
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend Server                           │
│                Django REST Framework                         │
│              (http://localhost:8000)                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Endpoints                                       │  │
│  │  - /api/token/          (Authentication)            │  │
│  │  - /api/clients/        (Client Management)         │  │
│  │  - /api/cases/          (Case Management)           │  │
│  │  - /api/profile/        (User Profile)              │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL Queries
                         │ Port 5432
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                        │
│                  (casevault_db)                              │
│                                                              │
│  Tables:                                                     │
│  - clients          (Client information)                     │
│  - cases            (Case records)                           │
│  - users            (User profiles)                          │
│  - hearings         (Hearing schedules)                      │
│  - notifications    (System notifications)                   │
│  - admin_logs       (Audit trail)                            │
└─────────────────────────────────────────────────────────────┘
```

### 1.5 User Roles

#### Administrator
- Full system access
- User management
- System configuration
- Access to Django admin panel
- View audit logs

#### Lawyer
- Manage assigned cases
- View client information
- Update case status
- Add case notes

#### Staff
- Data entry
- Client management
- Basic case management

---

## 2. System Requirements

### 2.1 Hardware Requirements

#### Minimum Requirements
- **Processor**: Dual-core 2.0 GHz or higher
- **RAM**: 4 GB
- **Storage**: 10 GB available space
- **Network**: Stable internet connection

#### Recommended Requirements
- **Processor**: Quad-core 2.5 GHz or higher
- **RAM**: 8 GB or more
- **Storage**: 20 GB SSD
- **Network**: High-speed internet connection

### 2.2 Software Requirements

#### Operating System
- **Linux**: Ubuntu 20.04 LTS or later (Recommended)
- **macOS**: 10.15 (Catalina) or later
- **Windows**: Windows 10 or later (with WSL2 for best experience)

#### Required Software

**Node.js**
- Version: 16.x or higher
- Download: https://nodejs.org/
- Includes npm (Node Package Manager)

**Python**
- Version: 3.9 or higher
- Download: https://www.python.org/
- Includes pip (Python Package Manager)

**PostgreSQL**
- Version: 12 or higher
- Download: https://www.postgresql.org/
- Database server for data storage

**Git**
- Latest version
- Download: https://git-scm.com/
- Version control system

### 2.3 Browser Requirements

#### Supported Browsers
- **Google Chrome**: Version 90 or later (Recommended)
- **Mozilla Firefox**: Version 88 or later
- **Microsoft Edge**: Version 90 or later
- **Safari**: Version 14 or later

#### Browser Features Required
- JavaScript enabled
- Cookies enabled
- Local Storage support
- Modern CSS support (Flexbox, Grid)

### 2.4 Network Requirements

- **Ports**:
  - 5173: Frontend development server
  - 8000: Backend API server
  - 5432: PostgreSQL database
- **Firewall**: Allow connections on above ports
- **Internet**: Required for initial setup and package downloads

---

## 3. Installation Guide

### 3.1 Pre-Installation Checklist

Before beginning installation, ensure you have:
- [ ] Administrator/sudo access to your system
- [ ] Stable internet connection
- [ ] All required software installed (Node.js, Python, PostgreSQL, Git)
- [ ] At least 10 GB free disk space
- [ ] Verified software versions using commands below

### 3.2 Verify Installed Software

Open terminal and run these commands:

```bash
# Check Node.js version (should be 16.x or higher)
node --version

# Check npm version (should be 8.x or higher)
npm --version

# Check Python version (should be 3.9 or higher)
python3 --version

# Check PostgreSQL version (should be 12.x or higher)
psql --version

# Check Git version
git --version
```

### 3.3 Clone the Repository

```bash
# Navigate to your projects directory
cd ~/projects

# Clone the repository
git clone https://github.com/yourusername/Marcos-CaseVault.git

# Navigate into the project directory
cd Marcos-CaseVault

# Verify the project structure
ls -la
```

Expected output:
```
backend/
frontend/
setup_postgres.sh
README.md
.gitignore
```

### 3.4 Database Setup

#### Option 1: Automated Setup (Recommended)

```bash
# Make the setup script executable
chmod +x setup_postgres.sh

# Run the setup script
./setup_postgres.sh
```

The script will:
1. Install PostgreSQL (if not already installed)
2. Start PostgreSQL service
3. Create database: `casevault_db`
4. Create user: `casevault_user`
5. Set password: `casevault_pass123`
6. Grant necessary privileges
7. Grant schema permissions

Expected output:
```
Setting up PostgreSQL for CaseVault...
PostgreSQL setup complete!
Database: casevault_db
User: casevault_user
Password: casevault_pass123
```

#### Option 2: Manual Setup

If you prefer manual setup or the script fails:

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Access PostgreSQL as postgres user
sudo -u postgres psql
```

In the PostgreSQL shell, run:

```sql
-- Create database
CREATE DATABASE casevault_db;

-- Create user with password
CREATE USER casevault_user WITH PASSWORD 'casevault_pass123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE casevault_db TO casevault_user;

-- Allow user to create databases (for testing)
ALTER USER casevault_user CREATEDB;

-- Exit PostgreSQL shell
\q
```

Grant schema permissions:

```bash
# Grant schema permissions
sudo -u postgres psql -d casevault_db -c "GRANT ALL ON SCHEMA public TO casevault_user;"
```

#### Verify Database Setup

```bash
# Test database connection
psql -U casevault_user -d casevault_db -h localhost

# If successful, you'll see:
# casevault_db=>

# Exit with:
\q
```

### 3.5 Backend Setup

#### Step 1: Navigate to Backend Directory

```bash
cd backend
```

#### Step 2: Create Virtual Environment

```bash
# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
# On Linux/macOS:
source .venv/bin/activate

# On Windows:
.venv\Scripts\activate

# Your prompt should now show (.venv)
```

#### Step 3: Install Python Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install required packages
pip install -r requirements.txt
```

Dependencies installed:
- Django>=4.2.0
- djangorestframework
- djangorestframework-simplejwt
- django-cors-headers
- psycopg2-binary
- boto3

#### Step 4: Run Database Migrations

```bash
# Create database tables
python manage.py migrate
```

Expected output:
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, core, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying admin.0001_initial... OK
  ...
  Applying core.0001_initial... OK
  Applying sessions.0001_initial... OK
```

#### Step 5: Create Superuser

```bash
# Run the superuser creation script
python create_superuser.py
```

Expected output:
```
Superuser created: admin@nmmlaw.com / admin123
Test user created: test@example.com / testpass123
```

#### Step 6: Start Backend Server

```bash
# Start Django development server
python manage.py runserver 8000
```

Expected output:
```
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
December 12, 2025 - 09:00:00
Django version 4.2.0, using settings 'casevault.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

#### Alternative: Use Start Script

```bash
# Make start script executable
chmod +x start.sh

# Run start script (does all backend setup)
./start.sh
```

The start.sh script will:
1. Activate virtual environment
2. Install dependencies
3. Run migrations
4. Create superuser
5. Start server

### 3.6 Frontend Setup

Open a new terminal window (keep backend running).

#### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

#### Step 2: Install Node Dependencies

```bash
# Install all npm packages
npm install
```

This will install all dependencies listed in package.json (may take 2-5 minutes).

#### Step 3: Configure Environment Variables

Create a `.env` file in the frontend directory:

```bash
# Create .env file
touch .env

# Add configuration
echo "VITE_API_BASE_URL=http://localhost:8000/api" > .env
```

Or manually create `.env` with this content:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

#### Step 4: Start Frontend Development Server

```bash
# Start Vite development server
npm run dev
```

Expected output:
```
  VITE v6.4.1  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 3.7 Access the Application

Open your web browser and navigate to:

**Frontend Application**
- URL: http://localhost:5173
- Login with: admin@nmmlaw.com / admin123

**Backend API**
- URL: http://localhost:8000/api
- API Documentation: http://localhost:8000/api/

**Django Admin Panel**
- URL: http://localhost:8000/admin
- Login with: admin@nmmlaw.com / admin123

### 3.8 Post-Installation Verification

#### Test Frontend
1. Open http://localhost:5173
2. You should see the login page
3. Login with admin@nmmlaw.com / admin123
4. You should be redirected to the dashboard

#### Test Backend API
```bash
# Test health endpoint
curl http://localhost:8000/api/health/

# Expected response:
# {"status":"healthy"}
```

#### Test Database Connection
```bash
# Access Django shell
python manage.py shell

# In the shell:
from core.models import Client
print(Client.objects.count())
# Should print: 0

# Exit shell
exit()
```

---

## 4. Configuration Guide

### 4.1 Backend Configuration

#### Django Settings (`backend/casevault/settings.py`)

**Database Configuration**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'casevault_db',
        'USER': 'casevault_user',
        'PASSWORD': 'casevault_pass123',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

**CORS Settings**
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
    "http://localhost:3000",  # Alternative port
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True
```

**JWT Token Settings**
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}
```

**Security Settings**
```python
SECRET_KEY = 'your-secret-key-here'  # Change in production
DEBUG = True  # Set to False in production
ALLOWED_HOSTS = ['localhost', '127.0.0.1']  # Add domain in production
```

#### Environment Variables

Create `.env` file in backend directory (optional):
```env
DATABASE_NAME=casevault_db
DATABASE_USER=casevault_user
DATABASE_PASSWORD=casevault_pass123
DATABASE_HOST=localhost
DATABASE_PORT=5432
SECRET_KEY=your-secret-key
DEBUG=True
```

### 4.2 Frontend Configuration

#### Environment Variables (`frontend/.env`)

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:8000/api

# Optional: API Timeout (milliseconds)
VITE_API_TIMEOUT=30000

# Optional: Enable Debug Mode
VITE_DEBUG=true
```

#### Vite Configuration (`frontend/vite.config.ts`)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
```

### 4.3 Lawyer Configuration

The system is pre-configured with four lawyers from Neyra Marcos Mendez & Jungco Law Office:

1. **Atty. Prince Arthur M. Neyra**
2. **Atty. Cloydie Mark A. Marcos**
3. **Atty. Ryan E. Mendez**
4. **Atty. Deolanar C. Jungco**

To modify lawyers, edit:
- `frontend/src/components/Dashboard.tsx` (line 614-618)
- `frontend/src/components/AddClientPage.tsx` (line 54-58)

### 4.4 Case Types Configuration

Default case types:
- Contract Dispute
- Personal Injury
- Family Law
- Criminal Defense
- Real Estate
- Employment Law
- Intellectual Property
- Corporate Law

To modify, edit the `caseTypes` array in:
- `frontend/src/components/Dashboard.tsx`
- `frontend/src/components/AddClientPage.tsx`

---

## 5. User Guide

### 5.1 Getting Started

#### First Login

1. Open your browser and navigate to http://localhost:5173
2. You will see the login page
3. Enter credentials:
   - **Email**: admin@nmmlaw.com
   - **Password**: admin123
4. Click "Sign In"
5. You will be redirected to the Dashboard

#### Understanding the Interface

**Sidebar Navigation**
- **Dashboard**: Main overview page
- **Clients**: View all clients
- **Cases**: View all cases
- **Add Client**: Quick access to add new client
- **Lawyers**: View lawyer information
- **About**: System information

**Top Bar**
- Search functionality
- User profile menu
- Logout button

### 5.2 Client Management

#### Adding a New Client

**Method 1: From Dashboard**
1. Click "Add Client" button on dashboard
2. Fill in the client information form

**Method 2: From Add Client Page**
1. Click "Add Client" in sidebar
2. Fill in the comprehensive form

**Required Fields:**
- First Name
- Last Name

**Optional Fields:**
- Middle Name
- Date of Birth
- Civil Status
- Phone Number
- Email
- Address (Street, City, State, ZIP Code)
- Opposing Parties
- Notes

**Adding Cases to New Client:**
1. Scroll to "Case Information" section
2. Click "Add Another Case" to add multiple cases
3. For each case, fill in:
   - **Lawyer Assigned** (required) - Select from dropdown
   - **Case Title** (required)
   - **Case Type** (required) - Select from dropdown
   - **Status** (required) - Active, Pending, or Closed
   - **Description** (optional)

4. Click "Add Client with Cases" to save

**Form Validation:**
- Email must be valid format
- All required fields must be filled
- Duplicate emails are not allowed

#### Viewing Clients

**From Dashboard:**
- All clients are displayed as cards
- Each card shows:
  - Client ID
  - Full name
  - Email
  - Phone number
  - Number of cases
  - Action buttons (Edit, Delete, Add Case)

**Search Functionality:**
- Use the search bar at the top
- Search by:
  - Client name
  - Email
  - Phone number
  - Client ID
- Results update in real-time

#### Editing Client Information

1. Find the client on the dashboard
2. Click the **Edit** button (pencil icon)
3. A modal will appear with the client's current information
4. Modify the fields you want to change
5. Click "Update Client" to save changes
6. Click "Cancel" to discard changes

**Editable Fields:**
- All client information fields
- Cannot change Client ID (auto-generated)

#### Deleting a Client

1. Find the client on the dashboard
2. Click the **Delete** button (trash icon)
3. A confirmation dialog will appear
4. Click "Delete" to confirm
5. Click "Cancel" to abort

**Warning:** Deleting a client will also delete all associated cases. This action cannot be undone.

### 5.3 Case Management

#### Adding a Case to Existing Client

**From Dashboard:**
1. Find the client card
2. Click the **"+"** button next to "Cases: X"
3. Fill in the case form:
   - **Case Title** (required)
   - **Case Type** (required) - Select from dropdown
   - **Status** (required) - Active/Pending/Closed
   - **Lawyer Assigned** (required) - Select from dropdown
   - **Description** (optional)
4. Click "Add Case"

**From Cases Page:**
1. Navigate to "Cases" in sidebar
2. Click "Add Case" button
3. Select client from dropdown
4. Fill in case details
5. Click "Save Case"

#### Viewing All Cases

1. Click "Cases" in the sidebar
2. All cases are displayed as cards
3. Each card shows:
   - Case ID
   - Client name
   - Case title
   - Case type
   - Status badge
   - Lawyer assigned
   - Description
   - Created date

**Filtering by Status:**
- Use tabs at the top:
  - **All**: Show all cases
  - **Active**: Show only active cases
  - **Pending**: Show only pending cases
  - **Closed**: Show only closed cases

**Search Functionality:**
- Search by:
  - Client name
  - Case ID
  - Case title
  - Case type
  - Lawyer name
- Results update in real-time

#### Editing a Case

1. Go to Cases page
2. Find the case you want to edit
3. Click the **Edit** button on the case card
4. Modify the case information in the modal
5. Click "Update Case" to save
6. Click "Cancel" to discard changes

**Editable Fields:**
- Case title
- Case type
- Status
- Lawyer assigned
- Description

#### Deleting a Case

1. Go to Cases page
2. Find the case you want to delete
3. Click the **Delete** button
4. Confirm deletion in the dialog
5. The case will be permanently removed

**Note:** Deleting a case does not delete the associated client.

### 5.4 Dashboard Features

#### Statistics Overview

The dashboard displays four key metrics:

1. **Total Clients**
   - Count of all clients in the system
   - Blue card with Users icon

2. **Active Cases**
   - Count of cases with "Active" status
   - Green card with Briefcase icon

3. **Pending Cases**
   - Count of cases with "Pending" status
   - Yellow card with Clock icon

4. **Closed Cases**
   - Count of cases with "Closed" status
   - Gray card with CheckCircle icon

#### Quick Actions

**Add Client Button**
- Located at top right of dashboard
- Opens Add Client page
- Quick access to create new client profiles

**Add Case Button**
- Located on each client card
- Opens case creation modal
- Pre-fills client information

#### Client Cards

Each client card displays:
- **Client ID**: Unique identifier
- **Full Name**: First, middle, and last name
- **Email**: Contact email address
- **Phone**: Contact phone number
- **Case Count**: Number of associated cases
- **Action Buttons**:
  - Edit (pencil icon)
  - Delete (trash icon)
  - Add Case (+ button)

### 5.5 Search and Filtering

#### Global Search

**Dashboard Search:**
- Located at top of page
- Searches across all clients
- Real-time results
- Search criteria:
  - First name
  - Last name
  - Email
  - Phone number
  - Client ID

**Cases Page Search:**
- Located at top of Cases page
- Searches across all cases
- Real-time results
- Search criteria:
  - Client name
  - Case ID
  - Case title
  - Case type
  - Lawyer assigned

#### Status Filtering

**Cases Page Tabs:**
- **All**: Display all cases regardless of status
- **Active**: Filter to show only active cases
- **Pending**: Filter to show only pending cases
- **Closed**: Filter to show only closed cases

**Combining Search and Filters:**
- Use tabs to filter by status
- Use search to further narrow results
- Both work together for precise filtering

### 5.6 User Account Management

#### Viewing Profile

1. Click on user icon in top right
2. Select "Profile" from dropdown
3. View your account information

#### Changing Password

**Method 1: Django Admin**
1. Navigate to http://localhost:8000/admin
2. Login with admin credentials
3. Click "Users" in the sidebar
4. Select your user account
5. Click "Change password"
6. Enter new password twice
7. Click "Save"

**Method 2: Forgot Password (if enabled)**
1. Click "Forgot Password" on login page
2. Enter your email
3. Follow reset instructions

#### Logging Out

1. Click user icon in top right
2. Select "Logout" from dropdown
3. You will be redirected to login page
4. Your session will be terminated

**Security Note:** Always logout when using shared computers.

---

## 6. Administrator Guide

### 6.1 Django Admin Panel

#### Accessing Admin Panel

1. Navigate to http://localhost:8000/admin
2. Login with admin credentials:
   - Email: admin@nmmlaw.com
   - Password: admin123

#### Admin Panel Features

**Dashboard:**
- Overview of all database tables
- Quick access to manage records
- Recent actions log

**Available Sections:**
- **Authentication and Authorization**
  - Users
  - Groups
- **Core**
  - Clients
  - Cases
  - User Profiles
  - Hearings
  - Notifications
  - Admin Logs

### 6.2 User Management

#### Creating New Users

1. Go to Django Admin Panel
2. Click "Users" under Authentication
3. Click "Add User" button
4. Fill in required information:
   - Username (use email format)
   - Password
   - Password confirmation
5. Click "Save and continue editing"
6. Fill in additional details:
   - First name
   - Last name
   - Email address
   - Staff status
   - Superuser status
7. Click "Save"

#### User Permissions

**Superuser:**
- Full access to all features
- Can access Django admin
- Can manage other users
- Can view audit logs

**Staff:**
- Can access Django admin
- Limited permissions based on groups
- Cannot manage users

**Regular User:**
- Cannot access Django admin
- Can only use frontend application
- Limited to assigned cases

#### Assigning Roles

1. Go to Django Admin Panel
2. Click "User Profiles" under Core
3. Select user profile
4. Set role:
   - Lawyer
   - Admin
   - Staff
5. Click "Save"

#### Deactivating Users

1. Go to Users section
2. Select user
3. Uncheck "Active" checkbox
4. Click "Save"

**Note:** Deactivated users cannot login but their data is preserved.

### 6.3 Database Management

#### Viewing Records

**Clients:**
1. Go to "Clients" in Core section
2. View list of all clients
3. Click on client to view/edit details
4. Use filters on right sidebar
5. Use search box to find specific clients

**Cases:**
1. Go to "Cases" in Core section
2. View list of all cases
3. Filter by status, priority, lawyer
4. Click on case to view/edit details

**Hearings:**
1. Go to "Hearings" in Core section
2. View scheduled hearings
3. Filter by status, date
4. Edit hearing details

#### Bulk Operations

**Bulk Delete:**
1. Select multiple records using checkboxes
2. Choose "Delete selected" from Actions dropdown
3. Click "Go"
4. Confirm deletion

**Bulk Update:**
1. Select multiple records
2. Choose appropriate action from dropdown
3. Click "Go"
4. Confirm changes

#### Exporting Data

**Method 1: Django Admin**
1. Install django-import-export (optional)
2. Use export functionality in admin

**Method 2: Database Dump**
```bash
# Export entire database
pg_dump -U casevault_user -h localhost casevault_db > backup.sql

# Export specific table
pg_dump -U casevault_user -h localhost -t clients casevault_db > clients_backup.sql
```

### 6.4 System Monitoring

#### Viewing Logs

**Django Logs:**
- Located in backend directory
- Check console output for errors
- Review `django.log` if configured

**Admin Logs:**
1. Go to Django Admin Panel
2. Click "Admin Logs" under Core
3. View all system actions:
   - User actions
   - Record changes
   - IP addresses
   - Timestamps

#### Monitoring Performance

**Database Queries:**
```bash
# Connect to database
psql -U casevault_user -d casevault_db

# View active connections
SELECT * FROM pg_stat_activity;

# View table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Server Status:**
```bash
# Check Django server status
ps aux | grep manage.py

# Check PostgreSQL status
sudo systemctl status postgresql

# Check disk usage
df -h
```

### 6.5 Security Management

#### Password Policies

**Changing User Passwords:**
1. Go to Django Admin
2. Select user
3. Click "Change password"
4. Enter new password
5. Confirm and save

**Password Requirements:**
- Minimum 8 characters
- Cannot be too similar to username
- Cannot be entirely numeric
- Cannot be too common

#### Session Management

**JWT Token Settings:**
- Access token lifetime: 60 minutes
- Refresh token lifetime: 7 days
- Tokens automatically rotate on refresh

**Force Logout All Users:**
```bash
# Clear all sessions
python manage.py clearsessions
```

#### Audit Trail

**Viewing Audit Logs:**
1. Go to Admin Logs in Django Admin
2. Filter by:
   - User
   - Action type
   - Date range
   - Table name
3. Export logs for compliance

**Log Information Includes:**
- User ID
- Action performed
- Table affected
- Record ID
- Old values
- New values
- IP address
- User agent
- Timestamp

---

## 7. API Reference

### 7.1 Authentication Endpoints

#### POST /api/token/
**Description:** Obtain JWT access and refresh tokens

**Request:**
```json
{
  "username": "admin@nmmlaw.com",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Error Responses:**
- 401 Unauthorized: Invalid credentials
- 400 Bad Request: Missing required fields

#### POST /api/token/refresh/
**Description:** Refresh access token using refresh token

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 7.2 Client Endpoints

#### GET /api/clients/
**Description:** Retrieve all clients

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "client_id": 1,
    "first_name": "John",
    "middle_name": "Michael",
    "last_name": "Doe",
    "date_of_birth": "1985-05-15",
    "civil_status": "Married",
    "phone_number": "123-456-7890",
    "email": "john.doe@example.com",
    "street": "123 Main St",
    "city": "Manila",
    "state": "Metro Manila",
    "zip_code": "1000",
    "opposing_parties": "ABC Corporation",
    "notes": "Important client",
    "created_at": "2025-12-12T09:00:00Z",
    "updated_at": "2025-12-12T09:00:00Z"
  }
]
```

#### POST /api/clients/
**Description:** Create a new client

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "phone_number": "098-765-4321",
  "street": "456 Oak Ave",
  "city": "Quezon City",
  "state": "Metro Manila",
  "zip_code": "1100"
}
```

**Response (201 Created):**
```json
{
  "client_id": 2,
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  ...
}
```

#### GET /api/clients/{id}/
**Description:** Retrieve specific client

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "client_id": 1,
  "first_name": "John",
  "last_name": "Doe",
  ...
}
```

#### PUT /api/clients/{id}/
**Description:** Update client information

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request:**
```json
{
  "first_name": "John Updated",
  "phone_number": "111-222-3333"
}
```

**Response (200 OK):**
```json
{
  "client_id": 1,
  "first_name": "John Updated",
  "phone_number": "111-222-3333",
  ...
}
```

#### DELETE /api/clients/{id}/
**Description:** Delete a client and all associated cases

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204 No Content)**

### 7.3 Case Endpoints

#### GET /api/cases/
**Description:** Retrieve all cases

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status`: Filter by status (active, pending, closed)
- `client_id`: Filter by client ID
- `lawyer_assigned`: Filter by lawyer name

**Response (200 OK):**
```json
[
  {
    "case_id": 1,
    "client_id": 1,
    "case_title": "Contract Dispute Case",
    "case_type": "Contract Dispute",
    "status": "active",
    "description": "Dispute over contract terms",
    "priority": "high",
    "estimated_value": "500000.00",
    "start_date": "2025-01-01",
    "end_date": null,
    "lawyer_assigned": "Atty. Prince Arthur M. Neyra",
    "created_at": "2025-12-12T09:00:00Z",
    "updated_at": "2025-12-12T09:00:00Z"
  }
]
```

#### POST /api/cases/
**Description:** Create a new case

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request:**
```json
{
  "client_id": 1,
  "case_title": "Personal Injury Case",
  "case_type": "Personal Injury",
  "status": "active",
  "description": "Car accident case",
  "lawyer_assigned": "Atty. Cloydie Mark A. Marcos",
  "priority": "high"
}
```

**Response (201 Created):**
```json
{
  "case_id": 2,
  "client_id": 1,
  "case_title": "Personal Injury Case",
  ...
}
```

#### PUT /api/cases/{id}/
**Description:** Update case information

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request:**
```json
{
  "status": "closed",
  "description": "Case resolved successfully"
}
```

**Response (200 OK):**
```json
{
  "case_id": 1,
  "status": "closed",
  "description": "Case resolved successfully",
  ...
}
```

#### DELETE /api/cases/{id}/
**Description:** Delete a case

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204 No Content)**

### 7.4 User Profile Endpoints

#### GET /api/profile/
**Description:** Get current user profile

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "user_id": 1,
  "email": "admin@nmmlaw.com",
  "first_name": "Admin",
  "last_name": "User",
  "role": "admin",
  "phone_number": "123-456-7890",
  "is_active": true
}
```

### 7.5 Error Responses

**400 Bad Request:**
```json
{
  "error": "Invalid request data",
  "details": {
    "email": ["This field is required"]
  }
}
```

**401 Unauthorized:**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**403 Forbidden:**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

**404 Not Found:**
```json
{
  "detail": "Not found."
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## 8. Database Schema

### 8.1 Tables Overview

The CaseVault database consists of 6 main tables:

1. **clients** - Client information
2. **cases** - Case records
3. **users** - User profiles
4. **hearings** - Hearing schedules
5. **notifications** - System notifications
6. **admin_logs** - Audit trail

### 8.2 Clients Table

**Table Name:** `clients`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| client_id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique client identifier |
| first_name | VARCHAR(100) | NOT NULL | Client's first name |
| middle_name | VARCHAR(100) | NULL | Client's middle name |
| last_name | VARCHAR(100) | NOT NULL | Client's last name |
| date_of_birth | DATE | NULL | Client's date of birth |
| civil_status | VARCHAR(50) | NULL | Marital status |
| phone_number | VARCHAR(20) | NULL | Contact phone number |
| email | VARCHAR(254) | UNIQUE, NULL | Email address |
| street | VARCHAR(255) | NULL | Street address |
| city | VARCHAR(100) | NULL | City |
| state | VARCHAR(100) | NULL | State/Province |
| zip_code | VARCHAR(20) | NULL | Postal code |
| opposing_parties | TEXT | NULL | Opposing party information |
| notes | TEXT | NULL | Additional notes |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, AUTO_UPDATE | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `client_id`
- UNIQUE INDEX on `email`
- INDEX on `last_name`, `first_name` for search optimization

### 8.3 Cases Table

**Table Name:** `cases`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| case_id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique case identifier |
| client_id | INTEGER | FOREIGN KEY (clients.client_id), NOT NULL | Reference to client |
| case_title | VARCHAR(255) | NOT NULL | Case title |
| case_type | VARCHAR(100) | NULL | Type of case |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'active' | Case status (active/pending/closed) |
| description | TEXT | NULL | Case description |
| priority | VARCHAR(20) | DEFAULT 'medium' | Priority level (low/medium/high) |
| estimated_value | DECIMAL(15,2) | NULL | Estimated case value |
| start_date | DATE | NULL | Case start date |
| end_date | DATE | NULL | Case end date |
| lawyer_assigned | VARCHAR(255) | NULL | Assigned lawyer name |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, AUTO_UPDATE | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `case_id`
- FOREIGN KEY on `client_id` REFERENCES `clients(client_id)` ON DELETE CASCADE
- INDEX on `status` for filtering
- INDEX on `lawyer_assigned` for filtering

**Relationships:**
- Many-to-One with `clients` (one client can have many cases)
- CASCADE DELETE: Deleting a client deletes all associated cases

### 8.4 Users Table

**Table Name:** `users`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| user_id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| django_user_id | INTEGER | FOREIGN KEY, UNIQUE | Reference to Django auth_user |
| cognito_user_id | VARCHAR(255) | UNIQUE, NULL | AWS Cognito user ID |
| role | VARCHAR(50) | DEFAULT 'lawyer' | User role (lawyer/admin/staff) |
| phone_number | VARCHAR(20) | NULL | Contact phone number |
| is_active | BOOLEAN | DEFAULT TRUE | Account active status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, AUTO_UPDATE | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `user_id`
- UNIQUE INDEX on `django_user_id`
- UNIQUE INDEX on `cognito_user_id`

### 8.5 Hearings Table

**Table Name:** `hearings`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| hearing_id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique hearing identifier |
| case_id | INTEGER | FOREIGN KEY (cases.case_id), NOT NULL | Reference to case |
| hearing_date | TIMESTAMP | NOT NULL | Scheduled hearing date/time |
| hearing_type | VARCHAR(100) | NULL | Type of hearing |
| location | VARCHAR(255) | NULL | Hearing location |
| judge_name | VARCHAR(255) | NULL | Presiding judge name |
| notes | TEXT | NULL | Hearing notes |
| status | VARCHAR(50) | DEFAULT 'scheduled' | Status (scheduled/completed/cancelled/postponed) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, AUTO_UPDATE | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `hearing_id`
- FOREIGN KEY on `case_id` REFERENCES `cases(case_id)` ON DELETE CASCADE
- INDEX on `hearing_date` for scheduling queries
- INDEX on `status` for filtering

### 8.6 Notifications Table

**Table Name:** `notifications`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| notification_id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique notification identifier |
| user_id | INTEGER | FOREIGN KEY (users.user_id), NOT NULL | Reference to user |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NULL | Notification message |
| type | VARCHAR(50) | DEFAULT 'info' | Type (info/warning/error/success) |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY on `notification_id`
- FOREIGN KEY on `user_id` REFERENCES `users(user_id)` ON DELETE CASCADE
- INDEX on `user_id`, `is_read` for filtering unread notifications

### 8.7 Admin Logs Table

**Table Name:** `admin_logs`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| log_id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique log identifier |
| user_id | VARCHAR(255) | NULL | User who performed action |
| action | VARCHAR(100) | NOT NULL | Action performed |
| table_name | VARCHAR(100) | NULL | Affected table |
| record_id | VARCHAR(100) | NULL | Affected record ID |
| old_values | JSON | NULL | Previous values |
| new_values | JSON | NULL | New values |
| ip_address | INET | NULL | User's IP address |
| user_agent | TEXT | NULL | User's browser/client info |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Action timestamp |

**Indexes:**
- PRIMARY KEY on `log_id`
- INDEX on `user_id` for user activity tracking
- INDEX on `created_at` for time-based queries
- INDEX on `table_name`, `record_id` for record history

### 8.8 Entity Relationship Diagram

```
┌─────────────────┐
│    CLIENTS      │
│─────────────────│
│ client_id (PK)  │
│ first_name      │
│ last_name       │
│ email (UNIQUE)  │
│ phone_number    │
│ ...             │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│     CASES       │
│─────────────────│
│ case_id (PK)    │
│ client_id (FK)  │
│ case_title      │
│ status          │
│ lawyer_assigned │
│ ...             │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│    HEARINGS     │
│─────────────────│
│ hearing_id (PK) │
│ case_id (FK)    │
│ hearing_date    │
│ status          │
│ ...             │
└─────────────────┘

┌─────────────────┐
│  AUTH_USER      │
│  (Django)       │
│─────────────────│
│ id (PK)         │
│ username        │
│ email           │
│ password        │
└────────┬────────┘
         │
         │ 1:1
         │
┌────────▼────────┐
│     USERS       │
│─────────────────│
│ user_id (PK)    │
│ django_user_id  │
│ role            │
│ ...             │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│ NOTIFICATIONS   │
│─────────────────│
│ notification_id │
│ user_id (FK)    │
│ title           │
│ is_read         │
└─────────────────┘
```

---

## 9. Security & Authentication

### 9.1 Authentication Flow

#### JWT Token-Based Authentication

1. **User Login**:
   - User submits email and password
   - Backend validates credentials
   - Returns access token (60 min) and refresh token (7 days)

2. **API Requests**:
   - Frontend includes access token in Authorization header
   - Backend validates token on each request
   - Returns requested data if valid

3. **Token Refresh**:
   - When access token expires, use refresh token
   - Backend issues new access token
   - Refresh token rotates for security

4. **Logout**:
   - Frontend discards tokens
   - User must re-authenticate

### 9.2 Password Security

#### Password Hashing
- Uses Django's PBKDF2 algorithm
- Salted hashes stored in database
- Passwords never stored in plain text

#### Password Requirements
- Minimum 8 characters
- Cannot be too similar to username
- Cannot be entirely numeric
- Cannot be common passwords

#### Password Reset
- Secure token-based reset flow
- Tokens expire after 24 hours
- Email verification required

### 9.3 API Security

#### CORS Configuration
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True
```

#### Request Authentication
- All API endpoints require JWT token
- Except: /api/token/ (login)
- Token must be in Authorization header

#### Rate Limiting
- Implement rate limiting in production
- Prevent brute force attacks
- Use Django middleware or nginx

### 9.4 Data Protection

#### Input Validation
- All user inputs validated
- SQL injection prevention
- XSS attack prevention

#### HTTPS in Production
- Always use HTTPS in production
- Encrypt data in transit
- Use valid SSL certificates

#### Database Security
- Strong database passwords
- Limited database user permissions
- Regular security updates

---

## 10. Troubleshooting

### 10.1 Common Issues

#### Database Connection Error
```
django.db.utils.OperationalError: could not connect to server
```

**Solutions:**
1. Check PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   ```

2. Verify database credentials in `settings.py`

3. Test database connection:
   ```bash
   psql -U casevault_user -d casevault_db -h localhost
   ```

4. Check PostgreSQL logs:
   ```bash
   sudo tail -f /var/log/postgresql/postgresql-*.log
   ```

#### Permission Denied for Schema Public
```
permission denied for schema public
```

**Solution:**
```bash
sudo -u postgres psql -d casevault_db -c "GRANT ALL ON SCHEMA public TO casevault_user;"
```

#### CORS Error in Browser
```
Access to fetch blocked by CORS policy
```

**Solutions:**
1. Verify Django server is running on port 8000
2. Check CORS settings in `settings.py`:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:5173",
   ]
   ```
3. Clear browser cache
4. Check browser console for exact error

#### Frontend Build Errors
```
Module not found: Can't resolve './components/...'
```

**Solutions:**
1. Check file paths and imports
2. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   ```

#### Authentication Issues
```
401 Unauthorized
```

**Solutions:**
1. Check if token is expired
2. Verify token is in Authorization header
3. Check user credentials
4. Clear browser localStorage:
   ```javascript
   localStorage.clear()
   ```

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5173
```

**Solutions:**
1. Find process using port:
   ```bash
   lsof -i :5173
   ```
2. Kill the process:
   ```bash
   kill -9 <PID>
   ```
3. Or use different port:
   ```bash
   npm run dev -- --port 3000
   ```

### 10.2 Debugging Tips

#### Backend Debugging

**Enable Debug Mode:**
```python
# settings.py
DEBUG = True
```

**View Django Logs:**
```bash
# In terminal running Django server
# All requests and errors are logged
```

**Django Shell:**
```bash
python manage.py shell

# Test database queries
from core.models import Client
Client.objects.all()
```

**Database Queries:**
```bash
# Connect to database
psql -U casevault_user -d casevault_db

# View all clients
SELECT * FROM clients;

# View all cases
SELECT * FROM cases;
```

#### Frontend Debugging

**Browser Console:**
- Open Developer Tools (F12)
- Check Console tab for errors
- Check Network tab for API calls

**React DevTools:**
- Install React Developer Tools extension
- Inspect component state and props

**Check API Responses:**
```javascript
// In browser console
fetch('http://localhost:8000/api/clients/', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
  }
}).then(r => r.json()).then(console.log)
```

### 10.3 Performance Issues

#### Slow Database Queries

**Add Indexes:**
```sql
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_cases_status ON cases(status);
```

**Analyze Queries:**
```sql
EXPLAIN ANALYZE SELECT * FROM cases WHERE status = 'active';
```

#### Slow Frontend Loading

**Solutions:**
1. Enable production build:
   ```bash
   npm run build
   npm run preview
   ```
2. Optimize images
3. Implement lazy loading
4. Use React.memo for expensive components

---

## 11. Maintenance & Backup

### 11.1 Database Backup

#### Manual Backup

**Full Database Backup:**
```bash
# Backup entire database
pg_dump -U casevault_user -h localhost casevault_db > backup_$(date +%Y%m%d).sql

# Backup with compression
pg_dump -U casevault_user -h localhost casevault_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

**Table-Specific Backup:**
```bash
# Backup clients table only
pg_dump -U casevault_user -h localhost -t clients casevault_db > clients_backup.sql

# Backup cases table only
pg_dump -U casevault_user -h localhost -t cases casevault_db > cases_backup.sql
```

#### Automated Backup Script

Create `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/home/backups/casevault"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U casevault_user -h localhost casevault_db | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

**Schedule with Cron:**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

### 11.2 Database Restore

#### Restore from Backup

**Restore Full Database:**
```bash
# Drop existing database (WARNING: This deletes all data)
dropdb -U casevault_user casevault_db

# Create new database
createdb -U casevault_user casevault_db

# Restore from backup
psql -U casevault_user -d casevault_db < backup_20251212.sql

# Or from compressed backup
gunzip -c backup_20251212.sql.gz | psql -U casevault_user -d casevault_db
```

**Restore Specific Table:**
```bash
# Restore only clients table
psql -U casevault_user -d casevault_db < clients_backup.sql
```

### 11.3 System Updates

#### Update Backend Dependencies

```bash
cd backend
source .venv/bin/activate

# Update all packages
pip install --upgrade pip
pip install --upgrade -r requirements.txt

# Update requirements.txt
pip freeze > requirements.txt

# Run migrations
python manage.py migrate
```

#### Update Frontend Dependencies

```bash
cd frontend

# Check for outdated packages
npm outdated

# Update all packages
npm update

# Update specific package
npm install package-name@latest

# Update package.json
npm install
```

### 11.4 Database Maintenance

#### Vacuum Database

```bash
# Connect to database
psql -U casevault_user -d casevault_db

# Vacuum all tables
VACUUM ANALYZE;

# Vacuum specific table
VACUUM ANALYZE clients;
```

#### Check Database Size

```sql
-- Total database size
SELECT pg_size_pretty(pg_database_size('casevault_db'));

-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Reindex Database

```sql
-- Reindex all tables
REINDEX DATABASE casevault_db;

-- Reindex specific table
REINDEX TABLE clients;
```

### 11.5 Log Management

#### Django Logs

**Configure Logging in settings.py:**
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

**Rotate Logs:**
```bash
# Install logrotate
sudo apt install logrotate

# Create logrotate config
sudo nano /etc/logrotate.d/casevault

# Add configuration:
/path/to/backend/django.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

#### PostgreSQL Logs

**View Logs:**
```bash
sudo tail -f /var/log/postgresql/postgresql-*.log
```

**Configure Log Rotation:**
```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/*/main/postgresql.conf

# Set log rotation
log_rotation_age = 1d
log_rotation_size = 100MB
```

---

## 12. Development Guide

### 12.1 Development Environment Setup

#### Prerequisites
- Node.js 16+
- Python 3.9+
- PostgreSQL 12+
- Git
- Code editor (VS Code recommended)

#### Recommended VS Code Extensions
- Python
- Pylance
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GitLens

### 12.2 Code Structure

#### Backend Structure
```
backend/
├── casevault/          # Django project settings
│   ├── settings.py     # Configuration
│   ├── urls.py         # URL routing
│   └── wsgi.py         # WSGI config
├── api/                # API endpoints
│   ├── views.py        # API views
│   ├── serializers.py  # Data serializers
│   └── urls.py         # API URLs
├── core/               # Core models
│   ├── models.py       # Database models
│   └── admin.py        # Admin config
└── manage.py           # Django CLI
```

#### Frontend Structure
```
frontend/
├── src/
│   ├── components/     # React components
│   │   ├── ui/        # Reusable UI components
│   │   ├── Dashboard.tsx
│   │   ├── CasesPage.tsx
│   │   └── LoginPage.tsx
│   ├── services/      # API services
│   │   ├── api-service.tsx
│   │   └── auth-service.tsx
│   └── App.tsx        # Main app
├── public/            # Static assets
└── package.json       # Dependencies
```

### 12.3 Adding New Features

#### Add New API Endpoint

1. **Create Serializer** (`api/serializers.py`):
```python
class NewFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewFeature
        fields = '__all__'
```

2. **Create View** (`api/views.py`):
```python
class NewFeatureViewSet(viewsets.ModelViewSet):
    queryset = NewFeature.objects.all()
    serializer_class = NewFeatureSerializer
    permission_classes = [IsAuthenticated]
```

3. **Add URL** (`api/urls.py`):
```python
router.register(r'newfeature', NewFeatureViewSet)
```

#### Add New Frontend Component

1. **Create Component** (`src/components/NewFeature.tsx`):
```typescript
export function NewFeature() {
  return (
    <div>
      <h1>New Feature</h1>
    </div>
  )
}
```

2. **Add Route** (`src/App.tsx`):
```typescript
<Route path="/newfeature" element={<NewFeature />} />
```

3. **Add Navigation** (Sidebar):
```typescript
<Link to="/newfeature">New Feature</Link>
```

### 12.4 Testing

#### Backend Testing

**Create Test File** (`api/tests.py`):
```python
from django.test import TestCase
from core.models import Client

class ClientTestCase(TestCase):
    def setUp(self):
        Client.objects.create(
            first_name="John",
            last_name="Doe",
            email="john@example.com"
        )
    
    def test_client_creation(self):
        client = Client.objects.get(email="john@example.com")
        self.assertEqual(client.first_name, "John")
```

**Run Tests:**
```bash
python manage.py test
```

#### Frontend Testing

**Install Testing Libraries:**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

**Create Test File** (`src/components/NewFeature.test.tsx`):
```typescript
import { render, screen } from '@testing-library/react'
import { NewFeature } from './NewFeature'

test('renders new feature', () => {
  render(<NewFeature />)
  const element = screen.getByText(/New Feature/i)
  expect(element).toBeInTheDocument()
})
```

**Run Tests:**
```bash
npm test
```

### 12.5 Git Workflow

#### Branch Strategy

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add: new feature description"

# Push to remote
git push origin feature/new-feature

# Create pull request on GitHub
```

#### Commit Message Convention

```
Type: Brief description

Detailed description if needed

Types:
- Add: New feature
- Fix: Bug fix
- Update: Update existing feature
- Remove: Remove feature
- Refactor: Code refactoring
- Docs: Documentation changes
```

### 12.6 Deployment

#### Production Checklist

- [ ] Set DEBUG = False
- [ ] Configure ALLOWED_HOSTS
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS
- [ ] Configure static files
- [ ] Set up database backups
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Test all features
- [ ] Update documentation

#### Environment Variables

**Backend (.env):**
```env
DEBUG=False
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql://user:pass@host:port/dbname
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

**Frontend (.env.production):**
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

---

## 13. Support & Contact

### 13.1 Getting Help

**Documentation:**
- Read this manual thoroughly
- Check README.md for quick start
- Review API documentation

**Common Issues:**
- Check Troubleshooting section
- Search GitHub issues
- Review error logs

**Community Support:**
- Create GitHub issue
- Include error messages
- Provide steps to reproduce

### 13.2 Reporting Bugs

When reporting bugs, include:
1. Description of the issue
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Error messages/logs
6. System information
7. Screenshots if applicable

### 13.3 Feature Requests

To request new features:
1. Check if feature already exists
2. Search existing feature requests
3. Create detailed feature request
4. Explain use case
5. Provide examples

---

## 14. Appendix

### 14.1 Keyboard Shortcuts

**Browser:**
- `Ctrl + K` or `Cmd + K`: Focus search
- `Esc`: Close modals
- `Tab`: Navigate form fields

**Development:**
- `Ctrl + C`: Stop server
- `Ctrl + Z`: Undo
- `Ctrl + Shift + F`: Format code

### 14.2 Default Credentials

**Admin Account:**
- Email: admin@nmmlaw.com
- Password: admin123

**Test Account:**
- Email: test@example.com
- Password: testpass123

**Database:**
- Database: casevault_db
- User: casevault_user
- Password: casevault_pass123

### 14.3 Port Configuration

- **Frontend**: 5173 (Vite dev server)
- **Backend**: 8000 (Django server)
- **Database**: 5432 (PostgreSQL)

### 14.4 File Locations

**Backend:**
- Settings: `backend/casevault/settings.py`
- Models: `backend/core/models.py`
- API Views: `backend/api/views.py`
- URLs: `backend/api/urls.py`

**Frontend:**
- Main App: `frontend/src/App.tsx`
- Components: `frontend/src/components/`
- Services: `frontend/src/services/`
- Styles: `frontend/src/index.css`

### 14.5 Useful Commands

**Backend:**
```bash
python manage.py runserver          # Start server
python manage.py migrate            # Run migrations
python manage.py makemigrations     # Create migrations
python manage.py createsuperuser    # Create admin user
python manage.py shell              # Django shell
python manage.py test               # Run tests
```

**Frontend:**
```bash
npm run dev                         # Start dev server
npm run build                       # Build for production
npm run preview                     # Preview production build
npm install                         # Install dependencies
```

**Database:**
```bash
psql -U casevault_user -d casevault_db    # Connect to database
pg_dump casevault_db > backup.sql         # Backup database
psql casevault_db < backup.sql            # Restore database
```

---

**End of Manual**

**Version:** 1.0.0  
**Last Updated:** December 12, 2025  
**Maintained by:** Neyra Marcos Mendez & Jungco Law Office

For questions or support, please refer to the Support & Contact section.
