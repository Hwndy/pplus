# Media Monitoring Dashboard

A comprehensive media monitoring and analytics dashboard for tracking media mentions, sentiment analysis, and PR performance across multiple companies and publications.

## 🌟 Features

### Frontend (React + TypeScript)
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Component Library**: Shadcn/ui components for consistent design
- **Responsive Design**: Mobile-first responsive layout
- **Role-Based Access**: Different interfaces for Admin, Supervisor, Analyst, and Client roles
- **Real-time Analytics**: Interactive charts and dashboards
- **Data Visualization**: Charts for sentiment analysis, trends, and comparisons

### Backend (Node.js + Express + PostgreSQL)
- **RESTful API**: Comprehensive REST API with OpenAPI documentation
- **Authentication**: JWT-based authentication with role-based access control
- **Database**: PostgreSQL with Prisma ORM
- **File Upload**: Secure file upload and management
- **Audit Logging**: Complete audit trail of all system actions
- **Data Analytics**: Advanced analytics and reporting endpoints

### Key Modules
- **User Management**: Multi-role user system with hierarchical permissions
- **Company Management**: Track multiple companies and their media presence
- **Publication Management**: Manage media publications and sources
- **Editorial Content**: Track and analyze editorial mentions with sentiment
- **Data Analytics**: Comprehensive analytics dashboard with trends and insights
- **SWOT Analysis**: Structured SWOT analysis management
- **Daily Mentions**: Daily media mention tracking and reporting
- **File Management**: Upload and manage media assets and documents

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Component library
- **Recharts** - Data visualization
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Prisma** - Database ORM
- **JWT** - Authentication
- **Multer** - File upload
- **Swagger/OpenAPI** - API documentation
- **Joi** - Data validation

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v13 or higher)
- **npm** or **yarn**

## 🚀 Quick Start

### Automated Setup

Run the setup script to automatically install dependencies and configure the application:

```bash
# Make the setup script executable and run it
chmod +x setup.sh
./setup.sh
```

### Manual Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd media-monitoring-dashboard
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Frontend
   cp .env.example .env
   
   # Backend
   cd server
   cp .env.example .env
   ```

5. **Configure the database**
   Edit `server/.env` with your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/media_monitoring_db"
   ```

6. **Set up the database**
   ```bash
   cd server
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

7. **Start the development servers**
   
   Backend (in server directory):
   ```bash
   npm run dev
   ```
   
   Frontend (in root directory):
   ```bash
   npm run dev
   ```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs

## 📊 Dashboard Features

### Executive Summary
- Key performance indicators and metrics
- Sentiment analysis overview
- Media reach and engagement statistics
- Trending topics and mentions

### Analytics & Reporting
- Interactive charts and graphs
- Sentiment trend analysis
- Media channel performance
- Company comparison tools
- Custom date range filtering

### Content Management
- Editorial content tracking
- SWOT analysis management
- Daily mention summaries
- Publication and media channel management

### User Management
- Role-based access control
- User activity monitoring
- Audit trail and logging
- Team collaboration features

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions system
- **Data Validation**: Input validation and sanitization
- **Audit Logging**: Complete activity tracking
- **Rate Limiting**: API request throttling
- **CORS Protection**: Cross-origin request security

## 📱 Responsive Design

The dashboard is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile devices
- Different screen sizes and orientations

## 🚀 Deployment

### Using Docker

```bash
# Build and run with Docker Compose
cd server
docker-compose up -d
```

### Manual Deployment

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Build the backend**
   ```bash
   cd server
   npm run build
   ```

3. **Set production environment variables**
4. **Deploy to your hosting platform**

## 📚 Documentation

- **API Documentation**: Available at `/api-docs` when the server is running
- **Frontend Components**: Check the `src/components` directory
- **Backend API**: Detailed documentation in `server/README.md`
- **Database Schema**: Prisma schema in `server/prisma/schema.prisma`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information
4. Contact the development team

## 🎯 Roadmap

- [ ] Real-time notifications
- [ ] Advanced analytics with AI insights
- [ ] Mobile app development
- [ ] Integration with social media APIs
- [ ] Advanced reporting features
- [ ] Multi-language support

---

**Built with ❤️ for media monitoring and analytics**
