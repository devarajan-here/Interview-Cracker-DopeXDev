import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CreditCard, Shield, CheckCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [showPaymentVerification, setShowPaymentVerification] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email || !name || !phone) {
      toast.error("Please fill all required fields");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      console.log('Initiating payment process...');
      
      // Store customer details for later use
      localStorage.setItem('payment_customer_details', JSON.stringify({
        name,
        email,
        phone,
        timestamp: Date.now()
      }));

      toast.success("Redirecting to payment gateway...");
      
      // Open payment in new tab
      const paymentWindow = window.open('https://pages.razorpay.com/pl_Qbn1Dc0OBKEhgl/view', '_blank');
      
      // Monitor for payment completion
      const checkPaymentInterval = setInterval(() => {
        if (paymentWindow?.closed) {
          clearInterval(checkPaymentInterval);
          console.log('Payment window closed - showing payment verification form...');
          setShowPaymentVerification(true);
        }
      }, 1000);

      // Backup timeout - changed from 30 seconds to 1 minute
      setTimeout(() => {
        if (paymentWindow && !paymentWindow.closed) {
          paymentWindow.close();
        }
        clearInterval(checkPaymentInterval);
        console.log('Payment timeout - showing payment verification form...');
        setShowPaymentVerification(true);
      }, 60000); // Changed to 60 seconds (1 minute)
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentVerification = async () => {
    if (!paymentId.trim()) {
      toast.error("Please enter your payment ID");
      return;
    }

    // Basic validation for Razorpay payment ID format
    if (!paymentId.startsWith('pay_')) {
      toast.error("Please enter a valid Razorpay payment ID (starts with 'pay_')");
      return;
    }

    setIsLoading(true);

    try {
      console.log('Verifying payment ID:', paymentId);
      
      // Store payment verification details
      const customerDetails = JSON.parse(localStorage.getItem('payment_customer_details') || '{}');
      localStorage.setItem('payment_customer_details', JSON.stringify({
        ...customerDetails,
        payment_id: paymentId,
        payment_completed: true,
        timestamp: Date.now()
      }));

      toast.success("Payment ID verified! Redirecting to account creation...");
      
      // Small delay to show the success message
      setTimeout(() => {
        navigate(`/auth?payment_verified=true&email=${encodeURIComponent(email)}`);
      }, 1000);
      
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error("Failed to verify payment. Please check your payment ID and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is returning from payment
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const paymentIdFromUrl = urlParams.get('payment_id');
    
    if (paymentSuccess === 'true' || paymentIdFromUrl) {
      console.log('Payment success detected from URL');
      setShowPaymentVerification(true);
      if (paymentIdFromUrl) {
        setPaymentId(paymentIdFromUrl);
      }
    }
  }, []);

  if (showPaymentVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Verify Payment
            </CardTitle>
            <CardDescription>
              Please enter your payment ID to complete verification
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Thank you for your payment! Please enter your payment ID from the payment confirmation to proceed.
              </p>
            </div>

            <div>
              <Label htmlFor="payment-id">Payment ID *</Label>
              <Input
                id="payment-id"
                type="text"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                placeholder="Enter payment ID (e.g., pay_xxxxx)"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                You can find this in your payment confirmation email or SMS
              </p>
            </div>

            <Button 
              onClick={handlePaymentVerification}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Payment...
                </>
              ) : (
                "Verify Payment & Continue to Sign Up"
              )}
            </Button>

            <Button 
              variant="outline"
              onClick={() => setShowPaymentVerification(false)}
              className="w-full"
            >
              Back to Payment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            AI Interview Assistant
          </CardTitle>
          <CardDescription>
            Secure your access with our monthly subscription
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Price Display */}
          <div className="text-center p-6 bg-blue-50 rounded-lg border">
            {/* Lifetime Option */}
            <div>
              <div className="text-3xl font-bold text-green-600">₹150</div>
              <div className="text-gray-600">for lifetime access!</div>
              <p className="text-xs text-gray-500 mt-1">(Special Offer)</p>
            </div>

            {/* Common features list */}
            <div className="flex items-center justify-center mt-4 text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              Real-time AI assistance & all features
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter 10-digit phone number"
                maxLength={10}
                required
              />
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <Shield className="h-4 w-4 mr-2 text-green-600" />
            Secured by Razorpay
          </div>

          {/* Payment Button */}
          <Button 
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Opening Payment...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Pay ₹150 & Get Lifetime Access {/* Changed text */}
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By proceeding, you agree to our terms of service and privacy policy.
            After completing payment, you'll need to verify with your payment ID.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payment;
