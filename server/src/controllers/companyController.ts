import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         industry:
 *           type: string
 *         website:
 *           type: string
 *         logo:
 *           type: string
 *         description:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdById:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Get all companies
 *     tags: [Companies]
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
 *         name: industry
 *         schema:
 *           type: string
 *         description: Filter by industry
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Companies retrieved successfully
 */
export const getCompanies = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 10, search, industry, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { industry: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (industry) {
    where.industry = { contains: industry as string, mode: 'insensitive' };
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  // Get total count
  const total = await prisma.company.count({ where });

  // Get companies
  const companies = await prisma.company.findMany({
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
          dataEntries: true,
          editorials: true,
          swotAnalyses: true,
          dailyMentions: true,
        },
      },
    },
    skip,
    take: Number(limit),
    orderBy: {
      [sortBy as string]: sortOrder,
    },
  });

  return sendPaginatedResponse(res, companies, {
    page: Number(page),
    limit: Number(limit),
    total,
  });
});

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Get company by ID
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company retrieved successfully
 *       404:
 *         description: Company not found
 */
export const getCompanyById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const company = await prisma.company.findUnique({
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
          dataEntries: true,
          editorials: true,
          swotAnalyses: true,
          dailyMentions: true,
        },
      },
    },
  });

  if (!company) {
    return sendError(res, 'Company not found', 404);
  }

  return sendSuccess(res, company, 'Company retrieved successfully');
});

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Create a new company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - industry
 *             properties:
 *               name:
 *                 type: string
 *               industry:
 *                 type: string
 *               website:
 *                 type: string
 *               logo:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Company created successfully
 *       400:
 *         description: Validation error
 */
export const createCompany = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, industry, website, logo, description, isActive = true } = req.body;

  // Check if company already exists
  const existingCompany = await prisma.company.findUnique({
    where: { name },
  });

  if (existingCompany) {
    return sendError(res, 'Company with this name already exists', 400);
  }

  // Create company
  const company = await prisma.company.create({
    data: {
      name,
      industry,
      website,
      logo,
      description,
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

  return sendSuccess(res, company, 'Company created successfully', 201);
});

/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     summary: Update company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               industry:
 *                 type: string
 *               website:
 *                 type: string
 *               logo:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Company updated successfully
 *       404:
 *         description: Company not found
 */
export const updateCompany = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, industry, website, logo, description, isActive } = req.body;

  // Check if company exists
  const existingCompany = await prisma.company.findUnique({
    where: { id },
  });

  if (!existingCompany) {
    return sendError(res, 'Company not found', 404);
  }

  // Check if name is already taken by another company
  if (name && name !== existingCompany.name) {
    const nameExists = await prisma.company.findUnique({
      where: { name },
    });

    if (nameExists) {
      return sendError(res, 'Company name is already taken', 400);
    }
  }

  // Update company
  const company = await prisma.company.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(industry && { industry }),
      ...(website !== undefined && { website }),
      ...(logo !== undefined && { logo }),
      ...(description !== undefined && { description }),
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

  return sendSuccess(res, company, 'Company updated successfully');
});

/**
 * @swagger
 * /api/companies/{id}:
 *   delete:
 *     summary: Delete company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company deleted successfully
 *       404:
 *         description: Company not found
 *       400:
 *         description: Cannot delete company with existing data
 */
export const deleteCompany = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Check if company exists
  const existingCompany = await prisma.company.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          dataEntries: true,
          editorials: true,
          swotAnalyses: true,
          dailyMentions: true,
        },
      },
    },
  });

  if (!existingCompany) {
    return sendError(res, 'Company not found', 404);
  }

  // Check if company has associated data
  const hasData = existingCompany._count.dataEntries > 0 ||
                  existingCompany._count.editorials > 0 ||
                  existingCompany._count.swotAnalyses > 0 ||
                  existingCompany._count.dailyMentions > 0;

  if (hasData) {
    return sendError(res, 'Cannot delete company with existing data entries', 400);
  }

  // Delete company
  await prisma.company.delete({
    where: { id },
  });

  return sendSuccess(res, null, 'Company deleted successfully');
});

/**
 * @swagger
 * /api/companies/search:
 *   get:
 *     summary: Search companies
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
export const searchCompanies = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { q: query, limit = 10 } = req.query;

  // If special skip value, return empty array
  if (query === 'SKIP_SEARCH') {
    return sendSuccess(res, [], 'Search skipped');
  }

  // If no query or empty query, return all active companies (limited)
  if (!query || typeof query !== 'string' || query.trim() === '') {
    const companies = await prisma.company.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        industry: true,
        website: true,
        logo: true,
        description: true,
      },
      take: Number(limit),
      orderBy: {
        name: 'asc',
      },
    });

    return sendSuccess(res, companies, 'Companies retrieved successfully');
  }

  const companies = await prisma.company.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { industry: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      industry: true,
      website: true,
      logo: true,
      description: true,
    },
    take: Number(limit),
    orderBy: {
      name: 'asc',
    },
  });

  return sendSuccess(res, companies, 'Search results retrieved successfully');
});
