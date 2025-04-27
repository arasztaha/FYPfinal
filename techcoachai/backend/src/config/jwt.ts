import jwt from 'jsonwebtoken';
import type { IUser } from '../models/User';

// JWT secret key - in production, store this in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'techcoachai-jwt-secret';
const JWT_LIFETIME = process.env.JWT_LIFETIME || '7d';

// Define the token payload structure
export interface JwtPayload {
  userId: string;
  name: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Generate JWT token for a user
export const generateToken = (user: IUser): string => {
  const payload = {
    userId: user._id,
    name: user.name,
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_LIFETIME,
  });
};

// Verify JWT token
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export default {
  generateToken,
  verifyToken,
  JWT_SECRET,
  JWT_LIFETIME,
};
