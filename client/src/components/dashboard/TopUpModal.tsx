import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Plus, Minus, RefreshCw } from 'lucide-react';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TopUpModal({ isOpen, onClose, onSuccess }: TopUpModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiCalls, setApiCalls] = useState(10);
  const [loading, setLoading] = useState(false);

  const pricePerCall = 9;
  const totalAmount = apiCalls * pricePerCall;

  const handleTopUp = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase API calls",
        variant: "destructive"
      });
      return;
    }

    if (apiCalls < 1 || apiCalls > 1000) {
      toast({
        title: "Invalid Amount",
        description: "Please select between 1-1000 API calls",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Create top-up order
      const response = await fetch('/api/create-topup-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ apiCalls })
      });

      const orderData = await response.json();
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create top-up order');
      }

      // Create Razorpay options for top-up checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "API Calls Top-up",
        description: `${apiCalls} API calls at ₹${pricePerCall} each`,
        order_id: orderData.data.orderId,
        handler: async function (response: any) {
          try {
            // Verify top-up payment with backend
            const verifyResponse = await fetch('/api/verify-topup-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                orderId: orderData.data.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                apiCalls: apiCalls
              })
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              toast({
                title: "Top-up Successful!",
                description: `Added ${apiCalls} API calls to your account`,
              });
              onSuccess();
              onClose();
            } else {
              throw new Error(verifyData.error || 'Top-up verification failed');
            }
          } catch (error: any) {
            toast({
              title: "Top-up Verification Failed",
              description: error.message || "Please contact support",
              variant: "destructive"
            });
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: "#D4AF37"
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      // Open Razorpay checkout
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      
    } catch (error: any) {
      toast({
        title: "Top-up Failed",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const adjustApiCalls = (increment: number) => {
    const newValue = apiCalls + increment;
    if (newValue >= 1 && newValue <= 1000) {
      setApiCalls(newValue);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black max-w-md border border-yellow-600/30 shadow-2xl shadow-yellow-900/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-yellow-400" />
            Top-up API Calls
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="text-center">
            <p className="text-yellow-300 mb-2">
              Purchase additional API calls at ₹{pricePerCall} per call
            </p>
            <div className="bg-background/80 rounded-lg p-4 border border-yellow-400/20">
              <p className="text-yellow-400 font-semibold">Current Balance: {user?.api_credits || 0} calls</p>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="apiCalls" className="text-yellow-400 font-medium">
              Number of API Calls (1-1000)
            </Label>
            
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => adjustApiCalls(-10)}
                disabled={apiCalls <= 10}
                className="bg-black/60 border border-yellow-600/30 text-yellow-200 hover:bg-black/80"
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <Input
                id="apiCalls"
                type="number"
                min="1"
                max="1000"
                value={apiCalls}
                onChange={(e) => setApiCalls(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
                className="text-center bg-black/80 border-yellow-600/30 text-yellow-100 placeholder:text-yellow-400/60"
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => adjustApiCalls(10)}
                disabled={apiCalls >= 990}
                className="bg-black/60 border border-yellow-600/30 text-yellow-200 hover:bg-black/80"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-black/80 rounded-lg p-4 border border-yellow-400/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-yellow-300">API Calls:</span>
                <span className="text-yellow-400 font-semibold">{apiCalls}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-yellow-300">Price per call:</span>
                <span className="text-yellow-400 font-semibold">₹{pricePerCall}</span>
              </div>
              <div className="border-t border-yellow-400/30 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-yellow-400 font-semibold text-lg">Total Amount:</span>
                  <span className="text-yellow-300 font-bold text-xl">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-black/60 border border-yellow-600/30 text-yellow-200 hover:bg-black/80"
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleTopUp}
              disabled={loading || apiCalls < 1}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold shadow-lg hover:shadow-yellow-500/20 transition-all"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Pay ₹{totalAmount.toLocaleString()}</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}