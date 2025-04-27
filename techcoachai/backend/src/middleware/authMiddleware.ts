import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../config/jwt';

// Define the structure of the authenticated request
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    name: string;
    email: string;
  };
}

// Middleware to authenticate requests
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.',
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach user data to request object
    req.user = {
      userId: decoded.userId,
      name: decoded.name,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export default authenticate;
