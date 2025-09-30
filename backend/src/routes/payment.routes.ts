import { Router, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { billingService } from '../services/billing.service';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Create Stripe checkout session
router.post('/create-checkout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { packageId } = req.body;
    const userId = req.user!.id;

    if (!packageId) {
      res.status(400).json({ error: 'Package ID is required' });
      return;
    }

    // Get package details
    const pkg = billingService.getPackageById(packageId);
    if (!pkg) {
      res.status(404).json({ error: 'Package not found' });
      return;
    }

    console.log('Package details:', { packageId, credits: pkg.credits, price: pkg.price });
    const session = await paymentService.createCheckoutSession(userId, pkg.credits, pkg.price);

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