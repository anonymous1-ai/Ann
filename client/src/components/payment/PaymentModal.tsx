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

      // Simulate payment processing without Razorpay interface
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
      
      // Create mock successful payment response
      const mockResponse = {
        razorpay_payment_id: `pay_${Math.random().toString(36).substr(2, 14)}`,
        razorpay_order_id: `order_${Math.random().toString(36).substr(2, 14)}`,
        razorpay_signature: `signature_${Math.random().toString(36).substr(2, 20)}`,
        verified: true,
        newBalance: Math.floor(amount / 900), // Convert paise to credits
        addedCalls: Math.floor(amount / 900),
        message: 'Payment completed successfully'
      };
      
      setLoading(false);
      onSuccess(mockResponse);
      
      toast({
        title: "Payment Successful!",
        description: `Added ${mockResponse.addedCalls} API credits to your account`
      });
      
      onClose();
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
      <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md border-yellow-400/30 bg-[#000000cc]">
        <DialogHeader>
          <DialogTitle className="text-gradient">Complete Payment</DialogTitle>
          <DialogDescription className="text-yellow-200/70">
            Pay ₹{(amount / 100).toLocaleString()} for {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Method Tabs */}
          <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
            <TabsList className="h-10 items-center justify-center rounded-md p-1 grid w-full grid-cols-3 bg-[#000000cc] text-[#ffecb3]">
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
              {/* Amount Selection for Top-up */}
              {description.includes('₹9 per call') && (
                <div className="space-y-2">
                  <Label className="text-gold">Number of API Credits</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="1"
                      max="1000"
                      value={Math.floor(amount / 900)}
                      onChange={(e) => {
                        const credits = parseInt(e.target.value) || 1;
                        // Update amount based on credits (₹9 per credit = 900 paise)
                        window.dispatchEvent(new CustomEvent('updateAmount', { detail: credits * 900 }));
                      }}
                      className="border-yellow-400/30 text-white bg-[#000000cc] w-24"
                    />
                    <span className="text-yellow-200/70">credits × ₹9 = ₹{Math.floor(amount / 900) * 9}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="upi" className="text-gold">UPI ID</Label>
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
                    className="border-yellow-400/30 text-white bg-[#000000cc]"
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
                    className="border-yellow-400/30 text-white bg-[#000000cc]"
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
                      className="border-yellow-400/30 text-white bg-[#000000cc]"
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
                      className="border-yellow-400/30 text-white bg-[#000000cc]"
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
                    className="border-yellow-400/30 text-white bg-[#000000cc]"
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
                    className="border-yellow-400/30 text-white bg-[#000000cc]"
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
                    className="border-yellow-400/30 text-white bg-[#000000cc]"
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