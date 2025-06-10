import { Router } from 'express';
import {
  getDataEntries,
  getDataEntryById,
  createDataEntry,
  updateDataEntry,
  deleteDataEntry,
} from '../controllers/dataEntryController';
import { requireAnalystOrAbove } from '../middleware/auth';
import { validate, validateQuery } from '../utils/validation';
import {
  dataEntryCreateSchema,
  dataEntryUpdateSchema,
  dataEntryQuerySchema,
} from '../utils/validation';

const router = Router();

// Get all data entries (Analyst and above)
router.get('/', requireAnalystOrAbove, validateQuery(dataEntryQuerySchema), getDataEntries);

// Get data entry by ID (Analyst and above)
router.get('/:id', requireAnalystOrAbove, getDataEntryById);

// Create data entry (Analyst and above)
router.post('/', requireAnalystOrAbove, validate(dataEntryCreateSchema), createDataEntry);

// Update data entry (Analyst and above)
router.put('/:id', requireAnalystOrAbove, validate(dataEntryUpdateSchema), updateDataEntry);

// Delete data entry (Analyst and above)
router.delete('/:id', requireAnalystOrAbove, deleteDataEntry);

export default router;
