# Media Monitoring Dashboard - Backend API

A comprehensive backend API for the Media Monitoring and Analytics Dashboard built with Node.js, Express, TypeScript, and PostgreSQL.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Admin, Supervisor, Analyst, and Client roles
- **Company Management**: Track multiple companies and their media presence
- **Publication Management**: Manage media publications and sources
- **Editorial Content**: Track and analyze editorial mentions
- **Data Analytics**: Comprehensive analytics and reporting
- **SWOT Analysis**: Structured SWOT analysis management
- **Daily Mentions**: Daily media mention tracking
- **File Upload**: Secure file upload and management
- **Audit Logging**: Complete audit trail of all actions
- **API Documentation**: Swagger/OpenAPI documentation

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **File Upload**: Multer
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd media-monitoring-dashboard/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/media_monitoring_db"
   JWT_SECRET=your-super-secret-jwt-key
   PORT=3001
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   
   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

Once the server is running, you can access the interactive API documentation at:
- **Swagger UI**: `http://localhost:3001/api-docs`

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Default User Accounts

After seeding, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mediamonitor.com | admin123 |
| Supervisor | supervisor@mediamonitor.com | supervisor123 |
| Analyst | analyst@mediamonitor.com | analyst123 |
| Client | client@mediamonitor.com | client123 |

## 🛣️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/supervisors` - Get all supervisors

### Companies
- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get company by ID
- `POST /api/companies` - Create new company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Publications
- `GET /api/publications` - Get all publications
- `GET /api/publications/:id` - Get publication by ID
- `POST /api/publications` - Create new publication
- `PUT /api/publications/:id` - Update publication
- `DELETE /api/publications/:id` - Delete publication

### Media Channels
- `GET /api/media-channels` - Get all media channels
- `GET /api/media-channels/:id` - Get media channel by ID
- `POST /api/media-channels` - Create new media channel
- `PUT /api/media-channels/:id` - Update media channel
- `DELETE /api/media-channels/:id` - Delete media channel

### Data Parameters
- `GET /api/data-parameters` - Get all data parameters
- `GET /api/data-parameters/:id` - Get data parameter by ID
- `POST /api/data-parameters` - Create new data parameter
- `PUT /api/data-parameters/:id` - Update data parameter
- `DELETE /api/data-parameters/:id` - Delete data parameter

### Data Entries
- `GET /api/data-entries` - Get all data entries
- `GET /api/data-entries/:id` - Get data entry by ID
- `POST /api/data-entries` - Create new data entry
- `PUT /api/data-entries/:id` - Update data entry
- `DELETE /api/data-entries/:id` - Delete data entry

### Editorials
- `GET /api/editorials` - Get all editorials
- `GET /api/editorials/:id` - Get editorial by ID
- `POST /api/editorials` - Create new editorial
- `PUT /api/editorials/:id` - Update editorial
- `DELETE /api/editorials/:id` - Delete editorial

### SWOT Analysis
- `GET /api/swot-analysis` - Get all SWOT analyses
- `GET /api/swot-analysis/:id` - Get SWOT analysis by ID
- `POST /api/swot-analysis` - Create new SWOT analysis
- `PUT /api/swot-analysis/:id` - Update SWOT analysis
- `DELETE /api/swot-analysis/:id` - Delete SWOT analysis

### Daily Mentions
- `GET /api/daily-mentions` - Get all daily mentions
- `GET /api/daily-mentions/:id` - Get daily mention by ID
- `POST /api/daily-mentions` - Create new daily mention
- `PUT /api/daily-mentions/:id` - Update daily mention
- `DELETE /api/daily-mentions/:id` - Delete daily mention

### Analytics
- `GET /api/analytics/dashboard-summary` - Get dashboard summary
- `GET /api/analytics/mentions-trend` - Get mentions trend
- `GET /api/analytics/sentiment-analysis` - Get sentiment analysis
- `GET /api/analytics/media-channel-analysis` - Get media channel analysis
- `GET /api/analytics/company-comparison` - Get company comparison

### File Uploads
- `POST /api/files/upload` - Upload single file
- `POST /api/files/upload-multiple` - Upload multiple files
- `GET /api/files` - Get all files
- `GET /api/files/:id` - Get file by ID
- `DELETE /api/files/:id` - Delete file

### Audit Logs
- `GET /api/audit-logs` - Get all audit logs
- `GET /api/audit-logs/:id` - Get audit log by ID
- `GET /api/audit-logs/stats` - Get audit log statistics

## 🔒 Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all resources |
| **Supervisor** | Manage users (except admins), approve/reject content, view all data |
| **Analyst** | Create and edit own content, view assigned data |
| **Client** | Read-only access to approved content and analytics |

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: System users with different roles
- **Companies**: Companies being monitored
- **Publications**: Media publications and sources
- **Media Channels**: Different types of media channels
- **Data Parameters**: Metrics being tracked
- **Data Entries**: Individual data points
- **Editorials**: Editorial content and mentions
- **SWOT Analysis**: SWOT analysis entries
- **Daily Mentions**: Daily mention summaries
- **Audit Logs**: System audit trail
- **File Uploads**: Uploaded files metadata

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

Make sure to set these environment variables in production:

```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=your-frontend-domain
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
