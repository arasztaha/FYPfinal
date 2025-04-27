import express from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/authController';
import authenticate from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

export default router;
