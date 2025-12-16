# CaseVault .NET Core Backend

This is the .NET Core version of the CaseVault backend API, replacing the Django backend.

## Features

- **ASP.NET Core 9.0** Web API
- **Entity Framework Core** with PostgreSQL
- **JWT Authentication** 
- **Swagger/OpenAPI** documentation
- **CORS** configured for frontend
- **Same API endpoints** as Django version

## Quick Start

1. **Prerequisites**
   - .NET 9.0 SDK
   - PostgreSQL (same database as Django version)

2. **Run the application**
   ```bash
   ./start-dotnet.sh
   ```

3. **Access the API**
   - API: http://localhost:8000
   - Swagger UI: http://localhost:8000/swagger

## API Endpoints

### Authentication
- `POST /api/token` - Login (get JWT tokens)
- `POST /api/token/refresh` - Refresh access token

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/{id}` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/{id}` - Update client
- `DELETE /api/clients/{id}` - Delete client

### Cases
- `GET /api/cases` - Get all cases (with optional filters)
- `GET /api/cases/{id}` - Get case by ID
- `POST /api/cases` - Create new case
- `PUT /api/cases/{id}` - Update case
- `DELETE /api/cases/{id}` - Delete case

## Configuration

The application uses the same PostgreSQL database as the Django version:
- **Database**: casevault_db
- **User**: casevault_user
- **Password**: casevault_pass123

## Default Users

- **Admin**: admin@nmmlaw.com / admin123
- **Test**: test@example.com / testpass123

## Frontend Compatibility

This .NET backend is fully compatible with the existing React frontend. Simply:

1. Stop the Django backend
2. Start this .NET backend on port 8000
3. The frontend will work without any changes

## Development

```bash
# Build
dotnet build

# Run
dotnet run --urls="http://localhost:8000"

# Add packages
dotnet add package PackageName

# Create migration (if needed)
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update
```
