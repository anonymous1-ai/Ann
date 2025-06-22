import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface CustomPaymentModalProps {
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

export default function CustomPaymentModal({
  isOpen,
  onClose,
  amount,
  description,
  orderId,
  onSuccess,
  onError,
  userDetails
}: CustomPaymentModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  
  const formattedAmount = (amount / 100).toFixed(0);

  const handleUPIPayment = async () => {
    if (!upiId.trim()) {
      toast({
        title: "UPI ID Required",
        description: "Please enter your UPI ID",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay options for UPI payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: "Subscription Plan",
        description: description,
        order_id: orderId,
        method: {
          upi: true
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: '',
          'vpa': upiId
        },
        theme: {
          color: "#D4AF37",
          hide_topbar: true
        },
        modal: {
          backdrop_close: false,
          escape: false,
          handleback: false,
          ondismiss: function() {
            setLoading(false);
          }
        },
        handler: async function (response: any) {
          await handlePaymentSuccess(response);
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      setLoading(false);
      onError(error);
    }
  };

  const handleCardPayment = async () => {
    setLoading(true);

    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: "Subscription Plan",
        description: description,
        order_id: orderId,
        method: {
          card: true
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
        },
        theme: {
          color: "#D4AF37",
          hide_topbar: true
        },
        modal: {
          backdrop_close: false,
          escape: false,
          handleback: false,
          ondismiss: function() {
            setLoading(false);
          }
        },
        handler: async function (response: any) {
          await handlePaymentSuccess(response);
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      setLoading(false);
      onError(error);
    }
  };

  const handleBankPayment = async () => {
    setLoading(true);

    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: "Subscription Plan",
        description: description,
        order_id: orderId,
        method: {
          netbanking: true
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
        },
        theme: {
          color: "#D4AF37",
          hide_topbar: true
        },
        modal: {
          backdrop_close: false,
          escape: false,
          handleback: false,
          ondismiss: function() {
            setLoading(false);
          }
        },
        handler: async function (response: any) {
          await handlePaymentSuccess(response);
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      setLoading(false);
      onError(error);
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      const verifyResponse = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId: orderId,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
          plan: 'subscription'
        })
      });

      const verifyData = await verifyResponse.json();
      
      if (verifyData.success) {
        setLoading(false);
        onSuccess(verifyData);
      } else {
        throw new Error(verifyData.error || 'Payment verification failed');
      }
    } catch (error: any) {
      setLoading(false);
      onError(error);
    }
  };

  const handleQuickUPI = (provider: string) => {
    const suggestions = {
      'Google Pay': `${userDetails.email?.split('@')[0] || 'user'}@gpay`,
      'PhonePe': `${userDetails.email?.split('@')[0] || 'user'}@phonepe`,
      'Paytm': `${userDetails.email?.split('@')[0] || 'user'}@paytm`
    };
    setUpiId(suggestions[provider as keyof typeof suggestions] || '');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-slate-900 rounded-xl max-w-md w-full mx-4 border border-yellow-400/20">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gold">Complete Payment</h2>
              <p className="text-yellow-200/70 text-sm">{description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-yellow-200/70 hover:text-gold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-slate-800/50 rounded-lg p-1 mb-6">
            {['UPI', 'Card', 'Bank'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-yellow-600 text-black'
                    : 'text-yellow-200/70 hover:text-gold'
                }`}
              >
                {tab === 'UPI' && '📱'} {tab === 'Card' && '💳'} {tab === 'Bank' && '🏦'} {tab}
              </button>
            ))}
          </div>

          {/* UPI Tab */}
          {activeTab === 'UPI' && (
            <div className="space-y-4">
              <div>
                <label className="text-gold text-sm font-medium">UPI ID</label>
                <Input
                  placeholder="yourname@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="mt-1 bg-slate-800/50 border-yellow-400/20 text-yellow-100 placeholder:text-slate-400"
                />
                <p className="text-yellow-200/60 text-xs mt-1">
                  Enter your UPI ID (e.g., 9876543210@paytm, user@googlepay)
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleQuickUPI('Google Pay')}
                  variant="outline"
                  size="sm"
                  className="bg-blue-600/20 border-blue-400/30 text-blue-300 hover:bg-blue-600/30"
                >
                  Google Pay
                </Button>
                <Button
                  onClick={() => handleQuickUPI('PhonePe')}
                  variant="outline"
                  size="sm"
                  className="bg-purple-600/20 border-purple-400/30 text-purple-300 hover:bg-purple-600/30"
                >
                  PhonePe
                </Button>
                <Button
                  onClick={() => handleQuickUPI('Paytm')}
                  variant="outline"
                  size="sm"
                  className="bg-blue-500/20 border-blue-400/30 text-blue-300 hover:bg-blue-500/30"
                >
                  Paytm
                </Button>
              </div>
            </div>
          )}

          {/* Card Tab */}
          {activeTab === 'Card' && (
            <div className="text-center py-8">
              <p className="text-yellow-200/70 mb-4">Click below to pay with Credit/Debit Card</p>
              <p className="text-lg text-gold font-semibold">Secure card payment</p>
            </div>
          )}

          {/* Bank Tab */}
          {activeTab === 'Bank' && (
            <div className="text-center py-8">
              <p className="text-yellow-200/70 mb-4">Click below to pay with Net Banking</p>
              <p className="text-lg text-gold font-semibold">Choose your bank</p>
            </div>
          )}

          {/* Amount Section */}
          <div className="bg-slate-800/30 rounded-lg p-4 mt-6 border border-yellow-400/20">
            <div className="flex justify-between items-center">
              <span className="text-yellow-200/80">Amount to Pay</span>
              <span className="text-gold text-xl font-bold">₹{formattedAmount}</span>
            </div>
            <p className="text-yellow-200/60 text-xs mt-1">
              Secure payment powered by advanced encryption
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-slate-800/50 border-yellow-400/30 text-yellow-200 hover:bg-slate-700/50"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (activeTab === 'UPI') handleUPIPayment();
                else if (activeTab === 'Card') handleCardPayment();
                else if (activeTab === 'Bank') handleBankPayment();
              }}
              disabled={loading || (activeTab === 'UPI' && !upiId.trim())}
              className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-black font-semibold"
            >
              {loading ? 'Processing...' : `Pay ₹${formattedAmount}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}