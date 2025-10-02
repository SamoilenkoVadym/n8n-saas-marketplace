import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { aiChatRateLimit } from '../middleware/rate-limit';
import * as aiService from '../services/ai.service';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/ai/chat
 * Send a message and get a generated workflow
 */
router.post('/chat', aiChatRateLimit, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { message, conversationId } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (message.length > 2000) {
      res.status(400).json({ error: 'Message is too long (max 2000 characters)' });
      return;
    }

    if (conversationId && typeof conversationId !== 'string') {
      res.status(400).json({ error: 'Invalid conversation ID' });
      return;
    }

    // Generate workflow
    const result = await aiService.generateWorkflow(
      req.user.id,
      message.trim(),
      conversationId
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('AI chat error:', error);

    if (error instanceof Error) {
      if (error.message === 'Conversation not found') {
        res.status(404).json({ error: error.message });
        return;
      }

      if (error.message.includes('API key') || error.message.includes('authentication')) {
        res.status(503).json({ error: 'AI service temporarily unavailable' });
        return;
      }
    }

    res.status(500).json({ error: 'Failed to generate workflow' });
  }
});

/**
 * GET /api/ai/conversations
 * Get user's conversation history
 */
router.get('/conversations', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const conversations = await aiService.getUserConversations(req.user.id);

    res.status(200).json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

/**
 * POST /api/ai/conversations/:id/regenerate
 * Regenerate workflow from existing conversation
 */
router.post('/conversations/:id/regenerate', aiChatRateLimit, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Invalid conversation ID' });
      return;
    }

    // Regenerate workflow
    const result = await aiService.regenerateWorkflow(req.user.id, id);

    res.status(200).json(result);
  } catch (error) {
    console.error('Regenerate workflow error:', error);

    if (error instanceof Error) {
      if (error.message === 'Conversation not found') {
        res.status(404).json({ error: error.message });
        return;
      }

      if (error.message === 'No messages in conversation' || error.message === 'No user message found') {
        res.status(400).json({ error: error.message });
        return;
      }

      if (error.message.includes('API key') || error.message.includes('authentication')) {
        res.status(503).json({ error: 'AI service temporarily unavailable' });
        return;
      }
    }

    res.status(500).json({ error: 'Failed to regenerate workflow' });
  }
});

export default router;
