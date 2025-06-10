import { Router } from 'express';
import {
  getSwotAnalyses,
  getSwotAnalysisById,
  createSwotAnalysis,
  updateSwotAnalysis,
  deleteSwotAnalysis,
} from '../controllers/swotAnalysisController';
import { requireAnalystOrAbove } from '../middleware/auth';
import { validate, validateQuery } from '../utils/validation';
import {
  swotAnalysisCreateSchema,
  swotAnalysisUpdateSchema,
  paginationSchema,
  dateRangeSchema,
} from '../utils/validation';

const router = Router();

// Get all SWOT analyses (Analyst and above)
router.get('/', requireAnalystOrAbove, validateQuery(paginationSchema), getSwotAnalyses);

// Get SWOT analysis by ID (Analyst and above)
router.get('/:id', requireAnalystOrAbove, getSwotAnalysisById);

// Create SWOT analysis (Analyst and above)
router.post('/', requireAnalystOrAbove, validate(swotAnalysisCreateSchema), createSwotAnalysis);

// Update SWOT analysis (Analyst and above)
router.put('/:id', requireAnalystOrAbove, validate(swotAnalysisUpdateSchema), updateSwotAnalysis);

// Delete SWOT analysis (Analyst and above)
router.delete('/:id', requireAnalystOrAbove, deleteSwotAnalysis);

export default router;
