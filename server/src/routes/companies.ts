import { Router } from 'express';
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  searchCompanies,
} from '../controllers/companyController';
import { requireSupervisorOrAdmin } from '../middleware/auth';
import { validate, validateQuery } from '../utils/validation';
import {
  companyCreateSchema,
  companyUpdateSchema,
  companyQuerySchema,
} from '../utils/validation';

const router = Router();

// Get all companies
router.get('/', validateQuery(companyQuerySchema), getCompanies);

// Search companies
router.get('/search', searchCompanies);

// Get company by ID
router.get('/:id', getCompanyById);

// Create company (Supervisor and Admin only)
router.post('/', requireSupervisorOrAdmin, validate(companyCreateSchema), createCompany);

// Update company (Supervisor and Admin only)
router.put('/:id', requireSupervisorOrAdmin, validate(companyUpdateSchema), updateCompany);

// Delete company (Supervisor and Admin only)
router.delete('/:id', requireSupervisorOrAdmin, deleteCompany);

export default router;
