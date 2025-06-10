/**
 * Real-time WebSocket Service
 * Provides real-time updates for dashboard data
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

class RealtimeService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:8080",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupAuthentication();
    this.setupEventHandlers();
    this.startPeriodicUpdates();
  }

  private setupAuthentication() {
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, role: true, status: true }
        });

        if (!user || user.status !== 'ACTIVE') {
          return next(new Error('Invalid or inactive user'));
        }

        socket.userId = user.id;
        socket.userRole = user.role;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected to real-time service`);
      
      // Store connection
      this.connectedUsers.set(socket.id, socket.userId!);

      // Join user to their role-based room
      socket.join(`role:${socket.userRole}`);
      socket.join(`user:${socket.userId}`);

      // Handle subscription to specific data types
      socket.on('subscribe', (dataType: string) => {
        socket.join(`data:${dataType}`);
        console.log(`User ${socket.userId} subscribed to ${dataType}`);
      });

      socket.on('unsubscribe', (dataType: string) => {
        socket.leave(`data:${dataType}`);
        console.log(`User ${socket.userId} unsubscribed from ${dataType}`);
      });

      // Handle real-time data requests
      socket.on('request:dashboard-summary', async () => {
        try {
          const summary = await this.getDashboardSummary();
          socket.emit('dashboard-summary', summary);
        } catch (error) {
          socket.emit('error', { message: 'Failed to fetch dashboard summary' });
        }
      });

      socket.on('request:recent-activities', async () => {
        try {
          const activities = await this.getRecentActivities();
          socket.emit('recent-activities', activities);
        } catch (error) {
          socket.emit('error', { message: 'Failed to fetch recent activities' });
        }
      });

      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected from real-time service`);
        this.connectedUsers.delete(socket.id);
      });
    });
  }

  private async getDashboardSummary() {
    const [
      totalCompanies,
      totalUsers,
      totalEditorials,
      totalDataEntries,
      pendingApprovals,
      recentActivities
    ] = await Promise.all([
      prisma.company.count({ where: { isActive: true } }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.editorial.count(),
      prisma.dataEntry.count(),
      prisma.editorial.count({ where: { status: 'PENDING' } }) + 
      prisma.dataEntry.count({ where: { status: 'PENDING' } }),
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } }
      })
    ]);

    return {
      totalCompanies,
      totalUsers,
      totalEditorials,
      totalDataEntries,
      pendingApprovals,
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        action: activity.action,
        resource: activity.resource,
        userName: activity.user.name,
        createdAt: activity.createdAt
      }))
    };
  }

  private async getRecentActivities() {
    const activities = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, role: true } } }
    });

    return activities.map(activity => ({
      id: activity.id,
      action: activity.action,
      resource: activity.resource,
      userName: activity.user.name,
      userRole: activity.user.role,
      details: activity.details,
      createdAt: activity.createdAt
    }));
  }

  private startPeriodicUpdates() {
    // Send dashboard updates every 30 seconds
    setInterval(async () => {
      try {
        const summary = await this.getDashboardSummary();
        this.io.to('data:dashboard').emit('dashboard-summary', summary);
      } catch (error) {
        console.error('Error sending periodic dashboard update:', error);
      }
    }, 30000);

    // Send activity updates every 60 seconds
    setInterval(async () => {
      try {
        const activities = await this.getRecentActivities();
        this.io.to('data:activities').emit('recent-activities', activities);
      } catch (error) {
        console.error('Error sending periodic activity update:', error);
      }
    }, 60000);
  }

  // Public methods for triggering real-time updates
  public async notifyDataChange(dataType: string, action: string, data: any, userId?: string) {
    const notification = {
      type: dataType,
      action: action,
      data: data,
      timestamp: new Date(),
      userId: userId
    };

    // Broadcast to all users subscribed to this data type
    this.io.to(`data:${dataType}`).emit('data-change', notification);

    // Also send to role-based rooms if needed
    if (action === 'create' || action === 'update') {
      this.io.to('role:ADMIN').emit('admin-notification', notification);
      this.io.to('role:SUPERVISOR').emit('supervisor-notification', notification);
    }
  }

  public async notifyUserActivity(userId: string, action: string, resource: string, details?: any) {
    const activity = {
      userId,
      action,
      resource,
      details,
      timestamp: new Date()
    };

    // Broadcast to supervisors and admins
    this.io.to('role:ADMIN').emit('user-activity', activity);
    this.io.to('role:SUPERVISOR').emit('user-activity', activity);
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.values());
  }

  public async broadcastSystemMessage(message: string, type: 'info' | 'warning' | 'error' = 'info') {
    const systemMessage = {
      message,
      type,
      timestamp: new Date()
    };

    this.io.emit('system-message', systemMessage);
  }
}

export default RealtimeService;
