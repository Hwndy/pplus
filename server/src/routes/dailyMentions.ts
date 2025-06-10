import { Router } from 'express';
import {
  getDailyMentions,
  getDailyMentionById,
  createDailyMention,
  updateDailyMention,
  deleteDailyMention,
} from '../controllers/dailyMentionController';
import { requireAnalystOrAbove } from '../middleware/auth';
import { validate, validateQuery } from '../utils/validation';
import {
  dailyMentionCreateSchema,
  dailyMentionUpdateSchema,
  paginationSchema,
  dateRangeSchema,
} from '../utils/validation';

const router = Router();

// Get all daily mentions (Analyst and above)
router.get('/', requireAnalystOrAbove, validateQuery(paginationSchema), getDailyMentions);

// Get daily mention by ID (Analyst and above)
router.get('/:id', requireAnalystOrAbove, getDailyMentionById);

// Create daily mention (Analyst and above)
router.post('/', requireAnalystOrAbove, validate(dailyMentionCreateSchema), createDailyMention);

// Update daily mention (Analyst and above)
router.put('/:id', requireAnalystOrAbove, validate(dailyMentionUpdateSchema), updateDailyMention);

// Delete daily mention (Analyst and above)
router.delete('/:id', requireAnalystOrAbove, deleteDailyMention);

export default router;
