import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, Zap, Crown, Star, Shield, CheckCircle, Lock, Smartphone, HelpCircle, RefreshCw } from 'lucide-react';

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
    icon: Download
  },
  {
    id: 'pro',
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
    popular: true,
    icon: Zap
  },
  {
    id: 'advanced',
    name: 'Advanced',
    price: 2000,
    currency: '₹',
    period: 'year',
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
    icon: Crown
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

      // Store plan info for success page
      localStorage.setItem('pendingPlan', planId);
      
      // Redirect to Razorpay payment page (no UI branding visible)
      window.location.href = orderData.data.paymentUrl;
      
    } catch (error: any) {
      toast({
        title: "Payment Setup Failed",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
      setLoading(null);
    }
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

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
                        {plan.apiCalls} API calls {plan.period === 'year' ? 'per month' : plan.period === 'month' ? 'per month' : 'included'}
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