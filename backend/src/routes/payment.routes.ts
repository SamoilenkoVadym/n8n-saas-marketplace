import { Router, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Create Stripe checkout session
router.post('/create-checkout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { credits, amount } = req.body;
    const userId = req.user!.id;

    if (!credits || !amount || credits <= 0 || amount <= 0) {
      res.status(400).json({ error: 'Invalid credits or amount' });
      return;
    }

    const session = await paymentService.createCheckoutSession(userId, credits, amount);

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Get payment history
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const payments = await paymentService.getPaymentHistory(userId);

    res.json(payments);
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to retrieve payment history' });
  }
});

export default router;