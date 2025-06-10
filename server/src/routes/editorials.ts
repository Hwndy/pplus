import { Router } from 'express';
import {
  getEditorials,
  getEditorialById,
  createEditorial,
  updateEditorial,
  deleteEditorial,
  batchUploadEditorials,
  downloadEditorialTemplate,
} from '../controllers/editorialController';
import { requireAnalystOrAbove } from '../middleware/auth';
import { validate, validateQuery } from '../utils/validation';
import {
  editorialCreateSchema,
  editorialUpdateSchema,
  editorialQuerySchema,
} from '../utils/validation';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  },
});

// Download template for batch upload (Analyst and above) - Must come before /:id route
router.get('/template', requireAnalystOrAbove, downloadEditorialTemplate);

// Batch upload editorials (Analyst and above)
router.post('/batch-upload', requireAnalystOrAbove, upload.single('file'), batchUploadEditorials);

// Get all editorials (Analyst and above)
router.get('/', requireAnalystOrAbove, validateQuery(editorialQuerySchema), getEditorials);

// Get editorial by ID (Analyst and above)
router.get('/:id', requireAnalystOrAbove, getEditorialById);

// Create editorial (Analyst and above)
router.post('/', requireAnalystOrAbove, validate(editorialCreateSchema), createEditorial);

// Update editorial (Analyst and above)
router.put('/:id', requireAnalystOrAbove, validate(editorialUpdateSchema), updateEditorial);

// Delete editorial (Analyst and above)
router.delete('/:id', requireAnalystOrAbove, deleteEditorial);

export default router;
