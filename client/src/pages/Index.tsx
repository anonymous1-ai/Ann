import { useState } from 'react';
import { Download, Code, Camera, Brain, Shield, Zap, ArrowRight, Check, CreditCard, Activity, Settings, Timer, Menu, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { getLogoPath } from "@/assets/logo-config";

// Add Razorpay type declaration
declare global {
  interface Window {
    Razorpay: any;
  }
}

const Index = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState<string | null>(null);

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Silently AI installer is being prepared for download...",
      className: "success-toast"
    });
  };

  const handleGetStarted = () => {
    if (user) {
      setLocation('/dashboard');
    } else {
      setLocation('/auth');
    }
  };

  const handleLogin = () => {
    setLocation('/auth');
  };

  const handleContactUs = () => {
    toast({
      title: "Contact Us",
      description: "Send your queries to support@silentlyai.com"
    });
  };

  const handleSocialLink = (linkName: string) => {
    toast({
      title: linkName,
      description: `${linkName} will be available soon`
    });
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to a plan",
        variant: "destructive",
        className: "error-toast"
      });
      setLocation('/auth');
      return;
    }

    if (planId === 'free') {
      handleDownload();
      return;
    }

    setLoading(planId);

    try {
      // Get plan pricing based on billing period
      const planPricing = {
        'pro': billingPeriod === 'monthly' ? { price: 800, calls: 100 } : { price: 9500, calls: 1200 },
        'advanced': billingPeriod === 'monthly' ? { price: 2000, calls: 300 } : { price: 20000, calls: 3600 },
        'topup': { price: 9, calls: 1 }
      };

      const selectedPlan = planPricing[planId as keyof typeof planPricing];
      if (!selectedPlan) {
        throw new Error('Invalid plan selected');
      }

      // Create Razorpay order
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          plan: planId,
          amount: selectedPlan.price,
          billingPeriod,
          calls: selectedPlan.calls
        })
      });

      const orderData = await response.json();
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      // Initialize Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key',
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'Silently AI',
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan - ${billingPeriod}`,
        order_id: orderData.data.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
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
                plan: planId,
                billingPeriod
              })
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              toast({
                title: "Payment Successful!",
                description: `Successfully subscribed to ${planId} plan. Welcome to Silently AI!`,
                className: "success-toast"
              });
              
              // Redirect to dashboard
              setLocation('/dashboard');
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error: any) {
            toast({
              title: "Payment Verification Failed",
              description: error.message || "Please contact support if payment was deducted.",
              variant: "destructive",
              className: "error-toast"
            });
          }
        },
        prefill: {
          email: user.email,
          name: user.name
        },
        theme: {
          color: '#D4AF37'
        },
        modal: {
          ondismiss: function() {
            setLoading(null);
          }
        }
      };

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const rzp = new window.Razorpay(options);
          rzp.open();
        };
        document.body.appendChild(script);
      } else {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }

    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Unable to process payment. Please try again.",
        variant: "destructive",
        className: "error-toast"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleTopUp = async (topupType: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase API credits",
        variant: "destructive"
      });
      setLocation('/auth');
      return;
    }

    setLoading(topupType);

    try {
      const topupOptions = {
        'topup-50': { calls: 50, price: 450 },
        'topup-100': { calls: 100, price: 800 },
        'topup-250': { calls: 250, price: 1750 }
      };

      const selected = topupOptions[topupType as keyof typeof topupOptions];
      if (!selected) {
        throw new Error('Invalid top-up option');
      }

      // Create top-up order
      const response = await fetch('/api/create-topup-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          topupType,
          calls: selected.calls,
          price: selected.price
        })
      });

      const orderData = await response.json();
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create top-up order');
      }

      // Initialize Razorpay payment for top-up
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key',
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'Silently AI',
        description: `${selected.calls} API Credits Top-up`,
        order_id: orderData.data.orderId,
        handler: async function (response: any) {
          try {
            // Verify top-up payment
            const verifyResponse = await fetch('/api/verify-topup-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                orderId: orderData.data.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                topupType,
                calls: selected.calls
              })
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              toast({
                title: "Top-up Successful!",
                description: `${selected.calls} API credits added to your account.`,
                className: "success-toast"
              });
            } else {
              throw new Error(verifyData.error || 'Top-up verification failed');
            }
          } catch (error: any) {
            toast({
              title: "Top-up Verification Failed",
              description: error.message || "Please contact support if payment was deducted.",
              variant: "destructive",
              className: "error-toast"
            });
          }
        },
        prefill: {
          email: user.email,
          name: user.name
        },
        theme: {
          color: '#D4AF37'
        },
        modal: {
          ondismiss: function() {
            setLoading(null);
          }
        }
      };

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const rzp = new window.Razorpay(options);
          rzp.open();
        };
        document.body.appendChild(script);
      } else {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }

    } catch (error: any) {
      toast({
        title: "Top-up Failed",
        description: error.message || "Unable to process top-up. Please try again.",
        variant: "destructive",
        className: "error-toast"
      });
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      id: "free",
      name: "Free",
      monthlyPrice: "₹0",
      yearlyPrice: "₹0",
      period: "/forever",
      description: "Basic access via keyboard shortcuts",
      features: ["Shortcut-only access", "Limited daily use", "Basic text-to-code", "Community support"],
      buttonText: "Download Free",
      popular: false,
      badge: "Perfect for trying out"
    },
    {
      id: "pro",
      name: "Pro",
      monthlyPrice: "₹800",
      yearlyPrice: "₹9500",
      period: billingPeriod === 'monthly' ? "/month" : "/year",
      description: billingPeriod === 'monthly' ? "100 API calls included" : "1200 API calls included",
      features: billingPeriod === 'monthly' 
        ? ["100 API calls/month", "All core features", "Priority typing simulation", "Email support", "Offline mode"] 
        : ["1200 API calls/year", "All core features", "Priority typing simulation", "Email support", "Offline mode"],
      buttonText: "Start Pro",
      popular: true,
      badge: "Most Popular"
    },
    {
      id: "advanced",
      name: "Advanced",
      monthlyPrice: "₹2000",
      yearlyPrice: "₹20000",
      period: billingPeriod === 'monthly' ? "/month" : "/year",
      description: billingPeriod === 'monthly' ? "300 API calls + premium features" : "3600 API calls + premium features",
      features: billingPeriod === 'monthly' 
        ? ["300 API calls/month", "Advanced aptitude solver", "Batch screenshot processing", "Custom shortcuts", "Premium support"] 
        : ["3600 API calls/year", "Advanced aptitude solver", "Batch screenshot processing", "Custom shortcuts", "Premium support"],
      buttonText: "Go Advanced",
      popular: false,
      badge: "Best Value"
    },
    {
      id: "topup",
      name: "Top-Up",
      monthlyPrice: "₹9",
      yearlyPrice: "₹9",
      period: "/call",
      description: "Add credits anytime",
      features: ["Pay per API call", "No monthly commitment", "Add to any plan", "Perfect for heavy usage"],
      buttonText: "Buy Credits",
      popular: false,
      badge: "Flexible"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, hsl(218, 23%, 4%) 0%, hsl(218, 20%, 8%) 50%, hsl(218, 23%, 4%) 100%)'
    }}>
      {/* Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="shape-1 gold-gradient opacity-20"></div>
        <div className="shape-2 gold-gradient opacity-15"></div>
        <div className="shape-3 gold-gradient opacity-10"></div>
        <div className="shape-4 gold-gradient opacity-25"></div>
        <div className="shape-5 gold-gradient opacity-20"></div>
        <div className="shape-6 gold-gradient opacity-15"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 luxury-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src={getLogoPath()} 
                alt="Silently AI Logo" 
                className="w-8 h-8 object-contain logo-reveal"
              />
              <span className="text-gold font-bold text-xl logo-text-reveal">Silently AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-yellow-200/70 hover:text-gold transition-colors">Features</button>
              <button onClick={() => scrollToSection('pricing')} className="text-yellow-200/70 hover:text-gold transition-colors">Pricing</button>
              <button onClick={() => scrollToSection('faq')} className="text-yellow-200/70 hover:text-gold transition-colors">FAQ</button>
              {user ? (
                <Button onClick={() => setLocation('/dashboard')} className="btn-luxury">
                  Dashboard
                </Button>
              ) : (
                <Button onClick={handleLogin} variant="outline" className="btn-luxury-outline">
                  Login
                </Button>
              )}
            </div>
            <div className="md:hidden">
              <Button variant="ghost" size="sm" className="text-gold">
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              <span className="block text-gradient mx-0 px-0 font-bold py-[10px]">Silently AI</span>
            </h1>
            <p className="text-xl sm:text-2xl text-yellow-200/80 mb-8 max-w-3xl mx-auto">
              Screenshots, text, aptitude problems - transform them into working code instantly. 
              Undetectable typing simulation for seamless coding tests.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button onClick={handleGetStarted} size="lg" className="btn-luxury px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-200">
              {user ? 'Go to Dashboard' : 'Get Started Free'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button onClick={() => scrollToSection('pricing')} variant="outline" size="lg" className="btn-luxury-outline px-8 py-4 text-lg font-semibold">
              View Pricing
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm text-yellow-200/60 px-4">
            <div className="flex items-center gap-2">
              <Check className="h-3 md:h-4 w-3 md:w-4 text-gold" />
              <span>Undetectable typing simulation</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-3 md:h-4 w-3 md:w-4 text-gold" />
              <span>Instant kill switch</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-4 md:px-6 py-16 md:py-20 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-gradient py-[10px] lg:text-5xl">
              Stealth Features That Actually Work
            </h2>
            <p className="text-yellow-200/70 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed px-4 md:px-0">
              Built for students, freelancers, and professionals who need results without detection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Code,
                emoji: "⚡",
                title: "Text → Code Magic",
                description: "Select any text problem statement and instantly get clean, working code solutions",
                gradient: "from-yellow-500/20 to-amber-500/20"
              },
              {
                icon: Camera,
                emoji: "📸",
                title: "Screenshot → Implementation",
                description: "Upload any UI screenshot or long image and get pixel-perfect code implementation",
                gradient: "from-amber-500/20 to-orange-500/20"
              },
              {
                icon: Brain,
                emoji: "🧠",
                title: "Aptitude Problem Solver",
                description: "Crack quantitative aptitude, logical reasoning, and coding problems in seconds",
                gradient: "from-orange-500/20 to-red-500/20"
              },
              {
                icon: Shield,
                emoji: "🛡️",
                title: "Undetectable Typing",
                description: "Natural typing simulation with human-like patterns, speed variations, and corrections",
                gradient: "from-red-500/20 to-pink-500/20"
              },
              {
                icon: Zap,
                emoji: "⚡",
                title: "Master Kill Switch",
                description: "Ctrl+Shift+K instantly hides all activity and returns to normal desktop view",
                gradient: "from-pink-500/20 to-purple-500/20"
              },
              {
                icon: Activity,
                emoji: "📊",
                title: "Real-time Analytics",
                description: "Track your usage, success rates, and performance metrics in beautiful dashboards",
                gradient: "from-purple-500/20 to-blue-500/20"
              }
            ].map((feature, index) => (
              <Card key={index} className="luxury-card hover:golden-glow transition-all duration-500 group">
                <CardContent className="pt-6 md:pt-8">
                  <div className={`w-16 md:w-20 h-16 md:h-20 rounded-2xl md:rounded-3xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto`}>
                    <span className="text-2xl md:text-3xl">{feature.emoji}</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3 text-center group-hover:text-gold transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-yellow-200/70 leading-relaxed text-center text-sm md:text-base">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 md:px-6 py-16 md:py-20 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-gradient py-[10px] lg:text-5xl">
              Fair & Transparent Pricing
            </h2>
            <p className="text-yellow-200/70 text-lg md:text-xl max-w-3xl mx-auto px-4 md:px-0">
              Choose the plan that fits your needs. Upgrade or downgrade anytime.
            </p>
          </div>

          {/* Billing Period Toggle */}
          <div className="flex justify-center items-center mb-12">
            <div className="flex items-center gap-4">
              <span className={`text-lg font-medium transition-colors ${billingPeriod === 'monthly' ? 'text-gold' : 'text-yellow-200/70'}`}>
                Monthly
              </span>
              <div className="relative">
                <button
                  onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                  className="relative w-16 h-8 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-full transition-all duration-300 focus:outline-none shadow-lg"
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-md ${billingPeriod === 'yearly' ? 'translate-x-8' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-medium transition-colors ${billingPeriod === 'yearly' ? 'text-gold' : 'text-yellow-200/70'}`}>
                  Yearly
                </span>
                <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1 rounded-full">
                  Save up to 17%
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {plans.filter(plan => plan.id !== 'topup').map((plan, index) => (
              <Card key={index} className={`relative rounded-2xl overflow-hidden luxury-card transition-all duration-500 hover:golden-glow ${plan.popular ? 'bg-gradient-to-b from-yellow-950/30 to-amber-950/30 border-yellow-400/50' : 'hover:border-yellow-400/50'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold px-4 py-1">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4 md:pb-6">
                  <div className="mb-3 md:mb-4">
                    <CardTitle className="text-lg md:text-xl text-foreground mb-2">{plan.name}</CardTitle>
                    {!plan.popular && (
                      <Badge variant="secondary" className="badge-luxury text-xs">
                        {plan.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="mb-3 md:mb-4">
                    <span className="text-3xl md:text-4xl font-bold text-gold">
                      {billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                    </span>
                    <span className="text-yellow-200/60 text-sm md:text-base">{plan.period}</span>
                    {billingPeriod === 'yearly' && (plan.id === 'pro' || plan.id === 'advanced') && (
                      <div className="text-xs text-yellow-200/70 mt-1">
                        {plan.id === 'pro' ? '₹9500 billed annually' : '₹20000 billed annually'}
                      </div>
                    )}
                  </div>
                  <p className="text-yellow-200/70 text-xs md:text-sm">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
                  <ul className="space-y-2 md:space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 md:gap-3 text-yellow-200/70 text-xs md:text-sm">
                        <Check className="h-3 md:h-4 w-3 md:w-4 text-gold flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => handleSubscribe(plan.id)} 
                    disabled={loading === plan.id}
                    className={`w-full rounded-xl py-2 md:py-3 text-sm md:text-base font-semibold transition-all duration-300 ${plan.popular ? 'btn-luxury' : 'btn-luxury-outline'}`}
                  >
                    {loading === plan.id ? 'Processing...' : plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Top-up Section */}
          <div className="mt-20 border-t border-yellow-400/20 pt-16">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gradient mb-4">
                Need More API Calls?
              </h3>
              <p className="text-yellow-200/70 max-w-2xl mx-auto">
                Top up your account with additional API calls. Credits never expire and work with any plan.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <Card className="luxury-card golden-glow ring-2 ring-gold/50">
                <CardHeader className="text-center">
                  <Badge className="mb-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold">
                    Most Popular
                  </Badge>
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-black" />
                  </div>
                  <CardTitle className="text-gold text-xl">100 Calls</CardTitle>
                  <CardDescription className="text-yellow-200/70">Best value</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gradient">₹800</span>
                    <p className="text-yellow-200/70 text-sm">₹8 per call</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleTopUp('topup-100')}
                    disabled={loading === 'topup-100'}
                    className="w-full btn-luxury"
                  >
                    {loading === 'topup-100' ? 'Processing...' : 'Buy 100 Calls'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="luxury-card hover:golden-glow transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-gold text-xl">250 Calls</CardTitle>
                  <CardDescription className="text-yellow-200/70">Maximum value</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gradient">₹1750</span>
                    <p className="text-yellow-200/70 text-sm">₹7 per call</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleTopUp('topup-250')}
                    disabled={loading === 'topup-250'}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {loading === 'topup-250' ? 'Processing...' : 'Buy 250 Calls'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <p className="text-yellow-200/70 text-sm">
                Top-up credits never expire and work with any subscription plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 md:px-6 py-16 md:py-20 relative">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 md:mb-4 text-gradient py-[10px] lg:text-5xl">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="space-y-4 md:space-y-6">
            {[
              {
                value: "item-1",
                question: "How does the stealth typing feature actually work?",
                answer: "Our AI analyzes human typing patterns and replicates natural delays, corrections, and variations. It types at 45-65 WPM with realistic pauses, making it indistinguishable from human typing to monitoring software."
              },
              {
                value: "item-2",
                question: "Can I use this during online exams and interviews?",
                answer: "Silently AI is designed to be undetectable, but always check your institution's/company's policies first. The master kill switch (Ctrl+Shift+K) instantly hides all activity if needed."
              },
              {
                value: "item-3",
                question: "What happens when I run out of API calls?",
                answer: "You'll get notified when you have 10 calls remaining. You can instantly top-up with ₹9 per call or upgrade your plan. The app works offline for basic features even without API credits."
              },
              {
                value: "item-4",
                question: "Is Razorpay payment safe and do you store card details?",
                answer: "We use Razorpay (India's leading payment gateway) for all transactions. We never store your card details - everything is handled securely by Razorpay with bank-level encryption."
              },
              {
                value: "item-5",
                question: "Can I get refund if it doesn't work for my use case?",
                answer: "We offer a 7-day money-back guarantee for all paid plans. If Silently AI doesn't meet your expectations, contact support for a full refund within 7 days of purchase."
              },
              {
                value: "item-6",
                question: "Does it work on Mac/Linux or only Windows?",
                answer: "Currently only Windows (.exe) is supported. Mac and Linux versions are in development. You can use Windows in a VM on Mac/Linux as a temporary solution."
              }
            ].map((item, index) => (
              <AccordionItem key={index} value={item.value} className="luxury-card rounded-xl">
                <AccordionTrigger className="text-left px-4 md:px-6 py-4 md:py-6 text-foreground hover:text-gold transition-colors text-sm md:text-base font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 md:px-6 pb-4 md:pb-6 text-yellow-200/70 leading-relaxed text-xs md:text-sm">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 md:px-6 py-12 md:py-16 border-t border-yellow-500/20 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <img 
                  src={getLogoPath()} 
                  alt="Silently AI Logo" 
                  className="w-10 md:w-12 h-10 md:h-12 object-contain"
                />
                <span className="text-xl md:text-2xl font-bold text-gold">Silently AI</span>
              </div>
              <p className="text-yellow-200/70 leading-relaxed mb-4 md:mb-6 text-sm md:text-base">
                The undetectable desktop AI tool for students, developers, and professionals who need results without detection.
              </p>
              <Badge variant="secondary" className="badge-luxury text-xs">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
                10,000+ Active Users
              </Badge>
            </div>
            {[
              {
                title: "Product",
                links: [
                  { name: "Download", action: handleDownload },
                  { name: "Features", action: () => scrollToSection('features') },
                  { name: "Pricing", action: () => scrollToSection('pricing') },
                  { name: "Roadmap", action: () => handleSocialLink("Roadmap") }
                ]
              },
              {
                title: "Support",
                links: [
                  { name: "Help Center", action: handleContactUs },
                  { name: "API Docs", action: () => handleSocialLink("API Docs") },
                  { name: "Contact Us", action: handleContactUs },
                  { name: "Bug Reports", action: () => handleSocialLink("Bug Reports") }
                ]
              },
              {
                title: "Legal",
                links: [
                  { name: "Privacy Policy", action: () => handleSocialLink("Privacy Policy") },
                  { name: "Terms of Service", action: () => handleSocialLink("Terms of Service") },
                  { name: "Refund Policy", action: () => handleSocialLink("Refund Policy") },
                  { name: "GDPR", action: () => handleSocialLink("GDPR") }
                ]
              }
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold text-foreground mb-4 md:mb-6 text-base md:text-lg">{section.title}</h3>
                <ul className="space-y-2 md:space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <button onClick={link.action} className="text-yellow-200/60 hover:text-gold transition-colors text-sm md:text-base text-left">
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-yellow-500/20 mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center text-yellow-200/60 space-y-4 md:space-y-0">
            <div className="text-sm md:text-base">© 2024 Silently AI. All rights reserved.</div>
            <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm">
              <span>Made in India 🇮🇳</span>
              <span>•</span>
              <span>Powered by Razorpay</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;