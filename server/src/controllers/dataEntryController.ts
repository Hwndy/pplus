import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

export const getDataEntries = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    companyId, 
    parameterId, 
    channelId, 
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

  if (parameterId) {
    where.parameterId = parameterId;
  }

  if (channelId) {
    where.channelId = channelId;
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
      { parameter: { name: { contains: search as string, mode: 'insensitive' } } },
      { channel: { name: { contains: search as string, mode: 'insensitive' } } },
      { comments: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  // Role-based filtering
  if (req.user!.role === 'ANALYST') {
    where.analystId = req.user!.id;
  }

  // Get total count
  const total = await prisma.dataEntry.count({ where });

  // Get data entries
  const dataEntries = await prisma.dataEntry.findMany({
    where,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          industry: true,
        },
      },
      parameter: {
        select: {
          id: true,
          name: true,
          category: true,
          unit: true,
        },
      },
      channel: {
        select: {
          id: true,
          name: true,
          type: true,
          category: true,
        },
      },
      analyst: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    skip,
    take: Number(limit),
    orderBy: {
      [sortBy as string]: sortOrder,
    },
  });

  return sendPaginatedResponse(res, dataEntries, {
    page: Number(page),
    limit: Number(limit),
    total,
  });
});

export const getDataEntryById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const dataEntry = await prisma.dataEntry.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          industry: true,
        },
      },
      parameter: {
        select: {
          id: true,
          name: true,
          category: true,
          unit: true,
        },
      },
      channel: {
        select: {
          id: true,
          name: true,
          type: true,
          category: true,
        },
      },
      analyst: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!dataEntry) {
    return sendError(res, 'Data entry not found', 404);
  }

  // Role-based access control
  if (req.user!.role === 'ANALYST' && dataEntry.analystId !== req.user!.id) {
    return sendError(res, 'Access denied', 403);
  }

  return sendSuccess(res, dataEntry, 'Data entry retrieved successfully');
});

export const createDataEntry = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { companyId, parameterId, channelId, value, date, comments, metadata } = req.body;

  // Verify that the referenced entities exist
  const [company, parameter, channel] = await Promise.all([
    prisma.company.findUnique({ where: { id: companyId } }),
    prisma.dataParameter.findUnique({ where: { id: parameterId } }),
    prisma.mediaChannel.findUnique({ where: { id: channelId } }),
  ]);

  if (!company) {
    return sendError(res, 'Company not found', 400);
  }

  if (!parameter) {
    return sendError(res, 'Data parameter not found', 400);
  }

  if (!channel) {
    return sendError(res, 'Media channel not found', 400);
  }

  // Create data entry
  const dataEntry = await prisma.dataEntry.create({
    data: {
      companyId,
      parameterId,
      channelId,
      value,
      date: new Date(date),
      comments,
      metadata,
      analystId: req.user!.id,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          industry: true,
        },
      },
      parameter: {
        select: {
          id: true,
          name: true,
          category: true,
          unit: true,
        },
      },
      channel: {
        select: {
          id: true,
          name: true,
          type: true,
          category: true,
        },
      },
      analyst: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return sendSuccess(res, dataEntry, 'Data entry created successfully', 201);
});

export const updateDataEntry = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { companyId, parameterId, channelId, value, date, status, comments, metadata } = req.body;

  // Check if data entry exists
  const existingEntry = await prisma.dataEntry.findUnique({
    where: { id },
  });

  if (!existingEntry) {
    return sendError(res, 'Data entry not found', 404);
  }

  // Role-based access control
  if (req.user!.role === 'ANALYST' && existingEntry.analystId !== req.user!.id) {
    return sendError(res, 'Access denied', 403);
  }

  // Analysts can only update their own entries and cannot change status
  const updateData: any = {};

  if (req.user!.role === 'ANALYST') {
    // Analysts can only update basic fields, not status
    if (companyId) updateData.companyId = companyId;
    if (parameterId) updateData.parameterId = parameterId;
    if (channelId) updateData.channelId = channelId;
    if (value !== undefined) updateData.value = value;
    if (date) updateData.date = new Date(date);
    if (comments !== undefined) updateData.comments = comments;
    if (metadata !== undefined) updateData.metadata = metadata;
  } else {
    // Supervisors and admins can update everything including status
    if (companyId) updateData.companyId = companyId;
    if (parameterId) updateData.parameterId = parameterId;
    if (channelId) updateData.channelId = channelId;
    if (value !== undefined) updateData.value = value;
    if (date) updateData.date = new Date(date);
    if (status) updateData.status = status;
    if (comments !== undefined) updateData.comments = comments;
    if (metadata !== undefined) updateData.metadata = metadata;
  }

  // Update data entry
  const dataEntry = await prisma.dataEntry.update({
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
      parameter: {
        select: {
          id: true,
          name: true,
          category: true,
          unit: true,
        },
      },
      channel: {
        select: {
          id: true,
          name: true,
          type: true,
          category: true,
        },
      },
      analyst: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return sendSuccess(res, dataEntry, 'Data entry updated successfully');
});

export const deleteDataEntry = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Check if data entry exists
  const existingEntry = await prisma.dataEntry.findUnique({
    where: { id },
  });

  if (!existingEntry) {
    return sendError(res, 'Data entry not found', 404);
  }

  // Role-based access control
  if (req.user!.role === 'ANALYST' && existingEntry.analystId !== req.user!.id) {
    return sendError(res, 'Access denied', 403);
  }

  // Delete data entry
  await prisma.dataEntry.delete({
    where: { id },
  });

  return sendSuccess(res, null, 'Data entry deleted successfully');
});
