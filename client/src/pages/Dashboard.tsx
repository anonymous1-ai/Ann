
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LogOut, Download, CreditCard, TrendingUp, Calendar, Clock } from 'lucide-react';
import { getLogoPath } from '@/assets/logo-config';

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

  const handleTopUp = async (topupType: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase API credits",
        variant: "destructive"
      });
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
                description: `${selected.calls} API credits added to your account.`
              });
              
              // Refresh user data
              await refreshUser();
            } else {
              throw new Error(verifyData.error || 'Top-up verification failed');
            }
          } catch (error: any) {
            toast({
              title: "Top-up Verification Failed",
              description: error.message || "Please contact support if payment was deducted.",
              variant: "destructive"
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
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-200/70 text-sm">Credits Remaining</p>
                  <p className="text-2xl font-bold text-gold">{user.api_credits}</p>
                </div>
                <div className="w-12 h-12 gold-gradient rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-black" />
                </div>
              </div>
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

          <Card className="luxury-card golden-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-200/70 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-gold">{apiStats.successRate}%</p>
                </div>
                <div className="w-12 h-12 gold-gradient rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-black" />
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
                  handleTopUp('topup-100');
                }}
                disabled={loading === 'topup-100'}
                className="w-full btn-luxury"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {loading === 'topup-100' ? 'Processing...' : 'Buy More Credits'}
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
    </div>
  );
};

export default Dashboard;
