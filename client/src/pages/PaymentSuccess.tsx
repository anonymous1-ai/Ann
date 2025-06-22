import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getLogoPath } from '@/assets/logo-config';

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Countdown timer for auto-redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setLocation('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="luxury-card text-center p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <img 
              src={getLogoPath()} 
              alt="Silently AI Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>

          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gradient">
              Payment Successful!
            </h1>
            <p className="text-yellow-200/70">
              Your subscription has been activated successfully
            </p>
          </div>

          {/* Countdown */}
          <div className="flex items-center justify-center space-x-2 text-yellow-200/60">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Redirecting to dashboard in {countdown} seconds...</span>
          </div>

          {/* Manual Redirect Button */}
          <Button
            onClick={() => setLocation('/dashboard')}
            className="btn-luxury w-full"
          >
            Go to Dashboard Now
          </Button>

          {/* Additional Info */}
          <div className="text-xs text-yellow-200/50 space-y-1">
            <p>Your license key has been generated and stored securely.</p>
            <p>You can download the AI tool from your dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
}