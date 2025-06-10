import { Router } from 'express';
import {
  getPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
} from '../controllers/publicationController';
import { requireSupervisorOrAdmin } from '../middleware/auth';
import { validate, validateQuery } from '../utils/validation';
import {
  publicationCreateSchema,
  publicationUpdateSchema,
  publicationQuerySchema,
} from '../utils/validation';

const router = Router();

// Get all publications
router.get('/', validateQuery(publicationQuerySchema), getPublications);

// Get publication by ID
router.get('/:id', getPublicationById);

// Create publication (Supervisor and Admin only)
router.post('/', requireSupervisorOrAdmin, validate(publicationCreateSchema), createPublication);

// Update publication (Supervisor and Admin only)
router.put('/:id', requireSupervisorOrAdmin, validate(publicationUpdateSchema), updatePublication);

// Delete publication (Supervisor and Admin only)
router.delete('/:id', requireSupervisorOrAdmin, deletePublication);

export default router;
