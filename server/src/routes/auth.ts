import { Router } from 'express';
import { login, getProfile, changePassword, refreshToken, logout, forgotPassword, resetPassword } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../utils/validation';
import { loginSchema, changePasswordSchema } from '../utils/validation';

const router = Router();

// Public routes
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/me', authMiddleware, getProfile);
router.post('/change-password', authMiddleware, validate(changePasswordSchema), changePassword);
router.post('/logout', authMiddleware, logout);

// Password reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
