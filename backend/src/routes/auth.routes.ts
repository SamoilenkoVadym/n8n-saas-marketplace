import { Router, Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logger } from '../config/logger';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    const result = await authService.register({ email, password, name });
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User already exists') {
        res.status(400).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    logger.debug('POST /api/auth/login received', {
      email,
      hasPassword: !!password,
      bodyKeys: Object.keys(req.body)
    });

    // Validate input
    if (!email || !password) {
      logger.warn('Login validation failed: Missing email or password', { email, hasPassword: !!password });
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const result = await authService.login({ email, password });
    logger.info('Login route: Success', { email });
    res.status(200).json(result);
  } catch (error) {
    logger.error('Login route error', error);
    if (error instanceof Error) {
      if (error.message === 'Invalid credentials') {
        res.status(401).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await authService.me(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;