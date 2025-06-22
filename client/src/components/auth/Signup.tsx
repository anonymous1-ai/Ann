import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Code, Check, Eye, EyeOff } from 'lucide-react';
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
  const { signup, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    try {
      await signup(email, password, name);
      toast({
        title: "Account created successfully",
        description: "Welcome to Silently AI! You have 5 free credits.",
      });
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "Please try again.",
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
          <div className="space-y-2">
            <Label htmlFor="name" className="text-yellow-200/90 font-medium">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="input-luxury"
            />
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-yellow-200/90 font-medium">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="input-luxury pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-200/60 hover:text-gold transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-400 text-xs mt-1">Passwords don't match</p>
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
