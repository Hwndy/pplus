# Troubleshooting Guide

This guide helps you resolve common issues with the Media Monitoring Dashboard backend.

## 🚀 Quick Start Checklist

1. **Check Node.js version**
   ```bash
   node --version  # Should be 18 or higher
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```

4. **Set up database**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

6. **Check server status**
   ```bash
   npm run check
   ```

## 🔧 Common Issues and Solutions

### 1. Server Won't Start

**Error**: `Error: Not Found - /`

**Solution**: This is normal! The server is running. The error occurs when you visit the root URL in a browser. Try these instead:
- http://localhost:3001/health (Health check)
- http://localhost:3001/api-docs (API documentation)
- http://localhost:3001/test (Test endpoint)

### 2. Database Connection Issues

**Error**: `Can't reach database server`

**Solutions**:
1. **Check PostgreSQL is running**
   ```bash
   # On Windows (if using local PostgreSQL)
   net start postgresql-x64-13
   
   # On macOS
   brew services start postgresql
   
   # On Linux
   sudo systemctl start postgresql
   ```

2. **Use Docker for PostgreSQL**
   ```bash
   docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15
   ```

3. **Check DATABASE_URL in .env**
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/media_monitoring_db"
   ```

### 3. Prisma Issues

**Error**: `Prisma Client is not generated`

**Solution**:
```bash
npm run db:generate
```

**Error**: `Database does not exist`

**Solution**:
```bash
# Create database manually or use Docker
npm run db:push
```

### 4. Authentication Issues

**Error**: `Invalid token`

**Solutions**:
1. **Check JWT_SECRET in .env**
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

2. **Use correct login credentials**
   - Email: admin@mediamonitor.com
   - Password: admin123

### 5. CORS Issues

**Error**: `CORS policy blocked`

**Solution**: Update CORS_ORIGIN in .env
```env
CORS_ORIGIN=http://localhost:5173
```

### 6. File Upload Issues

**Error**: `File upload failed`

**Solutions**:
1. **Check upload directory exists**
   ```bash
   mkdir uploads
   ```

2. **Check file size limits**
   ```env
   MAX_FILE_SIZE=10485760  # 10MB
   ```

### 7. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3001`

**Solutions**:
1. **Kill existing process**
   ```bash
   # Windows
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:3001 | xargs kill -9
   ```

2. **Use different port**
   ```env
   PORT=3002
   ```

## 🧪 Testing and Debugging

### 1. Test API Endpoints

```bash
# Test all endpoints
npm run test:api

# Check server health
curl http://localhost:3001/health

# Test authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mediamonitor.com","password":"admin123"}'
```

### 2. Database Debugging

```bash
# Open Prisma Studio
npm run db:studio

# Check database schema
npm run db:generate

# Reset database (WARNING: This will delete all data)
npm run db:push --force-reset
npm run db:seed
```

### 3. Enable Debug Logging

Add to .env:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

## 📊 Monitoring and Logs

### 1. Check Server Logs

The server logs all requests and errors to the console. Look for:
- HTTP status codes
- Error messages
- Database query logs (in development)

### 2. Health Check Endpoint

Visit http://localhost:3001/health to see:
- Server status
- Uptime
- Environment
- Timestamp

### 3. API Documentation

Visit http://localhost:3001/api-docs for:
- Interactive API documentation
- Endpoint testing
- Request/response examples

## 🔍 Advanced Debugging

### 1. Enable Prisma Query Logging

In `src/lib/prisma.ts`, the client is configured to log queries in development:
```typescript
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
```

### 2. Debug Authentication

Add logging to auth middleware:
```typescript
console.log('Token:', token);
console.log('Decoded:', decoded);
console.log('User:', user);
```

### 3. Database Connection Test

```bash
# Test database connection
npm run db:setup
```

## 🆘 Getting Help

If you're still having issues:

1. **Check the logs** for specific error messages
2. **Verify environment variables** are set correctly
3. **Test database connection** separately
4. **Check firewall/antivirus** settings
5. **Try running with Docker** for isolated environment

### Common Environment Variables

```env
# Required
DATABASE_URL="postgresql://postgres:password@localhost:5432/media_monitoring_db"
JWT_SECRET=your-super-secret-jwt-key
PORT=3001

# Optional
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
API_DOCS_ENABLED=true
```

### Docker Alternative

If you're having persistent issues, try running with Docker:

```bash
cd server
docker-compose up -d
```

This will start PostgreSQL and the API server in containers.

## 📞 Support

For additional support:
1. Check the main README.md
2. Review the API documentation at /api-docs
3. Check the GitHub issues
4. Contact the development team
