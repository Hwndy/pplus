import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

export const getAuditLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    userId, 
    action,
    resource,
    startDate,
    endDate,
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = {};

  if (userId) {
    where.userId = userId;
  }

  if (action) {
    where.action = { contains: action as string, mode: 'insensitive' };
  }

  if (resource) {
    where.resource = { contains: resource as string, mode: 'insensitive' };
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate as string);
    }
  }

  if (search) {
    where.OR = [
      { action: { contains: search as string, mode: 'insensitive' } },
      { resource: { contains: search as string, mode: 'insensitive' } },
      { resourceId: { contains: search as string, mode: 'insensitive' } },
      { user: { name: { contains: search as string, mode: 'insensitive' } } },
      { user: { email: { contains: search as string, mode: 'insensitive' } } },
    ];
  }

  // Role-based filtering
  if (req.user!.role === 'ANALYST') {
    where.userId = req.user!.id;
  }

  // Get total count
  const total = await prisma.auditLog.count({ where });

  // Get audit logs
  const auditLogs = await prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    skip,
    take: Number(limit),
    orderBy: {
      [sortBy as string]: sortOrder,
    },
  });

  return sendPaginatedResponse(res, auditLogs, {
    page: Number(page),
    limit: Number(limit),
    total,
  });
});

export const getAuditLogById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const auditLog = await prisma.auditLog.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!auditLog) {
    return sendError(res, 'Audit log not found', 404);
  }

  // Role-based access control
  if (req.user!.role === 'ANALYST' && auditLog.userId !== req.user!.id) {
    return sendError(res, 'Access denied', 403);
  }

  return sendSuccess(res, auditLog, 'Audit log retrieved successfully');
});

export const getAuditLogsByResource = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { resource, resourceId } = req.params;
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = {
    resource,
    resourceId,
  };

  // Role-based filtering
  if (req.user!.role === 'ANALYST') {
    where.userId = req.user!.id;
  }

  // Get total count
  const total = await prisma.auditLog.count({ where });

  // Get audit logs
  const auditLogs = await prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    skip,
    take: Number(limit),
    orderBy: {
      [sortBy as string]: sortOrder,
    },
  });

  return sendPaginatedResponse(res, auditLogs, {
    page: Number(page),
    limit: Number(limit),
    total,
  });
});

export const getAuditLogsByUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  // Role-based access control
  if (req.user!.role === 'ANALYST' && userId !== req.user!.id) {
    return sendError(res, 'Access denied', 403);
  }

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = {
    userId,
  };

  // Get total count
  const total = await prisma.auditLog.count({ where });

  // Get audit logs
  const auditLogs = await prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    skip,
    take: Number(limit),
    orderBy: {
      [sortBy as string]: sortOrder,
    },
  });

  return sendPaginatedResponse(res, auditLogs, {
    page: Number(page),
    limit: Number(limit),
    total,
  });
});

export const getAuditLogStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { startDate, endDate } = req.query;

  // Default date range (last 30 days)
  const end = endDate ? new Date(endDate as string) : new Date();
  const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Build where clause
  const where: any = {
    createdAt: {
      gte: start,
      lte: end,
    },
  };

  // Role-based filtering
  if (req.user!.role === 'ANALYST') {
    where.userId = req.user!.id;
  }

  // Get action distribution
  const actionStats = await prisma.auditLog.groupBy({
    by: ['action'],
    where,
    _count: {
      action: true,
    },
    orderBy: {
      _count: {
        action: 'desc',
      },
    },
  });

  // Get resource distribution
  const resourceStats = await prisma.auditLog.groupBy({
    by: ['resource'],
    where,
    _count: {
      resource: true,
    },
    orderBy: {
      _count: {
        resource: 'desc',
      },
    },
  });

  // Get user activity
  const userStats = await prisma.auditLog.groupBy({
    by: ['userId'],
    where,
    _count: {
      userId: true,
    },
    orderBy: {
      _count: {
        userId: 'desc',
      },
    },
    take: 10,
  });

  // Get user names for user stats
  const userIds = userStats.map(us => us.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true, role: true },
  });

  const userStatsWithNames = userStats.map(us => ({
    ...us,
    user: users.find(u => u.id === us.userId),
  }));

  // Get total count
  const totalLogs = await prisma.auditLog.count({ where });

  const stats = {
    totalLogs,
    actionStats,
    resourceStats,
    userStats: userStatsWithNames,
    dateRange: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
  };

  return sendSuccess(res, stats, 'Audit log statistics retrieved successfully');
});
