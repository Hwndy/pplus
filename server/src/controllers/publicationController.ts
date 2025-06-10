import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * @swagger
 * /api/publications:
 *   get:
 *     summary: Get all publications
 *     tags: [Publications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [PRINT, ONLINE, BOTH]
 *         description: Filter by publication type
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Publications retrieved successfully
 */
export const getPublications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 10, search, type, country, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { country: { contains: search as string, mode: 'insensitive' } },
      { language: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (type) {
    where.type = type;
  }

  if (country) {
    where.country = { contains: country as string, mode: 'insensitive' };
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  // Get total count
  const total = await prisma.publication.count({ where });

  // Get publications
  const publications = await prisma.publication.findMany({
    where,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          editorials: true,
        },
      },
    },
    skip,
    take: Number(limit),
    orderBy: {
      [sortBy as string]: sortOrder,
    },
  });

  return sendPaginatedResponse(res, publications, {
    page: Number(page),
    limit: Number(limit),
    total,
  });
});

export const getPublicationById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const publication = await prisma.publication.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          editorials: true,
        },
      },
    },
  });

  if (!publication) {
    return sendError(res, 'Publication not found', 404);
  }

  return sendSuccess(res, publication, 'Publication retrieved successfully');
});

export const createPublication = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, type, website, country = 'Nigeria', language = 'English', circulation = 0, isActive = true } = req.body;

  // Check if publication already exists
  const existingPublication = await prisma.publication.findUnique({
    where: { name },
  });

  if (existingPublication) {
    return sendError(res, 'Publication with this name already exists', 400);
  }

  // Create publication
  const publication = await prisma.publication.create({
    data: {
      name,
      type,
      website,
      country,
      language,
      circulation,
      isActive,
      createdById: req.user!.id,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return sendSuccess(res, publication, 'Publication created successfully', 201);
});

export const updatePublication = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, type, website, country, language, circulation, isActive } = req.body;

  // Check if publication exists
  const existingPublication = await prisma.publication.findUnique({
    where: { id },
  });

  if (!existingPublication) {
    return sendError(res, 'Publication not found', 404);
  }

  // Check if name is already taken by another publication
  if (name && name !== existingPublication.name) {
    const nameExists = await prisma.publication.findUnique({
      where: { name },
    });

    if (nameExists) {
      return sendError(res, 'Publication name is already taken', 400);
    }
  }

  // Update publication
  const publication = await prisma.publication.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(type && { type }),
      ...(website !== undefined && { website }),
      ...(country && { country }),
      ...(language && { language }),
      ...(circulation !== undefined && { circulation }),
      ...(isActive !== undefined && { isActive }),
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return sendSuccess(res, publication, 'Publication updated successfully');
});

export const deletePublication = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Check if publication exists
  const existingPublication = await prisma.publication.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          editorials: true,
        },
      },
    },
  });

  if (!existingPublication) {
    return sendError(res, 'Publication not found', 404);
  }

  // Check if publication has associated editorials
  if (existingPublication._count.editorials > 0) {
    return sendError(res, 'Cannot delete publication with existing editorials', 400);
  }

  // Delete publication
  await prisma.publication.delete({
    where: { id },
  });

  return sendSuccess(res, null, 'Publication deleted successfully');
});
