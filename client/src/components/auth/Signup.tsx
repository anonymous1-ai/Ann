import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Code, Check, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getLogoPath } from '@/assets/logo-config';

interface SignupProps {
  onToggleMode: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const { signup, isLoading } = useAuth();
  const { toast } = useToast();

  const validateForm = () => {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    
    if (!name.trim()) {
      errors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
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
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      await signup(email, password, name);
      toast({
        title: "Welcome to Silently AI!",
        description: "Account created successfully. You have 5 free API credits to get started.",
        className: "bg-gradient-to-r from-yellow-950/90 to-amber-950/90 border-yellow-500/50 text-yellow-200",
      });
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to create account. Please try again.";
      setError(errorMessage);
      toast({
        title: "Signup failed",
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
          Create Account
        </CardTitle>
        <CardDescription className="text-yellow-200/70 mb-4">
          Join Silently AI and start converting text to code
        </CardDescription>
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          <Badge variant="secondary" className="badge-luxury">
            <Check className="h-3 w-3 mr-1" />
            5 Free Credits
          </Badge>
          <Badge variant="secondary" className="badge-luxury">
            <Check className="h-3 w-3 mr-1" />
            No Setup Required
          </Badge>
        </div>
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
            <Label htmlFor="name" className="text-yellow-200/90 font-medium">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (validationErrors.name) {
                  setValidationErrors(prev => ({...prev, name: undefined}));
                }
              }}
              placeholder="John Doe"
              className={`input-luxury ${validationErrors.name ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            />
            {validationErrors.name && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.name}
              </p>
            )}
          </div>
          
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
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-yellow-200/90 font-medium">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (validationErrors.confirmPassword) {
                    setValidationErrors(prev => ({...prev, confirmPassword: undefined}));
                  }
                }}
                placeholder="••••••••"
                className={`input-luxury pr-10 ${validationErrors.confirmPassword ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-200/60 hover:text-gold transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full btn-luxury py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105" 
            disabled={isLoading || (!!confirmPassword && password !== confirmPassword)}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
          <div className="text-center">
            <p className="text-yellow-200/60 text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-gold hover:text-yellow-400 font-medium transition-colors hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
