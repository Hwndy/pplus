import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { hashPassword } from '../utils/auth';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         name:
 *           type: string
 *         role:
 *           type: string
 *           enum: [ADMIN, SUPERVISOR, ANALYST, CLIENT]
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED]
 *         avatar:
 *           type: string
 *         mobileContact:
 *           type: string
 *         countryCode:
 *           type: string
 *         supervisorId:
 *           type: string
 *         expirationDate:
 *           type: string
 *           format: date-time
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, SUPERVISOR, ANALYST, CLIENT]
 *         description: Filter by role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
export const getUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 10, search, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (status) {
    where.status = status;
  }

  // Get total count
  const total = await prisma.user.count({ where });

  // Get users
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      avatar: true,
      mobileContact: true,
      countryCode: true,
      supervisorId: true,
      expirationDate: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
      supervisor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      subordinates: {
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

  return sendPaginatedResponse(res, users, {
    page: Number(page),
    limit: Number(limit),
    total,
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
export const getUserById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      avatar: true,
      mobileContact: true,
      countryCode: true,
      supervisorId: true,
      expirationDate: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
      supervisor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      subordinates: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  return sendSuccess(res, user, 'User retrieved successfully');
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
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
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [ADMIN, SUPERVISOR, ANALYST, CLIENT]
 *               mobileContact:
 *                 type: string
 *               countryCode:
 *                 type: string
 *               supervisorId:
 *                 type: string
 *               expirationDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */
export const createUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password, role, mobileContact, countryCode, supervisorId, expirationDate } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return sendError(res, 'User with this email already exists', 400);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      mobileContact,
      countryCode,
      supervisorId,
      expirationDate: expirationDate ? new Date(expirationDate) : null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      avatar: true,
      mobileContact: true,
      countryCode: true,
      supervisorId: true,
      expirationDate: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return sendSuccess(res, user, 'User created successfully', 201);
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
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
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [ADMIN, SUPERVISOR, ANALYST, CLIENT]
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED]
 *               mobileContact:
 *                 type: string
 *               countryCode:
 *                 type: string
 *               supervisorId:
 *                 type: string
 *               expirationDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
export const updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, email, role, status, mobileContact, countryCode, supervisorId, expirationDate } = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    return sendError(res, 'User not found', 404);
  }

  // Check if email is already taken by another user
  if (email && email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (emailExists) {
      return sendError(res, 'Email is already taken', 400);
    }
  }

  // Update user
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email: email.toLowerCase() }),
      ...(role && { role }),
      ...(status && { status }),
      ...(mobileContact !== undefined && { mobileContact }),
      ...(countryCode !== undefined && { countryCode }),
      ...(supervisorId !== undefined && { supervisorId }),
      ...(expirationDate !== undefined && {
        expirationDate: expirationDate ? new Date(expirationDate) : null
      }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      avatar: true,
      mobileContact: true,
      countryCode: true,
      supervisorId: true,
      expirationDate: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return sendSuccess(res, user, 'User updated successfully');
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
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
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
export const deleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    return sendError(res, 'User not found', 404);
  }

  // Prevent deleting yourself
  if (id === req.user!.id) {
    return sendError(res, 'You cannot delete your own account', 400);
  }

  // Delete user
  await prisma.user.delete({
    where: { id },
  });

  return sendSuccess(res, null, 'User deleted successfully');
});

/**
 * @swagger
 * /api/users/supervisors:
 *   get:
 *     summary: Get all supervisors
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Supervisors retrieved successfully
 */
export const getSupervisors = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const supervisors = await prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'SUPERVISOR'] },
      status: 'ACTIVE',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return sendSuccess(res, supervisors, 'Supervisors retrieved successfully');
});

/**
 * @swagger
 * /api/users/bulk-update:
 *   put:
 *     summary: Bulk update users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - updates
 *             properties:
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     data:
 *                       type: object
 *     responses:
 *       200:
 *         description: Users updated successfully
 */
export const bulkUpdateUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return sendError(res, 'Updates array is required and cannot be empty', 400);
  }

  const results = [];

  for (const update of updates) {
    try {
      const { id, data } = update;

      if (!id || !data) {
        results.push({ id, success: false, error: 'ID and data are required' });
        continue;
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
        },
      });

      results.push({ id, success: true, data: updatedUser });
    } catch (error) {
      results.push({
        id: update.id,
        success: false,
        error: error instanceof Error ? error.message : 'Update failed'
      });
    }
  }

  return sendSuccess(res, results, 'Bulk update completed');
});
