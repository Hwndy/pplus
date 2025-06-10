import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { hashPassword, comparePassword, generateToken, generateRefreshToken } from '../utils/auth';
import crypto from 'crypto';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             token:
 *               type: string
 *             refreshToken:
 *               type: string
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      role: true,
      status: true,
      avatar: true,
    },
  });

  if (!user) {
    return sendError(res, 'Invalid email or password', 401);
  }

  if (user.status !== 'ACTIVE') {
    return sendError(res, 'Account is inactive', 401);
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return sendError(res, 'Invalid email or password', 401);
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Generate tokens
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({ id: user.id });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  return sendSuccess(res, {
    user: userWithoutPassword,
    token,
    refreshToken,
  }, 'Login successful');
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
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
    },
  });

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  return sendSuccess(res, user, 'Profile retrieved successfully');
});

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password
 */
export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      password: true,
    },
  });

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    return sendError(res, 'Current password is incorrect', 400);
  }

  // Hash new password
  const hashedNewPassword = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedNewPassword },
  });

  return sendSuccess(res, null, 'Password changed successfully');
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return sendError(res, 'Refresh token is required', 400);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      return sendError(res, 'Invalid refresh token', 401);
    }

    // Generate new tokens
    const newToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({ id: user.id });

    return sendSuccess(res, {
      token: newToken,
      refreshToken: newRefreshToken,
    }, 'Token refreshed successfully');
  } catch (error) {
    return sendError(res, 'Invalid refresh token', 401);
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
export const logout = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  // In a real application, you might want to blacklist the token
  // For now, we'll just return a success message
  return sendSuccess(res, null, 'Logout successful');
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return sendError(res, 'Email is required', 400);
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    // Don't reveal if user exists or not for security
    return sendSuccess(res, null, 'If the email exists, a password reset link has been sent');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

  // Save reset token to user (you might want to create a separate table for this)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      // Note: You'll need to add these fields to your User model
      // resetToken,
      // resetTokenExpiry,
    },
  });

  // TODO: Send email with reset link
  // await emailService.sendPasswordResetEmail(user.email, resetToken);

  return sendSuccess(res, null, 'If the email exists, a password reset link has been sent');
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return sendError(res, 'Token and new password are required', 400);
  }

  if (newPassword.length < 6) {
    return sendError(res, 'Password must be at least 6 characters long', 400);
  }

  // Find user by reset token (you'll need to implement this based on your schema)
  // const user = await prisma.user.findFirst({
  //   where: {
  //     resetToken: token,
  //     resetTokenExpiry: {
  //       gt: new Date(),
  //     },
  //   },
  // });

  // For now, return a placeholder response
  // if (!user) {
  //   return sendError(res, 'Invalid or expired reset token', 400);
  // }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user password and clear reset token
  // await prisma.user.update({
  //   where: { id: user.id },
  //   data: {
  //     password: hashedPassword,
  //     resetToken: null,
  //     resetTokenExpiry: null,
  //   },
  // });

  return sendSuccess(res, null, 'Password reset successful. Please login with your new password.');
});
