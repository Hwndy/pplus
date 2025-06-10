import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getSupervisors,
  bulkUpdateUsers,
} from '../controllers/userController';
import { requireAdmin, requireSupervisorOrAdmin } from '../middleware/auth';
import { validate, validateQuery } from '../utils/validation';
import {
  userCreateSchema,
  userUpdateSchema,
  userQuerySchema,
} from '../utils/validation';

const router = Router();

// Get all users (Admin and Supervisor only)
router.get('/', requireSupervisorOrAdmin, validateQuery(userQuerySchema), getUsers);

// Get supervisors (for dropdown lists)
router.get('/supervisors', getSupervisors);

// Get user by ID
router.get('/:id', requireSupervisorOrAdmin, getUserById);

// Create user (Admin only)
router.post('/', requireAdmin, validate(userCreateSchema), createUser);

// Update user (Admin only)
router.put('/:id', requireAdmin, validate(userUpdateSchema), updateUser);

// Delete user (Admin only)
router.delete('/:id', requireAdmin, deleteUser);

// Bulk update users (Admin only)
router.put('/bulk-update', requireAdmin, bulkUpdateUsers);

export default router;
