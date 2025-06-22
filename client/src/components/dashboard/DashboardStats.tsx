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
  AlertCircle
} from 'lucide-react';
import { apiService } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { ApiUsage } from '../../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface DashboardStatsProps {
  onGenerateLicense?: () => void;
  onTopUpCredits?: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ onGenerateLicense, onTopUpCredits }) => {
  const { user, refreshUser } = useAuth();
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

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      const [statsData, historyData] = await Promise.all([
        apiService.getDashboardStats(user.id),
        apiService.getApiUsageHistory(user.id, 30)
      ]);
      
      setStats(statsData);
      setUsageHistory(historyData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
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