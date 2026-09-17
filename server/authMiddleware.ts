import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'craftwise_secret_jwt_key_sih2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    mobile?: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      fullName: string;
      role: string;
      mobile?: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        fullName: string;
        role: string;
        mobile?: string;
      };
      req.user = decoded;
    } catch {
      // Ignore token error for optional auth
    }
  }
  next();
}

export function signToken(user: { id: string; email: string; fullName: string; role: string; mobile?: string }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      mobile: user.mobile
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
