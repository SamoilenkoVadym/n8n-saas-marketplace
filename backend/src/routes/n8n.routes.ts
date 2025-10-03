import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as n8nService from '../services/n8n.service';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/n8n/connect
 * Save user's n8n instance credentials
 */
router.post('/connect', async (req: Request, res: Response) => {
  try {
    const { baseUrl, apiKey } = req.body;
    const userId = req.user!.userId;

    // Validate input
    if (!baseUrl || !apiKey) {
      return res.status(400).json({
        error: 'Base URL and API key are required',
      });
    }

    // Test connection first
    const testResult = await n8nService.testConnection(baseUrl, apiKey);

    if (!testResult.success) {
      return res.status(400).json({
        error: testResult.message,
      });
    }

    // Save connection
    await n8nService.saveConnection(userId, baseUrl, apiKey);

    res.json({
      message: 'n8n instance connected successfully',
    });
  } catch (error) {
    console.error('Error connecting n8n:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to connect n8n instance',
    });
  }
});

/**
 * DELETE /api/n8n/disconnect
 * Remove user's n8n connection
 */
router.delete('/disconnect', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    await n8nService.disconnectN8n(userId);

    res.json({
      message: 'n8n instance disconnected successfully',
    });
  } catch (error) {
    console.error('Error disconnecting n8n:', error);
    res.status(500).json({
      error: 'Failed to disconnect n8n instance',
    });
  }
});

/**
 * GET /api/n8n/status
 * Check connection status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const status = await n8nService.getConnectionStatus(userId);

    res.json(status);
  } catch (error) {
    console.error('Error getting n8n status:', error);
    res.status(500).json({
      error: 'Failed to get connection status',
    });
  }
});

/**
 * POST /api/n8n/test
 * Test connection to n8n instance
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { baseUrl, apiKey } = req.body;

    if (!baseUrl || !apiKey) {
      return res.status(400).json({
        error: 'Base URL and API key are required',
      });
    }

    const result = await n8nService.testConnection(baseUrl, apiKey);

    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error) {
    console.error('Error testing n8n connection:', error);
    res.status(500).json({
      error: 'Failed to test connection',
    });
  }
});

/**
 * POST /api/n8n/deploy
 * Deploy workflow to user's n8n instance
 */
router.post('/deploy', async (req: Request, res: Response) => {
  try {
    const { workflow, name } = req.body;
    const userId = req.user!.userId;

    if (!workflow || !name) {
      return res.status(400).json({
        error: 'Workflow and name are required',
      });
    }

    const result = await n8nService.deployWorkflow(userId, workflow, name);

    if (result.success) {
      res.json({
        message: result.message,
        workflowId: result.workflowId,
        workflowUrl: result.workflowUrl,
      });
    } else {
      res.status(400).json({
        error: result.message,
      });
    }
  } catch (error) {
    console.error('Error deploying workflow:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to deploy workflow',
    });
  }
});

/**
 * GET /api/n8n/workflows
 * List workflows from user's n8n instance
 */
router.get('/workflows', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const workflows = await n8nService.getWorkflows(userId);

    res.json({ workflows });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch workflows',
    });
  }
});

/**
 * DELETE /api/n8n/workflows/:id
 * Delete workflow from user's n8n instance
 */
router.delete('/workflows/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const result = await n8nService.deleteWorkflow(userId, id);

    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete workflow',
    });
  }
});

/**
 * POST /api/n8n/workflows/:id/activate
 * Toggle workflow activation
 */
router.post('/workflows/:id/activate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    const userId = req.user!.userId;

    if (typeof active !== 'boolean') {
      return res.status(400).json({
        error: 'Active status (boolean) is required',
      });
    }

    const result = await n8nService.toggleWorkflowActivation(userId, id, active);

    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error) {
    console.error('Error toggling workflow activation:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to toggle workflow activation',
    });
  }
});

export default router;
