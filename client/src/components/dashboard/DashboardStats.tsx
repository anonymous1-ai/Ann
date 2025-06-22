import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  Activity, 
  CreditCard, 
  Download, 
  Key, 
  TrendingUp, 
  Users, 
  Zap,
  RefreshCw,
  AlertCircle,
  Crown,
  Star
} from 'lucide-react';
import { apiService } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { ApiUsage } from '../../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useToast } from '../../hooks/use-toast';

interface DashboardStatsProps {
  onGenerateLicense?: () => void;
  onTopUpCredits?: () => void;
}

// Add Razorpay type declaration
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ onGenerateLicense, onTopUpCredits }) => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<{
    totalCalls: number;
    remainingCredits: number;
    plan: string;
    subscriptionStatus?: string;
    usageThisMonth: number;
  } | null>(null);
  const [usageHistory, setUsageHistory] = useState<ApiUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingLicense, setGeneratingLicense] = useState(false);
  const [topupLoading, setTopupLoading] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      const [statsData, historyData] = await Promise.all([
        apiService.getDashboardStats(user.id),
        apiService.getApiUsageHistory(user.id, 30)
      ]);
      
      setStats({
        ...statsData,
        usageThisMonth: statsData.totalCalls || 0
      });
      setUsageHistory(historyData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
        className: "error-toast"
      });
    } finally {
      setLoading(false);
    }
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

    setTopupLoading(topupType);

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
              
              // Refresh user data and stats
              await refreshUser();
              await fetchStats();
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
            setTopupLoading(null);
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
      setTopupLoading(null);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const handleGenerateLicense = async () => {
    if (!user) return;
    
    setGeneratingLicense(true);
    try {
      const { licenseKey } = await apiService.generateLicenseKey(user.id);
      toast.success('License key generated successfully!');
      await refreshUser();
      onGenerateLicense?.();
    } catch (error) {
      console.error('License generation error:', error);
      toast.error('Failed to generate license key');
    } finally {
      setGeneratingLicense(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'advanced': return 'bg-purple-500';
      case 'pro': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'advanced': return <Zap className="h-4 w-4" />;
      case 'pro': return <TrendingUp className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const chartData = usageHistory.slice(-7).map(usage => ({
    date: new Date(usage.created_at).toLocaleDateString(),
    credits: usage.credits_used,
  }));

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.usageThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Credits</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.remainingCredits.toLocaleString()}</div>
            <Progress 
              value={(stats.remainingCredits / (stats.plan === 'free' ? 5 : stats.plan === 'pro' ? 100 : 300)) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            {getPlanIcon(stats.plan)}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className={getPlanColor(stats.plan)}>
                {stats.plan.charAt(0).toUpperCase() + stats.plan.slice(1)}
              </Badge>
              {stats.subscriptionStatus && (
                <Badge variant="outline" className="text-xs">
                  {stats.subscriptionStatus}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">License Key</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {user?.license_key ? (
              <div className="space-y-2">
                <code className="text-xs bg-muted p-1 rounded block break-all">
                  {user.license_key}
                </code>
                <Button size="sm" variant="outline" className="w-full">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">No license key</p>
                <Button 
                  size="sm" 
                  onClick={handleGenerateLicense}
                  disabled={generatingLicense || stats.plan === 'free'}
                  className="w-full"
                >
                  {generatingLicense ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Key className="h-3 w-3 mr-1" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>API Usage (Last 7 Days)</CardTitle>
          <CardDescription>
            Daily credit consumption over the past week
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="credits" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No usage data available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent API Activity</CardTitle>
          <CardDescription>
            Your latest API calls and credit usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usageHistory.length > 0 ? (
            <div className="space-y-4">
              {usageHistory.slice(0, 10).map((usage) => (
                <div key={usage.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{usage.endpoint}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(usage.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {usage.credits_used} credits
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top-up Credits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="luxury-card hover:golden-glow transition-all duration-300">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-gold text-xl">50 Credits</CardTitle>
            <CardDescription className="text-yellow-200/70">Quick boost</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold text-gradient">₹450</span>
              <p className="text-yellow-200/70 text-sm">₹9 per credit</p>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => handleTopUp('topup-50')}
              disabled={topupLoading === 'topup-50'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {topupLoading === 'topup-50' ? 'Processing...' : 'Buy 50 Credits'}
            </Button>
          </CardContent>
        </Card>

        <Card className="luxury-card golden-glow ring-2 ring-gold/50">
          <CardHeader className="text-center">
            <Badge className="mb-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold">
              Most Popular
            </Badge>
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <Crown className="w-6 h-6 text-black" />
            </div>
            <CardTitle className="text-gold text-xl">100 Credits</CardTitle>
            <CardDescription className="text-yellow-200/70">Best value</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold text-gradient">₹800</span>
              <p className="text-yellow-200/70 text-sm">₹8 per credit</p>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => handleTopUp('topup-100')}
              disabled={topupLoading === 'topup-100'}
              className="w-full btn-luxury"
            >
              {topupLoading === 'topup-100' ? 'Processing...' : 'Buy 100 Credits'}
            </Button>
          </CardContent>
        </Card>

        <Card className="luxury-card hover:golden-glow transition-all duration-300">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-gold text-xl">250 Credits</CardTitle>
            <CardDescription className="text-yellow-200/70">Maximum value</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold text-gradient">₹1750</span>
              <p className="text-yellow-200/70 text-sm">₹7 per credit</p>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => handleTopUp('topup-250')}
              disabled={topupLoading === 'topup-250'}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {topupLoading === 'topup-250' ? 'Processing...' : 'Buy 250 Credits'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Plan Upgrade Alert */}
      {stats.plan === 'free' && stats.remainingCredits < 3 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Low Credits Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-4">
              You're running low on API credits. Consider upgrading to a paid plan for more credits and additional features.
            </p>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 