import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Zap, CreditCard, Building2, Clock, ArrowLeft, Smartphone } from 'lucide-react';
import { useLocation } from 'wouter';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  pricePerCall: number;
  estimatedTime: string;
  popular: boolean;
  savings?: string;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    price: 900,
    currency: '₹',
    pricePerCall: 9,
    estimatedTime: '~2 hours',
    popular: false
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    credits: 500,
    price: 4000,
    currency: '₹',
    pricePerCall: 8,
    estimatedTime: '~10 hours',
    popular: true,
    savings: 'Save ₹500'
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    credits: 1000,
    price: 7000,
    currency: '₹',
    pricePerCall: 7,
    estimatedTime: '~20 hours',
    popular: false,
    savings: 'Save ₹2000'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 2500,
    price: 15000,
    currency: '₹',
    pricePerCall: 6,
    estimatedTime: '~50 hours',
    popular: false,
    savings: 'Save ₹7500'
  }
];

const BuyCredits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Bank'>('UPI');
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifsc: '',
    accountHolder: ''
  });

  const handlePurchase = async () => {
    if (!selectedPackage) {
      toast({
        title: "Select Package",
        description: "Please select a credit package first",
        variant: "destructive"
      });
      return;
    }

    if (paymentMethod === 'UPI' && !upiId.trim()) {
      toast({
        title: "UPI ID Required",
        description: "Please enter your UPI ID",
        variant: "destructive"
      });
      return;
    }

    if (paymentMethod === 'Card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
        toast({
          title: "Card Details Required",
          description: "Please fill all card details",
          variant: "destructive"
        });
        return;
      }
    }

    if (paymentMethod === 'Bank') {
      if (!bankDetails.accountNumber || !bankDetails.ifsc || !bankDetails.accountHolder) {
        toast({
          title: "Bank Details Required",
          description: "Please fill all bank details",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);
    try {
      // Create order
      const orderResponse = await fetch('/api/create-topup-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: selectedPackage.price,
          credits: selectedPackage.credits,
          paymentMethod,
          paymentDetails: paymentMethod === 'UPI' ? { upiId } :
                         paymentMethod === 'Card' ? cardDetails :
                         bankDetails
        })
      });

      const orderData = await orderResponse.json();
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Initialize Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: selectedPackage.price * 100,
        currency: 'INR',
        name: 'Silently AI',
        description: `${selectedPackage.name} - ${selectedPackage.credits} API Credits`,
        order_id: orderData.data.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/verify-topup-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              toast({
                title: "Purchase Successful!",
                description: `${selectedPackage.credits} credits added to your account`
              });
              setLocation('/dashboard');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if amount was deducted",
              variant: "destructive"
            });
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email
        },
        theme: {
          color: '#FBBF24'
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      toast({
        title: "Purchase Failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="animated-bg">
        <div className="static-graphics"></div>
        <div className="geometric-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
          <div className="shape shape-6"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/dashboard')}
            className="text-yellow-400 hover:text-yellow-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4">
            Buy API Credits
          </h1>
          <p className="text-yellow-200/80 text-lg max-w-2xl mx-auto">
            Purchase additional API credits to power your AI tool. Choose the package that fits your needs.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Credit Packages */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-6">Select Credit Package</h2>
            
            <div className="grid gap-4">
              {CREDIT_PACKAGES.map((pkg) => (
                <Card 
                  key={pkg.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedPackage?.id === pkg.id 
                      ? 'border-yellow-500 bg-yellow-500/10 ring-2 ring-yellow-500/20' 
                      : 'border-yellow-600/30 hover:border-yellow-500/50'
                  } ${pkg.popular ? 'relative' : ''}`}
                  style={{
                    background: selectedPackage?.id === pkg.id 
                      ? 'radial-gradient(ellipse at top, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.05) 50%), linear-gradient(135deg, hsl(218, 23%, 4%) 0%, hsl(218, 25%, 3%) 50%, hsl(218, 23%, 5%) 100%)'
                      : `radial-gradient(ellipse at top, hsl(218, 23%, 6%) 0%, hsl(218, 23%, 4%) 50%), linear-gradient(135deg, hsl(218, 23%, 4%) 0%, hsl(218, 25%, 3%) 50%, hsl(218, 23%, 5%) 100%)`
                  }}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold px-3 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-yellow-400 text-lg">{pkg.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="text-yellow-200 font-medium">{pkg.credits.toLocaleString()} Credits</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-400">
                          {pkg.currency}{pkg.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-yellow-300/70">
                          {pkg.currency}{pkg.pricePerCall}/call
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-yellow-300/80">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{pkg.estimatedTime}</span>
                      </div>
                      {pkg.savings && (
                        <Badge variant="outline" className="border-green-500/30 text-green-400">
                          {pkg.savings}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-6">Payment Details</h2>
            
            {selectedPackage && (
              <Card className="border-yellow-600/30" style={{
                background: `radial-gradient(ellipse at top, hsl(218, 23%, 6%) 0%, hsl(218, 23%, 4%) 50%), linear-gradient(135deg, hsl(218, 23%, 4%) 0%, hsl(218, 25%, 3%) 50%, hsl(218, 23%, 5%) 100%)`
              }}>
                <CardHeader>
                  <CardTitle className="text-yellow-400">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-yellow-200">Package:</span>
                      <span className="text-yellow-400 font-medium">{selectedPackage.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-200">Credits:</span>
                      <span className="text-yellow-400 font-medium">{selectedPackage.credits.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-200">Estimated Usage:</span>
                      <span className="text-yellow-400 font-medium">{selectedPackage.estimatedTime}</span>
                    </div>
                    <div className="border-t border-yellow-600/30 pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-yellow-200">Total:</span>
                        <span className="text-yellow-400">{selectedPackage.currency}{selectedPackage.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Method Selection */}
            <Card className="border-yellow-600/30" style={{
              background: `radial-gradient(ellipse at top, hsl(218, 23%, 6%) 0%, hsl(218, 23%, 4%) 50%), linear-gradient(135deg, hsl(218, 23%, 4%) 0%, hsl(218, 25%, 3%) 50%, hsl(218, 23%, 5%) 100%)`
            }}>
              <CardHeader>
                <CardTitle className="text-yellow-400">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-6">
                  <Button
                    variant={paymentMethod === 'UPI' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('UPI')}
                    className={`flex-1 ${
                      paymentMethod === 'UPI'
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
                        : 'border-yellow-600/30 text-yellow-400 hover:bg-yellow-500/10'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    UPI
                  </Button>
                  <Button
                    variant={paymentMethod === 'Card' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('Card')}
                    className={`flex-1 ${
                      paymentMethod === 'Card'
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
                        : 'border-yellow-600/30 text-yellow-400 hover:bg-yellow-500/10'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Card
                  </Button>
                  <Button
                    variant={paymentMethod === 'Bank' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('Bank')}
                    className={`flex-1 ${
                      paymentMethod === 'Bank'
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
                        : 'border-yellow-600/30 text-yellow-400 hover:bg-yellow-500/10'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Bank
                  </Button>
                </div>

                {/* UPI Form */}
                {paymentMethod === 'UPI' && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-yellow-200">UPI ID</Label>
                      <Input
                        placeholder="yourname@paytm"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        style={{
                          background: `radial-gradient(ellipse at top, hsl(218, 23%, 8%) 0%, hsl(218, 23%, 6%) 50%), linear-gradient(135deg, hsl(218, 23%, 6%) 0%, hsl(218, 25%, 5%) 50%, hsl(218, 23%, 7%) 100%)`
                        }}
                        className="border-yellow-600/30 text-yellow-100 placeholder:text-yellow-400/60"
                      />
                    </div>
                    <p className="text-yellow-300/60 text-sm">
                      Enter your UPI ID (e.g., 9876543210@paytm, user@googlepay)
                    </p>
                  </div>
                )}

                {/* Card Form */}
                {paymentMethod === 'Card' && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-yellow-200">Cardholder Name</Label>
                      <Input
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                        style={{
                          background: `radial-gradient(ellipse at top, hsl(218, 23%, 8%) 0%, hsl(218, 23%, 6%) 50%), linear-gradient(135deg, hsl(218, 23%, 6%) 0%, hsl(218, 25%, 5%) 50%, hsl(218, 23%, 7%) 100%)`
                        }}
                        className="border-yellow-600/30 text-yellow-100 placeholder:text-yellow-400/60"
                      />
                    </div>
                    <div>
                      <Label className="text-yellow-200">Card Number</Label>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                        style={{
                          background: `radial-gradient(ellipse at top, hsl(218, 23%, 8%) 0%, hsl(218, 23%, 6%) 50%), linear-gradient(135deg, hsl(218, 23%, 6%) 0%, hsl(218, 25%, 5%) 50%, hsl(218, 23%, 7%) 100%)`
                        }}
                        className="border-yellow-600/30 text-yellow-100 placeholder:text-yellow-400/60"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-yellow-200">Expiry</Label>
                        <Input
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                          className="bg-background/60 border-yellow-600/30 text-yellow-100 placeholder:text-yellow-400/60"
                        />
                      </div>
                      <div>
                        <Label className="text-yellow-200">CVV</Label>
                        <Input
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                          className="bg-background/60 border-yellow-600/30 text-yellow-100 placeholder:text-yellow-400/60"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank Form */}
                {paymentMethod === 'Bank' && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-yellow-200">Account Holder Name</Label>
                      <Input
                        placeholder="John Doe"
                        value={bankDetails.accountHolder}
                        onChange={(e) => setBankDetails({...bankDetails, accountHolder: e.target.value})}
                        className="bg-background/60 border-yellow-600/30 text-yellow-100 placeholder:text-yellow-400/60"
                      />
                    </div>
                    <div>
                      <Label className="text-yellow-200">Account Number</Label>
                      <Input
                        placeholder="1234567890"
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                        className="bg-background/60 border-yellow-600/30 text-yellow-100 placeholder:text-yellow-400/60"
                      />
                    </div>
                    <div>
                      <Label className="text-yellow-200">IFSC Code</Label>
                      <Input
                        placeholder="SBIN0001234"
                        value={bankDetails.ifsc}
                        onChange={(e) => setBankDetails({...bankDetails, ifsc: e.target.value})}
                        className="bg-background/60 border-yellow-600/30 text-yellow-100 placeholder:text-yellow-400/60"
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={handlePurchase}
                  disabled={loading || !selectedPackage}
                  className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-3 text-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full mr-2" />
                      Processing...
                    </div>
                  ) : selectedPackage ? (
                    `Purchase ${selectedPackage.credits} Credits - ${selectedPackage.currency}${selectedPackage.price.toLocaleString()}`
                  ) : (
                    'Select a Package'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyCredits;