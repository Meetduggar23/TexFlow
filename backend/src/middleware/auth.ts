import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-secret-change-me');

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set. Using development fallback. Set JWT_SECRET in production!');
}

function getJwtSecret(): string {
  if (!JWT_SECRET) throw new Error('JWT_SECRET must be set in production');
  return JWT_SECRET;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function optionalAuthenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as { userId: string };
      req.userId = decoded.userId;
    } catch {
      // Public routes continue as anonymous when an optional token is invalid.
    }
  }

  next();
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, getJwtSecret(), {
    expiresIn: '7d' as any
  });
}
