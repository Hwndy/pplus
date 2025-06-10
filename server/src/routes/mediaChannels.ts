import { Router } from 'express';
import {
  getMediaChannels,
  getMediaChannelById,
  createMediaChannel,
  updateMediaChannel,
  deleteMediaChannel,
} from '../controllers/mediaChannelController';
import { requireSupervisorOrAdmin } from '../middleware/auth';
import { validate, validateQuery } from '../utils/validation';
import {
  mediaChannelCreateSchema,
  mediaChannelUpdateSchema,
  mediaChannelQuerySchema,
} from '../utils/validation';

const router = Router();

// Get all media channels
router.get('/', validateQuery(mediaChannelQuerySchema), getMediaChannels);

// Get media channel by ID
router.get('/:id', getMediaChannelById);

// Create media channel (Supervisor and Admin only)
router.post('/', requireSupervisorOrAdmin, validate(mediaChannelCreateSchema), createMediaChannel);

// Update media channel (Supervisor and Admin only)
router.put('/:id', requireSupervisorOrAdmin, validate(mediaChannelUpdateSchema), updateMediaChannel);

// Delete media channel (Supervisor and Admin only)
router.delete('/:id', requireSupervisorOrAdmin, deleteMediaChannel);

export default router;
