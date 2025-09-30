import { stripe } from '../config/stripe';
import { prisma } from '../config/database';
import Stripe from 'stripe';

export class PaymentService {
  async createCheckoutSession(userId: string, credits: number, amountInCents: number) {
    console.log('Creating Stripe session:', {
      credits,
      amountInCents,
      amountInDollars: (amountInCents / 100).toFixed(2)
    });

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
            unit_amount: amountInCents, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/dashboard/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/credits`,
      metadata: {
        userId,
        credits: credits.toString(),
      },
    });

    // Create payment record (amount stored in cents)
    await prisma.payment.create({
      data: {
        userId,
        amount: amountInCents,
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
    await prisma.payment.update({
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