import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

export const getSwotAnalyses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    companyId, 
    status, 
    analystId,
    startDate,
    endDate,
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = {};

  if (companyId) {
    where.companyId = companyId;
  }

  if (status) {
    where.status = status;
  }

  if (analystId) {
    where.analystId = analystId;
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.date.lte = new Date(endDate as string);
    }
  }

  if (search) {
    where.OR = [
      { company: { name: { contains: search as string, mode: 'insensitive' } } },
      { analystNote: { contains: search as string, mode: 'insensitive' } },
      { supervisorNote: { contains: search as string, mode: 'insensitive' } },
      { items: { some: { content: { contains: search as string, mode: 'insensitive' } } } },
    ];
  }

  // Role-based filtering
  if (req.user!.role === 'ANALYST') {
    where.analystId = req.user!.id;
  }

  // Get total count
  const total = await prisma.swotAnalysis.count({ where });

  // Get SWOT analyses
  const swotAnalyses = await prisma.swotAnalysis.findMany({
    where,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          industry: true,
        },
      },
      analyst: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
    skip,
    take: Number(limit),
    orderBy: {
      [sortBy as string]: sortOrder,
    },
  });

  return sendPaginatedResponse(res, swotAnalyses, {
    page: Number(page),
    limit: Number(limit),
    total,
  });
});

export const getSwotAnalysisById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const swotAnalysis = await prisma.swotAnalysis.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          industry: true,
        },
      },
      analyst: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!swotAnalysis) {
    return sendError(res, 'SWOT analysis not found', 404);
  }

  // Role-based access control
  if (req.user!.role === 'ANALYST' && swotAnalysis.analystId !== req.user!.id) {
    return sendError(res, 'Access denied', 403);
  }

  return sendSuccess(res, swotAnalysis, 'SWOT analysis retrieved successfully');
});

export const createSwotAnalysis = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { companyId, date, items, analystNote, supervisorNote } = req.body;

  // Verify that the company exists
  const company = await prisma.company.findUnique({ where: { id: companyId } });

  if (!company) {
    return sendError(res, 'Company not found', 400);
  }

  // Create SWOT analysis with items
  const swotAnalysis = await prisma.swotAnalysis.create({
    data: {
      companyId,
      date: new Date(date),
      analystNote,
      supervisorNote,
      analystId: req.user!.id,
      items: {
        create: items.map((item: any) => ({
          content: item.content,
          type: item.type,
        })),
      },
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          industry: true,
        },
      },
      analyst: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  return sendSuccess(res, swotAnalysis, 'SWOT analysis created successfully', 201);
});

export const updateSwotAnalysis = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { companyId, date, items, analystNote, supervisorNote, status } = req.body;

  // Check if SWOT analysis exists
  const existingAnalysis = await prisma.swotAnalysis.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!existingAnalysis) {
    return sendError(res, 'SWOT analysis not found', 404);
  }

  // Role-based access control
  if (req.user!.role === 'ANALYST' && existingAnalysis.analystId !== req.user!.id) {
    return sendError(res, 'Access denied', 403);
  }

  // Prepare update data based on user role
  const updateData: any = {};

  if (req.user!.role === 'ANALYST') {
    // Analysts can update most fields but not status or supervisor notes
    if (companyId) updateData.companyId = companyId;
    if (date) updateData.date = new Date(date);
    if (analystNote !== undefined) updateData.analystNote = analystNote;
  } else {
    // Supervisors and admins can update everything
    if (companyId) updateData.companyId = companyId;
    if (date) updateData.date = new Date(date);
    if (analystNote !== undefined) updateData.analystNote = analystNote;
    if (supervisorNote !== undefined) updateData.supervisorNote = supervisorNote;
    if (status) updateData.status = status;
  }

  // Handle items update if provided
  if (items) {
    // Delete existing items and create new ones
    await prisma.swotItem.deleteMany({
      where: { swotAnalysisId: id },
    });

    updateData.items = {
      create: items.map((item: any) => ({
        content: item.content,
        type: item.type,
      })),
    };
  }

  // Update SWOT analysis
  const swotAnalysis = await prisma.swotAnalysis.update({
    where: { id },
    data: updateData,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          industry: true,
        },
      },
      analyst: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  return sendSuccess(res, swotAnalysis, 'SWOT analysis updated successfully');
});

export const deleteSwotAnalysis = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Check if SWOT analysis exists
  const existingAnalysis = await prisma.swotAnalysis.findUnique({
    where: { id },
  });

  if (!existingAnalysis) {
    return sendError(res, 'SWOT analysis not found', 404);
  }

  // Role-based access control
  if (req.user!.role === 'ANALYST' && existingAnalysis.analystId !== req.user!.id) {
    return sendError(res, 'Access denied', 403);
  }

  // Delete SWOT analysis (items will be deleted automatically due to cascade)
  await prisma.swotAnalysis.delete({
    where: { id },
  });

  return sendSuccess(res, null, 'SWOT analysis deleted successfully');
});
