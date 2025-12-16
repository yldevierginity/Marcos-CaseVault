#!/bin/bash

echo "Starting .NET Core CaseVault Backend..."

# Add dotnet tools to PATH
export PATH="$PATH:/home/acidburn/.dotnet/tools"

# Build the project
echo "Building project..."
dotnet build

# Run the application
echo "Starting server on http://localhost:8000..."
dotnet run --urls="http://localhost:8000"
