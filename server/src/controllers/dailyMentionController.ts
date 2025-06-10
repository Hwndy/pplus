import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

export const getDailyMentions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
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
      { title: { contains: search as string, mode: 'insensitive' } },
      { company: { name: { contains: search as string, mode: 'insensitive' } } },
      { analystNote: { contains: search as string, mode: 'insensitive' } },
      { supervisorNote: { contains: search as string, mode: 'insensitive' } },
      { highlights: { some: { content: { contains: search as string, mode: 'insensitive' } } } },
    ];
  }

  // Role-based filtering
  if (req.user!.role === 'ANALYST') {
    where.analystId = req.user!.id;
  }

  // Get total count
  const total = await prisma.dailyMention.count({ where });

  // Get daily mentions
  const dailyMentions = await prisma.dailyMention.findMany({
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
      highlights: {
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

  return sendPaginatedResponse(res, dailyMentions, {
    page: Number(page),
    limit: Number(limit),
    total,
  });
});

export const getDailyMentionById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const dailyMention = await prisma.dailyMention.findUnique({
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
      highlights: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!dailyMention) {
    return sendError(res, 'Daily mention not found', 404);
  }

  // Role-based access control
  if (req.user!.role === 'ANALYST' && dailyMention.analystId !== req.user!.id) {
    return sendError(res, 'Access denied', 403);
  }

  return sendSuccess(res, dailyMention, 'Daily mention retrieved successfully');
});

export const createDailyMention = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { date, companyId, title, publications, highlights, analystNote, supervisorNote } = req.body;

  // Verify that the company exists
  const company = await prisma.company.findUnique({ where: { id: companyId } });

  if (!company) {
    return sendError(res, 'Company not found', 400);
  }

  // Create daily mention with highlights
  const dailyMention = await prisma.dailyMention.create({
    data: {
      date: new Date(date),
      companyId,
      title,
      publications,
      analystNote,
      supervisorNote,
      analystId: req.user!.id,
      highlights: {
        create: highlights.map((highlight: any) => ({
          content: highlight.content,
          type: highlight.type,
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
      highlights: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  return sendSuccess(res, dailyMention, 'Daily mention created successfully', 201);
});

export const updateDailyMention = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { date, companyId, title, publications, highlights, analystNote, supervisorNote, status } = req.body;

  // Check if daily mention exists
  const existingMention = await prisma.dailyMention.findUnique({
    where: { id },
    include: { highlights: true },
  });

  if (!existingMention) {
    return sendError(res, 'Daily mention not found', 404);
  }

  // Role-based access control
  if (req.user!.role === 'ANALYST' && existingMention.analystId !== req.user!.id) {
    return sendError(res, 'Access denied', 403);
  }

  // Prepare update data based on user role
  const updateData: any = {};

  if (req.user!.role === 'ANALYST') {
    // Analysts can update most fields but not status or supervisor notes
    if (date) updateData.date = new Date(date);
    if (companyId) updateData.companyId = companyId;
    if (title) updateData.title = title;
    if (publications) updateData.publications = publications;
    if (analystNote !== undefined) updateData.analystNote = analystNote;
  } else {
    // Supervisors and admins can update everything
    if (date) updateData.date = new Date(date);
    if (companyId) updateData.companyId = companyId;
    if (title) updateData.title = title;
    if (publications) updateData.publications = publications;
    if (analystNote !== undefined) updateData.analystNote = analystNote;
    if (supervisorNote !== undefined) updateData.supervisorNote = supervisorNote;
    if (status) updateData.status = status;
  }

  // Handle highlights update if provided
  if (highlights) {
    // Delete existing highlights and create new ones
    await prisma.dailyMentionHighlight.deleteMany({
      where: { dailyMentionId: id },
    });

    updateData.highlights = {
      create: highlights.map((highlight: any) => ({
        content: highlight.content,
        type: highlight.type,
      })),
    };
  }

  // Update daily mention
  const dailyMention = await prisma.dailyMention.update({
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
      highlights: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  return sendSuccess(res, dailyMention, 'Daily mention updated successfully');
});

export const deleteDailyMention = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Check if daily mention exists
  const existingMention = await prisma.dailyMention.findUnique({
    where: { id },
  });

  if (!existingMention) {
    return sendError(res, 'Daily mention not found', 404);
  }

  // Role-based access control
  if (req.user!.role === 'ANALYST' && existingMention.analystId !== req.user!.id) {
    return sendError(res, 'Access denied', 403);
  }

  // Delete daily mention (highlights will be deleted automatically due to cascade)
  await prisma.dailyMention.delete({
    where: { id },
  });

  return sendSuccess(res, null, 'Daily mention deleted successfully');
});
