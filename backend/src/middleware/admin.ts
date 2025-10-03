import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

/**
 * Middleware to check if the user is an admin
 */
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    // Check if user is authenticated (should be called after authenticateToken)
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      res.status(403).json({ error: 'Access denied. Admin privileges required.' });
      return;
    }

    // User is admin, proceed
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
