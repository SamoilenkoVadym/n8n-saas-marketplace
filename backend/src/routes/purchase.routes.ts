import { Router, Response } from 'express';
import { purchaseService } from '../services/purchase.service';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/purchases/:templateId - Purchase template with credits
router.post('/:templateId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { templateId } = req.params;
    const userId = req.user!.id;

    const purchase = await purchaseService.purchaseTemplate(userId, templateId);

    res.json(purchase);
  } catch (error: any) {
    console.error('Purchase template error:', error);

    if (error.message === 'Template not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === 'Insufficient credits') {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error.message === 'Template already purchased') {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Failed to purchase template' });
  }
});

// GET /api/purchases - Get user's purchases
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const purchases = await purchaseService.getUserPurchases(userId);

    res.json(purchases);
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: 'Failed to retrieve purchases' });
  }
});

export default router;