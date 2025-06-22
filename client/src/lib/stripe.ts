// Mock Stripe for demo purposes
const mockStripePromise = Promise.resolve(null);

export const stripePromise = mockStripePromise;

export const STRIPE_PLANS = {
  pro: {
    name: 'Pro Plan',
    price: 10,
    currency: 'USD',
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
    credits: 100,
    features: [
      '100 API Credits',
      'Advanced Analytics',
      'Priority Support',
      'License Key Generation'
    ]
  },
  advanced: {
    name: 'Advanced Plan',
    price: 25,
    currency: 'USD',
    priceId: import.meta.env.VITE_STRIPE_ADVANCED_PRICE_ID,
    credits: 300,
    features: [
      '300 API Credits',
      'Advanced Analytics',
      'Priority Support',
      'License Key Generation',
      'Custom Integrations',
      'Dedicated Support',
      'All Features'
    ]
  }
} as const;

export type PlanType = keyof typeof STRIPE_PLANS; 