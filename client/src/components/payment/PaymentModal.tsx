import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Smartphone, Building2, X } from 'lucide-react';

// Add Razorpay type declaration
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency: string;
  description: string;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  userDetails: {
    email: string;
    name: string;
  };
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  currency,
  description,
  onSuccess,
  onError,
  userDetails
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  
  // UPI form state
  const [upiId, setUpiId] = useState('');
  
  // Card form state
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  
  // Bank transfer state
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifsc: '',
    accountName: ''
  });

  const validateUPI = (upi: string) => {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return upiRegex.test(upi);
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Validate based on payment method
      if (paymentMethod === 'upi' && !validateUPI(upiId)) {
        throw new Error('Please enter a valid UPI ID (e.g., username@paytm)');
      }

      if (paymentMethod === 'card') {
        if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
          throw new Error('Please fill all card details');
        }
      }

      if (paymentMethod === 'netbanking') {
        if (!bankDetails.accountNumber || !bankDetails.ifsc || !bankDetails.accountName) {
          throw new Error('Please fill all bank details');
        }
      }

      // Create order for the payment
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          plan: 'custom-payment',
          amount: amount / 100, // Convert from paise to rupees
          paymentMethod
        })
      });

      const orderData = await response.json();
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      // Prepare Razorpay options based on payment method
      const razorpayOptions: any = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key',
        amount: amount,
        currency: currency,
        name: 'Silently AI',
        description: description,
        order_id: orderData.data.orderId,
        handler: function (response: any) {
          onSuccess(response);
          onClose();
          toast({
            title: "Payment Successful!",
            description: `Payment completed successfully via ${paymentMethod.toUpperCase()}`
          });
        },
        prefill: {
          email: userDetails.email,
          name: userDetails.name,
          contact: ''
        },
        theme: {
          color: '#D4AF37'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            onClose();
          }
        }
      };

      // Customize options based on payment method
      if (paymentMethod === 'upi') {
        razorpayOptions.method = {
          upi: true,
          card: false,
          netbanking: false,
          wallet: false
        };
        razorpayOptions.prefill.vpa = upiId;
      } else if (paymentMethod === 'card') {
        razorpayOptions.method = {
          upi: false,
          card: true,
          netbanking: false,
          wallet: false
        };
      } else if (paymentMethod === 'netbanking') {
        razorpayOptions.method = {
          upi: false,
          card: false,
          netbanking: true,
          wallet: false
        };
      }

      // Load and execute Razorpay
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const rzp = new window.Razorpay(razorpayOptions);
          rzp.on('payment.failed', function (response: any) {
            onError(response.error);
            toast({
              title: "Payment Failed",
              description: response.error.description || "Payment was unsuccessful",
              variant: "destructive"
            });
          });
          rzp.open();
          onClose(); // Close our custom modal when Razorpay opens
        };
        document.body.appendChild(script);
      } else {
        const rzp = new window.Razorpay(razorpayOptions);
        rzp.on('payment.failed', function (response: any) {
          onError(response.error);
          toast({
            title: "Payment Failed",
            description: response.error.description || "Payment was unsuccessful",
            variant: "destructive"
          });
        });
        rzp.open();
        onClose(); // Close our custom modal when Razorpay opens
      }

    } catch (error: any) {
      setLoading(false);
      toast({
        title: "Payment Error",
        description: error.message || "Unable to process payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-900 border-yellow-400/30">
        <DialogHeader>
          <DialogTitle className="text-gradient">Complete Payment</DialogTitle>
          <DialogDescription className="text-yellow-200/70">
            Pay ₹{(amount / 100).toLocaleString()} for {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Method Tabs */}
          <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
            <TabsList className="grid w-full grid-cols-3 bg-slate-800">
              <TabsTrigger value="upi" className="data-[state=active]:bg-yellow-600">
                <Smartphone className="w-4 h-4 mr-1" />
                UPI
              </TabsTrigger>
              <TabsTrigger value="card" className="data-[state=active]:bg-yellow-600">
                <CreditCard className="w-4 h-4 mr-1" />
                Card
              </TabsTrigger>
              <TabsTrigger value="netbanking" className="data-[state=active]:bg-yellow-600">
                <Building2 className="w-4 h-4 mr-1" />
                Bank
              </TabsTrigger>
            </TabsList>

            {/* UPI Payment */}
            <TabsContent value="upi" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upi" className="text-gold">UPI ID</Label>
                <Input
                  id="upi"
                  type="text"
                  placeholder="yourname@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="bg-slate-800 border-yellow-400/30 text-white"
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
            </TabsContent>

            {/* Card Payment */}
            <TabsContent value="card" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardname" className="text-gold">Cardholder Name</Label>
                  <Input
                    id="cardname"
                    type="text"
                    placeholder="John Doe"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                    className="bg-slate-800 border-yellow-400/30 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cardnumber" className="text-gold">Card Number</Label>
                  <Input
                    id="cardnumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                    className="bg-slate-800 border-yellow-400/30 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry" className="text-gold">Expiry</Label>
                    <Input
                      id="expiry"
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                      className="bg-slate-800 border-yellow-400/30 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv" className="text-gold">CVV</Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                      className="bg-slate-800 border-yellow-400/30 text-white"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Net Banking */}
            <TabsContent value="netbanking" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountname" className="text-gold">Account Holder Name</Label>
                  <Input
                    id="accountname"
                    type="text"
                    placeholder="John Doe"
                    value={bankDetails.accountName}
                    onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                    className="bg-slate-800 border-yellow-400/30 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account" className="text-gold">Account Number</Label>
                  <Input
                    id="account"
                    type="text"
                    placeholder="1234567890123456"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                    className="bg-slate-800 border-yellow-400/30 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ifsc" className="text-gold">IFSC Code</Label>
                  <Input
                    id="ifsc"
                    type="text"
                    placeholder="SBIN0001234"
                    value={bankDetails.ifsc}
                    onChange={(e) => setBankDetails({...bankDetails, ifsc: e.target.value.toUpperCase()})}
                    className="bg-slate-800 border-yellow-400/30 text-white"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Payment Summary */}
          <Card className="bg-yellow-900/20 border-yellow-400/30">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-yellow-200/70">Amount to Pay</span>
                <span className="text-gold font-bold text-lg">₹{(amount / 100).toLocaleString()}</span>
              </div>
              <p className="text-xs text-yellow-200/60 mt-1">
                Secure payment powered by advanced encryption
              </p>
            </CardContent>
          </Card>

          {/* Payment Button */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-yellow-400/30 text-yellow-200 hover:bg-yellow-900/30"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 btn-luxury"
            >
              {loading ? 'Processing...' : `Pay ₹${(amount / 100).toLocaleString()}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};