import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Code, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onToggleMode: () => void;
}

export const Login: React.FC<LoginProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast({
        title: "Login successful",
        description: "Welcome back to Silently AI!",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto tech-border neon-glow bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-lg">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center neon-glow pulse-glow">
            <Code className="w-6 h-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent neon-text">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-slate-300">
          Sign in to your Silently AI account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200 font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="tech-border bg-slate-800/50 text-white placeholder:text-slate-400 focus:border-cyan-400/50 focus:ring-cyan-400/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200 font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="tech-border bg-slate-800/50 text-white placeholder:text-slate-400 focus:border-cyan-400/50 focus:ring-cyan-400/20 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl neon-glow transition-all duration-300 hover:scale-105" 
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
