import prisma from '../config/database';

export interface CreateTemplateData {
  name: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  workflowJson: any;
  previewImage?: string;
  isPublished?: boolean;
  authorId: string;
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  price?: number;
  workflowJson?: any;
  previewImage?: string;
  isPublished?: boolean;
}

export interface TemplateFilters {
  category?: string;
  tags?: string[];
  search?: string;
  onlyFree?: boolean;
}

// Validate workflow JSON structure
const validateWorkflowJson = (workflowJson: any): boolean => {
  if (!workflowJson || typeof workflowJson !== 'object') {
    return false;
  }

  // Check for required n8n workflow properties
  if (!workflowJson.nodes || !Array.isArray(workflowJson.nodes)) {
    return false;
  }

  if (!workflowJson.connections || typeof workflowJson.connections !== 'object') {
    return false;
  }

  return true;
};

// Create a new template (admin only)
export const create = async (data: CreateTemplateData) => {
  // Validate workflow JSON
  if (!validateWorkflowJson(data.workflowJson)) {
    throw new Error('Invalid workflow JSON: must contain nodes and connections');
  }

  const template = await prisma.template.create({
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      tags: data.tags,
      price: data.price,
      workflowJson: data.workflowJson,
      previewImage: data.previewImage,
      isPublished: data.isPublished ?? false,
      authorId: data.authorId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return template;
};

// List all templates with filters (includes unpublished for display purposes)
export const list = async (filters?: TemplateFilters) => {
  const where: any = {};

  // Apply filters
  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.tags && filters.tags.length > 0) {
    where.tags = {
      hasSome: filters.tags,
    };
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters?.onlyFree) {
    where.price = 0;
  }

  const templates = await prisma.template.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      tags: true,
      price: true,
      previewImage: true,
      downloads: true,
      authorId: true,
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      isPublished: true,
      createdAt: true,
      updatedAt: true,
      // Exclude workflowJson from list
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return templates;
};

// Get template by ID
export const getById = async (id: string, userId?: string) => {
  const template = await prisma.template.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!template) {
    throw new Error('Template not found');
  }

  // Check if user has access to workflowJson
  const hasAccess =
    template.price === 0 || // Free template
    userId === template.authorId || // User is the author
    (userId && await checkUserPurchased(userId, id)); // User purchased it

  // If no access, remove workflowJson
  if (!hasAccess) {
    return {
      ...template,
      workflowJson: undefined,
      hasAccess: false,
    };
  }

  return {
    ...template,
    hasAccess: true,
  };
};

// Download template workflow
export const download = async (id: string, userId: string) => {
  const template = await prisma.template.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!template) {
    throw new Error('Template not found');
  }

  if (!template.isPublished) {
    throw new Error('Template is not published');
  }

  // Check access
  const isFree = template.price === 0;
  const isAuthor = userId === template.authorId;
  const alreadyPurchased = await checkUserPurchased(userId, id);

  // If not free, not author, and not purchased - process purchase
  if (!isFree && !isAuthor && !alreadyPurchased) {
    // Check user has enough credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.credits < template.price) {
      throw new Error(`Insufficient credits. Required: ${template.price}, Available: ${user.credits}`);
    }

    // Create purchase and deduct credits in a transaction
    await prisma.$transaction([
      // Deduct credits from user
      prisma.user.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: template.price,
          },
        },
      }),
      // Record purchase
      prisma.purchase.create({
        data: {
          userId,
          templateId: id,
          credits: template.price,
        },
      }),
    ]);
  }

  // Increment downloads counter
  await prisma.template.update({
    where: { id },
    data: {
      downloads: {
        increment: 1,
      },
    },
  });

  // Use cached workflow JSON if available, otherwise try to fetch from n8n-workflows
  let workflowJson = template.workflowJson;

  // Check if workflowJson is empty (for n8n-workflows templates that haven't been cached yet)
  const isWorkflowEmpty =
    !workflowJson || (typeof workflowJson === 'object' && Object.keys(workflowJson).length === 0);

  if (template.sourceType === 'n8n-workflows' && template.n8nWorkflowFilename && isWorkflowEmpty) {
    try {
      logger.info(`Fetching workflow JSON from n8n-workflows for ${template.name}`);
      const n8nWorkflowsService = require('./n8n-workflows.service').default;
      const fetchedWorkflow = await n8nWorkflowsService.downloadWorkflow(template.n8nWorkflowFilename);
      workflowJson = fetchedWorkflow;

      // Update template with fetched workflow for caching
      await prisma.template.update({
        where: { id },
        data: { workflowJson: fetchedWorkflow },
      });
      logger.info(`Cached workflow JSON for ${template.name}`);
    } catch (error) {
      logger.error(`Failed to fetch workflow from n8n-workflows: ${error}`);
      // Fall back to stored workflowJson (may be empty)
    }
  }

  return {
    id: template.id,
    name: template.name,
    workflowJson,
  };
};

// Update template
export const update = async (id: string, userId: string, userRole: string, data: UpdateTemplateData) => {
  const template = await prisma.template.findUnique({
    where: { id },
  });

  if (!template) {
    throw new Error('Template not found');
  }

  // Check permissions: author or admin
  if (template.authorId !== userId && userRole !== 'admin') {
    throw new Error('Unauthorized to update this template');
  }

  // Validate workflow JSON if provided
  if (data.workflowJson && !validateWorkflowJson(data.workflowJson)) {
    throw new Error('Invalid workflow JSON: must contain nodes and connections');
  }

  const updatedTemplate = await prisma.template.update({
    where: { id },
    data,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updatedTemplate;
};

// Delete template
export const deleteTemplate = async (id: string, userId: string, userRole: string) => {
  const template = await prisma.template.findUnique({
    where: { id },
  });

  if (!template) {
    throw new Error('Template not found');
  }

  // Check permissions: author or admin
  if (template.authorId !== userId && userRole !== 'admin') {
    throw new Error('Unauthorized to delete this template');
  }

  await prisma.template.delete({
    where: { id },
  });

  return { message: 'Template deleted successfully' };
};

// Check if user purchased template
export const checkUserPurchased = async (userId: string, templateId: string): Promise<boolean> => {
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId,
      templateId,
    },
  });

  return !!purchase;
};