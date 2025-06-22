import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Download, Zap, Crown, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: '₹',
    period: 'Forever',
    apiCalls: 0,
    description: 'Try out the tool with download access',
    features: [
      'Download AI tool',
      'Tool remains inactive',
      'Community support',
      'Basic documentation'
    ],
    limitations: [
      'No API calls included',
      'License validation fails',
      'Tool functionality disabled'
    ],
    buttonText: 'Download Free',
    popular: false,
    icon: Download
  },
  {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    price: 800,
    currency: '₹',
    period: 'month',
    apiCalls: 100,
    description: 'Perfect for individuals and small projects',
    features: [
      'Full AI tool activation',
      '100 API calls per month',
      'License validation',
      'Email support',
      'Regular updates',
      'Usage analytics'
    ],
    buttonText: 'Subscribe Monthly',
    popular: false,
    icon: Zap
  },
  {
    id: 'pro-annual',
    name: 'Pro Annual',
    price: 9500,
    currency: '₹',
    period: 'year',
    apiCalls: 1200,
    description: 'Save money with annual billing',
    features: [
      'Full AI tool activation',
      '1200 API calls per year',
      'Save ₹1100 vs monthly',
      'License validation',
      'Email support',
      'Regular updates',
      'Usage analytics'
    ],
    buttonText: 'Subscribe Annually',
    popular: true,
    icon: Zap,
    savings: 'Save 11%'
  },
  {
    id: 'advanced-monthly',
    name: 'Advanced Monthly',
    price: 2000,
    currency: '₹',
    period: 'month',
    apiCalls: 300,
    description: 'For power users and small teams',
    features: [
      'Full AI tool activation',
      '300 API calls per month',
      'Priority support',
      'Advanced analytics',
      'Hardware hash binding',
      'Commercial usage rights',
      'API access logs'
    ],
    buttonText: 'Subscribe Monthly',
    popular: false,
    icon: Crown
  },
  {
    id: 'advanced-annual',
    name: 'Advanced Annual',
    price: 20000,
    currency: '₹',
    period: 'year',
    apiCalls: 3600,
    description: 'Best value for businesses',
    features: [
      'Full AI tool activation',
      '3600 API calls per year',
      'Save ₹4000 vs monthly',
      'Priority support',
      'Advanced analytics',
      'Hardware hash binding',
      'Commercial usage rights',
      'API access logs',
      'Dedicated support'
    ],
    buttonText: 'Subscribe Annually',
    popular: false,
    icon: Crown,
    savings: 'Save 17%'
  }
];

export default function Pricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to a plan",
        variant: "destructive"
      });
      return;
    }

    if (planId === 'free') {
      // Handle free plan download
      try {
        const response = await fetch('/api/download');
        const data = await response.json();
        
        if (data.success) {
          toast({
            title: "Download Ready",
            description: "Your download will begin shortly. Note: The tool requires a paid license to activate.",
          });
          // In a real implementation, trigger actual download
          window.open(data.downloadUrl, '_blank');
        }
      } catch (error) {
        toast({
          title: "Download Error",
          description: "Failed to initiate download. Please try again.",
          variant: "destructive"
        });
      }
      return;
    }

    setLoading(planId);

    try {
      // Create order
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ plan: planId })
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error);
      }

      // Mock Razorpay payment process (replace with actual Razorpay integration)
      const mockPaymentSuccess = await simulatePayment(orderData.data);

      if (mockPaymentSuccess) {
        // Verify payment
        const verifyResponse = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            orderId: orderData.data.orderId,
            paymentId: `pay_${Date.now()}`,
            signature: 'mock_signature',
            plan: planId
          })
        });

        const verifyData = await verifyResponse.json();

        if (verifyData.success) {
          toast({
            title: "Payment Successful!",
            description: `You've successfully subscribed to the ${planId} plan. Your license key has been generated.`,
          });

          // Refresh user data
          window.location.reload();
        } else {
          throw new Error(verifyData.error);
        }
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Payment processing failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const simulatePayment = (orderData: any): Promise<boolean> => {
    // Mock payment simulation - replace with actual Razorpay integration
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true); // Simulate successful payment
      }, 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold">
            SaaS Pricing
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-yellow-200/70 max-w-3xl mx-auto">
            Get access to our powerful AI tool with flexible pricing options. 
            Download for free or unlock full functionality with our paid plans.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {PRICING_PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = user?.plan === plan.id;
            
            return (
              <Card 
                key={plan.id}
                className={`luxury-card relative ${
                  plan.popular 
                    ? 'golden-glow ring-2 ring-gold/50 scale-105' 
                    : ''
                } ${isCurrentPlan ? 'ring-2 ring-green-500/50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {plan.savings && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-green-500 text-white font-semibold">
                      {plan.savings}
                    </Badge>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-green-500 text-white">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-black" />
                  </div>
                  
                  <CardTitle className="text-gold text-2xl font-bold">
                    {plan.name}
                  </CardTitle>
                  
                  <CardDescription className="text-yellow-200/70">
                    {plan.description}
                  </CardDescription>

                  <div className="mt-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gradient">
                        {plan.currency}{plan.price}
                      </span>
                      {plan.period !== 'Forever' && (
                        <span className="text-yellow-200/70 ml-2">
                          /{plan.period}
                        </span>
                      )}
                    </div>
                    {plan.apiCalls > 0 && (
                      <p className="text-gold text-sm mt-2">
                        {plan.apiCalls} API calls {plan.id === 'advanced' ? 'per month' : 'included'}
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <Check className="w-4 h-4 text-gold mr-3 flex-shrink-0" />
                        <span className="text-yellow-200/90 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations (for free plan) */}
                  {plan.limitations && (
                    <div className="space-y-3 pt-3 border-t border-yellow-400/20">
                      <p className="text-yellow-200/70 text-xs font-medium">Limitations:</p>
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-red-500/20 mr-3 flex-shrink-0 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                          </div>
                          <span className="text-red-200/70 text-sm">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id || isCurrentPlan}
                    className={`w-full ${
                      plan.popular 
                        ? 'btn-luxury' 
                        : 'bg-yellow-900/30 hover:bg-yellow-900/50 text-gold border border-yellow-400/30'
                    }`}
                  >
                    {loading === plan.id ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Processing...
                      </div>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      plan.buttonText
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gradient mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <Card className="luxury-card">
              <CardHeader>
                <CardTitle className="text-gold">How does license validation work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-200/70">
                  Our AI tool validates your license key and hardware hash with every use. 
                  This ensures secure access and tracks your API call usage in real-time.
                </p>
              </CardContent>
            </Card>

            <Card className="luxury-card">
              <CardHeader>
                <CardTitle className="text-gold">What happens when I run out of API calls?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-200/70">
                  The tool will show an error message and stop functioning until you upgrade 
                  your plan or wait for your monthly quota to reset.
                </p>
              </CardContent>
            </Card>

            <Card className="luxury-card">
              <CardHeader>
                <CardTitle className="text-gold">Can I use the tool on multiple devices?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-200/70">
                  Each license is bound to a specific hardware hash for security. 
                  Contact support if you need to transfer your license to a new device.
                </p>
              </CardContent>
            </Card>

            <Card className="luxury-card">
              <CardHeader>
                <CardTitle className="text-gold">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-200/70">
                  We offer a 7-day money-back guarantee for all paid plans. 
                  Contact our support team if you're not satisfied with the service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}