
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LogOut, Download, CreditCard, TrendingUp, Calendar, Clock, ExternalLink, Plus } from 'lucide-react';
import { useLocation } from 'wouter';
import { getLogoPath } from '@/assets/logo-config';
import { PaymentModal } from '@/components/payment/PaymentModal';
import TopUpModal from '@/components/dashboard/TopUpModal';

// Add Razorpay type declaration
declare global {
  interface Window {
    Razorpay: any;
  }
}

const Dashboard = () => {
  const { user, logout, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    amount: 0,
    description: '',
    type: ''
  });
  const [topUpModal, setTopUpModal] = useState(false);
  const [recentActivity] = useState([
    { id: 1, feature: 'Screenshot to Code', timestamp: '2 minutes ago', status: 'success' },
    { id: 2, feature: 'Text to Code', timestamp: '15 minutes ago', status: 'success' },
    { id: 3, feature: 'Aptitude Solver', timestamp: '1 hour ago', status: 'success' },
    { id: 4, feature: 'Screenshot to Code', timestamp: '2 hours ago', status: 'success' },
    { id: 5, feature: 'Text to Code', timestamp: '1 day ago', status: 'success' },
  ]);

  const [apiStats] = useState({
    todayCalls: 15,
    weekCalls: 87,
    monthCalls: 342,
    avgResponseTime: '1.2s',
    successRate: 98.5,
    lastCall: '2 minutes ago'
  });

  if (!user) return null;

  const creditPercentage = (user.api_credits / 100) * 100;
  const planLimits = {
    free: 10,
    pro: 100,
    advanced: 300
  };

  const handleTopUp = (topupType: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase API credits",
        variant: "destructive"
      });
      return;
    }

    if (topupType !== 'topup-9') {
      toast({
        title: "Invalid Option",
        description: "Please select a valid top-up option",
        variant: "destructive"
      });
      return;
    }

    setPaymentModal({
      isOpen: true,
      amount: 900, // ₹9 in paise per call
      description: "API Credits - ₹9 per call",
      type: topupType
    });
  };

  const handleSubscription = (planType: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase a subscription plan",
        variant: "destructive"
      });
      return;
    }

    const planOptions = {
      'pro-monthly': { plan: 'pro', price: 800, duration: 'monthly' },
      'pro-annual': { plan: 'pro', price: 9500, duration: 'annual' },
      'advanced-monthly': { plan: 'advanced', price: 2000, duration: 'monthly' },
      'advanced-annual': { plan: 'advanced', price: 20000, duration: 'annual' }
    };

    const selected = planOptions[planType as keyof typeof planOptions];
    if (!selected) {
      toast({
        title: "Invalid Plan",
        description: "Please select a valid subscription plan",
        variant: "destructive"
      });
      return;
    }

    setPaymentModal({
      isOpen: true,
      amount: selected.price * 100, // Convert to paise
      description: `${selected.plan.toUpperCase()} Plan - ${selected.duration}`,
      type: planType
    });
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      // Payment verification is now handled in PaymentModal
      // Just refresh user data and show success message
      if (response.verified && response.newBalance) {
        toast({
          title: "Payment Successful!",
          description: response.message || `Added ${response.addedCalls} API credits to your account`
        });
        await refreshUser();
      } else {
        // Fallback for older payment flows
        toast({
          title: "Payment Completed",
          description: "Please refresh to see updated credits"
        });
        await refreshUser();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Please refresh your dashboard",
        variant: "destructive"
      });
    }
  };

  const handlePaymentError = (error: any) => {
    toast({
      title: "Payment Failed",
      description: error.description || "Payment was unsuccessful. Please try again.",
      variant: "destructive"
    });
  };

  const handleDownloadLogs = () => {
    toast({
      title: "Downloading logs",
      description: "Your activity logs are being prepared...",
    });
  };

  return (
    <div className="min-h-screen">
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
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleDownloadLogs}
                className="btn-luxury-outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Logs
              </Button>
              <Button
                variant="outline"
                onClick={logout}
                className="btn-luxury-outline border-red-400/30 text-red-300 hover:bg-red-950/30 hover:border-red-400/50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gradient">
                API Dashboard
              </h1>
              <p className="text-yellow-200/70 text-lg">Welcome back, {user.name}</p>
            </div>
          </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="luxury-card golden-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-yellow-200/70 text-sm">API Credits</p>
                  <p className="text-2xl font-bold text-gold">{user.apiCallsLeft}</p>
                </div>
                <div className="w-12 h-12 gold-gradient rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-black" />
                </div>
              </div>
              <Button
                onClick={() => setTopUpModal(true)}
                size="sm"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Top-up ₹9/call
              </Button>
            </CardContent>
          </Card>

          <Card className="luxury-card golden-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-200/70 text-sm">Today's Calls</p>
                  <p className="text-2xl font-bold text-gold">{apiStats.todayCalls}</p>
                </div>
                <div className="w-12 h-12 gold-gradient rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-black" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-600 to-yellow-700 border-2 border-yellow-400 cursor-pointer hover:from-yellow-500 hover:to-yellow-600 hover:shadow-[0_0_30px_rgba(212,175,55,0.8)] transition-all duration-300" 
                onClick={() => setLocation('/pricing')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black/70 text-sm font-medium">View All Plans</p>
                  <p className="text-lg font-bold text-black">Pricing</p>
                </div>
                <div className="w-12 h-12 bg-black/20 rounded-lg flex items-center justify-center">
                  <ExternalLink className="w-6 h-6 text-black" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="luxury-card golden-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-200/70 text-sm">Avg Response</p>
                  <p className="text-2xl font-bold text-gold">{apiStats.avgResponseTime}</p>
                </div>
                <div className="w-12 h-12 gold-gradient rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-black" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Plan Display for Paid Users */}
        {user.plan !== 'free' && (
          <div className="mb-8">
            <Card className="luxury-card golden-glow">
              <CardHeader>
                <CardTitle className="text-gradient">Current Plan</CardTitle>
                <CardDescription className="text-yellow-200/70">
                  You're currently on the {user.plan.toUpperCase()} plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-yellow-900/20 rounded-lg border border-yellow-400/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gold text-lg font-semibold capitalize">{user.plan} Plan</h3>
                      <p className="text-yellow-200/70 text-sm">
                        {user.plan === 'pro' ? '100 API calls/month' : '300 API calls/month'}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-600 text-white">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}



        {/* Main Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* API Usage Tracker */}
          <Card className="lg:col-span-1 luxury-card golden-glow">
            <CardHeader>
              <CardTitle className="text-gradient">API Usage</CardTitle>
              <CardDescription className="text-yellow-200/70">Track your API consumption</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-yellow-200/70">Current Plan</span>
                  <Badge variant="secondary" className="capitalize bg-yellow-900/50 text-gold border-yellow-400/30">
                    {user.plan}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-200/70">Credits Usage</span>
                    <span className="text-gold font-bold">
                      {planLimits[user.plan] - user.api_credits}/{planLimits[user.plan]}
                    </span>
                  </div>
                  <Progress 
                    value={((planLimits[user.plan] - user.api_credits) / planLimits[user.plan]) * 100} 
                    className="h-3 bg-slate-800/50 [&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-yellow-600 [&>div]:shadow-[0_0_10px_rgba(212,175,55,0.5)]" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-3 bg-yellow-900/20 rounded-lg border border-yellow-400/30">
                    <p className="text-gold text-lg font-semibold">{apiStats.weekCalls}</p>
                    <p className="text-yellow-200/70 text-xs">This Week</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-900/20 rounded-lg border border-yellow-400/30">
                    <p className="text-gold text-lg font-semibold">{apiStats.monthCalls}</p>
                    <p className="text-yellow-200/70 text-xs">This Month</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleTopUp('topup-9');
                }}
                disabled={loading === 'topup-9'}
                className="w-full btn-luxury"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {loading === 'topup-9' ? 'Processing...' : 'Buy Credits (₹9/call)'}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2 luxury-card golden-glow">
            <CardHeader>
              <CardTitle className="text-gradient">Recent Activity</CardTitle>
              <CardDescription className="text-yellow-200/70">Your recent API calls and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 bg-yellow-900/20 rounded-lg border border-yellow-400/30 hover:bg-yellow-900/30 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-gold rounded-full shadow-[0_0_6px_rgba(212,175,55,0.8)]"></div>
                      <div>
                        <span className="text-gold font-medium">{activity.feature}</span>
                        <p className="text-yellow-200/70 text-sm">API call completed successfully</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-gold border-yellow-400/50 bg-yellow-900/30">
                        {activity.status}
                      </Badge>
                      <span className="text-yellow-200/70 text-sm">{activity.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-yellow-900/20 rounded-lg border border-yellow-400/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gold font-medium">Last API Call</p>
                    <p className="text-yellow-200/70 text-sm">{apiStats.lastCall}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gold font-semibold">Response: {apiStats.avgResponseTime}</p>
                    <p className="text-gold text-sm">Status: Active</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
        amount={paymentModal.amount}
        currency="INR"
        description={paymentModal.description}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        userDetails={{
          email: user?.email || '',
          name: user?.name || ''
        }}
      />

      {/* Top-Up Modal */}
      <TopUpModal
        isOpen={topUpModal}
        onClose={() => setTopUpModal(false)}
        onSuccess={async () => {
          await refreshUser();
          setTopUpModal(false);
        }}
      />
    </div>
  );
};

export default Dashboard;
