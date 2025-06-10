import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import prisma from '../lib/prisma';

export const auditMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Store original res.json to capture response
  const originalJson = res.json;
  let responseData: any;

  res.json = function (data: any) {
    responseData = data;
    return originalJson.call(this, data);
  };

  // Store original res.end to log after response
  const originalEnd = res.end;
  res.end = function (...args: any[]) {
    // Log the audit entry after response is sent
    setImmediate(async () => {
      try {
        if (req.user && shouldAudit(req)) {
          await createAuditLog(req, res, responseData);
        }
      } catch (error) {
        console.error('Audit logging failed:', error);
      }
    });

    return originalEnd.apply(this, args);
  };

  next();
};

const shouldAudit = (req: AuthenticatedRequest): boolean => {
  // Only audit state-changing operations
  const auditMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  return auditMethods.includes(req.method);
};

const createAuditLog = async (
  req: AuthenticatedRequest,
  res: Response,
  responseData: any
) => {
  try {
    const action = getActionFromRequest(req);
    const resource = getResourceFromRequest(req);
    const resourceId = getResourceIdFromRequest(req, responseData);

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action,
        resource,
        resourceId,
        details: {
          method: req.method,
          url: req.originalUrl,
          body: req.body,
          query: req.query,
          statusCode: res.statusCode,
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

const getActionFromRequest = (req: AuthenticatedRequest): string => {
  const method = req.method;
  const path = req.route?.path || req.path;

  switch (method) {
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return 'READ';
  }
};

const getResourceFromRequest = (req: AuthenticatedRequest): string => {
  const path = req.originalUrl.split('/');
  return path[2] || 'unknown'; // /api/[resource]/...
};

const getResourceIdFromRequest = (req: AuthenticatedRequest, responseData: any): string | null => {
  // Try to get ID from URL params
  if (req.params.id) {
    return req.params.id;
  }

  // Try to get ID from response data
  if (responseData?.data?.id) {
    return responseData.data.id;
  }

  if (responseData?.id) {
    return responseData.id;
  }

  return null;
};
