import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Smartphone, 
  CreditCard, 
  Building2, 
  Copy, 
  CheckCircle, 
  RefreshCw,
  Lock,
  Shield
} from 'lucide-react';

interface UniversalPaymentModalProps {
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

export default function UniversalPaymentModal({
  isOpen,
  onClose,
  amount,
  description,
  orderId,
  onSuccess,
  onError,
  userDetails
}: UniversalPaymentModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [activeTab, setActiveTab] = useState('upi');
  const [copied, setCopied] = useState(false);
  
  // UPI Details
  const [upiId] = useState('payments@yourapp.upi');
  const formattedAmount = (amount / 100).toFixed(2);
  const upiString = `upi://pay?pa=${upiId}&pn=YourApp&am=${formattedAmount}&tr=${orderId}&tn=${encodeURIComponent(description)}`;

  // Card Details
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Bank Details
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifsc: '',
    accountHolder: ''
  });

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
    
    setTimeout(() => {
      checkPaymentStatus();
    }, 5000);
  };

  const processCardPayment = async () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
      toast({
        title: "Incomplete Details",
        description: "Please fill all card details",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setPaymentStatus('processing');

    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: "Secure Payment",
        description: description,
        order_id: orderId,
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
            setPaymentStatus('pending');
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
      setPaymentStatus('failed');
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  const processBankTransfer = async () => {
    if (!bankDetails.accountNumber || !bankDetails.ifsc || !bankDetails.accountHolder) {
      toast({
        title: "Incomplete Details",
        description: "Please fill all bank details",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/initiate-bank-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId,
          accountDetails: bankDetails,
          amount: formattedAmount
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Bank Transfer Initiated",
          description: "Your bank transfer request has been submitted. You'll receive confirmation once processed.",
        });
        setPaymentStatus('processing');
      } else {
        throw new Error(data.error || 'Bank transfer failed');
      }
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
        setTimeout(() => checkPaymentStatus(), 3000);
      }
    } catch (error) {
      setTimeout(() => checkPaymentStatus(), 5000);
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
        setPaymentStatus('success');
        onSuccess(verifyData);
      } else {
        throw new Error(verifyData.error || 'Payment verification failed');
      }
    } catch (error: any) {
      setPaymentStatus('failed');
      onError(error);
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
        toast({
          title: "Verification Submitted",
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
      <DialogContent className="luxury-card max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient flex items-center gap-2">
            <Shield className="w-6 h-6 text-gold" />
            Secure Payment
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
            <div className="w-full">
              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-slate-800/50 rounded-lg">
                <button
                  onClick={() => setActiveTab('upi')}
                  className={`flex items-center justify-center p-3 rounded-md transition-all ${
                    activeTab === 'upi' 
                      ? 'bg-gold text-black font-semibold' 
                      : 'text-yellow-200/70 hover:text-gold'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  UPI
                </button>
                <button
                  onClick={() => setActiveTab('card')}
                  className={`flex items-center justify-center p-3 rounded-md transition-all ${
                    activeTab === 'card' 
                      ? 'bg-gold text-black font-semibold' 
                      : 'text-yellow-200/70 hover:text-gold'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Card
                </button>
                <button
                  onClick={() => setActiveTab('bank')}
                  className={`flex items-center justify-center p-3 rounded-md transition-all ${
                    activeTab === 'bank' 
                      ? 'bg-gold text-black font-semibold' 
                      : 'text-yellow-200/70 hover:text-gold'
                  }`}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Bank
                </button>
              </div>

              {/* UPI Payment Section */}
              {activeTab === 'upi' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-gold font-semibold mb-3">Choose UPI App</h3>
                  </div>

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

              {/* Card Payment Section */}
              {activeTab === 'card' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber" className="text-gold">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                      className="luxury-input"
                      maxLength={19}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry" className="text-gold">MM/YY</Label>
                      <Input
                        id="expiry"
                        placeholder="12/25"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                        className="luxury-input"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-gold">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                        className="luxury-input"
                        maxLength={4}
                        type="password"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="cardName" className="text-gold">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                      className="luxury-input"
                    />
                  </div>

                  <Button
                    onClick={processCardPayment}
                    disabled={loading}
                    className="w-full luxury-button"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Lock className="w-4 h-4 mr-2" />
                    )}
                    Pay ₹{formattedAmount}
                  </Button>
                </div>
              )}

              {/* Bank Transfer Section */}
              {activeTab === 'bank' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="accountNumber" className="text-gold">Account Number</Label>
                    <Input
                      id="accountNumber"
                      placeholder="Enter account number"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                      className="luxury-input"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="ifsc" className="text-gold">IFSC Code</Label>
                    <Input
                      id="ifsc"
                      placeholder="SBIN0001234"
                      value={bankDetails.ifsc}
                      onChange={(e) => setBankDetails({...bankDetails, ifsc: e.target.value.toUpperCase()})}
                      className="luxury-input"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="accountHolder" className="text-gold">Account Holder Name</Label>
                    <Input
                      id="accountHolder"
                      placeholder="As per bank records"
                      value={bankDetails.accountHolder}
                      onChange={(e) => setBankDetails({...bankDetails, accountHolder: e.target.value})}
                      className="luxury-input"
                    />
                  </div>

                  <div className="bg-yellow-900/20 rounded-lg p-3 border border-yellow-400/30">
                    <p className="text-yellow-200/80 text-sm">
                      Bank transfers may take 1-3 business days to process. Your subscription will be activated once payment is confirmed.
                    </p>
                  </div>

                  <Button
                    onClick={processBankTransfer}
                    disabled={loading}
                    className="w-full luxury-button"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Building2 className="w-4 h-4 mr-2" />
                    )}
                    Initiate Bank Transfer
                  </Button>
                </div>
              )}
            </div>
          )}

          {paymentStatus === 'processing' && (
            <div className="text-center space-y-4">
              <div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full mx-auto"></div>
              <div>
                <p className="text-gold font-semibold">Processing Payment...</p>
                <p className="text-yellow-200/80 text-sm">
                  {activeTab === 'upi' && "Complete the payment in your UPI app"}
                  {activeTab === 'card' && "Processing your card payment"}
                  {activeTab === 'bank' && "Initiating bank transfer"}
                </p>
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