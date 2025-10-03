import { prisma } from '../config/database';

class PurchaseService {
  async purchaseTemplate(userId: string, templateId: string) {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    const existingPurchase = await prisma.purchase.findFirst({
      where: { userId, templateId },
    });

    if (existingPurchase) {
      throw new Error('Template already purchased');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.credits < template.price) {
      throw new Error('Insufficient credits');
    }

    const purchase = await prisma.$transaction(async (tx: any) => {
      await tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: template.price } },
      });

      return tx.purchase.create({
        data: { userId, templateId, credits: template.price },
        include: {
          template: {
            select: { id: true, name: true, price: true },
          },
        },
      });
    });

    return purchase;
  }

  async getUserPurchases(userId: string) {
    return prisma.purchase.findMany({
      where: { userId },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            tags: true,
            price: true,
            downloads: true,
            previewImage: true,
            workflowJson: true,
            author: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async hasPurchased(userId: string, templateId: string): Promise<boolean> {
    const purchase = await prisma.purchase.findFirst({
      where: { userId, templateId },
    });
    return !!purchase;
  }
}

export const purchaseService = new PurchaseService();