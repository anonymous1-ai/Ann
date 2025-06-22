import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, QrCode, Copy, CheckCircle, RefreshCw } from 'lucide-react';

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  orderId: string;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  userDetails: {
    email: string;
    name: string;
  };
}

export default function UPIPaymentModal({
  isOpen,
  onClose,
  amount,
  description,
  orderId,
  onSuccess,
  onError,
  userDetails
}: UPIPaymentModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [upiId] = useState('payments@yourapp.upi'); // Replace with your actual UPI ID
  const [copied, setCopied] = useState(false);
  
  const formattedAmount = (amount / 100).toFixed(2);
  const upiString = `upi://pay?pa=${upiId}&pn=YourApp&am=${formattedAmount}&tr=${orderId}&tn=${encodeURIComponent(description)}`;

  const copyUPIId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast({
      title: "UPI ID Copied",
      description: "UPI ID has been copied to clipboard"
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const openUPIApp = (app: string) => {
    let appUrl = '';
    
    switch (app) {
      case 'gpay':
        appUrl = `tez://upi/pay?pa=${upiId}&pn=YourApp&am=${formattedAmount}&tr=${orderId}&tn=${encodeURIComponent(description)}`;
        break;
      case 'phonepe':
        appUrl = `phonepe://pay?pa=${upiId}&pn=YourApp&am=${formattedAmount}&tr=${orderId}&tn=${encodeURIComponent(description)}`;
        break;
      case 'paytm':
        appUrl = `paytmmp://pay?pa=${upiId}&pn=YourApp&am=${formattedAmount}&tr=${orderId}&tn=${encodeURIComponent(description)}`;
        break;
      default:
        appUrl = upiString;
    }

    setPaymentStatus('processing');
    window.location.href = appUrl;
    
    // Start checking payment status
    setTimeout(() => {
      checkPaymentStatus();
    }, 5000);
  };

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch('/api/check-payment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ orderId })
      });

      const data = await response.json();
      
      if (data.success && data.status === 'paid') {
        setPaymentStatus('success');
        onSuccess(data);
      } else if (data.status === 'failed') {
        setPaymentStatus('failed');
        onError(new Error('Payment failed'));
      } else {
        // Continue checking
        setTimeout(() => checkPaymentStatus(), 3000);
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      setTimeout(() => checkPaymentStatus(), 5000);
    }
  };

  const handleManualVerification = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/manual-payment-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ orderId, amount: formattedAmount })
      });

      const data = await response.json();
      
      if (data.success) {
        setPaymentStatus('success');
        onSuccess(data);
      } else {
        toast({
          title: "Verification Pending",
          description: "Payment verification is in progress. You'll be notified once confirmed.",
        });
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Please contact support if payment was made",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="luxury-card max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-gold" />
            Complete Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="text-center">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-yellow-400/20 mb-4">
              <p className="text-gold font-semibold text-lg">₹{formattedAmount}</p>
              <p className="text-yellow-200/80 text-sm">{description}</p>
              <p className="text-yellow-200/60 text-xs mt-1">Order ID: {orderId}</p>
            </div>
          </div>

          {paymentStatus === 'pending' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-gold font-semibold mb-3">Choose Payment Method</h3>
              </div>

              {/* UPI Apps */}
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => openUPIApp('gpay')}
                  className="luxury-button-outline flex flex-col items-center p-4 h-auto"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-lg mb-2 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <span className="text-xs">Google Pay</span>
                </Button>

                <Button
                  onClick={() => openUPIApp('phonepe')}
                  className="luxury-button-outline flex flex-col items-center p-4 h-auto"
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-lg mb-2 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                  <span className="text-xs">PhonePe</span>
                </Button>

                <Button
                  onClick={() => openUPIApp('paytm')}
                  className="luxury-button-outline flex flex-col items-center p-4 h-auto"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-lg mb-2 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                  <span className="text-xs">Paytm</span>
                </Button>
              </div>

              {/* Manual UPI ID */}
              <div className="border-t border-yellow-400/20 pt-4">
                <p className="text-yellow-200/80 text-sm mb-2">Or pay manually using UPI ID:</p>
                <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg p-3 border border-yellow-400/20">
                  <span className="text-gold font-mono text-sm flex-1">{upiId}</span>
                  <Button
                    onClick={copyUPIId}
                    size="sm"
                    variant="outline"
                    className="luxury-button-outline"
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === 'processing' && (
            <div className="text-center space-y-4">
              <div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full mx-auto"></div>
              <div>
                <p className="text-gold font-semibold">Processing Payment...</p>
                <p className="text-yellow-200/80 text-sm">Complete the payment in your UPI app</p>
              </div>
              <Button
                onClick={handleManualVerification}
                disabled={loading}
                className="luxury-button-outline"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                I've completed the payment
              </Button>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <p className="text-gold font-semibold text-lg">Payment Successful!</p>
                <p className="text-yellow-200/80 text-sm">Your account has been updated</p>
              </div>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-2xl">✗</span>
              </div>
              <div>
                <p className="text-red-400 font-semibold text-lg">Payment Failed</p>
                <p className="text-yellow-200/80 text-sm">Please try again</p>
              </div>
              <Button
                onClick={() => setPaymentStatus('pending')}
                className="luxury-button"
              >
                Try Again
              </Button>
            </div>
          )}

          {paymentStatus === 'pending' && (
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 luxury-button-outline"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}