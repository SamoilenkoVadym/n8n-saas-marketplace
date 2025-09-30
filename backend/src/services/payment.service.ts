import { stripe } from '../config/stripe';
import { prisma } from '../config/database';
import Stripe from 'stripe';

export class PaymentService {
  async createCheckoutSession(userId: string, credits: number, amount: number) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${credits} Credits`,
              description: `Purchase ${credits} credits for n8n templates`,
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        userId,
        credits: credits.toString(),
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        userId,
        amount,
        credits,
        status: 'pending',
        stripeSessionId: session.id,
      },
    });

    return session;
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutSessionCompleted(session);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const { userId, credits } = session.metadata as { userId: string; credits: string };
    const stripeSessionId = session.id;

    // Update payment status
    const payment = await prisma.payment.update({
      where: { stripeSessionId },
      data: { status: 'completed' },
    });

    // Add credits to user
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: parseInt(credits, 10),
        },
      },
    });

    console.log(`Payment completed: User ${userId} received ${credits} credits`);
  }

  async getPaymentHistory(userId: string) {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const paymentService = new PaymentService();