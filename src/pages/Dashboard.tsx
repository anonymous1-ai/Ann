
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LogOut, Download, CreditCard, Camera, Type, Brain, Settings } from 'lucide-react';

const Dashboard = () => {
  const { user, logout, updateCredits } = useAuth();
  const { toast } = useToast();
  const [recentActivity] = useState([
    { id: 1, feature: 'Screenshot to Code', timestamp: '2 minutes ago', status: 'success' },
    { id: 2, feature: 'Text to Code', timestamp: '15 minutes ago', status: 'success' },
    { id: 3, feature: 'Aptitude Solver', timestamp: '1 hour ago', status: 'success' },
    { id: 4, feature: 'Screenshot to Code', timestamp: '2 hours ago', status: 'success' },
    { id: 5, feature: 'Text to Code', timestamp: '1 day ago', status: 'success' },
  ]);

  if (!user) return null;

  const creditPercentage = (user.apiCredits / 100) * 100;
  const planLimits = {
    free: 10,
    pro: 100,
    advanced: 300
  };

  const handleFeatureUse = (featureName: string) => {
    if (user.apiCredits <= 0) {
      toast({
        title: "No credits remaining",
        description: "Please purchase more credits to use this feature.",
        variant: "destructive",
      });
      return;
    }

    updateCredits(user.apiCredits - 1);
    toast({
      title: `${featureName} activated`,
      description: `1 credit used. ${user.apiCredits - 1} credits remaining.`,
    });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-300">Welcome back, {user.name}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadLogs}
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Logs
            </Button>
            <Button
              variant="outline"
              onClick={logout}
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* API Credits Tracker */}
          <Card className="lg:col-span-1 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">API Credits</CardTitle>
              <CardDescription>Track your usage and plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Current Plan</span>
                <Badge variant="secondary" className="capitalize">
                  {user.plan}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Credits Remaining</span>
                  <span className="text-white font-bold">{user.apiCredits}</span>
                </div>
                <Progress value={creditPercentage} className="h-2" />
                <p className="text-xs text-slate-400">
                  {user.apiCredits} of {planLimits[user.plan]} credits remaining
                </p>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-300">Total Calls</span>
                <span className="text-white font-bold">{user.totalCalls}</span>
              </div>

              <Button
                onClick={handleTopUp}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Buy More Credits
              </Button>
            </CardContent>
          </Card>

          {/* Feature Shortcuts */}
          <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription>Access your favorite features instantly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleFeatureUse('Screenshot to Code')}
                  className="h-20 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700"
                  disabled={user.apiCredits <= 0}
                >
                  <Camera className="w-6 h-6 mb-2" />
                  Screenshot → Code
                </Button>
                
                <Button
                  onClick={() => handleFeatureUse('Text to Code')}
                  className="h-20 flex flex-col items-center justify-center bg-green-600 hover:bg-green-700"
                  disabled={user.apiCredits <= 0}
                >
                  <Type className="w-6 h-6 mb-2" />
                  Text → Code
                </Button>
                
                <Button
                  onClick={() => handleFeatureUse('Aptitude Solver')}
                  className="h-20 flex flex-col items-center justify-center bg-orange-600 hover:bg-orange-700"
                  disabled={user.apiCredits <= 0}
                >
                  <Brain className="w-6 h-6 mb-2" />
                  Aptitude Solver
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  <Settings className="w-6 h-6 mb-2" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-3 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <CardDescription>Your last 5 feature uses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-white">{activity.feature}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        {activity.status}
                      </Badge>
                      <span className="text-slate-400 text-sm">{activity.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
