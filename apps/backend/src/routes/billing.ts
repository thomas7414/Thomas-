import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { APIError } from '../middleware/errorHandler';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = Router();

// Get subscription plans
router.get('/plans', async (req, res) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      projects: 3,
      description: 'Perfect for getting started',
    },
    {
      id: 'pro-monthly',
      name: 'Pro Monthly',
      price: 10.99,
      projects: -1,
      description: 'Unlimited projects and AI agents',
      stripePriceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
    },
    {
      id: 'pro-yearly',
      name: 'Pro Yearly',
      price: 100.99,
      projects: -1,
      description: 'Best value with annual savings',
      stripePriceId: process.env.STRIPE_PRICE_PRO_YEARLY,
    },
  ];

  res.json(plans);
});

// Create checkout session
router.post('/checkout', authenticateToken, async (req: AuthRequest, res) => {
  const { planId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env[`STRIPE_PRICE_${planId.toUpperCase()}`],
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
      customer_email: (req.user as any).email,
    });

    res.json({ url: session.url });
  } catch (error) {
    throw new APIError(400, 'Failed to create checkout session');
  }
});

// Webhook for Stripe events
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      // TODO: Update user subscription in database
    }

    res.json({ received: true });
  } catch (error) {
    throw new APIError(400, 'Webhook error');
  }
});

export default router;
