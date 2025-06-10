import { Router } from 'express';
import {
  getAuditLogs,
  getAuditLogById,
  getAuditLogsByResource,
  getAuditLogsByUser,
  getAuditLogStats,
} from '../controllers/auditLogController';
import { requireSupervisorOrAdmin, requireAnyRole } from '../middleware/auth';
import { validateQuery } from '../utils/validation';
import { paginationSchema, dateRangeSchema } from '../utils/validation';

const router = Router();

// Get all audit logs (Supervisor and Admin only)
router.get('/', requireSupervisorOrAdmin, validateQuery(paginationSchema), getAuditLogs);

// Get audit log statistics (Supervisor and Admin only)
router.get('/stats', requireSupervisorOrAdmin, validateQuery(dateRangeSchema), getAuditLogStats);

// Get audit log by ID (Any authenticated user, with role-based filtering)
router.get('/:id', requireAnyRole, getAuditLogById);

// Get audit logs by resource (Supervisor and Admin only)
router.get('/resource/:resource/:resourceId', requireSupervisorOrAdmin, validateQuery(paginationSchema), getAuditLogsByResource);

// Get audit logs by user (Any authenticated user, with role-based filtering)
router.get('/user/:userId', requireAnyRole, validateQuery(paginationSchema), getAuditLogsByUser);

export default router;
