import { Router } from 'express';
import {
  uploadFile,
  uploadMultipleFiles,
  getFiles,
  getFileById,
  deleteFileById,
  updateFileMetadata,
} from '../controllers/fileUploadController';
import { requireAnalystOrAbove } from '../middleware/auth';
import { upload } from '../utils/fileUpload';
import { validateQuery } from '../utils/validation';
import { paginationSchema } from '../utils/validation';

const router = Router();

// Upload single file
router.post('/upload', requireAnalystOrAbove, upload.single('file'), uploadFile);

// Upload multiple files
router.post('/upload-multiple', requireAnalystOrAbove, upload.array('files', 10), uploadMultipleFiles);

// Upload avatar/logo
router.post('/upload-avatar', requireAnalystOrAbove, upload.single('avatar'), uploadFile);
router.post('/upload-logo', requireAnalystOrAbove, upload.single('logo'), uploadFile);

// Upload document
router.post('/upload-document', requireAnalystOrAbove, upload.single('document'), uploadFile);

// Upload data file (CSV, Excel)
router.post('/upload-data', requireAnalystOrAbove, upload.single('data'), uploadFile);

// Get all files
router.get('/', requireAnalystOrAbove, validateQuery(paginationSchema), getFiles);

// Get file by ID
router.get('/:id', requireAnalystOrAbove, getFileById);

// Update file metadata
router.patch('/:id/metadata', requireAnalystOrAbove, updateFileMetadata);

// Delete file
router.delete('/:id', requireAnalystOrAbove, deleteFileById);

export default router;
