# CaseVault - Law Firm Case Management System

**Version:** 2.0.0  
**Last Updated:** December 16, 2025  
**Law Firm:** Neyra Marcos Mendez & Jungco Law Office

## 🚀 Quick Start

1. **Start Backend (.NET Core)**
   ```bash
   cd backend
   ./start-dotnet.sh
   ```

2. **Start Frontend (React)**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Login: admin@nmmlaw.com / admin123

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **Vite 6.4.1** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Components

### Backend
- **ASP.NET Core 9.0** - Web API
- **Entity Framework Core** - ORM
- **PostgreSQL** - Database
- **JWT Authentication** - Security

### Database
- **PostgreSQL 12+** - Same database as before
- **Database**: casevault_db
- **User**: casevault_user
- **Password**: casevault_pass123

## 📋 Features

- Client Management (CRUD)
- Case Management (CRUD)
- JWT Authentication
- Real-time Search
- Status Filtering
- Responsive Design

## 🔧 Development

**Backend:**
```bash
cd backend
dotnet build
dotnet run --urls="http://localhost:8000"
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📚 API Documentation

### Authentication
- `POST /api/token` - Login
- `POST /api/token/refresh` - Refresh token

### Clients
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `PUT /api/clients/{id}` - Update client
- `DELETE /api/clients/{id}` - Delete client

### Cases
- `GET /api/cases` - List cases
- `POST /api/cases` - Create case
- `PUT /api/cases/{id}` - Update case
- `DELETE /api/cases/{id}` - Delete case

## 🔐 Default Credentials

- **Admin**: admin@nmmlaw.com / admin123
- **Test**: test@example.com / testpass123

---

**Migration from Django to .NET Core completed successfully!**
