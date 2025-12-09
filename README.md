# CaseVault - Law Firm Case Management System

A comprehensive case management system built for law firms to manage clients, cases, hearings, and legal documentation. Built with React TypeScript frontend, Django REST API backend, and PostgreSQL database.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## ✨ Features

### Client Management
- ✅ Add, edit, delete clients
- ✅ Complete client profiles (personal info, address, contact details)
- ✅ Client search and filtering
- ✅ Multiple cases per client

### Case Management
- ✅ Create, update, delete cases
- ✅ Case status tracking (Active, Pending, Closed)
- ✅ Case types and lawyer assignments
- ✅ Case descriptions and notes

### Dashboard & Analytics
- ✅ Overview statistics
- ✅ Client and case summaries
- ✅ Quick actions and navigation

### Authentication & Security
- ✅ JWT-based authentication
- ✅ Email-based login system
- ✅ Protected routes and API endpoints

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** components
- **React Router** for navigation
- **Sonner** for notifications

### Backend
- **Django 4.2+** with Python 3.9+
- **Django REST Framework** for API
- **JWT Authentication** (djangorestframework-simplejwt)
- **CORS Headers** for cross-origin requests

### Database
- **PostgreSQL 12+** for production
- **Structured schema** with proper relationships
- **Auto-generated timestamps** and audit trails

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (version 16.x or higher)
- **npm** (comes with Node.js)
- **Python** (version 3.9 or higher)
- **PostgreSQL** (version 12 or higher)
- **Git** for version control

### Check Your Versions
```bash
node --version    # Should be 16.x+
npm --version     # Should be 8.x+
python3 --version # Should be 3.9+
psql --version    # Should be 12.x+
```

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/CaseVault.git
cd CaseVault
```

### 2. Setup Database
```bash
# Make script executable and run
chmod +x setup_postgres.sh
./setup_postgres.sh
```

### 3. Setup Backend
```bash
cd backend
chmod +x start.sh
./start.sh
```

### 4. Setup Frontend (New Terminal)
```bash
cd frontend
npm install
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin/

### 6. Login Credentials
- **Email**: `admin@example.com`
- **Password**: `admin123`

## 📖 Detailed Setup

### Database Setup (PostgreSQL)

#### Option 1: Automated Setup (Recommended)
```bash
# Run the setup script
./setup_postgres.sh
```

#### Option 2: Manual Setup
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

```sql
-- In PostgreSQL shell
CREATE DATABASE casevault_db;
CREATE USER casevault_user WITH PASSWORD 'casevault_pass123';
GRANT ALL PRIVILEGES ON DATABASE casevault_db TO casevault_user;
ALTER USER casevault_user CREATEDB;
\q
```

#### Database Configuration
The application uses these database settings:
- **Database**: `casevault_db`
- **Username**: `casevault_user`
- **Password**: `casevault_pass123`
- **Host**: `localhost`
- **Port**: `5432`

### Backend Setup (Django)

#### Step 1: Create Virtual Environment
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

#### Step 3: Configure Database
```bash
# Run migrations to create tables
python manage.py migrate

# Create superuser
python create_superuser.py
```

#### Step 4: Start Development Server
```bash
python manage.py runserver 8000
```

#### Backend Dependencies (requirements.txt)
```
Django>=4.2.0
djangorestframework
djangorestframework-simplejwt
django-cors-headers
psycopg2-binary
boto3
```

### Frontend Setup (React)

#### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

#### Step 2: Environment Configuration
Create `.env` file in frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

#### Step 3: Start Development Server
```bash
npm run dev
```

#### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📁 Project Structure

```
CaseVault/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ui/         # Reusable UI components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CasesPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── ...
│   │   ├── services/       # API services
│   │   │   ├── api-service.tsx
│   │   │   ├── auth-service.tsx
│   │   │   └── auth.ts
│   │   ├── config/         # Configuration files
│   │   ├── styles/         # CSS and styling
│   │   └── App.tsx         # Main app component
│   ├── public/             # Static assets
│   ├── package.json        # Dependencies and scripts
│   └── vite.config.ts      # Vite configuration
│
├── backend/                 # Django REST API backend
│   ├── casevault/          # Django project settings
│   │   ├── settings.py     # Main settings
│   │   ├── urls.py         # URL routing
│   │   └── wsgi.py         # WSGI config
│   ├── api/                # API app
│   │   ├── views.py        # API endpoints
│   │   ├── serializers.py  # Data serializers
│   │   ├── urls.py         # API URL patterns
│   │   └── backends.py     # Authentication backends
│   ├── core/               # Core models app
│   │   ├── models.py       # Database models
│   │   └── admin.py        # Django admin config
│   ├── venv/               # Python virtual environment
│   ├── requirements.txt    # Python dependencies
│   ├── manage.py           # Django management script
│   ├── create_superuser.py # User creation script
│   └── start.sh            # Backend startup script
│
├── setup_postgres.sh       # Database setup script
├── .gitignore              # Git ignore rules
├── CREDENTIALS.md          # Login credentials
└── README.md               # This file
```

## 🔌 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/token/
Content-Type: application/json

{
  "username": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Register
```http
POST /api/register/
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Client Endpoints

#### Get All Clients
```http
GET /api/clients/
Authorization: Bearer <access_token>
```

#### Create Client
```http
POST /api/clients/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone_number": "123-456-7890",
  "street": "123 Main St",
  "city": "Anytown",
  "state": "CA",
  "zip_code": "12345"
}
```

#### Update Client
```http
PUT /api/clients/{id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "first_name": "John Updated",
  "last_name": "Doe"
}
```

#### Delete Client
```http
DELETE /api/clients/{id}/
Authorization: Bearer <access_token>
```

### Case Endpoints

#### Get All Cases
```http
GET /api/cases/
Authorization: Bearer <access_token>
```

#### Create Case
```http
POST /api/cases/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "client_id": 1,
  "case_title": "Personal Injury Case",
  "case_type": "Personal Injury",
  "status": "active",
  "description": "Car accident case",
  "lawyer_assigned": "Atty. John Smith"
}
```

#### Update Case
```http
PUT /api/cases/{id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "closed",
  "description": "Case resolved successfully"
}
```

#### Delete Case
```http
DELETE /api/cases/{id}/
Authorization: Bearer <access_token>
```

### Other Endpoints

#### Health Check
```http
GET /api/health/
```

#### User Profile
```http
GET /api/profile/
Authorization: Bearer <access_token>
```

## 📚 Usage Guide

### Getting Started

1. **Login**: Use the provided credentials to access the system
2. **Dashboard**: View overview of clients and cases
3. **Add Client**: Click "Add Client" to create new client profiles
4. **Manage Cases**: Add cases to clients using the "+" button on client cards
5. **Edit Information**: Use edit buttons to modify client or case details

### Client Management

#### Adding a New Client
1. Click "Add Client" button on dashboard
2. Fill in required information:
   - First Name (required)
   - Last Name (required)
   - Email, phone, address details
   - Opposing parties and notes
3. Click "Save Client"

#### Editing Client Information
1. Find client on dashboard
2. Click edit button (pencil icon)
3. Modify information in the modal
4. Click "Update Client"

#### Deleting a Client
1. Find client on dashboard
2. Click delete button (trash icon)
3. Confirm deletion (this will also delete associated cases)

### Case Management

#### Adding a Case to a Client
1. Find client on dashboard
2. Click "+" button next to case count
3. Fill in case details:
   - Case Title (required)
   - Case Type (dropdown selection)
   - Status (Active/Pending/Closed)
   - Lawyer Assigned (dropdown selection)
   - Description
4. Click "Add Case"

#### Viewing All Cases
1. Navigate to "Cases" page from sidebar
2. Use tabs to filter by status (All/Active/Pending/Closed)
3. Use search to find specific cases

#### Editing Cases
1. Go to Cases page
2. Find the case you want to edit
3. Click edit button on case card
4. Modify information and save

### Search and Filtering

#### Dashboard Search
- Search by client name, email, phone, or ID
- Results update in real-time as you type

#### Cases Page Search
- Search by client name, case title, case type, or lawyer
- Filter by case status using tabs

### User Management

#### Changing Password
1. Access Django Admin at http://localhost:8000/admin/
2. Login with admin credentials
3. Navigate to Users section
4. Select user and change password

#### Creating New Users
1. Use the registration API endpoint
2. Or create via Django Admin interface

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Error
```
django.db.utils.OperationalError: could not connect to server
```
**Solution:**
1. Ensure PostgreSQL is running: `sudo systemctl start postgresql`
2. Check database credentials in `backend/casevault/settings.py`
3. Verify database exists: `psql -U casevault_user -d casevault_db`

#### CORS Error in Browser
```
Access to fetch at 'http://localhost:8000/api/' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solution:**
1. Ensure Django server is running on port 8000
2. Check CORS settings in `backend/casevault/settings.py`
3. Verify `CORS_ALLOWED_ORIGINS` includes frontend URL

#### Frontend Build Errors
```
Module not found: Can't resolve './components/...'
```
**Solution:**
1. Check file paths and imports
2. Ensure all dependencies are installed: `npm install`
3. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

#### Authentication Issues
```
401 Unauthorized
```
**Solution:**
1. Check if JWT token is valid
2. Verify user credentials
3. Ensure authentication headers are included in requests

### Development Tips

#### Backend Development
```bash
# Activate virtual environment
source backend/venv/bin/activate

# Install new packages
pip install package_name
pip freeze > requirements.txt

# Create new migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

#### Frontend Development
```bash
# Install new packages
npm install package_name

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

#### Database Management
```bash
# Backup database
pg_dump -U casevault_user -h localhost casevault_db > backup.sql

# Restore database
psql -U casevault_user -h localhost casevault_db < backup.sql

# Reset database
python manage.py flush
```

### Performance Optimization

#### Frontend
- Use React.memo for expensive components
- Implement proper loading states
- Optimize bundle size with code splitting

#### Backend
- Add database indexes for frequently queried fields
- Use select_related() for foreign key queries
- Implement pagination for large datasets

#### Database
- Regular VACUUM and ANALYZE operations
- Monitor query performance
- Add appropriate indexes

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test your changes**
   ```bash
   # Backend tests
   cd backend && python manage.py test
   
   # Frontend tests
   cd frontend && npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Code Style Guidelines

#### Frontend (TypeScript/React)
- Use TypeScript for all new components
- Follow React hooks best practices
- Use Tailwind CSS for styling
- Implement proper error boundaries

#### Backend (Python/Django)
- Follow PEP 8 style guidelines
- Use Django REST Framework serializers
- Implement proper error handling
- Add docstrings to functions and classes

#### Database
- Use descriptive table and column names
- Add proper foreign key constraints
- Include created_at and updated_at timestamps

### Testing

#### Backend Testing
```bash
cd backend
python manage.py test
```

#### Frontend Testing
```bash
cd frontend
npm test
```

### Deployment

#### Production Environment Variables
Create `.env.production` files with:

**Frontend:**
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

**Backend:**
```env
DEBUG=False
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql://user:pass@host:port/dbname
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
```

#### Build Commands
```bash
# Frontend production build
cd frontend && npm run build

# Backend static files
cd backend && python manage.py collectstatic
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review the API documentation

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Client management system
- Case management system
- JWT authentication
- Dashboard with statistics
- CRUD operations for clients and cases

---

**Built with ❤️ for law firms to manage their cases efficiently.**
