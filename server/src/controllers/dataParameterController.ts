import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

export const getDataParameters = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 10, search, category, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { category: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.category = { contains: category as string, mode: 'insensitive' };
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  // Get total count
  const total = await prisma.dataParameter.count({ where });

  // Get data parameters
  const dataParameters = await prisma.dataParameter.findMany({
    where,
    include: {
      _count: {
        select: {
          dataEntries: true,
        },
      },
    },
    skip,
    take: Number(limit),
    orderBy: {
      [sortBy as string]: sortOrder,
    },
  });

  return sendPaginatedResponse(res, dataParameters, {
    page: Number(page),
    limit: Number(limit),
    total,
  });
});

export const getDataParameterById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const dataParameter = await prisma.dataParameter.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          dataEntries: true,
        },
      },
    },
  });

  if (!dataParameter) {
    return sendError(res, 'Data parameter not found', 404);
  }

  return sendSuccess(res, dataParameter, 'Data parameter retrieved successfully');
});

export const createDataParameter = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, category, description, unit, isActive = true } = req.body;

  // Check if data parameter already exists
  const existingParameter = await prisma.dataParameter.findUnique({
    where: { name },
  });

  if (existingParameter) {
    return sendError(res, 'Data parameter with this name already exists', 400);
  }

  // Create data parameter
  const dataParameter = await prisma.dataParameter.create({
    data: {
      name,
      category,
      description,
      unit,
      isActive,
    },
  });

  return sendSuccess(res, dataParameter, 'Data parameter created successfully', 201);
});

export const updateDataParameter = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, category, description, unit, isActive } = req.body;

  // Check if data parameter exists
  const existingParameter = await prisma.dataParameter.findUnique({
    where: { id },
  });

  if (!existingParameter) {
    return sendError(res, 'Data parameter not found', 404);
  }

  // Check if name is already taken by another parameter
  if (name && name !== existingParameter.name) {
    const nameExists = await prisma.dataParameter.findUnique({
      where: { name },
    });

    if (nameExists) {
      return sendError(res, 'Data parameter name is already taken', 400);
    }
  }

  // Update data parameter
  const dataParameter = await prisma.dataParameter.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(category && { category }),
      ...(description !== undefined && { description }),
      ...(unit !== undefined && { unit }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return sendSuccess(res, dataParameter, 'Data parameter updated successfully');
});

export const deleteDataParameter = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Check if data parameter exists
  const existingParameter = await prisma.dataParameter.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          dataEntries: true,
        },
      },
    },
  });

  if (!existingParameter) {
    return sendError(res, 'Data parameter not found', 404);
  }

  // Check if parameter has associated data entries
  if (existingParameter._count.dataEntries > 0) {
    return sendError(res, 'Cannot delete data parameter with existing data entries', 400);
  }

  // Delete data parameter
  await prisma.dataParameter.delete({
    where: { id },
  });

  return sendSuccess(res, null, 'Data parameter deleted successfully');
});
