import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Code, Eye, EyeOff } from 'lucide-react';
import { getLogoPath } from '@/assets/logo-config';

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
    <Card className="w-full max-w-md mx-auto luxury-card golden-glow">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img 
            src={getLogoPath()} 
            alt="Silently AI Logo" 
            className="w-12 h-12 object-contain"
          />
        </div>
        <CardTitle className="text-2xl text-gradient">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-yellow-200/70">
          Sign in to your Silently AI account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-yellow-200/90 font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="input-luxury"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-yellow-200/90 font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="input-luxury pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-200/60 hover:text-gold transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full btn-luxury py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105" 
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
          <div className="text-center">
            <p className="text-yellow-200/60 text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-gold hover:text-yellow-400 font-medium transition-colors hover:underline"
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
