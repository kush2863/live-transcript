import express from 'express';
import { AuthController } from './authController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/refresh-token', AuthController.refreshToken);

// Protected routes
router.get('/profile', authenticateUser, AuthController.getProfile);
router.put('/update-password', authenticateUser, AuthController.updatePassword);

export default router;
