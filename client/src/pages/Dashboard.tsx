
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LogOut, Download, CreditCard, TrendingUp, Calendar, Clock } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
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

  const handleTopUp = () => {
    toast({
      title: "Redirecting to payment",
      description: "Opening Razorpay checkout...",
    });
  };

  const handleDownloadLogs = () => {
    toast({
      title: "Downloading logs",
      description: "Your activity logs are being prepared...",
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent neon-text">
              API Dashboard
            </h1>
            <p className="text-slate-300 text-lg">Welcome back, {user.name}</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDownloadLogs}
              className="tech-border bg-slate-900/50 border-cyan-400/30 text-cyan-300 hover:bg-cyan-950/30 hover:border-cyan-400/50 transition-all duration-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Logs
            </Button>
            <Button
              variant="outline"
              onClick={logout}
              className="tech-border bg-slate-900/50 border-red-400/30 text-red-300 hover:bg-red-950/30 hover:border-red-400/50 transition-all duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="tech-border neon-glow bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Credits Remaining</p>
                  <p className="text-2xl font-bold text-cyan-300 neon-text">{user.api_credits}</p>
                </div>
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="tech-border neon-glow bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Today's Calls</p>
                  <p className="text-2xl font-bold text-green-300">{apiStats.todayCalls}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="tech-border neon-glow bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-blue-300">{apiStats.successRate}%</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="tech-border neon-glow bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg Response</p>
                  <p className="text-2xl font-bold text-purple-300">{apiStats.avgResponseTime}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* API Usage Tracker */}
          <Card className="lg:col-span-1 tech-border neon-glow bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white neon-text">API Usage</CardTitle>
              <CardDescription className="text-slate-300">Track your API consumption</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Current Plan</span>
                  <Badge variant="secondary" className="capitalize bg-cyan-950/50 text-cyan-300 border-cyan-400/30">
                    {user.plan}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Credits Usage</span>
                    <span className="text-white font-bold text-cyan-300 neon-text">
                      {planLimits[user.plan] - user.api_credits}/{planLimits[user.plan]}
                    </span>
                  </div>
                  <Progress 
                    value={((planLimits[user.plan] - user.api_credits) / planLimits[user.plan]) * 100} 
                    className="h-3 bg-slate-800/50 [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-blue-600 [&>div]:shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                    <p className="text-cyan-400 text-lg font-semibold">{apiStats.weekCalls}</p>
                    <p className="text-slate-400 text-xs">This Week</p>
                  </div>
                  <div className="text-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                    <p className="text-cyan-400 text-lg font-semibold">{apiStats.monthCalls}</p>
                    <p className="text-slate-400 text-xs">This Month</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleTopUp}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl neon-glow transition-all duration-300 hover:scale-105"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Buy More Credits
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2 tech-border neon-glow bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white neon-text">Recent Activity</CardTitle>
              <CardDescription className="text-slate-300">Your recent API calls and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:bg-slate-700/30 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_6px_rgba(34,211,238,0.8)] pulse-glow"></div>
                      <div>
                        <span className="text-white font-medium">{activity.feature}</span>
                        <p className="text-slate-400 text-sm">API call completed successfully</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-cyan-400 border-cyan-400/50 bg-cyan-950/30">
                        {activity.status}
                      </Badge>
                      <span className="text-slate-400 text-sm">{activity.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-slate-800/20 rounded-lg border border-slate-700/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Last API Call</p>
                    <p className="text-slate-400 text-sm">{apiStats.lastCall}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400 font-semibold">Response: {apiStats.avgResponseTime}</p>
                    <p className="text-green-400 text-sm">Status: Active</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
