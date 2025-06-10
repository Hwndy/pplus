import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';
import { upload, deleteFile, getFileUrl } from '../utils/fileUpload';
import path from 'path';

export const uploadFile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    return sendError(res, 'No file uploaded', 400);
  }

  const { fieldname, filename, originalname, mimetype, size, path: filePath } = req.file;

  // Save file info to database
  const fileUpload = await prisma.fileUpload.create({
    data: {
      filename,
      originalName: originalname,
      mimetype,
      size,
      path: filePath,
      uploadedBy: req.user!.id,
      metadata: {
        fieldname,
        uploadedAt: new Date().toISOString(),
        uploadedBy: req.user!.name,
      },
    },
  });

  // Generate file URL
  const subDir = path.dirname(filePath).split(path.sep).pop() || 'misc';
  const fileUrl = getFileUrl(filename, subDir);

  return sendSuccess(res, {
    ...fileUpload,
    url: fileUrl,
  }, 'File uploaded successfully', 201);
});

export const uploadMultipleFiles = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return sendError(res, 'No files uploaded', 400);
  }

  const fileUploads = await Promise.all(
    files.map(async (file) => {
      const { fieldname, filename, originalname, mimetype, size, path: filePath } = file;

      const fileUpload = await prisma.fileUpload.create({
        data: {
          filename,
          originalName: originalname,
          mimetype,
          size,
          path: filePath,
          uploadedBy: req.user!.id,
          metadata: {
            fieldname,
            uploadedAt: new Date().toISOString(),
            uploadedBy: req.user!.name,
          },
        },
      });

      // Generate file URL
      const subDir = path.dirname(filePath).split(path.sep).pop() || 'misc';
      const fileUrl = getFileUrl(filename, subDir);

      return {
        ...fileUpload,
        url: fileUrl,
      };
    })
  );

  return sendSuccess(res, fileUploads, 'Files uploaded successfully', 201);
});

export const getFiles = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 10, search, mimetype, uploadedBy, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { originalName: { contains: search as string, mode: 'insensitive' } },
      { filename: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (mimetype) {
    where.mimetype = { contains: mimetype as string, mode: 'insensitive' };
  }

  if (uploadedBy) {
    where.uploadedBy = uploadedBy;
  }

  // Role-based filtering
  if (req.user!.role === 'ANALYST') {
    where.uploadedBy = req.user!.id;
  }

  // Get total count
  const total = await prisma.fileUpload.count({ where });

  // Get files
  const files = await prisma.fileUpload.findMany({
    where,
    skip,
    take: Number(limit),
    orderBy: {
      [sortBy as string]: sortOrder,
    },
  });

  // Add URLs to files
  const filesWithUrls = files.map(file => {
    const subDir = path.dirname(file.path).split(path.sep).pop() || 'misc';
    const fileUrl = getFileUrl(file.filename, subDir);
    return {
      ...file,
      url: fileUrl,
    };
  });

  return sendPaginatedResponse(res, filesWithUrls, {
    page: Number(page),
    limit: Number(limit),
    total,
  });
});

export const getFileById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const file = await prisma.fileUpload.findUnique({
    where: { id },
  });

  if (!file) {
    return sendError(res, 'File not found', 404);
  }

  // Role-based access control
  if (req.user!.role === 'ANALYST' && file.uploadedBy !== req.user!.id) {
    return sendError(res, 'Access denied', 403);
  }

  // Generate file URL
  const subDir = path.dirname(file.path).split(path.sep).pop() || 'misc';
  const fileUrl = getFileUrl(file.filename, subDir);

  return sendSuccess(res, {
    ...file,
    url: fileUrl,
  }, 'File retrieved successfully');
});

export const deleteFileById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const file = await prisma.fileUpload.findUnique({
    where: { id },
  });

  if (!file) {
    return sendError(res, 'File not found', 404);
  }

  // Role-based access control
  if (req.user!.role === 'ANALYST' && file.uploadedBy !== req.user!.id) {
    return sendError(res, 'Access denied', 403);
  }

  // Delete file from filesystem
  deleteFile(file.path);

  // Delete file record from database
  await prisma.fileUpload.delete({
    where: { id },
  });

  return sendSuccess(res, null, 'File deleted successfully');
});

export const updateFileMetadata = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { metadata } = req.body;

  const file = await prisma.fileUpload.findUnique({
    where: { id },
  });

  if (!file) {
    return sendError(res, 'File not found', 404);
  }

  // Role-based access control
  if (req.user!.role === 'ANALYST' && file.uploadedBy !== req.user!.id) {
    return sendError(res, 'Access denied', 403);
  }

  // Update file metadata
  const updatedFile = await prisma.fileUpload.update({
    where: { id },
    data: {
      metadata: {
        ...file.metadata,
        ...metadata,
        lastModifiedAt: new Date().toISOString(),
        lastModifiedBy: req.user!.name,
      },
    },
  });

  // Generate file URL
  const subDir = path.dirname(updatedFile.path).split(path.sep).pop() || 'misc';
  const fileUrl = getFileUrl(updatedFile.filename, subDir);

  return sendSuccess(res, {
    ...updatedFile,
    url: fileUrl,
  }, 'File metadata updated successfully');
});
