import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Check, Loader2, Star } from 'lucide-react';
import { STRIPE_PLANS, PlanType, stripePromise } from '../../lib/stripe';
import { apiService } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface PaymentPlansProps {
  onSuccess?: () => void;
}

export const PaymentPlans: React.FC<PaymentPlansProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState<PlanType | null>(null);
  const { user } = useAuth();

  const handleSubscribe = async (plan: PlanType) => {
    if (!user) {
      toast.error('Please log in to subscribe');
      return;
    }

    setLoading(plan);
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { sessionId } = await apiService.createCheckoutSession({
        plan,
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      });

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to start subscription process');
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { url } = await apiService.createPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error('Portal session error:', error);
      toast.error('Failed to open customer portal');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {/* Free Plan */}
      <Card className="relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Free Plan
            <Badge variant="secondary">Current</Badge>
          </CardTitle>
          <CardDescription>
            Perfect for getting started
          </CardDescription>
          <div className="text-3xl font-bold">$0</div>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              5 API Credits
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Basic Analytics
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Community Support
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button disabled className="w-full">
            Current Plan
          </Button>
        </CardFooter>
      </Card>

      {/* Pro Plan */}
      <Card className="relative border-primary">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">
            <Star className="h-3 w-3 mr-1" />
            Popular
          </Badge>
        </div>
        <CardHeader>
          <CardTitle>Pro Plan</CardTitle>
          <CardDescription>
            For power users and small teams
          </CardDescription>
          <div className="text-3xl font-bold">${STRIPE_PLANS.pro.price}</div>
          <p className="text-sm text-muted-foreground">per month</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2">
            {STRIPE_PLANS.pro.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => handleSubscribe('pro')}
            disabled={loading === 'pro'}
            className="w-full"
          >
            {loading === 'pro' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Subscribe to Pro'
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Advanced Plan */}
      <Card className="relative">
        <CardHeader>
          <CardTitle>Advanced Plan</CardTitle>
          <CardDescription>
            For enterprise and large teams
          </CardDescription>
          <div className="text-3xl font-bold">${STRIPE_PLANS.advanced.price}</div>
          <p className="text-sm text-muted-foreground">per month</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2">
            {STRIPE_PLANS.advanced.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => handleSubscribe('advanced')}
            disabled={loading === 'advanced'}
            className="w-full"
            variant="outline"
          >
            {loading === 'advanced' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Subscribe to Advanced'
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Manage Subscription Button */}
      {user?.plan !== 'free' && (
        <div className="col-span-full flex justify-center">
          <Button 
            onClick={handleManageSubscription}
            variant="outline"
            className="mt-4"
          >
            Manage Subscription
          </Button>
        </div>
      )}
    </div>
  );
}; 