import { Router, Request, Response } from 'express';
import * as templateService from '../services/template.service';
import { authMiddleware, adminOnly, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/templates - List all published templates (public)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      category: req.query.category as string | undefined,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      search: req.query.search as string | undefined,
      onlyFree: req.query.onlyFree === 'true',
    };

    const templates = await templateService.list(filters);
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// GET /api/templates/:id - Get template by ID (public metadata, workflowJson if has access)
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const template = await templateService.getById(id, userId);
    res.status(200).json(template);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Template not found') {
        res.status(404).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// POST /api/templates/:id/download - Download template workflow (requires auth)
router.post('/:id/download', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const workflow = await templateService.download(id, userId);
    res.status(200).json(workflow);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Template not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message === 'Template is not published') {
        res.status(403).json({ error: error.message });
        return;
      }
      if (error.message.includes('Access denied')) {
        res.status(403).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: 'Failed to download template' });
  }
});

// POST /api/templates - Create new template (admin only)
router.post('/', authMiddleware, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, category, tags, price, workflowJson, previewImage, isPublished } = req.body;

    // Validate required fields
    if (!name || !description || !category || !workflowJson) {
      res.status(400).json({ error: 'Name, description, category, and workflowJson are required' });
      return;
    }

    const template = await templateService.create({
      name,
      description,
      category,
      tags: tags || [],
      price: price || 0,
      workflowJson,
      previewImage,
      isPublished,
      authorId: req.user!.id,
    });

    res.status(201).json(template);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Invalid workflow JSON')) {
        res.status(400).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// PUT /api/templates/:id - Update template (author or admin)
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { name, description, category, tags, price, workflowJson, previewImage, isPublished } = req.body;

    const template = await templateService.update(id, userId, userRole, {
      name,
      description,
      category,
      tags,
      price,
      workflowJson,
      previewImage,
      isPublished,
    });

    res.status(200).json(template);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Template not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message === 'Unauthorized to update this template') {
        res.status(403).json({ error: error.message });
        return;
      }
      if (error.message.includes('Invalid workflow JSON')) {
        res.status(400).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// DELETE /api/templates/:id - Delete template (author or admin)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await templateService.deleteTemplate(id, userId, userRole);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Template not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message === 'Unauthorized to delete this template') {
        res.status(403).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

export default router;