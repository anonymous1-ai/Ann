import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, Zap, Crown, Star, Shield, CheckCircle, Lock, Smartphone, RefreshCw } from 'lucide-react';


interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  apiCalls: number;
  description: string;
  features: string[];
  limitations?: string[];
  buttonText: string;
  popular: boolean;
  icon: any;
  billingType: 'monthly' | 'yearly' | 'free';
}

const PRICING_PLANS: PricingPlan[] = [
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
    icon: Download,
    billingType: 'free'
  },
  {
    id: 'pro-monthly',
    name: 'Pro',
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
    buttonText: 'Subscribe Pro',
    popular: false,
    icon: Zap,
    billingType: 'monthly'
  },
  {
    id: 'pro-yearly',
    name: 'Pro',
    price: 9500,
    currency: '₹',
    period: 'year',
    apiCalls: 1200,
    description: 'Perfect for individuals and small projects',
    features: [
      'Full AI tool activation',
      '1200 API calls annually',
      'License validation',
      'Email support',
      'Regular updates',
      'Usage analytics',
      'Save ₹1100 per year'
    ],
    buttonText: 'Subscribe Pro',
    popular: true,
    icon: Zap,
    billingType: 'yearly'
  },
  {
    id: 'advanced-monthly',
    name: 'Advanced',
    price: 2000,
    currency: '₹',
    period: 'month',
    apiCalls: 300,
    description: 'Best for businesses and power users',
    features: [
      'Full AI tool activation',
      '300 API calls per month',
      'Priority support',
      'Advanced analytics',
      'Hardware hash binding',
      'Commercial usage rights',
      'API access logs',
      'Dedicated support'
    ],
    buttonText: 'Subscribe Advanced',
    popular: false,
    icon: Crown,
    billingType: 'monthly'
  },
  {
    id: 'advanced-yearly',
    name: 'Advanced',
    price: 20000,
    currency: '₹',
    period: 'year',
    apiCalls: 3600,
    description: 'Best for businesses and power users',
    features: [
      'Full AI tool activation',
      '3600 API calls annually',
      'Priority support',
      'Advanced analytics',
      'Hardware hash binding',
      'Commercial usage rights',
      'API access logs',
      'Dedicated support',
      'Save ₹4000 per year'
    ],
    buttonText: 'Subscribe Advanced',
    popular: false,
    icon: Crown,
    billingType: 'yearly'
  }
];

export default function Pricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

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
      // Create payment order
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ plan: planId })
      });

      const orderData = await response.json();
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      // Open Razorpay checkout modal (same as dashboard)
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "Subscription Plan",
        description: `${planId.toUpperCase()} Plan Subscription`,
        order_id: orderData.data.orderId,
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#D4AF37"
        },
        handler: async function (response: any) {
          try {
            // Verify payment with backend
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                orderId: orderData.data.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                plan: planId
              })
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              toast({
                title: "Payment Successful!",
                description: "Your subscription has been activated",
              });
              // Redirect to dashboard
              window.location.href = '/dashboard';
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error: any) {
            toast({
              title: "Verification Error",
              description: error.message || "Payment successful but verification failed. Contact support.",
              variant: "destructive"
            });
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(null);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      
    } catch (error: any) {
      toast({
        title: "Payment Setup Failed",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
      setLoading(null);
    }
  };



  // Filter plans based on billing period
  const getFilteredPlans = () => {
    return PRICING_PLANS.filter(plan => {
      if (plan.id === 'free') return true;
      return plan.billingType === billingPeriod;
    });
  };

  return (
    <div className="min-h-screen luxury-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gradient mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-yellow-200/80 max-w-3xl mx-auto">
            Get access to our powerful AI tool with flexible pricing options. 
            Download for free or unlock full functionality with our paid plans.
          </p>
        </div>



        {/* Billing Period Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-12">
          <span className={`text-lg font-medium ${billingPeriod === 'monthly' ? 'text-gold' : 'text-yellow-200/70'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            className="relative inline-flex items-center h-8 rounded-full w-16 bg-yellow-900/30 border border-yellow-400/30 transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            <span
              className={`inline-block w-6 h-6 transform bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-transform ${
                billingPeriod === 'yearly' ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
          <div className="flex items-center space-x-2">
            <span className={`text-lg font-medium ${billingPeriod === 'yearly' ? 'text-gold' : 'text-yellow-200/70'}`}>
              Yearly
            </span>
            <Badge className="bg-green-500 text-white text-xs">Save up to 17%</Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {getFilteredPlans().map((plan) => {
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
                
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="mb-4">
                    <Icon className="w-12 h-12 text-gold mx-auto" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gold">
                    {plan.name}
                  </CardTitle>
                  <p className="text-yellow-200/70 mt-2">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gradient">
                        {plan.currency}{plan.price.toLocaleString()}
                      </span>
                      {plan.period !== 'Forever' && (
                        <span className="text-yellow-200/70 ml-2">
                          /{plan.period}
                        </span>
                      )}
                    </div>
                    {plan.apiCalls > 0 && (
                      <p className="text-gold text-sm mt-2">
                        {plan.apiCalls} API calls {plan.period === 'year' ? 'annually' : 'per month'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gold">Features:</h4>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-yellow-200/80 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-red-400">Limitations:</h4>
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Lock className="w-4 h-4 text-red-400 flex-shrink-0" />
                          <span className="text-red-300/80 text-sm">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id || isCurrentPlan}
                    className={`w-full h-12 text-lg font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black'
                        : isCurrentPlan
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50 cursor-not-allowed'
                          : 'luxury-button'
                    }`}
                  >
                    {loading === plan.id ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
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

        {/* Features Comparison */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gradient text-center mb-12">
            Why Choose Our AI Tool?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="luxury-card text-center">
              <CardContent className="pt-6">
                <Shield className="w-12 h-12 text-gold mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gold mb-2">Secure License System</h3>
                <p className="text-yellow-200/70">
                  Hardware-bound licensing ensures your subscription is protected and cannot be shared illegally.
                </p>
              </CardContent>
            </Card>

            <Card className="luxury-card text-center">
              <CardContent className="pt-6">
                <Smartphone className="w-12 h-12 text-gold mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gold mb-2">Real-time Validation</h3>
                <p className="text-yellow-200/70">
                  Every API call is validated in real-time with our secure backend system for accurate usage tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="luxury-card text-center">
              <CardContent className="pt-6">
                <CheckCircle className="w-12 h-12 text-gold mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gold mb-2">Instant Activation</h3>
                <p className="text-yellow-200/70">
                  License keys are generated instantly upon payment completion. No waiting period required.
                </p>
              </CardContent>
            </Card>

            <Card className="luxury-card text-center">
              <CardContent className="pt-6">
                <RefreshCw className="w-12 h-12 text-gold mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gold mb-2">Monthly Reset</h3>
                <p className="text-yellow-200/70">
                  API call quotas reset automatically every month, ensuring consistent access to our services.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gradient text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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