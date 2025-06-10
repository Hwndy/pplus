import { Router } from 'express';
import {
  getDataParameters,
  getDataParameterById,
  createDataParameter,
  updateDataParameter,
  deleteDataParameter,
} from '../controllers/dataParameterController';
import { requireSupervisorOrAdmin } from '../middleware/auth';
import { validate, validateQuery } from '../utils/validation';
import {
  dataParameterCreateSchema,
  dataParameterUpdateSchema,
  dataParameterQuerySchema,
} from '../utils/validation';

const router = Router();

// Get all data parameters
router.get('/', validateQuery(dataParameterQuerySchema), getDataParameters);

// Get data parameter by ID
router.get('/:id', getDataParameterById);

// Create data parameter (Supervisor and Admin only)
router.post('/', requireSupervisorOrAdmin, validate(dataParameterCreateSchema), createDataParameter);

// Update data parameter (Supervisor and Admin only)
router.put('/:id', requireSupervisorOrAdmin, validate(dataParameterUpdateSchema), updateDataParameter);

// Delete data parameter (Supervisor and Admin only)
router.delete('/:id', requireSupervisorOrAdmin, deleteDataParameter);

export default router;
