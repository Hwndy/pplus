#!/bin/bash

# Media Monitoring Dashboard Setup Script
echo "🚀 Setting up Media Monitoring Dashboard..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) is installed"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL is not installed. Please install PostgreSQL 13 or higher."
    print_status "You can install PostgreSQL from: https://www.postgresql.org/download/"
    print_status "Or use Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15"
fi

# Install frontend dependencies
print_status "Installing frontend dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd server
npm install
if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Copy environment files
print_status "Setting up environment files..."
if [ ! -f .env ]; then
    cp .env.example .env
    print_success "Backend .env file created"
else
    print_warning "Backend .env file already exists"
fi

cd ..
if [ ! -f .env ]; then
    cp .env.example .env
    print_success "Frontend .env file created"
else
    print_warning "Frontend .env file already exists"
fi

# Setup database (if PostgreSQL is available)
if command -v psql &> /dev/null; then
    print_status "Setting up database..."
    cd server
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npm run db:generate
    
    # Push database schema
    print_status "Pushing database schema..."
    npm run db:push
    
    # Seed database
    print_status "Seeding database with sample data..."
    npm run db:seed
    
    if [ $? -eq 0 ]; then
        print_success "Database setup completed"
    else
        print_warning "Database setup failed. Please check your PostgreSQL connection."
    fi
    
    cd ..
else
    print_warning "PostgreSQL not found. Skipping database setup."
    print_status "Please install PostgreSQL and run the following commands in the server directory:"
    print_status "  npm run db:generate"
    print_status "  npm run db:push"
    print_status "  npm run db:seed"
fi

print_success "Setup completed!"
echo ""
print_status "🎉 Media Monitoring Dashboard is ready!"
echo ""
print_status "To start the application:"
print_status "1. Start the backend server:"
print_status "   cd server && npm run dev"
echo ""
print_status "2. In a new terminal, start the frontend:"
print_status "   npm run dev"
echo ""
print_status "3. Open your browser and navigate to:"
print_status "   Frontend: http://localhost:5173"
print_status "   Backend API: http://localhost:3001"
print_status "   API Documentation: http://localhost:3001/api-docs"
echo ""
print_status "📋 Default user accounts:"
print_status "   Admin: admin@mediamonitor.com / admin123"
print_status "   Supervisor: supervisor@mediamonitor.com / supervisor123"
print_status "   Analyst: analyst@mediamonitor.com / analyst123"
print_status "   Client: client@mediamonitor.com / client123"
echo ""
print_status "📚 For more information, check the README files in the root and server directories."
