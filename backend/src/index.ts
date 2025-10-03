import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import templateRoutes from './routes/template.routes';
import paymentRoutes from './routes/payment.routes';
import purchaseRoutes from './routes/purchase.routes';
import billingRoutes from './routes/billing.routes';
import aiRoutes from './routes/ai.routes';
import n8nRoutes from './routes/n8n.routes';
import adminRoutes from './routes/admin.routes';
import healthRoutes from './routes/health.routes';
import { stripe } from './config/stripe';
import { paymentService } from './services/payment.service';
import { env } from './config/env';
import { logger, stream } from './config/logger';
import { incrementRequestCount, incrementErrorCount } from './routes/health.routes';
import { authRateLimiter, aiRateLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = env.PORT;

// Request counter middleware
app.use((req, res, next) => {
  incrementRequestCount();
  next();
});

// HTTP request logger
app.use(morgan('combined', { stream }));

// Webhook route (must be BEFORE express.json() middleware)
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      res.status(400).send('Missing stripe-signature header');
      return;
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      res.status(500).send('Webhook secret not configured');
      return;
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      await paymentService.handleWebhook(event);

      res.json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err);
      res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Remove X-Powered-By header
app.disable('x-powered-by');

// Routes
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/ai', aiRateLimiter, aiRoutes);
app.use('/api/n8n', n8nRoutes);
app.use('/api/admin', adminRoutes);

// Health check routes
app.use('/health', healthRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  incrementErrorCount();
  logger.error('Unhandled error:', err);

  // Don't leak error details in production
  const message = env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(500).json({
    error: message,
  });
});

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
  logger.info(`Frontend URL: ${env.FRONTEND_URL}`);
});