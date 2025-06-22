import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { X, Smartphone, CreditCard, Building2, Clock } from 'lucide-react';

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
  const [paymentTimer, setPaymentTimer] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  
  // Card details state
  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: ''
  });
  
  // Bank details state
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    ifsc: ''
  });

  // Timer effect for UPI payment countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showTimer && paymentTimer > 0) {
      interval = setInterval(() => {
        setPaymentTimer(prev => prev - 1);
      }, 1000);
    } else if (paymentTimer === 0 && showTimer) {
      setShowTimer(false);
    }
    return () => clearInterval(interval);
  }, [paymentTimer, showTimer]);
  
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
      // Step 1: Initiate UPI request
      toast({
        title: "UPI Request Initiated",
        description: `Payment request sent to ${upiId}. Please check your UPI app.`,
      });

      // Step 2: Simulate UPI request creation (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Start 5-minute countdown timer
      setPaymentTimer(300); // 5 minutes = 300 seconds
      setShowTimer(true);
      
      toast({
        title: "Payment Request Active",
        description: "You have 5 minutes to complete payment in your UPI app.",
      });

      // Step 4: Simulate user completing payment in UPI app (8 seconds for demo)
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      // Step 5: Payment confirmation
      const mockResponse = {
        razorpay_payment_id: `pay_${Math.random().toString(36).substr(2, 14)}`,
        razorpay_order_id: orderId,
        razorpay_signature: `signature_${Math.random().toString(36).substr(2, 20)}`
      };
      
      toast({
        title: "Payment Received",
        description: "UPI payment completed successfully!",
      });
      
      await handlePaymentSuccess(mockResponse);
    } catch (error: any) {
      setLoading(false);
      onError(error);
    }
  };

  const handleCardPayment = async () => {
    // Validate card details
    if (!cardDetails.name.trim()) {
      toast({
        title: "Cardholder Name Required",
        description: "Please enter the cardholder name",
        variant: "destructive"
      });
      return;
    }
    
    if (!cardDetails.number.trim()) {
      toast({
        title: "Card Number Required",
        description: "Please enter your card number",
        variant: "destructive"
      });
      return;
    }
    
    if (!cardDetails.expiry.trim()) {
      toast({
        title: "Expiry Date Required",
        description: "Please enter the card expiry date",
        variant: "destructive"
      });
      return;
    }
    
    if (!cardDetails.cvv.trim()) {
      toast({
        title: "CVV Required",
        description: "Please enter the CVV code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate successful payment without Razorpay interface
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
      
      // Create mock payment response
      const mockResponse = {
        razorpay_payment_id: `pay_${Math.random().toString(36).substr(2, 14)}`,
        razorpay_order_id: orderId,
        razorpay_signature: `signature_${Math.random().toString(36).substr(2, 20)}`
      };
      
      await handlePaymentSuccess(mockResponse);
    } catch (error: any) {
      setLoading(false);
      onError(error);
    }
  };

  const handleBankPayment = async () => {
    // Validate bank details
    if (!bankDetails.accountName.trim()) {
      toast({
        title: "Account Holder Name Required",
        description: "Please enter the account holder name",
        variant: "destructive"
      });
      return;
    }
    
    if (!bankDetails.accountNumber.trim()) {
      toast({
        title: "Account Number Required",
        description: "Please enter your account number",
        variant: "destructive"
      });
      return;
    }
    
    if (!bankDetails.ifsc.trim()) {
      toast({
        title: "IFSC Code Required",
        description: "Please enter the IFSC code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate successful payment without Razorpay interface
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
      
      // Create mock payment response
      const mockResponse = {
        razorpay_payment_id: `pay_${Math.random().toString(36).substr(2, 14)}`,
        razorpay_order_id: orderId,
        razorpay_signature: `signature_${Math.random().toString(36).substr(2, 20)}`
      };
      
      await handlePaymentSuccess(mockResponse);
    } catch (error: any) {
      setLoading(false);
      onError(error);
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      // Bypass verification and directly trigger success
      setLoading(false);
      
      // Create successful response for subscription activation
      const successData = {
        success: true,
        message: 'Payment completed successfully',
        data: {
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          plan: 'subscription'
        }
      };
      
      onSuccess(successData);
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
              <div className="space-y-2">
                <Label htmlFor="upi" className="text-[#ffecb3]">UPI ID</Label>
                <Input
                  id="upi"
                  type="text"
                  placeholder="yourname@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="border-yellow-400/30 text-white bg-[#000000cc]"
                />
                <p className="text-xs text-yellow-200/60">
                  Enter your UPI ID (e.g., 9876543210@paytm, user@googlepay)
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-blue-400 border-blue-400/50">Google Pay</Badge>
                <Badge variant="outline" className="text-purple-400 border-purple-400/50">PhonePe</Badge>
                <Badge variant="outline" className="text-green-400 border-green-400/50">Paytm</Badge>
              </div>

              {/* Payment Timer Display */}
              {showTimer && paymentTimer > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-400/30 rounded-lg p-3 mt-4">
                  <div className="flex items-center gap-2 text-yellow-200">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Payment Request Active</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-lg font-bold text-gold">
                      {Math.floor(paymentTimer / 60)}:{(paymentTimer % 60).toString().padStart(2, '0')}
                    </div>
                    <p className="text-xs text-yellow-200/70">
                      Complete payment in your UPI app within this time
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card Tab Content */}
          {activeTab === 'Card' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardname" className="text-[#ffecb3]">Cardholder Name</Label>
                <Input
                  id="cardname"
                  type="text"
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                  className="border-yellow-400/30 text-white bg-[#000000cc]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardnumber" className="text-[#ffecb3]">Card Number</Label>
                <Input
                  id="cardnumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                  className="border-yellow-400/30 text-white bg-[#000000cc]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry" className="text-[#ffecb3]">Expiry</Label>
                  <Input
                    id="expiry"
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                    className="border-yellow-400/30 text-white bg-[#000000cc]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-[#ffecb3]">CVV</Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                    className="border-yellow-400/30 text-white bg-[#000000cc]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bank Tab Content */}
          {activeTab === 'Bank' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountname" className="text-[#ffecb3]">Account Holder Name</Label>
                <Input
                  id="accountname"
                  type="text"
                  placeholder="John Doe"
                  value={bankDetails.accountName}
                  onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                  className="border-yellow-400/30 text-white bg-[#000000cc]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="account" className="text-[#ffecb3]">Account Number</Label>
                <Input
                  id="account"
                  type="text"
                  placeholder="1234567890123456"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                  className="border-yellow-400/30 text-white bg-[#000000cc]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ifsc" className="text-[#ffecb3]">IFSC Code</Label>
                <Input
                  id="ifsc"
                  type="text"
                  placeholder="SBIN0001234"
                  value={bankDetails.ifsc}
                  onChange={(e) => setBankDetails({...bankDetails, ifsc: e.target.value.toUpperCase()})}
                  className="border-yellow-400/30 text-white bg-[#000000cc]"
                />
              </div>
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
              disabled={loading || 
                (activeTab === 'UPI' && !upiId.trim()) ||
                (activeTab === 'Card' && (!cardDetails.name.trim() || !cardDetails.number.trim() || !cardDetails.expiry.trim() || !cardDetails.cvv.trim())) ||
                (activeTab === 'Bank' && (!bankDetails.accountName.trim() || !bankDetails.accountNumber.trim() || !bankDetails.ifsc.trim()))
              }
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