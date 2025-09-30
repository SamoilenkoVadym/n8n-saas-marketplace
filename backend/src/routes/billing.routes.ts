import { Router, Response } from 'express';
import { billingService } from '../services/billing.service';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';

const router = Router();

// GET /api/billing/packages - Get available credit packages
router.get('/packages', authMiddleware, async (_req: AuthRequest, res: Response) => {
  try {
    const packages = billingService.getPackages();
    res.json(packages);
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ error: 'Failed to retrieve packages' });
  }
});

// GET /api/billing/verify-session - Verify Stripe session and return updated credits
router.get('/verify-session', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { session_id } = req.query;
    const userId = req.user!.id;

    if (!session_id || typeof session_id !== 'string') {
      res.status(400).json({ error: 'Session ID is required' });
      return;
    }

    // Find payment by session ID
    const payment = await prisma.payment.findUnique({
      where: { stripeSessionId: session_id },
    });

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    if (payment.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    // Get updated user credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    res.json({
      success: payment.status === 'completed',
      credits: user?.credits || 0,
      transaction: {
        id: payment.id,
        userId: payment.userId,
        credits: payment.credits,
        amount: payment.amount,
        stripeSessionId: payment.stripeSessionId,
        status: payment.status,
        createdAt: payment.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Verify session error:', error);
    res.status(500).json({ error: 'Failed to verify session' });
  }
});

export default router;