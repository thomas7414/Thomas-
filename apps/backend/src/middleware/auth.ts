import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { APIError } from './errorHandler';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new APIError(401, 'No authentication token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = (decoded as any).userId;
    req.user = decoded;
    next();
  } catch (err) {
    throw new APIError(401, 'Invalid or expired token');
  }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.userId = (decoded as any).userId;
      req.user = decoded;
    } catch (err) {
      // Silently fail for optional auth
    }
  }

  next();
};
