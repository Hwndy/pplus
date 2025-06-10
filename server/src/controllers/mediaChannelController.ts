import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

export const getMediaChannels = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 10, search, type, category, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

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

  if (type) {
    where.type = type;
  }

  if (category) {
    where.category = { contains: category as string, mode: 'insensitive' };
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  // Get total count
  const total = await prisma.mediaChannel.count({ where });

  // Get media channels
  const mediaChannels = await prisma.mediaChannel.findMany({
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

  return sendPaginatedResponse(res, mediaChannels, {
    page: Number(page),
    limit: Number(limit),
    total,
  });
});

export const getMediaChannelById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const mediaChannel = await prisma.mediaChannel.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          dataEntries: true,
        },
      },
    },
  });

  if (!mediaChannel) {
    return sendError(res, 'Media channel not found', 404);
  }

  return sendSuccess(res, mediaChannel, 'Media channel retrieved successfully');
});

export const createMediaChannel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, type, category, description, isActive = true } = req.body;

  // Check if media channel already exists
  const existingChannel = await prisma.mediaChannel.findUnique({
    where: { name },
  });

  if (existingChannel) {
    return sendError(res, 'Media channel with this name already exists', 400);
  }

  // Create media channel
  const mediaChannel = await prisma.mediaChannel.create({
    data: {
      name,
      type,
      category,
      description,
      isActive,
    },
  });

  return sendSuccess(res, mediaChannel, 'Media channel created successfully', 201);
});

export const updateMediaChannel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, type, category, description, isActive } = req.body;

  // Check if media channel exists
  const existingChannel = await prisma.mediaChannel.findUnique({
    where: { id },
  });

  if (!existingChannel) {
    return sendError(res, 'Media channel not found', 404);
  }

  // Check if name is already taken by another channel
  if (name && name !== existingChannel.name) {
    const nameExists = await prisma.mediaChannel.findUnique({
      where: { name },
    });

    if (nameExists) {
      return sendError(res, 'Media channel name is already taken', 400);
    }
  }

  // Update media channel
  const mediaChannel = await prisma.mediaChannel.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(type && { type }),
      ...(category && { category }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return sendSuccess(res, mediaChannel, 'Media channel updated successfully');
});

export const deleteMediaChannel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Check if media channel exists
  const existingChannel = await prisma.mediaChannel.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          dataEntries: true,
        },
      },
    },
  });

  if (!existingChannel) {
    return sendError(res, 'Media channel not found', 404);
  }

  // Check if channel has associated data entries
  if (existingChannel._count.dataEntries > 0) {
    return sendError(res, 'Cannot delete media channel with existing data entries', 400);
  }

  // Delete media channel
  await prisma.mediaChannel.delete({
    where: { id },
  });

  return sendSuccess(res, null, 'Media channel deleted successfully');
});
