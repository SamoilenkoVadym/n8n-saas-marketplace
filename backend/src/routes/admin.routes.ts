import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';
import * as adminService from '../services/admin.service';

const router = Router();

// All routes require authentication and admin privileges
router.use(authenticateToken);
router.use(adminOnly);

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await adminService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
    });
  }
});

/**
 * GET /api/admin/users
 * Get paginated list of users
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;

    const result = await adminService.getUsers(page, limit, search, role);
    res.json(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
    });
  }
});

/**
 * PATCH /api/admin/users/:id/credits
 * Update user credits
 */
router.patch('/users/:id/credits', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { credits } = req.body;

    if (typeof credits !== 'number' || credits < 0) {
      return res.status(400).json({
        error: 'Invalid credits value. Must be a non-negative number.',
      });
    }

    await adminService.updateUserCredits(id, credits);

    res.json({
      message: 'User credits updated successfully',
    });
  } catch (error) {
    console.error('Error updating user credits:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to update user credits',
    });
  }
});

/**
 * PATCH /api/admin/users/:id/ban
 * Ban or unban a user
 */
router.patch('/users/:id/ban', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await adminService.toggleUserBan(id);

    res.json({
      message: result.banned ? 'User banned successfully' : 'User unbanned successfully',
      banned: result.banned,
    });
  } catch (error) {
    console.error('Error toggling user ban:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to update user status',
    });
  }
});

/**
 * GET /api/admin/payments
 * Get paginated list of payments
 */
router.get('/payments', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;

    const result = await adminService.getPayments(page, limit, status);
    res.json(result);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      error: 'Failed to fetch payments',
    });
  }
});

/**
 * GET /api/admin/templates
 * Get paginated list of templates
 */
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const published = req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined;

    const result = await adminService.getTemplates(page, limit, published);
    res.json(result);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      error: 'Failed to fetch templates',
    });
  }
});

/**
 * PATCH /api/admin/templates/:id/approve
 * Approve/publish a template
 */
router.patch('/templates/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await adminService.approveTemplate(id);

    res.json({
      message: 'Template approved successfully',
    });
  } catch (error) {
    console.error('Error approving template:', error);
    res.status(500).json({
      error: 'Failed to approve template',
    });
  }
});

/**
 * PATCH /api/admin/templates/:id/reject
 * Reject/unpublish a template
 */
router.patch('/templates/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await adminService.rejectTemplate(id);

    res.json({
      message: 'Template rejected successfully',
    });
  } catch (error) {
    console.error('Error rejecting template:', error);
    res.status(500).json({
      error: 'Failed to reject template',
    });
  }
});

/**
 * PATCH /api/admin/templates/:id
 * Update template metadata
 */
router.patch('/templates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, category, description } = req.body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({
          error: 'Invalid price value',
        });
      }
      updateData.price = price;
    }
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;

    await adminService.updateTemplate(id, updateData);

    res.json({
      message: 'Template updated successfully',
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({
      error: 'Failed to update template',
    });
  }
});

/**
 * DELETE /api/admin/templates/:id
 * Delete a template
 */
router.delete('/templates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await adminService.deleteTemplate(id);

    res.json({
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      error: 'Failed to delete template',
    });
  }
});

/**
 * GET /api/admin/ai-usage
 * Get AI usage analytics
 */
router.get('/ai-usage', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    const usage = await adminService.getAiUsage(days);
    res.json({ usage });
  } catch (error) {
    console.error('Error fetching AI usage:', error);
    res.status(500).json({
      error: 'Failed to fetch AI usage',
    });
  }
});

export default router;
