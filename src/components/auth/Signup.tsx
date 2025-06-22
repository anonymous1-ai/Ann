
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Code, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SignupProps {
  onToggleMode: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { signup, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(email, password, name);
      toast({
        title: "Account created successfully",
        description: "Welcome to Silently AI! You have 10 free credits.",
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
    <Card className="w-full max-w-md mx-auto tech-border neon-glow bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-lg">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center neon-glow pulse-glow">
            <Code className="w-6 h-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent neon-text">
          Create Account
        </CardTitle>
        <CardDescription className="text-slate-300 mb-4">
          Join Silently AI and start converting text to code
        </CardDescription>
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          <Badge variant="secondary" className="bg-cyan-950/50 text-cyan-300 border-cyan-400/30">
            <Check className="h-3 w-3 mr-1" />
            10 Free Credits
          </Badge>
          <Badge variant="secondary" className="bg-green-950/50 text-green-300 border-green-400/30">
            <Check className="h-3 w-3 mr-1" />
            No Setup Required
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-200 font-medium">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="tech-border bg-slate-800/50 text-white placeholder:text-slate-400 focus:border-cyan-400/50 focus:ring-cyan-400/20"
            />
          </div>
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
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="tech-border bg-slate-800/50 text-white placeholder:text-slate-400 focus:border-cyan-400/50 focus:ring-cyan-400/20"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl neon-glow transition-all duration-300 hover:scale-105" 
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors hover:underline"
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
