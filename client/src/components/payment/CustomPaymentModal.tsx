import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { X, Smartphone, CreditCard, Building2 } from 'lucide-react';

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
      <div className="bg-black rounded-2xl max-w-md w-full mx-4 border border-yellow-600/30 shadow-2xl shadow-yellow-900/20">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-yellow-400 mb-1">Complete Payment</h2>
              <p className="text-yellow-300 text-sm">{description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-black/80 rounded-lg p-1 mb-6 border border-yellow-600/20">
            <button
              onClick={() => setActiveTab('UPI')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                activeTab === 'UPI'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold shadow-lg'
                  : 'text-yellow-400 hover:text-yellow-300'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              UPI
            </button>
            <button
              onClick={() => setActiveTab('Card')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                activeTab === 'Card'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold shadow-lg'
                  : 'text-yellow-400 hover:text-yellow-300'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Card
            </button>
            <button
              onClick={() => setActiveTab('Bank')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                activeTab === 'Bank'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold shadow-lg'
                  : 'text-yellow-400 hover:text-yellow-300'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Bank
            </button>
          </div>

          {/* UPI Tab Content */}
          {activeTab === 'UPI' && (
            <div className="space-y-4">
              <div>
                <label className="text-yellow-200 text-sm font-medium block mb-2">UPI ID</label>
                <Input
                  placeholder="yourname@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="bg-background/80 border-yellow-600/30 text-yellow-100 placeholder:text-yellow-400/60 h-12 rounded-lg focus:border-yellow-500 focus:ring-yellow-500/20"
                />
                <p className="text-yellow-300/60 text-xs mt-2">
                  Enter your UPI ID (e.g., 9876543210@paytm, user@googlepay)
                </p>
              </div>

              <div className="flex gap-2">
                <div className="bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg px-4 py-2 text-sm cursor-not-allowed opacity-70">
                  Google Pay
                </div>
                <div className="bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-lg px-4 py-2 text-sm cursor-not-allowed opacity-70">
                  PhonePe
                </div>
                <div className="bg-green-600/20 border border-green-500/30 text-green-300 rounded-lg px-4 py-2 text-sm cursor-not-allowed opacity-70">
                  Paytm
                </div>
              </div>
            </div>
          )}

          {/* Card Tab Content */}
          {activeTab === 'Card' && (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-yellow-400/60 mx-auto mb-4" />
              <p className="text-yellow-300/70 mb-4">Click below to pay with Credit/Debit Card</p>
              <p className="text-lg text-yellow-200 font-semibold">Secure card payment</p>
            </div>
          )}

          {/* Bank Tab Content */}
          {activeTab === 'Bank' && (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-yellow-400/60 mx-auto mb-4" />
              <p className="text-yellow-300/70 mb-4">Click below to pay with Net Banking</p>
              <p className="text-lg text-yellow-200 font-semibold">Choose your bank</p>
            </div>
          )}

          {/* Amount Section */}
          <div className="bg-background/80 rounded-lg p-4 mt-6 border border-yellow-600/40">
            <div className="flex justify-between items-center">
              <span className="text-yellow-200 font-medium">Amount to Pay</span>
              <span className="text-yellow-200 text-xl font-bold">₹{formattedAmount}</span>
            </div>
            <p className="text-yellow-300/60 text-xs mt-1">
              Secure payment powered by advanced encryption
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={onClose}
              className="flex-1 bg-background/60 border border-yellow-600/30 text-yellow-200 hover:bg-background/80 rounded-lg h-12 font-medium"
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
              className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold rounded-lg h-12 shadow-lg hover:shadow-yellow-500/20 transition-all"
            >
              {loading ? 'Processing...' : `Pay ₹${formattedAmount}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}