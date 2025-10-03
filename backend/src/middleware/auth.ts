import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { logger } from '../config/logger';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    logger.debug('Auth middleware: Checking token', {
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader?.substring(0, 10)
    });

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Auth middleware: No valid token provided', {
        hasAuthHeader: !!authHeader,
        startsWithBearer: authHeader?.startsWith('Bearer ')
      });
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    logger.debug('Auth middleware: Token verified', { userId: decoded.id, email: decoded.email });

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Auth middleware: Token verification failed', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};

// Export alias for consistency
export const authenticateToken = authMiddleware;