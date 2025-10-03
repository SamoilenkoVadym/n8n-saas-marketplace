import { prisma } from '../config/database';

interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  totalTemplates: number;
  aiGenerationsThisMonth: number;
  recentUsers: number; // Users in last 30 days
  activeTemplates: number; // Published templates
}

interface PaginatedUsers {
  users: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedPayments {
  payments: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedTemplates {
  templates: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get dashboard statistics
 */
export async function getStats(): Promise<AdminStats> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalRevenue,
    totalTemplates,
    aiGenerationsThisMonth,
    recentUsers,
    activeTemplates,
  ] = await Promise.all([
    // Total users count
    prisma.user.count(),

    // Total revenue (sum of completed payments)
    prisma.payment.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true },
    }),

    // Total templates
    prisma.template.count(),

    // AI generations this month
    prisma.aiConversation.count({
      where: {
        createdAt: { gte: startOfMonth },
      },
    }),

    // Recent users (last 30 days)
    prisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    }),

    // Active (published) templates
    prisma.template.count({
      where: { isPublished: true },
    }),
  ]);

  return {
    totalUsers,
    totalRevenue: totalRevenue._sum.amount || 0,
    totalTemplates,
    aiGenerationsThisMonth,
    recentUsers,
    activeTemplates,
  };
}

/**
 * Get paginated list of users
 */
export async function getUsers(
  page: number = 1,
  limit: number = 20,
  search?: string,
  role?: string
): Promise<PaginatedUsers> {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            templates: true,
            payments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Update user credits
 */
export async function updateUserCredits(userId: string, credits: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { credits },
  });
}

/**
 * Ban/unban user (toggle role between 'user' and 'banned')
 */
export async function toggleUserBan(userId: string): Promise<{ banned: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const newRole = user.role === 'banned' ? 'user' : 'banned';

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  return { banned: newRole === 'banned' };
}

/**
 * Get paginated list of payments
 */
export async function getPayments(
  page: number = 1,
  limit: number = 20,
  status?: string
): Promise<PaginatedPayments> {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get paginated list of templates for moderation
 */
export async function getTemplates(
  page: number = 1,
  limit: number = 20,
  published?: boolean
): Promise<PaginatedTemplates> {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (published !== undefined) {
    where.isPublished = published;
  }

  const [templates, total] = await Promise.all([
    prisma.template.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            purchases: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.template.count({ where }),
  ]);

  return {
    templates,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Approve/publish template
 */
export async function approveTemplate(templateId: string): Promise<void> {
  await prisma.template.update({
    where: { id: templateId },
    data: { isPublished: true },
  });
}

/**
 * Reject/unpublish template
 */
export async function rejectTemplate(templateId: string): Promise<void> {
  await prisma.template.update({
    where: { id: templateId },
    data: { isPublished: false },
  });
}

/**
 * Delete template
 */
export async function deleteTemplate(templateId: string): Promise<void> {
  // Delete related purchases first
  await prisma.purchase.deleteMany({
    where: { templateId },
  });

  // Delete the template
  await prisma.template.delete({
    where: { id: templateId },
  });
}

/**
 * Get AI usage analytics
 */
export async function getAiUsage(days: number = 30): Promise<any[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const conversations = await prisma.aiConversation.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: { gte: startDate },
    },
    _count: true,
  });

  // Group by day
  const usage: Record<string, number> = {};

  conversations.forEach((conv) => {
    const date = new Date(conv.createdAt).toISOString().split('T')[0];
    usage[date] = (usage[date] || 0) + conv._count;
  });

  return Object.entries(usage).map(([date, count]) => ({
    date,
    count,
  }));
}

/**
 * Update template metadata (name, price, category)
 */
export async function updateTemplate(
  templateId: string,
  data: { name?: string; price?: number; category?: string; description?: string }
): Promise<void> {
  await prisma.template.update({
    where: { id: templateId },
    data,
  });
}
