import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Code, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { getLogoPath } from '@/assets/logo-config';

interface LoginProps {
  onToggleMode: () => void;
}

export const Login: React.FC<LoginProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{email?: string; password?: string}>({});
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const validateForm = () => {
    const errors: {email?: string; password?: string} = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    
    if (!validateForm()) return;
    
    try {
      await login(email, password);
      toast({
        title: "Welcome back!",
        description: "Successfully signed into your Silently AI account",
        className: "bg-gradient-to-r from-yellow-950/90 to-amber-950/90 border-yellow-500/50 text-yellow-200",
      });
    } catch (error: any) {
      const errorMessage = error?.message || "Invalid email or password. Please try again.";
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
        className: "bg-gradient-to-r from-red-950/90 to-red-900/90 border-red-500/50 text-red-200",
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
          {error && (
            <Alert className="bg-gradient-to-r from-red-950/50 to-red-900/50 border-red-500/50">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-yellow-200/90 font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationErrors.email) {
                  setValidationErrors(prev => ({...prev, email: undefined}));
                }
              }}
              placeholder="your@email.com"
              className={`input-luxury ${validationErrors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            />
            {validationErrors.email && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.email}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-yellow-200/90 font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationErrors.password) {
                    setValidationErrors(prev => ({...prev, password: undefined}));
                  }
                }}
                placeholder="••••••••"
                className={`input-luxury pr-10 ${validationErrors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-200/60 hover:text-gold transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.password}
              </p>
            )}
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
