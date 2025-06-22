import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

// Load environment variables from backend.env
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'silentlyai-backend' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('Missing Stripe secret key');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Create Stripe checkout session
app.post('/api/create-checkout-session', authenticateUser, async (req, res) => {
  try {
    const { plan, successUrl, cancelUrl } = req.body;
    const userId = req.user.id;

    if (!plan || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get price ID based on plan
    const priceId = process.env[`STRIPE_${plan.toUpperCase()}_PRICE_ID`];
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Create or get Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;

      // Update user with customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        plan: plan,
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    logger.error('Checkout session creation error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create customer portal session
app.post('/api/create-portal-session', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (userError || !user || !user.stripe_customer_id) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: process.env.FRONTEND_URL + '/dashboard',
    });

    res.json({ url: session.url });
  } catch (error) {
    logger.error('Portal session creation error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Generate license key
app.post('/api/generate-license', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user has a paid plan
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('plan, license_key')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.plan === 'free') {
      return res.status(403).json({ error: 'License keys are only available for paid plans' });
    }

    if (user.license_key) {
      return res.status(400).json({ error: 'License key already exists' });
    }

    // Generate unique license key
    const licenseKey = generateLicenseKey(userId);

    // Update user with license key
    const { error: updateError } = await supabase
      .from('users')
      .update({ license_key: licenseKey })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    res.json({ licenseKey });
  } catch (error) {
    logger.error('License generation error:', error);
    res.status(500).json({ error: 'Failed to generate license key' });
  }
});

// Stripe webhook handler
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Webhook handlers
async function handleCheckoutCompleted(session) {
  const userId = session.metadata.userId;
  const plan = session.metadata.plan;

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  // Update user plan and credits
  const credits = plan === 'pro' ? 100 : 300;
  
  await supabase
    .from('users')
    .update({
      plan: plan,
      api_credits: credits,
    })
    .eq('id', userId);

  // Create subscription record
  await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      plan: plan,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    });

  logger.info(`Subscription created for user ${userId}: ${plan} plan`);
}

async function handleSubscriptionUpdated(subscription) {
  const { data: subRecord, error } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (error || !subRecord) {
    logger.error('Subscription record not found:', subscription.id);
    return;
  }

  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  // If subscription is past due, update user plan to free
  if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
    await supabase
      .from('users')
      .update({
        plan: 'free',
        api_credits: 5,
      })
      .eq('id', subRecord.user_id);
  }

  logger.info(`Subscription updated: ${subscription.id} - ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription) {
  const { data: subRecord, error } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (error || !subRecord) {
    logger.error('Subscription record not found:', subscription.id);
    return;
  }

  // Update user to free plan
  await supabase
    .from('users')
    .update({
      plan: 'free',
      api_credits: 5,
    })
    .eq('id', subRecord.user_id);

  // Mark subscription as canceled
  await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id);

  logger.info(`Subscription canceled: ${subscription.id}`);
}

// Utility functions
function generateLicenseKey(userId) {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString('hex');
  const userHash = crypto.createHash('md5').update(userId).digest('hex').substring(0, 8);
  
  return `SL-${timestamp}-${random}-${userHash}`.toUpperCase();
}

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 SilentlyAI Backend Server running on port ${PORT}`);
});

export default app; 