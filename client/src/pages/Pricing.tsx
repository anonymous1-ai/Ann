import React from 'react';
import { PaymentPlans } from '../components/payment/PaymentPlans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Check, Star, Zap, Users, Shield, Headphones } from 'lucide-react';

const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with our free plan and upgrade as you grow. All plans include our core features with different usage limits.
          </p>
        </div>

        {/* Features Comparison */}
        <div className="mb-12">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Feature Comparison</CardTitle>
              <CardDescription className="text-center">
                Compare what's included in each plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-4">
                  <div className="font-semibold text-gray-900">Features</div>
                  <div className="space-y-3 text-sm">
                    <div>API Credits</div>
                    <div>License Key Generation</div>
                    <div>Advanced Analytics</div>
                    <div>Priority Support</div>
                    <div>Custom Integrations</div>
                    <div>Dedicated Support</div>
                    <div>All Features</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="font-semibold text-gray-900 text-center">Free</div>
                  <div className="space-y-3 text-sm text-center">
                    <div>5 credits</div>
                    <div className="text-gray-400">❌</div>
                    <div className="text-gray-400">❌</div>
                    <div className="text-gray-400">❌</div>
                    <div className="text-gray-400">❌</div>
                    <div className="text-gray-400">❌</div>
                    <div className="text-gray-400">❌</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="font-semibold text-blue-600 text-center">Pro</div>
                  <div className="space-y-3 text-sm text-center">
                    <div>100 credits</div>
                    <div className="text-green-600">✅</div>
                    <div className="text-green-600">✅</div>
                    <div className="text-green-600">✅</div>
                    <div className="text-gray-400">❌</div>
                    <div className="text-gray-400">❌</div>
                    <div className="text-gray-400">❌</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="font-semibold text-purple-600 text-center">Advanced</div>
                  <div className="space-y-3 text-sm text-center">
                    <div>300 credits</div>
                    <div className="text-green-600">✅</div>
                    <div className="text-green-600">✅</div>
                    <div className="text-green-600">✅</div>
                    <div className="text-green-600">✅</div>
                    <div className="text-green-600">✅</div>
                    <div className="text-green-600">✅</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Plans */}
        <PaymentPlans />

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How do API credits work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Each API call consumes credits based on the complexity and length of the generated code. 
                  Credits are replenished monthly with your subscription.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I upgrade or downgrade my plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can change your plan at any time. Upgrades take effect immediately, 
                  while downgrades take effect at the next billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens if I run out of credits?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You'll receive notifications when you're running low on credits. 
                  You can either upgrade your plan or wait for the next billing cycle for more credits.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How do license keys work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  License keys are automatically generated for paid subscribers and can be used 
                  to activate your desktop application. Each key is unique and tied to your account.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! Start with our free plan that includes 5 API credits. 
                  You can upgrade to a paid plan anytime to get more features and credits.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We accept all major credit cards, debit cards, and digital wallets 
                  through our secure Stripe payment processing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <Shield className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-600 text-sm">
                Enterprise-grade security with 99.9% uptime guarantee
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Headphones className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">
                Get help whenever you need it with our dedicated support team
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600 text-sm">
                Generate code in seconds with our optimized AI models
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing; 