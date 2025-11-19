# 🔐 Login Credentials for Media Monitor Dashboard

## 📋 Available User Accounts

### 🔴 **Admin Users**
| Name | Email | Password | Role | Description |
|------|-------|----------|------|-------------|
| Admin User | `admin@mediamonitor.com` | `admin123` | Admin | System administrator (existing) |
| David Manager | `manager@mediamonitor.com` | `manager123` | Admin | Manager with admin privileges |
| Lisa Admin | `admin2@mediamonitor.com` | `admin123` | Admin | Additional admin user |

### 🟡 **Supervisor Users**
| Name | Email | Password | Role | Description |
|------|-------|----------|------|-------------|
| Mike Supervisor | `supervisor1@mediamonitor.com` | `supervisor123` | Supervisor | Content supervisor |
| Sarah Supervisor | `supervisor2@mediamonitor.com` | `supervisor123` | Supervisor | Content supervisor |
| Tom Supervisor | `supervisor3@mediamonitor.com` | `supervisor123` | Supervisor | Content supervisor |

### 🟢 **Analyst Users**
| Name | Email | Password | Role | Description |
|------|-------|----------|------|-------------|
| John Analyst | `analyst1@mediamonitor.com` | `analyst123` | Analyst | Content analyst |
| Jane Analyst | `analyst2@mediamonitor.com` | `analyst123` | Analyst | Content analyst |
| Emma Analyst | `analyst3@mediamonitor.com` | `analyst123` | Analyst | Content analyst |

### 🔵 **Client Users**
| Name | Email | Password | Role | Description |
|------|-------|----------|------|-------------|
| Client User 1 | `client1@company.com` | `client123` | Client | Client dashboard access |
| Client User 2 | `client2@company.com` | `client123` | Client | Client dashboard access |

## 🎯 **Recommended Test Accounts**

### For Full System Testing:
- **Admin**: `admin@mediamonitor.com` / `admin123`
- **Analyst**: `analyst1@mediamonitor.com` / `analyst123`
- **Client**: `client1@company.com` / `client123`

## 📊 **Database Summary**

The database has been populated with comprehensive test data:

### 📈 **Data Counts**
- **👥 Users**: 11 total (1 existing admin + 10 new users)
- **🏢 Companies**: 10 (Nigerian companies like Dangote, MTN, GTBank, etc.)
- **📰 Publications**: 10 (Guardian, Punch, ThisDay, Vanguard, etc.)
- **📺 Media Channels**: 10 (TV, Radio, Online, Social Media, etc.)
- **📊 Data Parameters**: 10 (Revenue Growth, Market Share, etc.)
- **📝 Data Entries**: 20 (Realistic business metrics)
- **📰 Editorials**: 15 (News articles and coverage)
- **🎯 SWOT Analyses**: 10 (Strategic analyses with items)
- **📅 Daily Mentions**: 12 (Daily news summaries)
- **📋 Audit Logs**: 25 (System activity logs)

### 🏢 **Sample Companies**
1. Dangote Group (Conglomerate)
2. MTN Nigeria (Telecommunications)
3. Guaranty Trust Bank (Banking)
4. Nigerian Breweries (Beverages)
5. Shoprite Holdings (Retail)
6. Zenith Bank (Banking)
7. First Bank of Nigeria (Banking)
8. Nestle Nigeria (Food & Beverages)
9. Unilever Nigeria (Consumer Goods)
10. Access Bank (Banking)

### 📰 **Sample Publications**
1. The Guardian Nigeria
2. Punch Newspapers
3. ThisDay Live
4. Vanguard News
5. Premium Times
6. Daily Trust
7. The Nation
8. Leadership Newspaper
9. Sahara Reporters
10. Channels TV

## 🚀 **API Endpoints Status**

All endpoints are working and returning data:

### ✅ **Working Endpoints**
- `/api/companies` - 10 companies
- `/api/publications` - 10 publications
- `/api/users` - 11 users
- `/api/media-channels` - 10 channels
- `/api/data-parameters` - 10 parameters
- `/api/editorials` - 15 editorials
- `/api/swot-analysis` - 10 analyses
- `/api/daily-mentions` - 12 mentions
- `/api/audit-logs` - 25 logs
- `/api/analytics/dashboard-summary` - Working
- `/api/analytics/mentions-trend` - Working
- `/api/analytics/sentiment-analysis` - Working

## 🔧 **Server Information**

- **Server URL**: `http://localhost:3001`
- **Frontend URL**: `http://localhost:8080`
- **API Documentation**: `http://localhost:3001/api-docs`
- **Health Check**: `http://localhost:3001/health`
- **Real-time WebSocket**: Enabled

## 🎉 **Ready for Testing**

The system is now fully populated with realistic data and ready for comprehensive testing:

1. **Authentication** ✅ - All user roles working
2. **Data Management** ✅ - CRUD operations functional
3. **Analytics** ✅ - Dashboard metrics working
4. **Real-time Updates** ✅ - WebSocket service enabled
5. **API Documentation** ✅ - Swagger docs available
6. **Audit Logging** ✅ - All actions tracked

## 🔐 **Security Notes**

- All passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Role-based access control is implemented
- Audit logging tracks all user actions
- CORS is properly configured for frontend access

---

**🎯 Start testing with the admin account for full access to all features!**
